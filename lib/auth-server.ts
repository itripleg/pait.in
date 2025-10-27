// lib/auth-server.ts - Server-side authentication utilities for Next.js 16
// Uses async cookies() API - only works in Server Components and Route Handlers

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByPassword, type User } from "./user-management";

/**
 * Get current authenticated user from cookies (server-side)
 * Returns null if not authenticated or invalid credentials
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("pait_auth");

  if (!authCookie?.value) {
    return null;
  }

  // Validate the password cookie against user database
  const user = findUserByPassword(authCookie.value);
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this at the top of protected page components
 *
 * @param redirectPath - The current path to redirect back to after login
 * @returns The authenticated user
 */
export async function requireAuth(redirectPath?: string): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = redirectPath
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";
    redirect(loginUrl);
  }

  return user;
}

/**
 * Require admin role - redirect to home if not admin
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}
