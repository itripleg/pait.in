// components/UserStatus.tsx
"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, isAuthenticated, type UserProfile } from "@/lib/auth";

export function UserStatus() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const updateUserStatus = () => {
      const authStatus = isAuthenticated();
      const currentUser = getCurrentUser();

      setAuthenticated(authStatus);
      setUser(currentUser);
    };

    // Check immediately
    updateUserStatus();

    // Set up a listener for changes (when user logs in/out or switches profiles)
    const interval = setInterval(updateUserStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state initially
  if (authenticated === null || !user) {
    return (
      <span className="text-green-400 font-mono text-xs sm:text-sm tracking-wider">
        <span className="animate-pulse">loading@pait.in:~$</span>
      </span>
    );
  }

  return (
    <span className="text-green-400 font-mono text-xs sm:text-sm tracking-wider">
      <span className={authenticated ? "text-green-400" : "text-green-400/60"}>
        {user.username}
      </span>
      <span className="text-green-500/80">@pait.in</span>
      <span className="text-green-400/80">:~$</span>

      {/* Status indicator */}
      {authenticated && (
        <span className="ml-2 text-green-500/60 text-xs hidden sm:inline">
          [{user.role}]
        </span>
      )}

      {!authenticated && (
        <span className="ml-2 text-yellow-500/60 text-xs hidden sm:inline">
          [UNAUTHORIZED]
        </span>
      )}

      {/* User emoji for mobile */}
      <span className="ml-2 sm:hidden text-xs">{user.emoji}</span>
    </span>
  );
}
