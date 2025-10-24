import { createClient } from "@farcaster/quick-auth";

/**
 * Quick Auth client for verifying JWT tokens
 * This runs on the server side to validate tokens from the Farcaster SDK
 */
export const quickAuthClient = createClient();

/**
 * Verify a Quick Auth JWT token
 * @param token - The JWT token from the Authorization header
 * @param domain - Your app's domain (e.g., "localhost:3000" or "yourdomain.com")
 * @returns The decoded payload with user's FID as `sub`
 */
export async function verifyQuickAuthToken(token: string, domain: string) {
  try {
    const payload = await quickAuthClient.verifyJwt({
      token,
      domain,
    });

    return {
      success: true,
      fid: payload.sub, // Farcaster ID
      payload,
    };
  } catch (error) {
    console.error("Quick Auth verification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}
