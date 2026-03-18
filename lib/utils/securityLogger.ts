/**
 * Security logging utility for tracking suspicious activity
 * In production, integrate with proper logging service (DataDog, Sentry, etc.)
 */

interface SecurityEvent {
  type: "rate_limit" | "auth_failure" | "suspicious_pattern" | "api_abuse";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, unknown>;
  timestamp: number;
}

// In-memory store (use proper database/logging service in production)
const securityLogs: SecurityEvent[] = [];
const MAX_LOGS = 10000; // Keep last 10k events in memory

/**
 * Log a security event
 */
export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now(),
  };

  securityLogs.push(fullEvent);

  // Keep only recent logs
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.shift();
  }

  // Log to console (in production, send to logging service)
  const logLevel = event.severity === "critical" || event.severity === "high" ? "error" : "warn";
  console[logLevel](`🚨 Security Event [${event.type}]:`, {
    severity: event.severity,
    userId: event.userId,
    ip: event.ip,
    details: event.details,
  });
}

/**
 * Get recent security events
 */
export function getRecentSecurityEvents(
  limit = 100,
  filter?: Partial<Pick<SecurityEvent, "type" | "severity" | "userId">>
): SecurityEvent[] {
  let events = securityLogs;

  if (filter) {
    events = events.filter((event) => {
      if (filter.type && event.type !== filter.type) return false;
      if (filter.severity && event.severity !== filter.severity) return false;
      if (filter.userId && event.userId !== filter.userId) return false;
      return true;
    });
  }

  return events.slice(-limit).reverse();
}

/**
 * Analyze user behavior for suspicious patterns
 */
export function detectSuspiciousPatterns(userId: string, recentBets: {
  amount: number;
  timestamp: number;
  won: boolean;
}[]): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Pattern 1: Many bets in short time
  if (recentBets.length > 50) {
    const timespanMinutes = (Date.now() - recentBets[recentBets.length - 1].timestamp) / (1000 * 60);
    if (timespanMinutes < 5) {
      reasons.push(`${recentBets.length} bets in ${timespanMinutes.toFixed(1)} minutes (possible bot)`);
    }
  }

  // Pattern 2: Consistent bet amounts (bot-like behavior)
  if (recentBets.length > 20) {
    const amounts = recentBets.map(b => b.amount);
    const uniqueAmounts = new Set(amounts);
    if (uniqueAmounts.size <= 2) {
      reasons.push(`Only ${uniqueAmounts.size} unique bet amounts in ${recentBets.length} bets (bot pattern)`);
    }
  }

  // Pattern 3: Unusually high win rate (possible exploit)
  if (recentBets.length >= 20) {
    const winRate = recentBets.filter(b => b.won).length / recentBets.length;
    if (winRate > 0.7) {
      reasons.push(`Win rate ${(winRate * 100).toFixed(1)}% is suspiciously high`);
    }
  }

  // Pattern 4: Large volume in short time
  const last10MinBets = recentBets.filter(
    b => Date.now() - b.timestamp < 10 * 60 * 1000
  );
  const totalVolume = last10MinBets.reduce((sum, b) => sum + b.amount, 0);
  if (totalVolume > 500) { // $500 in 10 minutes
    reasons.push(`$${totalVolume.toFixed(2)} bet volume in 10 minutes (unusually high)`);
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}
