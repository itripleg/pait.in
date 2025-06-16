// middleware.ts - Clean version with proper redirect handling
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

  const authToken = request.cookies.get("pait_auth")?.value;
  const hasOptedIn = request.cookies.get("pait_optin")?.value === "true";

  // Check if route needs authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if route needs SMS opt-in
  const needsOptIn = optInRoutes.some((route) => pathname.startsWith(route));

  if (needsOptIn && authToken) {
    // Only check opt-in if user is authenticated
    if (!hasOptedIn) {
      const optInUrl = new URL("/opt-in", request.url);
      optInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(optInUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|static).*)",
  ],
};
