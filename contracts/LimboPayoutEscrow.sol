// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LimboPayoutEscrow
 * @notice Simple escrow contract for paying out bet winnings
 * @dev Backend generates results off-chain, then tells contract to pay winners
 */
contract LimboPayoutEscrow {
    // ============ State Variables ============
    
    /// @notice Contract owner (can fund and change signer)
    address public owner;
    
    /// @notice Backend server address that signs payout requests
    address public payoutSigner;
    
    /// @notice Tracks which payouts have been processed (prevents replay)
    mapping(bytes32 => bool) public processedPayouts;
    
    /// @notice Minimum payout amount (prevents spam)
    uint256 public minPayout;
    
    // ============ Events ============
    
    event PayoutProcessed(
        bytes32 indexed payoutId,
        address indexed recipient,
        uint256 amount
    );
    event Funded(address indexed funder, uint256 amount);
    event PayoutSignerChanged(address indexed oldSigner, address indexed newSigner);
    event MinPayoutChanged(uint256 oldMin, uint256 newMin);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    
    // ============ Errors ============
    
    error Unauthorized();
    error InvalidSignature();
    error PayoutAlreadyProcessed();
    error InsufficientBalance();
    error BelowMinimumPayout();
    error TransferFailed();
    error ZeroAddress();
    error ZeroAmount();
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _payoutSigner, uint256 _minPayout) {
        if (_payoutSigner == address(0)) revert ZeroAddress();
        
        owner = msg.sender;
        payoutSigner = _payoutSigner;
        minPayout = _minPayout;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Process a bet payout to winner with full bet verification
     * @param payoutId Unique identifier for this payout (betId)
     * @param recipient Address to receive the payout (player wallet)
     * @param wager Original bet amount (in wei)
     * @param win Whether the bet was a win
     * @param amount Amount to pay out (in wei) - only sent if win=true
     * @param signature Backend signature authorizing this payout
     * @dev Anyone can call this, signature provides security
     * @dev Signature proves: hash(payoutId + recipient + wager + win + amount)
     */
    function processPayout(
        bytes32 payoutId,
        address recipient,
        uint256 wager,
        bool win,
        uint256 amount,
        bytes memory signature
    ) external {
        // Validations
        if (recipient == address(0)) revert ZeroAddress();
        if (processedPayouts[payoutId]) revert PayoutAlreadyProcessed();
        
        // Verify signature from backend (includes all bet details)
        bytes32 messageHash = keccak256(
            abi.encodePacked(payoutId, recipient, wager, win, amount)
        );
        address recoveredSigner = recoverSigner(messageHash, signature);
        if (recoveredSigner != payoutSigner) revert InvalidSignature();
        
        // Mark as processed (prevent replay)
        processedPayouts[payoutId] = true;
        
        // Only pay if win (signature still verifies the loss for transparency)
        if (win) {
            if (amount == 0) revert ZeroAmount();
            if (amount < minPayout) revert BelowMinimumPayout();
            if (address(this).balance < amount) revert InsufficientBalance();
            
            // Send ETH to winner
            (bool success, ) = payable(recipient).call{value: amount}("");
            if (!success) revert TransferFailed();
        }
        
        emit PayoutProcessed(payoutId, recipient, amount);
    }
    
    /**
     * @notice Batch process multiple payouts (gas optimization)
     * @param payoutIds Array of payout identifiers
     * @param recipients Array of recipient addresses
     * @param wagers Array of wager amounts
     * @param wins Array of win/loss booleans
     * @param amounts Array of payout amounts
     * @param signatures Array of backend signatures
     */
    function batchProcessPayouts(
        bytes32[] calldata payoutIds,
        address[] calldata recipients,
        uint256[] calldata wagers,
        bool[] calldata wins,
        uint256[] calldata amounts,
        bytes[] calldata signatures
    ) external {
        uint256 length = payoutIds.length;
        require(
            length == recipients.length &&
            length == wagers.length &&
            length == wins.length &&
            length == amounts.length &&
            length == signatures.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < length; i++) {
            // Skip if already processed (don't revert entire batch)
            if (processedPayouts[payoutIds[i]]) continue;
            
            try this.processPayout(
                payoutIds[i],
                recipients[i],
                wagers[i],
                wins[i],
                amounts[i],
                signatures[i]
            ) {
                // Success
            } catch {
                // Skip failed payouts, continue with rest
                continue;
            }
        }
    }
    
    // ============ Owner Functions ============
    
    /**
     * @notice Fund the contract (anyone can fund, but typically owner)
     */
    function fund() external payable {
        if (msg.value == 0) revert ZeroAmount();
        emit Funded(msg.sender, msg.value);
    }
    
    /**
     * @notice Change the payout signer address
     * @param newSigner New backend signer address
     */
    function setPayoutSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZeroAddress();
        
        address oldSigner = payoutSigner;
        payoutSigner = newSigner;
        emit PayoutSignerChanged(oldSigner, newSigner);
    }
    
    /**
     * @notice Update minimum payout amount
     * @param newMinPayout New minimum payout in wei
     */
    function setMinPayout(uint256 newMinPayout) external onlyOwner {
        uint256 oldMin = minPayout;
        minPayout = newMinPayout;
        emit MinPayoutChanged(oldMin, newMinPayout);
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     * @param amount Amount to withdraw
     * @param to Address to send funds to
     * @dev Use with caution - should only be for emergencies
     */
    function emergencyWithdraw(uint256 amount, address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount > address(this).balance) revert InsufficientBalance();
        
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit EmergencyWithdraw(to, amount);
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
     * @notice Check if a payout has been processed
     * @param payoutId Payout identifier
     * @return Whether the payout has been processed
     */
    function isPayoutProcessed(bytes32 payoutId) external view returns (bool) {
        return processedPayouts[payoutId];
    }
    
    /**
     * @notice Get contract's ETH balance
     * @return Balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ Fallback ============
    
    /// @notice Accept ETH deposits
    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }
}

