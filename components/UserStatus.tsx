// components/UserStatus.tsx - Fixed hydration with proper SSR handling
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
  const [isClient, setIsClient] = useState(false);

  // Update cookie expiration on user activity
  const updateCookieExpiration = () => {
    if (typeof window === "undefined") return;

    const authCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("pait_auth="));

    const userCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("pait_user="));

    if (authCookie && userCookie) {
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 4); // Reset to 4 hours from now

      const authValue = authCookie.split("=")[1];
      const userValue = userCookie.split("=")[1];

      // Use same cookie settings as login
      const isProduction = window.location.protocol === "https:";
      const cookieOptions = isProduction
        ? `path=/; expires=${expirationTime.toUTCString()}; secure; samesite=lax`
        : `path=/; expires=${expirationTime.toUTCString()}; samesite=strict`;

      // Re-set cookies with new expiration
      document.cookie = `pait_auth=${authValue}; ${cookieOptions}`;
      document.cookie = `pait_user=${userValue}; ${cookieOptions}`;
    }
  };

  useEffect(() => {
    // Mark as client-side to prevent hydration mismatch
    setIsClient(true);

    const updateUserStatus = () => {
      if (typeof window === "undefined") return;

      const authCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_auth="));

      if (!authCookie) {
        setAuthenticated(false);
        setUser(null);
        return;
      }

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
          checkUserViaAPI();
        }
      } else {
        checkUserViaAPI();
      }
    };

    const checkUserViaAPI = () => {
      fetch("/api/auth")
        .then((response) => response.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setUser(data.user);
            setAuthenticated(true);

            // Set the user cookie for future reads
            const expirationTime = new Date();
            expirationTime.setHours(expirationTime.getHours() + 4);

            const isProduction = window.location.protocol === "https:";
            const cookieOptions = isProduction
              ? `path=/; expires=${expirationTime.toUTCString()}; secure; samesite=lax`
              : `path=/; expires=${expirationTime.toUTCString()}; samesite=strict`;

            document.cookie = `pait_user=${JSON.stringify(
              data.user
            )}; ${cookieOptions}`;
          } else {
            setAuthenticated(false);
            setUser(null);
          }
        })
        .catch(() => {
          setAuthenticated(false);
          setUser(null);
        });
    };

    // Check immediately
    updateUserStatus();

    // Set up activity listeners to extend session on user interaction
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      if (authenticated) {
        updateCookieExpiration();
      }
    };

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check user status periodically
    const interval = setInterval(updateUserStatus, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      // Remove activity listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [authenticated]);

  // Prevent hydration mismatch by showing consistent content during SSR
  if (!isClient) {
    return (
      <span className="text-green-400 font-mono text-xs sm:text-sm tracking-wider">
        <span className="text-green-400/60">guest</span>
        <span className="text-green-500/80">@pait.in</span>
        <span className="text-green-400/80">:~$</span>
      </span>
    );
  }

  // Show loading state initially (client-side only)
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
