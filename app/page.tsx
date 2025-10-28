// app/page.tsx - Smart splash screen handling
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import SplashScreen from "@/components/SplashScreen";
import HomePage from "@/components/HomePage";

type AppState = "checking" | "splash" | "home";

export default function App() {
  const [appState, setAppState] = useState<AppState>("checking");

  useEffect(() => {
    // Check if user is authenticated and if splash was already shown this session
    const checkAuthAndSplash = () => {
      if (typeof window === "undefined") return;

      // Check if splash was already shown this session
      const splashShown = sessionStorage.getItem("splash_shown");

      // Check if user is authenticated
      const authCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_auth="));

      // If authenticated or splash already shown, skip splash
      if (authCookie || splashShown === "true") {
        setAppState("home");
      } else {
        // Show splash for first visit by unauthenticated user
        setAppState("splash");
      }
    };

    checkAuthAndSplash();
  }, []);

  const handleSplashComplete = () => {
    // Mark splash as shown for this session
    sessionStorage.setItem("splash_shown", "true");
    setAppState("home");
  };

  // Don't render anything until we've checked auth
  if (appState === "checking") {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {appState === "splash" && (
        <SplashScreen key="splash" onComplete={handleSplashComplete} />
      )}

      {appState === "home" && <HomePage key="home" />}
    </AnimatePresence>
  );
}
