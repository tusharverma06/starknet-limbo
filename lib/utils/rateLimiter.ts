/**
 * Rate limiter for API endpoints
 * Prevents abuse by limiting requests per user/IP
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  totalAmount?: number; // For bet amount tracking
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  maxAmount?: number; // Max total bet amount per window (in USD)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @param amount - Optional amount for bet tracking (in USD)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  amount?: number
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Get or create entry
  let entry = rateLimitStore[key];

  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      totalAmount: 0,
    };
    rateLimitStore[key] = entry;
  }

  // Check request count limit
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: `Rate limit exceeded. Max ${config.maxRequests} requests per ${config.windowMs / 1000}s`,
    };
  }

  // Check amount limit (if applicable)
  if (amount !== undefined && config.maxAmount !== undefined) {
    const newTotal = (entry.totalAmount || 0) + amount;
    if (newTotal > config.maxAmount) {
      return {
        allowed: false,
        remaining: entry.count > 0 ? config.maxRequests - entry.count : 0,
        resetTime: entry.resetTime,
        error: `Bet amount limit exceeded. Max $${config.maxAmount} total per ${config.windowMs / 1000}s`,
      };
    }
  }

  // Update entry
  entry.count++;
  if (amount !== undefined) {
    entry.totalAmount = (entry.totalAmount || 0) + amount;
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore[identifier];

  if (!entry || entry.resetTime < now) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }

  return {
    allowed: entry.count < config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Use with caution - mainly for testing or admin overrides
 */
export function resetRateLimit(identifier: string): void {
  delete rateLimitStore[identifier];
}
