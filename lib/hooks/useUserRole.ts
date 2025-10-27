// lib/hooks/useUserRole.ts - Safe user role detection for Next.js App Router
"use client";

import { useState, useEffect } from "react";

interface UserInfo {
  id: string;
  name: string;
  role: "admin" | "user";
  emoji: string;
}

export function useUserRole() {
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        // First try to get from API (most reliable)
        const response = await fetch("/api/auth");
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUserRole(data.user.role || "user");
            setUserInfo(data.user);
            setIsLoading(false);
            return;
          }
        }

        // Fallback: try cookie parsing (client-side only)
        if (typeof window !== "undefined") {
          const userCookie = document.cookie
            .split(";")
            .find((cookie) => cookie.trim().startsWith("pait_user="));

          if (userCookie) {
            try {
              const cookieValue = userCookie.split("=")[1];
              const decodedValue = decodeURIComponent(cookieValue);
              const userInfoFromCookie = JSON.parse(decodedValue);
              setUserRole(userInfoFromCookie.role || "user");
              setUserInfo(userInfoFromCookie);
            } catch (error) {
              console.error("Error parsing user cookie:", error);
              setUserRole("user");
              setUserInfo(null);
            }
          }
        }
      } catch (error) {
        console.error("Error getting user role:", error);
        setUserRole("user");
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUserRole();
  }, []);

  return {
    userRole,
    userInfo,
    isLoading,
    isAdmin: userRole === "admin",
    isUser: userRole === "user",
  };
}
