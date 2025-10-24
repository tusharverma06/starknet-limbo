import { NextRequest, NextResponse } from "next/server";
import { verifyQuickAuthToken } from "./quickAuthClient";

/**
 * Middleware to verify Quick Auth tokens in API routes
 * Extracts token from Authorization header and verifies it
 *
 * Usage in API route:
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const authResult = await verifyRequest(req);
 *   if (!authResult.success) {
 *     return authResult.response;
 *   }
 *
 *   const fid = authResult.fid;
 *   // Your authenticated logic here
 * }
 * ```
 */
export async function verifyRequest(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      ),
    };
  }

  const token = authorization.split(" ")[1];
  const domain = req.headers.get("host") || "localhost:3000";

  const result = await verifyQuickAuthToken(token, domain);

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid token", details: result.error },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    fid: result.fid,
    payload: result.payload,
  };
}
