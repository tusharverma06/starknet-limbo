/**
 * Client-side session management using localStorage
 * Allows multiple wallets to link to same session (one custodial wallet per session)
 */

const SESSION_KEY = "limbo_session_id";

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create session ID from localStorage
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    // Server-side rendering - return empty string
    return "";
  }

  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      return existing;
    }

    const newSessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, newSessionId);
    return newSessionId;
  } catch (error) {
    console.error("Error managing session ID:", error);
    // Fallback for browsers with localStorage disabled
    return generateSessionId();
  }
}

/**
 * Get existing session ID (returns null if none exists)
 */
export function getSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(SESSION_KEY);
  } catch (error) {
    console.error("Error getting session ID:", error);
    return null;
  }
}

/**
 * Clear session ID (useful for logout/reset)
 */
export function clearSessionId(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Error clearing session ID:", error);
  }
}
