import { NextRequest, NextResponse } from "next/server";

// middleware.ts - Production fix
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and auth pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("pait_auth")?.value;

  // More robust auth check
  if (pathname === "/messaging" || pathname === "/contacts") {
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);
      // Prevent caching in production
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate, private"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }
  }

  const response = NextResponse.next();
  // Always prevent caching of auth-related pages
  response.headers.set(
    "Cache-Control",
    "no-cache, no-store, must-revalidate, private"
  );
  return response;
}
