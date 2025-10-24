// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LimboTreasury
 * @notice Handles on-chain fund custody and bet settlement for Limbo game
 * @dev Results are generated off-chain for speed, then settled on-chain for transparency
 */
contract LimboTreasury {
    // ============ State Variables ============
    
    /// @notice User balances (in wei)
    mapping(address => uint256) public balances;
    
    /// @notice House balance for paying out wins
    uint256 public houseBalance;
    
    /// @notice Contract owner (can fund house, change signer)
    address public owner;
    
    /// @notice Backend server address that signs bet results
    address public serverSigner;
    
    /// @notice Tracks which bets have been settled (prevents replay attacks)
    mapping(bytes32 => bool) public settledBets;
    
    /// @notice Minimum bet amount (in wei)
    uint256 public minBet;
    
    /// @notice Maximum bet amount (in wei)
    uint256 public maxBet;
    
    // ============ Events ============
    
    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event BetSettled(
        bytes32 indexed betId,
        address indexed player,
        uint256 wager,
        bool win,
        uint256 payout,
        uint256 newBalance
    );
    event HouseFunded(uint256 amount, uint256 newBalance);
    event ServerSignerChanged(address indexed oldSigner, address indexed newSigner);
    event BetLimitsChanged(uint256 minBet, uint256 maxBet);
    
    // ============ Errors ============
    
    error ZeroAmount();
    error InsufficientBalance();
    error BetAlreadySettled();
    error InvalidSignature();
    error BelowMinimumBet();
    error AboveMaximumBet();
    error InsufficientHouseBalance();
    error Unauthorized();
    error TransferFailed();
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _serverSigner, uint256 _minBet, uint256 _maxBet) {
        owner = msg.sender;
        serverSigner = _serverSigner;
        minBet = _minBet;
        maxBet = _maxBet;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Deposit ETH into the treasury
     * @dev Anyone can deposit to increase their balance
     */
    function deposit() external payable {
        if (msg.value == 0) revert ZeroAmount();
        
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value, balances[msg.sender]);
    }
    
    /**
     * @notice Withdraw ETH from the treasury
     * @param amount Amount to withdraw (in wei)
     * @dev Users can only withdraw their available balance
     */
    function withdraw(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Withdrawn(msg.sender, amount, balances[msg.sender]);
    }
    
    /**
     * @notice Settle a bet result on-chain
     * @param betId Unique bet identifier
     * @param player Address of the player
     * @param wager Amount wagered (in wei)
     * @param win Whether the player won
     * @param payout Amount to pay out if win (in wei)
     * @param signature Server signature proving result authenticity
     * @dev Called by backend after off-chain result generation
     */
    function settleBet(
        bytes32 betId,
        address player,
        uint256 wager,
        bool win,
        uint256 payout,
        bytes memory signature
    ) external {
        // Validate bet hasn't been settled
        if (settledBets[betId]) revert BetAlreadySettled();
        
        // Validate bet amounts
        if (wager < minBet) revert BelowMinimumBet();
        if (wager > maxBet) revert AboveMaximumBet();
        
        // Verify signature from server
        bytes32 messageHash = keccak256(
            abi.encodePacked(betId, player, wager, win, payout)
        );
        address recoveredSigner = recoverSigner(messageHash, signature);
        if (recoveredSigner != serverSigner) revert InvalidSignature();
        
        // Check player has sufficient balance
        if (balances[player] < wager) revert InsufficientBalance();
        
        // Deduct wager from player
        balances[player] -= wager;
        
        // Process win/loss
        if (win) {
            // Check house has enough to pay
            uint256 profit = payout - wager;
            if (houseBalance < profit) revert InsufficientHouseBalance();
            
            // Pay player
            balances[player] += payout;
            houseBalance -= profit;
        } else {
            // House wins the wager
            houseBalance += wager;
        }
        
        // Mark as settled
        settledBets[betId] = true;
        
        emit BetSettled(betId, player, wager, win, payout, balances[player]);
    }
    
    /**
     * @notice Batch settle multiple bets (gas optimization)
     * @param betIds Array of bet identifiers
     * @param players Array of player addresses
     * @param wagers Array of wager amounts
     * @param wins Array of win/loss booleans
     * @param payouts Array of payout amounts
     * @param signatures Array of server signatures
     */
    function settleBetBatch(
        bytes32[] calldata betIds,
        address[] calldata players,
        uint256[] calldata wagers,
        bool[] calldata wins,
        uint256[] calldata payouts,
        bytes[] calldata signatures
    ) external {
        uint256 length = betIds.length;
        require(
            length == players.length &&
            length == wagers.length &&
            length == wins.length &&
            length == payouts.length &&
            length == signatures.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < length; i++) {
            // Skip if already settled (don't revert entire batch)
            if (settledBets[betIds[i]]) continue;
            
            try this.settleBet(
                betIds[i],
                players[i],
                wagers[i],
                wins[i],
                payouts[i],
                signatures[i]
            ) {
                // Success
            } catch {
                // Skip failed settlements
                continue;
            }
        }
    }
    
    // ============ Owner Functions ============
    
    /**
     * @notice Fund the house balance
     * @dev Only owner can add to house balance
     */
    function fundHouse() external payable onlyOwner {
        if (msg.value == 0) revert ZeroAmount();
        
        houseBalance += msg.value;
        emit HouseFunded(msg.value, houseBalance);
    }
    
    /**
     * @notice Change the server signer address
     * @param newSigner New server signer address
     */
    function setServerSigner(address newSigner) external onlyOwner {
        address oldSigner = serverSigner;
        serverSigner = newSigner;
        emit ServerSignerChanged(oldSigner, newSigner);
    }
    
    /**
     * @notice Update bet limits
     * @param _minBet New minimum bet
     * @param _maxBet New maximum bet
     */
    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet < _maxBet, "Invalid limits");
        minBet = _minBet;
        maxBet = _maxBet;
        emit BetLimitsChanged(_minBet, _maxBet);
    }
    
    /**
     * @notice Emergency withdraw house balance
     * @param amount Amount to withdraw
     */
    function withdrawHouseBalance(uint256 amount) external onlyOwner {
        if (amount > houseBalance) revert InsufficientBalance();
        
        houseBalance -= amount;
        
        (bool success, ) = payable(owner).call{value: amount}("");
        if (!success) revert TransferFailed();
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Recover signer address from signature
     * @param messageHash Hash of the signed message
     * @param signature The signature bytes
     * @return Recovered signer address
     */
    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (address) {
        // EIP-191 signature
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // Extract r, s, v from signature
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        
        return ecrecover(ethSignedHash, v, r, s);
    }
    
    /**
     * @notice Split signature into r, s, v components
     * @param sig Signature bytes
     * @return r First 32 bytes
     * @return s Second 32 bytes
     * @return v Final byte
     */
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user balance
     * @param user User address
     * @return User's balance in wei
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    /**
     * @notice Check if bet is settled
     * @param betId Bet identifier
     * @return Whether the bet has been settled
     */
    function isBetSettled(bytes32 betId) external view returns (bool) {
        return settledBets[betId];
    }
    
    /**
     * @notice Get contract's total ETH balance
     * @return Total ETH held by contract
     */
    function getTotalBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ Fallback ============
    
    /// @notice Reject direct ETH transfers (must use deposit())
    receive() external payable {
        revert("Use deposit() function");
    }
}

