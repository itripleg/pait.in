// app/login/page.tsx - Production debugging version
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // Add debug logging function
  const addDebug = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo((prev) => [...prev.slice(-10), logMessage]); // Keep last 10 messages
  };

  // Check if user is already authenticated - but only once
  useEffect(() => {
    const checkAuthOnce = async () => {
      addDebug("Starting auth check...");

      if (typeof window === "undefined") {
        addDebug("Window is undefined, skipping auth check");
        return;
      }

      try {
        addDebug("Checking current URL: " + window.location.href);
        addDebug("Current cookies: " + document.cookie);

        // Check via API first (most reliable)
        addDebug("Making API call to /api/auth...");
        const response = await fetch("/api/auth", {
          method: "GET",
          credentials: "include", // Important for production
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        addDebug(`API response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          addDebug(`API response data: ${JSON.stringify(data)}`);

          if (data.authenticated && data.user) {
            addDebug("User already authenticated via API, redirecting...");
            const redirectTo = getRedirectParam();
            addDebug(`Redirect target: ${redirectTo}`);

            // Use window.location for production reliability
            setTimeout(() => {
              addDebug("Executing redirect...");
              if (redirectTo && redirectTo !== "/") {
                window.location.href = redirectTo;
              } else if (data.user.role === "admin") {
                window.location.href = "/contacts";
              } else {
                window.location.href = "/";
              }
            }, 1000);
            return;
          } else {
            addDebug("API response indicates not authenticated");
          }
        } else {
          addDebug(`API call failed with status: ${response.status}`);
        }

        // Fallback: check cookies directly
        const authCookie = document.cookie
          .split(";")
          .find((cookie) => cookie.trim().startsWith("pait_auth="));

        if (authCookie) {
          addDebug("Found auth cookie, but API said not authenticated");
          addDebug("This suggests a cookie/API mismatch issue");

          // Clear potentially stale cookies
          document.cookie =
            "pait_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "pait_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          addDebug("Cleared stale cookies");
        } else {
          addDebug("No auth cookie found");
        }
      } catch (error) {
        addDebug(`Auth check error: ${error}`);
        console.error("Auth check failed:", error);
      } finally {
        addDebug("Auth check completed, showing login form");
        setIsChecking(false);
      }
    };

    // Only run this check once on mount
    checkAuthOnce();
  }, []); // Empty dependency array

  const getRedirectParam = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect") || "/";
      addDebug(`Parsed redirect param: ${redirect}`);

      // Fallback: if no redirect param but we came from a protected route
      if (redirect === "/" && document.referrer) {
        const referrerUrl = new URL(document.referrer);
        const referrerPath = referrerUrl.pathname;
        addDebug(`Referrer path: ${referrerPath}`);

        if (referrerPath === "/messaging" || referrerPath === "/contacts") {
          addDebug(`Using referrer as redirect: ${referrerPath}`);
          return referrerPath;
        }
      }

      return redirect;
    }
    return "/";
  };

  const setAuthCookie = (name: string, value: string) => {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 4);

    // Production-specific cookie settings
    const isProduction = window.location.protocol === "https:";
    const domain = window.location.hostname;

    // More explicit cookie string for production
    let cookieString = `${name}=${value}; path=/; expires=${expirationTime.toUTCString()}`;

    if (isProduction) {
      cookieString += "; secure; samesite=lax";
      // Don't set domain for production - let it default to current domain
    } else {
      cookieString += "; samesite=strict";
    }

    addDebug(`Setting cookie: ${name} with string: ${cookieString}`);
    document.cookie = cookieString;

    // Verify cookie was set
    setTimeout(() => {
      const cookieCheck = document.cookie.includes(`${name}=`);
      addDebug(
        `Cookie ${name} verification: ${cookieCheck ? "SUCCESS" : "FAILED"}`
      );
      if (!cookieCheck) {
        addDebug(`Current cookies after attempt: ${document.cookie}`);
      }
    }, 100);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      addDebug("Login already in progress, ignoring submission");
      return;
    }

    setLoading(true);
    setError("");
    addDebug("Starting login process...");

    const redirectTo = getRedirectParam();

    try {
      addDebug("Making login API call...");
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include", // Important for production
        body: JSON.stringify({ password }),
      });

      addDebug(`Login API response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        addDebug(`Login successful for: ${data.user.name}`);
        addDebug(`User role: ${data.user.role}`);

        // Set cookies with production-safe settings
        setAuthCookie("pait_auth", password);
        setAuthCookie(
          "pait_user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            emoji: data.user.emoji,
            role: data.user.role,
          })
        );

        addDebug("Cookies set, waiting before redirect...");

        // Wait longer in production for cookie propagation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        addDebug("Executing redirect...");

        // Force reload approach for production
        if (
          redirectTo &&
          redirectTo !== "/" &&
          redirectTo !== window.location.pathname
        ) {
          addDebug(`Redirecting to intended page: ${redirectTo}`);
          window.location.href = redirectTo;
        } else {
          addDebug("Using role-based redirect");
          if (data.user.role === "admin") {
            window.location.href = "/contacts";
          } else {
            window.location.href = "/";
          }
        }
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.error || "Invalid password";
        addDebug(`Login failed: ${errorMsg}`);
        setError(errorMsg);
      }
    } catch (error) {
      addDebug(`Login error: ${error}`);
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-green-500/30">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-400 animate-pulse mb-4">
                Checking authentication...
              </div>
              {/* Show debug info in development */}
              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-left text-zinc-400 max-h-32 overflow-y-auto">
                  {debugInfo.map((info, i) => (
                    <div key={i}>{info}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const redirectParam = getRedirectParam();

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-green-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-400">
            🔐 PAIT LOGIN
          </CardTitle>
          <p className="text-green-400/70 text-sm mt-2">
            Personal Assistant & Information Terminal
          </p>
          {redirectParam && redirectParam !== "/" && (
            <p className="text-yellow-400/70 text-xs mt-2">
              Login required to access{" "}
              {redirectParam.replace("/", "").toUpperCase()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-950/30 p-2 rounded border border-red-500/30">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-mono font-bold"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </Button>
          </form>

          {/* Debug Panel - Show in production temporarily */}
          {debugInfo.length > 0 && (
            <div className="mt-6 p-3 bg-zinc-800 rounded border border-zinc-600">
              <h4 className="text-xs text-green-400 mb-2">Debug Log:</h4>
              <div className="text-xs text-zinc-400 max-h-32 overflow-y-auto space-y-1">
                {debugInfo.map((info, i) => (
                  <div key={i} className="font-mono">
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-green-400/50">
            <p>🔒 Secure access required</p>
            <p className="mt-1 text-green-400/30">
              Session expires after 4 hours of inactivity
            </p>
            <p className="mt-1 text-yellow-400/50">
              Production Debug Mode Active
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
