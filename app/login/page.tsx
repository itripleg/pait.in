// app/login/page.tsx
"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Use more explicit cookie settings for production
        const expires = new Date();
        expires.setDate(expires.getDate() + 1); // 1 day from now

        document.cookie = `pait_auth=${password}; path=/; expires=${expires.toUTCString()}; samesite=lax; secure=${
          window.location.protocol === "https:"
        }`;

        console.log("Cookie set, redirecting to:", redirectTo); // Debug log
        router.push(redirectTo);
      } else {
        setError("Invalid password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Add after successful login response
  if (response.ok) {
    console.log("Login successful");
    console.log("Current URL:", window.location.href);
    console.log("Redirect to:", redirectTo);
    console.log("Cookies before:", document.cookie);

    // Set cookie
    document.cookie = `pait_auth=${password}; path=/; expires=${expires.toUTCString()}; samesite=lax; secure=${
      window.location.protocol === "https:"
    }`;

    console.log("Cookies after:", document.cookie);

    // Wait a bit then redirect
    setTimeout(() => {
      console.log("Redirecting now...");
      router.push(redirectTo);
    }, 100);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-green-500/30">
        <CardHeader className="text-center">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-green-400 hover:bg-green-500/10 absolute left-4 top-4"
          >
            ← Home
          </Button>
          <div className="text-4xl mb-4">🔐</div>
          <CardTitle className="text-green-400 font-mono text-2xl">
            PAIT ACCESS
          </CardTitle>
          <p className="text-green-400/70 text-sm">Authentication required</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="bg-zinc-800 border-zinc-700 text-green-400 font-mono placeholder:text-zinc-500"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-mono font-bold"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS GRANTED"}
            </Button>
          </form>
          {error && (
            <p className="mt-4 text-center text-red-400 font-mono text-sm">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-green-400 font-mono">Loading login...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
