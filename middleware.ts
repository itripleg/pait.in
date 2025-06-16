// middleware.ts - Fixed to work with new user system and prevent loops
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/messaging", "/contacts", "/admin"];

// Routes that require SMS opt-in (only messaging for now)
const optInRoutes = ["/messaging"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware running for:", pathname);

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

  console.log("Auth token:", authToken ? "present" : "missing");
  console.log("Opted in:", hasOptedIn);

  // Check if route needs authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!authToken) {
      console.log("No auth token, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate the token against our user system
    // For now, we'll let the API routes handle validation
    // since we don't want to import user management here
  }

  // Check if route needs SMS opt-in
  const needsOptIn = optInRoutes.some((route) => pathname.startsWith(route));

  if (needsOptIn && authToken) {
    // Only check opt-in if user is authenticated
    if (!hasOptedIn) {
      console.log("User not opted in, redirecting to opt-in");
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
