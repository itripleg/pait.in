// app/login/page.tsx - Clean version with idle-based cookie expiration
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get redirect parameter directly from URL
  const getRedirectParam = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("redirect") || "/";
    }
    return "/";
  };

  // Set cookie with idle timeout (expires after 4 hours of no activity)
  const setAuthCookie = (name: string, value: string) => {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 4); // 4 hours from now

    document.cookie = `${name}=${value}; path=/; expires=${expirationTime.toUTCString()}; samesite=strict`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const redirectTo = getRedirectParam();

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Set auth cookie with 4-hour idle timeout
        setAuthCookie("pait_auth", password);

        // Set user info cookie
        setAuthCookie(
          "pait_user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            emoji: data.user.emoji,
            role: data.user.role,
          })
        );

        // Redirect logic
        if (redirectTo && redirectTo !== "/") {
          window.location.href = redirectTo;
        } else {
          if (data.user.role === "admin") {
            window.location.href = "/contacts";
          } else {
            window.location.href = "/";
          }
        }
      } else {
        setError("Invalid password");
      }
    } catch (error) {
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
