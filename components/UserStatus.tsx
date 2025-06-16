// components/UserStatus.tsx - Fixed to read authentication properly
"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  id: string;
  name: string;
  role: "admin" | "user";
  emoji: string;
}

export function UserStatus() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const updateUserStatus = () => {
      // Check if we have auth cookie
      const authCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_auth="));

      if (!authCookie) {
        setAuthenticated(false);
        setUser(null);
        return;
      }

      // Check for user info cookie
      const userCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_user="));

      if (userCookie) {
        try {
          const userInfo = JSON.parse(userCookie.split("=")[1]);
          setUser(userInfo);
          setAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user cookie:", error);
          setAuthenticated(false);
          setUser(null);
        }
      } else {
        // Fallback: try to get user info from auth API
        fetch("/api/auth")
          .then((response) => response.json())
          .then((data) => {
            if (data.authenticated && data.user) {
              setUser(data.user);
              setAuthenticated(true);

              // Set the user cookie for future reads
              document.cookie = `pait_user=${JSON.stringify(
                data.user
              )}; path=/; max-age=86400`;
            } else {
              setAuthenticated(false);
              setUser(null);
            }
          })
          .catch(() => {
            setAuthenticated(false);
            setUser(null);
          });
      }
    };

    // Check immediately
    updateUserStatus();

    // Set up a listener for changes (when user logs in/out)
    const interval = setInterval(updateUserStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state initially
  if (authenticated === null) {
    return (
      <span className="text-green-400 font-mono text-xs sm:text-sm tracking-wider">
        <span className="animate-pulse">loading@pait.in:~$</span>
      </span>
    );
  }

  // Show guest state if not authenticated
  if (!authenticated || !user) {
    return (
      <span className="text-green-400 font-mono text-xs sm:text-sm tracking-wider">
        <span className="text-green-400/60">guest</span>
        <span className="text-green-500/80">@pait.in</span>
        <span className="text-green-400/80">:~$</span>
        <span className="ml-2 text-yellow-500/60 text-xs hidden sm:inline">
          [UNAUTHORIZED]
        </span>
        <span className="ml-2 sm:hidden text-xs">❌</span>
      </span>
    );
  }

  return (
    <span className="text-green-400 font-mono text-xs sm:text-sm tracking-wider">
      <span className="text-green-400">{user.name.toLowerCase()}</span>
      <span className="text-green-500/80">@pait.in</span>
      <span className="text-green-400/80">:~$</span>

      {/* Role indicator for desktop */}
      <span className="ml-2 text-green-500/60 text-xs hidden sm:inline">
        [{user.role.toUpperCase()}]
      </span>

      {/* User emoji for mobile */}
      <span className="ml-2 sm:hidden text-xs">{user.emoji}</span>
    </span>
  );
}
