// app/page.tsx (simplified)
"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import SplashScreen from "@/components/SplashScreen";
import HomePage from "@/components/HomePage";

type AppState = "splash" | "home";

export default function App() {
  const [appState, setAppState] = useState<AppState>("splash");

  const handleSplashComplete = () => {
    setAppState("home");
  };

  return (
    <AnimatePresence mode="wait">
      {appState === "splash" && (
        <SplashScreen key="splash" onComplete={handleSplashComplete} />
      )}

      {appState === "home" && <HomePage key="home" />}
    </AnimatePresence>
  );
}
