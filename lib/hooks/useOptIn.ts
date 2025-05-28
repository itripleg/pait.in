// lib/hooks/useOptIn.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasOptedIn } from "../storage";

export function useOptIn(redirectPath?: string) {
  const [isOptedIn, setIsOptedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const optInStatus = hasOptedIn();
    setIsOptedIn(optInStatus);

    // If not opted in and redirectPath provided, redirect to opt-in page
    if (!optInStatus && redirectPath) {
      router.push(`/opt-in?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [redirectPath, router]);

  return {
    isOptedIn,
    isLoading: isOptedIn === null,
    requiresOptIn: isOptedIn === false,
  };
}
