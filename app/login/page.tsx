// app/login/page.tsx - Fixed version with no render loops
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize redirect param to prevent repeated calls
  const redirectParam = useMemo(() => {
    const redirect = searchParams.get("redirect") || "/";

    // Fallback: check referrer only once
    if (
      redirect === "/" &&
      typeof window !== "undefined" &&
      document.referrer
    ) {
      const referrerUrl = new URL(document.referrer);
      const referrerPath = referrerUrl.pathname;

      if (referrerPath === "/messaging" || referrerPath === "/contacts") {
        return referrerPath;
      }
    }

    return redirect;
  }, [searchParams]);

  // Stable cookie setting function
  const setAuthCookie = useCallback((name: string, value: string) => {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 4);

    const isProduction = window.location.protocol === "https:";

    let cookieString = `${name}=${value}; path=/; expires=${expirationTime.toUTCString()}`;

    if (isProduction) {
      cookieString += "; secure; samesite=lax";
    } else {
      cookieString += "; samesite=strict";
    }

    document.cookie = cookieString;
  }, []);

  // Check authentication only once on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuthOnce = async () => {
      if (typeof window === "undefined") return;

      try {
        // Check API first
        const response = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        });

        if (response.ok && isMounted) {
          const data = await response.json();

          if (data.authenticated && data.user) {
            // User is authenticated, redirect immediately
            if (redirectParam && redirectParam !== "/") {
              window.location.href = redirectParam;
            } else if (data.user.role === "admin") {
              window.location.href = "/contacts";
            } else {
              window.location.href = "/";
            }
            return;
          }
        }

        // Check for stale cookies and clear them
        const authCookie = document.cookie
          .split(";")
          .find((cookie) => cookie.trim().startsWith("pait_auth="));

        if (authCookie && isMounted) {
          // Clear stale cookies
          document.cookie =
            "pait_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "pait_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuthOnce();

    return () => {
      isMounted = false;
    };
  }, [redirectParam]); // Only depend on memoized redirectParam

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (loading) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          credentials: "include",
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          const data = await response.json();

          // Set cookies
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

          // Wait for cookies to be set
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Redirect based on role or intended destination
          if (
            redirectParam &&
            redirectParam !== "/" &&
            redirectParam !== window.location.pathname
          ) {
            window.location.href = redirectParam;
          } else if (data.user.role === "admin") {
            window.location.href = "/contacts";
          } else {
            window.location.href = "/";
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Invalid password");
        }
      } catch (error) {
        console.error("Login error:", error);
        setError("Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading, password, redirectParam, setAuthCookie]
  );

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-green-500/30">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-400 animate-pulse">
                Checking authentication...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              disabled={loading || !password.trim()}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-mono font-bold"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-green-400/50">
            <p>🔒 Secure access required</p>
            <p className="mt-1 text-green-400/30">
              Session expires after 4 hours of inactivity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
