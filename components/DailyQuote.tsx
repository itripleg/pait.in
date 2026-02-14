// components/DailyQuote.tsx - Daily random fact
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FACTS } from "@/lib/facts";

interface CachedFact {
  fact: string;
  date: string;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Get a consistent random fact for the day based on date
function getFactForDate(dateStr: string): string {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FACTS.length;
  return FACTS[index];
}

export function DailyQuote() {
  const [fact, setFact] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = getToday();
    const cacheKey = "pait-daily-fact-v2"; // New key to avoid old cached API objects

    // Check localStorage for cached fact
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: CachedFact = JSON.parse(cached);
        // Validate it's a string and today's date
        if (parsed.date === today && typeof parsed.fact === "string") {
          setFact(parsed.fact);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Cache read failed, continue
    }

    // Get fact for today
    const todaysFact = getFactForDate(today);
    setFact(todaysFact);

    // Cache it
    const toCache: CachedFact = { fact: todaysFact, date: today };
    localStorage.setItem(cacheKey, JSON.stringify(toCache));
    setIsLoading(false);

    // Clean up old cache key
    localStorage.removeItem("pait-daily-fact");
  }, []);

  return (
    <motion.div
      className="glass-card rounded-3xl p-8 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Decorative icon */}
      <div className="absolute top-4 right-4 text-4xl opacity-20 select-none">
        💡
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 bg-purple-200/30 rounded-full w-full" />
            <div className="h-5 bg-purple-200/30 rounded-full w-5/6" />
            <div className="h-5 bg-purple-200/30 rounded-full w-3/4" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-base text-foreground/90 leading-relaxed">
              {fact}
            </p>
          </motion.div>
        )}

        {/* Daily indicator */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs mt-4 pt-3 border-t border-purple-200/20">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🧠
          </motion.span>
          <span>Daily fun fact</span>
        </div>
      </div>
    </motion.div>
  );
}

export default DailyQuote;
