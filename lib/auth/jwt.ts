import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be set");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string; // User.id (cuid)
  fid: string; // Farcaster ID
  address: string; // User's wallet address
  custodialWallet: string; // Server custodial wallet address
  iat?: number;
  exp?: number;
}

/**
 * Create a JWT token for authenticated user
 * Expires in 30 days (matching SIWE expiration)
 */
export async function createToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const token = await new SignJWT(payload as Record<string, string>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // 30 days
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract JWT from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Support both "Bearer token" and just "token"
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }

  return null;
}
