// lib/auth.ts - Enhanced authentication utilities
"use client";

export interface UserProfile {
  username: string;
  displayName: string;
  role: "ADMIN" | "USER" | "CHILD" | "GUEST";
  emoji: string;
  permissions: string[];
}

// Family member profiles - you can customize these
const FAMILY_PROFILES: Record<string, UserProfile> = {
  dad: {
    username: "dad",
    displayName: "Dad",
    role: "ADMIN",
    emoji: "👦🏽",
    permissions: ["messaging", "contacts", "admin", "settings"],
  },
  mom: {
    username: "mom",
    displayName: "Mom",
    role: "ADMIN",
    emoji: "👩",
    permissions: ["messaging", "contacts", "admin", "settings"],
  },
  child1: {
    username: "child",
    displayName: "Child",
    role: "CHILD",
    emoji: "👧",
    permissions: ["messaging", "contacts"],
  },
  guest: {
    username: "guest",
    displayName: "Guest",
    role: "GUEST",
    emoji: "👤",
    permissions: [],
  },
};

export function getCurrentUser(): UserProfile {
  if (typeof window === "undefined") {
    return FAMILY_PROFILES.guest;
  }

  // Check for auth cookie
  const cookies = document.cookie.split(";");
  const authCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("pait_auth=")
  );

  if (!authCookie) {
    return FAMILY_PROFILES.guest;
  }

  // Check for user preference cookie (could be set during login)
  const userCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("pait_user=")
  );

  if (userCookie) {
    const userId = userCookie.split("=")[1];
    return FAMILY_PROFILES[userId] || FAMILY_PROFILES.guest;
  }

  // Default to dad if authenticated but no specific user set
  return FAMILY_PROFILES.dad;
}

export function setCurrentUser(userId: string) {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 1 week

  document.cookie = `pait_user=${userId}; path=/; expires=${expires.toUTCString()}; samesite=lax; secure=${
    window.location.protocol === "https:"
  }`;
}

export function getUserPermissions(): string[] {
  return getCurrentUser().permissions;
}

export function hasPermission(permission: string): boolean {
  return getUserPermissions().includes(permission);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const cookies = document.cookie.split(";");
  const authCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("pait_auth=")
  );

  return !!authCookie;
}
