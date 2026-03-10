import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for wallet-based authentication
 * Authentication handled by requireAuth in each API route using wallet address
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[Middleware] Request:", pathname);

  // Skip middleware for public routes - auth handled client-side or in API routes
  if (
    pathname.startsWith("/_next") || // Next.js internals
    pathname.startsWith("/ping") || // Health check
    pathname === "/game" || // Game page
    pathname === "/" || // Home page
    pathname === "/bets" || // Bets page
    pathname === "/verify" || // Verify page
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  // Skip auth check for internal background processing routes
  if (pathname.startsWith("/api/wallet/")) {
    if (
      pathname === "/api/wallet/process-bet" ||
      pathname === "/api/wallet/process-bet-transactions" ||
      pathname === "/api/wallet/deduct-bet" ||
      pathname === "/api/wallet/process-payout"
    ) {
      console.log("[Middleware] Allowing internal background process");
      return NextResponse.next();
    }
  }

  // For all other routes, authentication is handled by requireAuth in each API route
  // No need for session cookies - wallet address passed as query parameter
  console.log("[Middleware] Passing request to API route for validation");

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
