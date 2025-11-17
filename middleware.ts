import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to verify session cookie for protected routes
 * Just checks if cookie exists - full validation happens in API routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[Middleware] Request:", pathname);

  // Skip middleware for public routes
  if (
    pathname.startsWith("/_next") || // Next.js internals
    pathname.startsWith("/siwe") || // SIWE sign-in (creates session)
    pathname.startsWith("/signout") || // Sign out
    pathname.startsWith("/custodial-wallet") || // Get custodial wallet before signing
    pathname.startsWith("/api/siwe") || // Legacy SIWE route
    pathname.startsWith("/api/signout") || // Legacy signout route
    pathname.startsWith("/api/custodial-wallet") || // Legacy custodial wallet route
    pathname.startsWith("/api/wallet/create") || // Create wallet (public)
    pathname.startsWith("/ping") || // Health check
    pathname === "/game" || // Game page (handles auth client-side)
    pathname === "/" || // Home page
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  // Protected routes require session cookie (except internal background processing)
  if (pathname.startsWith("/api/wallet/")) {
    // Skip auth for internal background processing routes
    if (pathname === "/api/wallet/process-bet" ||
        pathname === "/api/wallet/process-bet-transactions" ||
        pathname === "/api/wallet/deduct-bet" ||
        pathname === "/api/wallet/process-payout") {
      console.log("[Middleware] Allowing internal background process");
      return NextResponse.next();
    }

    const sessionId = request.cookies.get("session_id")?.value;

    if (!sessionId) {
      console.log("[Middleware] No session cookie found");
      return NextResponse.json(
        {
          error: "Please sign in first",
          code: "NO_SESSION",
          showToast: true
        },
        { status: 401 }
      );
    }

    console.log("[Middleware] Session cookie found, passing to API route for validation");

    // Don't verify session in middleware - let API routes handle it
    // This avoids Prisma edge runtime issues
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
