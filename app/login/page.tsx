// app/login/page.tsx - Fixed version with proper cookie handling and redirect
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
  const router = useRouter();

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      if (typeof window !== "undefined") {
        const authCookie = document.cookie
          .split(";")
          .find((cookie) => cookie.trim().startsWith("pait_auth="));

        if (authCookie) {
          console.log("DEBUG - User already authenticated, redirecting...");
          const redirectTo = getRedirectParam();

          if (redirectTo && redirectTo !== "/") {
            console.log("DEBUG - Auto-redirecting to:", redirectTo);
            window.location.href = redirectTo; // Use window.location for reliability
          } else {
            console.log("DEBUG - Auto-redirecting to home");
            window.location.href = "/";
          }
        }
      }
    };

    // Check immediately and after a short delay
    checkAuthAndRedirect();
    const timeout = setTimeout(checkAuthAndRedirect, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Get redirect parameter directly from URL
  const getRedirectParam = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect") || "/";
      console.log("DEBUG - Raw URL:", window.location.href);
      console.log("DEBUG - Search params:", window.location.search);
      console.log("DEBUG - Parsed redirect:", redirect);

      // Fallback: if no redirect param but we came from a protected route,
      // check the referrer
      if (redirect === "/" && document.referrer) {
        const referrerUrl = new URL(document.referrer);
        const referrerPath = referrerUrl.pathname;
        console.log("DEBUG - Referrer path:", referrerPath);

        // If referrer was a protected route, use that
        if (referrerPath === "/messaging" || referrerPath === "/contacts") {
          console.log("DEBUG - Using referrer as redirect:", referrerPath);
          return referrerPath;
        }
      }

      return redirect;
    }
    return "/";
  };

  // Improved cookie setting with consistent SameSite policy
  const setAuthCookie = (name: string, value: string) => {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 4); // 4 hours from now

    // Use Lax for better cross-site compatibility while maintaining security
    const isProduction = window.location.protocol === "https:";
    const cookieString = `${name}=${value}; path=/; expires=${expirationTime.toUTCString()}; samesite=lax${
      isProduction ? "; secure" : ""
    }`;

    console.log("DEBUG - Setting cookie:", cookieString);
    document.cookie = cookieString;

    // Verify cookie was set
    setTimeout(() => {
      const cookieCheck = document.cookie.includes(`${name}=`);
      console.log(`DEBUG - Cookie ${name} set successfully:`, cookieCheck);
      if (!cookieCheck) {
        console.error(
          "DEBUG - Cookie failed to set! Current cookies:",
          document.cookie
        );
        console.error("DEBUG - Attempted cookie string:", cookieString);
      }
    }, 100);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const redirectTo = getRedirectParam();
    console.log("DEBUG - Starting login process");
    console.log("DEBUG - Redirect target:", redirectTo);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("DEBUG - Login successful for:", data.user.name);

        // Set cookies with consistent Lax policy
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

        console.log("DEBUG - Cookies set, waiting before redirect");

        // Wait longer to ensure cookies are properly set before redirecting
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Force a fresh page load to ensure middleware sees the cookies
        if (
          redirectTo &&
          redirectTo !== "/" &&
          redirectTo !== window.location.pathname
        ) {
          console.log("DEBUG - Redirecting to intended page:", redirectTo);
          window.location.href = redirectTo;
        } else {
          console.log("DEBUG - Using role-based redirect");
          if (data.user.role === "admin") {
            window.location.href = "/contacts";
          } else {
            window.location.href = "/";
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid password");
      }
    } catch (error) {
      console.error("DEBUG - Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
