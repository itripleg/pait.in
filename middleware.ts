// middleware.ts - Fixed version with better cookie handling and debugging
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/messaging", "/contacts"];

// Routes that require SMS opt-in (only messaging for now)
const optInRoutes = ["/messaging"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and auth pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/login" ||
    pathname === "/opt-in" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Debug logging for production
  console.log(`[MIDDLEWARE] Processing: ${pathname}`);

  const authToken = request.cookies.get("pait_auth")?.value;
  const hasOptedIn = request.cookies.get("pait_optin")?.value === "true";

  console.log(`[MIDDLEWARE] Auth token present: ${!!authToken}`);
  console.log(`[MIDDLEWARE] Opted in: ${hasOptedIn}`);

  // Check if route needs authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    console.log(`[MIDDLEWARE] Protected route detected: ${pathname}`);

    if (!authToken) {
      console.log(`[MIDDLEWARE] No auth token, redirecting to login`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      // Add cache-busting headers to prevent caching of redirects
      const response = NextResponse.redirect(loginUrl);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }
  }

  // Check if route needs SMS opt-in
  const needsOptIn = optInRoutes.some((route) => pathname.startsWith(route));

  if (needsOptIn && authToken) {
    console.log(`[MIDDLEWARE] Opt-in required route: ${pathname}`);

    // Only check opt-in if user is authenticated
    if (!hasOptedIn) {
      console.log(`[MIDDLEWARE] No opt-in, redirecting to opt-in page`);
      const optInUrl = new URL("/opt-in", request.url);
      optInUrl.searchParams.set("redirect", pathname);

      // Add cache-busting headers
      const response = NextResponse.redirect(optInUrl);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }
  }

  console.log(`[MIDDLEWARE] Allowing request to: ${pathname}`);

  // Add cache-busting headers to all responses to prevent stale auth state
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|static).*)",
  ],
};
