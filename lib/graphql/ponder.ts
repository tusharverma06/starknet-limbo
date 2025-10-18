import { GraphQLClient } from "graphql-request";

// Ponder GraphQL endpoint
const PONDER_ENDPOINT = "https://limbo-ponder-production.up.railway.app/";

// GraphQL client
export const ponderClient = new GraphQLClient(PONDER_ENDPOINT, {
  headers: {
    "Content-Type": "application/json",
  },
});

// Types based on your Ponder schema
export interface Bet {
  id: string;
  player: string;
  betAmount: string;
  targetMultiplier: string;
  limboMultiplier: string | null;
  win: boolean | null;
  payout: string | null;
  status: string;
  placedAt: number;
  resolvedAt: number | null;
  clientSeed: string | null;
  vrfRandomWord: string | null;
  vrfRequestTxHash: string;
  vrfFulfillTxHash: string | null;
}

export interface User {
  address: string;
  totalBets: number;
  totalWagered: string;
  totalWon: string;
  winCount: number;
  lossCount: number;
  lastBetTimestamp: number;
}

export interface BetsResponse {
  bets: {
    items: Bet[];
  };
}

export interface UserResponse {
  user: User | null;
}

export interface UsersResponse {
  users: {
    items: User[];
  };
}

// GraphQL Queries
export const GET_ALL_BETS = `
  query GetAllBets($limit: Int) {
    bets(limit: $limit, orderBy: "placedAt", orderDirection: "desc") {
      items {
        id
        player
        betAmount
        targetMultiplier
        limboMultiplier
        win
        payout
        status
        placedAt
        resolvedAt
        clientSeed
        vrfRandomWord
        vrfRequestTxHash
        vrfFulfillTxHash
      }
    }
  }
`;

export const GET_USER_BETS = `
  query GetUserBets($player: String!, $limit: Int) {
    bets(limit: $limit, where: { player: $player }, orderBy: "placedAt", orderDirection: "desc") {
      items {
        id
        player
        betAmount
        targetMultiplier
        limboMultiplier
        win
        payout
        status
        placedAt
        resolvedAt
        clientSeed
        vrfRandomWord
        vrfRequestTxHash
        vrfFulfillTxHash
      }
    }
  }
`;

export const GET_USER_STATS = `
  query GetUserStats($address: String!) {
    user(address: $address) {
      address
      totalBets
      totalWagered
      totalWon
      winCount
      lossCount
      lastBetTimestamp
    }
  }
`;

export const GET_RECENT_BETS = `
  query GetRecentBets($limit: Int = 10) {
    bets(limit: $limit, orderBy: "placedAt", orderDirection: "desc") {
      items {
        id
        player
        betAmount
        targetMultiplier
        limboMultiplier
        win
        payout
        status
        placedAt
        resolvedAt
        clientSeed
        vrfRandomWord
        vrfRequestTxHash
        vrfFulfillTxHash
      }
    }
  }
`;

export const GET_BET_BY_ID = `
  query GetBetById($id: String!) {
    bet(id: $id) {
      id
      player
      betAmount
      targetMultiplier
      limboMultiplier
      win
      payout
      status
      placedAt
      resolvedAt
      clientSeed
      vrfRandomWord
      vrfRequestTxHash
      vrfFulfillTxHash
    }
  }
`;

// API Functions
export class PonderAPI {
  /**
   * Get all bets with pagination
   */
  static async getAllBets(limit: number = 50): Promise<Bet[]> {
    try {
      const response = await ponderClient.request<BetsResponse>(GET_ALL_BETS, {
        limit,
      });
      return response.bets.items;
    } catch (error) {
      console.error("Failed to fetch all bets:", error);
      return [];
    }
  }

  /**
   * Get bets for a specific user
   */
  static async getUserBets(player: string, limit: number = 50): Promise<Bet[]> {
    try {
      const response = await ponderClient.request<BetsResponse>(GET_USER_BETS, {
        player: player.toLowerCase(),
        limit,
      });
      return response.bets.items;
    } catch (error) {
      console.error("Failed to fetch user bets:", error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(address: string): Promise<User | null> {
    try {
      const response = await ponderClient.request<UserResponse>(
        GET_USER_STATS,
        {
          address: address.toLowerCase(),
        }
      );
      return response.user;
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      return null;
    }
  }

  /**
   * Get recent bets
   */
  static async getRecentBets(limit: number = 10): Promise<Bet[]> {
    try {
      const response = await ponderClient.request<BetsResponse>(
        GET_RECENT_BETS,
        {
          limit,
        }
      );
      return response.bets.items;
    } catch (error) {
      console.error("Failed to fetch recent bets:", error);
      return [];
    }
  }

  /**
   * Get a specific bet by ID
   */
  static async getBetById(id: string): Promise<Bet | null> {
    try {
      const response = await ponderClient.request<{ bet: Bet | null }>(
        GET_BET_BY_ID,
        { id }
      );
      return response.bet;
    } catch (error) {
      console.error("Failed to fetch bet by ID:", error);
      return null;
    }
  }

  /**
   * Poll for new bets (for real-time updates)
   */
  static async pollForNewBets(
    lastTimestamp: number,
    callback: (bets: Bet[]) => void
  ): Promise<void> {
    try {
      const bets = await this.getRecentBets(100);
      const newBets = bets.filter((bet) => bet.placedAt > lastTimestamp);

      if (newBets.length > 0) {
        callback(newBets);
      }
    } catch (error) {
      console.error("Failed to poll for new bets:", error);
    }
  }

  /**
   * Get user's latest bet
   */
  static async getUserLatestBet(player: string): Promise<Bet | null> {
    try {
      const bets = await this.getUserBets(player, 1);
      return bets.length > 0 ? bets[0] : null;
    } catch (error) {
      console.error("Failed to fetch user latest bet:", error);
      return null;
    }
  }

  /**
   * Check if a bet exists (for validation)
   */
  static async betExists(id: string): Promise<boolean> {
    try {
      const bet = await this.getBetById(id);
      return bet !== null;
    } catch (error) {
      console.error("Failed to check if bet exists:", error);
      return false;
    }
  }
}
