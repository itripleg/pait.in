// components/UserStatus.tsx - Fixed hydration with proper SSR handling
"use client";

import { useState, useEffect, useRef } from "react";

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
  const lastRefreshRef = useRef<number>(0);

  // Update cookie expiration on user activity (via API call to server)
  // Throttled to max once every 5 minutes to prevent server flooding
  const updateCookieExpiration = async () => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // Only refresh if it's been at least 5 minutes since last refresh
    if (now - lastRefreshRef.current < fiveMinutes) {
      return;
    }

    try {
      lastRefreshRef.current = now;
      // Let server handle cookie updates
      await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Silently fail - not critical for user experience
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
          const cookieValue = userCookie.split("=")[1];
          const decodedValue = decodeURIComponent(cookieValue);
          const userInfo = JSON.parse(decodedValue);
          setUser(userInfo);
          setAuthenticated(true);
        } catch (error) {
          // Cookie parsing failed, fallback to API check
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
            // Cookies are already set by the server via Set-Cookie header
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
      <span className="text-primary font-mono text-xs sm:text-sm tracking-wider">
        <span className="text-primary/60">guest</span>
        <span className="text-primary/80">@pait.in</span>
        <span className="text-primary/80">:~$</span>
      </span>
    );
  }

  // Show loading state initially (client-side only)
  if (authenticated === null) {
    return (
      <span className="text-primary font-mono text-xs sm:text-sm tracking-wider">
        <span className="animate-pulse">loading@pait.in:~$</span>
      </span>
    );
  }

  // Show guest state if not authenticated
  if (!authenticated || !user) {
    return (
      <span className="text-primary font-mono text-xs sm:text-sm tracking-wider">
        <span className="text-primary/60">guest</span>
        <span className="text-primary/80">@pait.in</span>
        <span className="text-primary/80">:~$</span>
        <span className="ml-2 text-yellow-500/60 text-xs hidden sm:inline">
          [UNAUTHORIZED]
        </span>
        <span className="ml-2 sm:hidden text-xs">❌</span>
      </span>
    );
  }

  return (
    <span className="text-primary font-mono text-xs sm:text-sm tracking-wider">
      <span className="text-primary">{user.name.toLowerCase()}</span>
      <span className="text-primary/80">@pait.in</span>
      <span className="text-primary/80">:~$</span>

      {/* Role indicator for desktop */}
      <span className="ml-2 text-primary/60 text-xs hidden sm:inline">
        [{user.role.toUpperCase()}]
      </span>

      {/* User emoji for mobile */}
      <span className="ml-2 sm:hidden text-xs">{user.emoji}</span>
    </span>
  );
}
