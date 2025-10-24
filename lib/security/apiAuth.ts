import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * API Key authentication middleware
 * Protects sensitive endpoints from unauthorized access
 */

export interface AuthConfig {
  requireApiKey?: boolean;
  allowedKeys?: string[];
}

/**
 * Verify API key from request headers
 */
export function verifyApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return false;
  }

  // Get allowed API keys from environment
  const payout_api_key = process.env.PAYOUT_API_KEY;
  const worker_api_key = process.env.WORKER_API_KEY;

  const allowedKeys = [payout_api_key, worker_api_key].filter(Boolean);

  if (allowedKeys.length === 0) {
    console.error("⚠️ No API keys configured in environment");
    return false;
  }

  return allowedKeys.includes(apiKey);
}

/**
 * Middleware wrapper for API key authentication
 * Usage: wrap your route handler with this function
 */
export function requireApiKey<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse<T> | NextResponse> => {
    // Check API key
    if (!verifyApiKey(req)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Valid API key required",
        },
        { status: 401 }
      );
    }

    // Call the actual handler
    return await handler(req);
  };
}

/**
 * Generate a secure random API key
 * Use this to generate new API keys for your .env file
 */
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  // API key should be 64 hex characters
  return /^[a-f0-9]{64}$/i.test(key);
}
