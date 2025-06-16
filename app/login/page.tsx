// app/login/page.tsx - Enhanced login with user detection
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
        const data = await response.json();

        // Set auth cookie with password (we'll validate on each request)
        document.cookie = `pait_auth=${password}; path=/; max-age=86400`; // 24 hours

        // Set user info cookie for UI (this is what UserStatus reads)
        document.cookie = `pait_user=${JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          emoji: data.user.emoji,
          role: data.user.role,
        })}; path=/; max-age=86400`;

        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
