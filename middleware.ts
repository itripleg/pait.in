// middleware.ts (in root directory, same level as app/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/messaging",
  "/contacts",
  "/games",
  "/gallery",
  "/ai",
  "/settings",
];

// Routes that require SMS opt-in
const optInRoutes = ["/messaging"];

export function middleware(request: NextRequest) {
  console.log("Middleware running for:", request.nextUrl.pathname);

  const authToken = request.cookies.get("pait_auth")?.value;
  const hasOptedIn = request.cookies.get("pait_optin")?.value === "true";

  console.log("Auth token:", authToken);
  console.log("Opted in:", hasOptedIn);
  const { pathname } = request.nextUrl;

  // Check if route needs authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for auth token in cookies or headers
    const authToken = request.cookies.get("pait_auth")?.value;

    if (!authToken) {
      // Redirect to login page with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the token (simple comparison for now)
    if (authToken !== process.env.APP_PASSWORD) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if route needs SMS opt-in
  const needsOptIn = optInRoutes.some((route) => pathname.startsWith(route));

  if (needsOptIn) {
    // Check opt-in status via header (we'll set this from client)
    const hasOptedIn = request.cookies.get("pait_optin")?.value === "true";

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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

// Create a dedicated login page
