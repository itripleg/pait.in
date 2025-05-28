// lib/storage.ts
export const OPT_IN_KEY = "pait_sms_opt_in";

export function hasOptedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OPT_IN_KEY) === "true";
  } catch (error) {
    console.warn("Failed to check opt-in status:", error);
    return false;
  }
}

export function setOptInStatus(optedIn: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OPT_IN_KEY, optedIn.toString());
  } catch (error) {
    console.warn("Failed to set opt-in status:", error);
  }
}

export function clearOptInStatus(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(OPT_IN_KEY);
  } catch (error) {
    console.warn("Failed to clear opt-in status:", error);
  }
}

// Helper function to check and redirect if needed
export function requireOptIn(currentPath: string = "/"): string | null {
  if (hasOptedIn()) {
    return null; // Already opted in, no redirect needed
  }
  return `/opt-in?redirect=${encodeURIComponent(currentPath)}`;
}
