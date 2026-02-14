// components/MiniPet.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PetState {
  hunger: number; // 0-100, 100 = full
  lastUpdated: number; // timestamp
  fedToday: number; // feedings today
  lastFedDate: string; // YYYY-MM-DD to track daily reset
}

const HUNGER_DECAY_PER_HOUR = 4; // Loses 4% hunger per hour (~24hrs to empty)
const MAX_FEEDINGS_PER_DAY = 5;
const FOOD_PER_FEEDING = 20;

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getPetMood(hunger: number): {
  emoji: string;
  status: string;
  color: string;
  bgGradient: string;
  expression: string;
} {
  if (hunger >= 80)
    return {
      emoji: "🐕",
      status: "Happy!",
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
      expression: "Tail wagging!",
    };
  if (hunger >= 50)
    return {
      emoji: "🐶",
      status: "Content",
      color: "text-sky-400",
      bgGradient: "from-sky-500/20 via-blue-500/10 to-cyan-500/20",
      expression: "Relaxed",
    };
  if (hunger >= 25)
    return {
      emoji: "🐕‍🦺",
      status: "Hungry",
      color: "text-amber-400",
      bgGradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
      expression: "Looking for food...",
    };
  return {
    emoji: "🥺",
    status: "Starving!",
    color: "text-rose-400",
    bgGradient: "from-rose-500/20 via-red-500/10 to-pink-500/20",
    expression: "Please feed me!",
  };
}

export function MiniPet() {
  const [pet, setPet] = useState<PetState | null>(null);
  const [showHeart, setShowHeart] = useState(false);
  const [showFood, setShowFood] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // Load pet state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pait-mini-pet");
    const today = getToday();

    if (saved) {
      const parsed: PetState = JSON.parse(saved);

      // Reset daily feedings if it's a new day
      if (parsed.lastFedDate !== today) {
        parsed.fedToday = 0;
        parsed.lastFedDate = today;
      }

      // Calculate hunger decay since last update
      const hoursSinceUpdate =
        (Date.now() - parsed.lastUpdated) / (1000 * 60 * 60);
      const decay = Math.floor(hoursSinceUpdate * HUNGER_DECAY_PER_HOUR);
      parsed.hunger = Math.max(0, parsed.hunger - decay);
      parsed.lastUpdated = Date.now();

      setPet(parsed);
      localStorage.setItem("pait-mini-pet", JSON.stringify(parsed));
    } else {
      // Initialize new pet
      const newPet: PetState = {
        hunger: 50,
        lastUpdated: Date.now(),
        fedToday: 0,
        lastFedDate: today,
      };
      setPet(newPet);
      localStorage.setItem("pait-mini-pet", JSON.stringify(newPet));
    }
  }, []);

  // Periodic hunger decay (every minute check)
  useEffect(() => {
    if (!pet) return;

    const interval = setInterval(() => {
      setPet((prev) => {
        if (!prev) return prev;
        const hoursSinceUpdate =
          (Date.now() - prev.lastUpdated) / (1000 * 60 * 60);
        if (hoursSinceUpdate >= 0.25) {
          // Update every 15 mins
          const decay = Math.floor(hoursSinceUpdate * HUNGER_DECAY_PER_HOUR);
          const updated = {
            ...prev,
            hunger: Math.max(0, prev.hunger - decay),
            lastUpdated: Date.now(),
          };
          localStorage.setItem("pait-mini-pet", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [pet]);

  const feedPet = useCallback(() => {
    if (!pet) return;

    const today = getToday();
    let { fedToday, lastFedDate } = pet;

    // Reset if new day
    if (lastFedDate !== today) {
      fedToday = 0;
      lastFedDate = today;
    }

    // Check if can feed
    if (fedToday >= MAX_FEEDINGS_PER_DAY || pet.hunger >= 100) {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 500);
      return;
    }

    // Feed the pet
    const newHunger = Math.min(100, pet.hunger + FOOD_PER_FEEDING);
    const updated: PetState = {
      hunger: newHunger,
      lastUpdated: Date.now(),
      fedToday: fedToday + 1,
      lastFedDate: today,
    };

    setPet(updated);
    localStorage.setItem("pait-mini-pet", JSON.stringify(updated));

    // Show animations
    setShowFood(true);
    setTimeout(() => {
      setShowFood(false);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 600);
    }, 300);

    setTapCount((c) => c + 1);
  }, [pet]);

  if (!pet) return null;

  const mood = getPetMood(pet.hunger);
  const canFeed = pet.fedToday < MAX_FEEDINGS_PER_DAY && pet.hunger < 100;
  const feedingsLeft = MAX_FEEDINGS_PER_DAY - pet.fedToday;

  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden cursor-pointer select-none group"
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={feedPet}
    >
      {/* Background Layer - Artistic gradient with pattern */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient that changes with mood */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${mood.bgGradient} transition-all duration-700`}
        />

        {/* Decorative circles/blobs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm" />

        {/* Hover glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${mood.bgGradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 p-6">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Pet Avatar */}
          <motion.div
            className="relative"
            animate={isWiggling ? { rotate: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                pet.hunger >= 50
                  ? "from-amber-300 to-orange-400"
                  : "from-gray-300 to-gray-400"
              } flex items-center justify-center text-2xl shadow-lg transition-all duration-500`}
            >
              <motion.span
                animate={
                  canFeed
                    ? {
                        scale: [1, 1.15, 1],
                        rotate: [0, -5, 5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {mood.emoji}
              </motion.span>
            </div>

            {/* Food animation */}
            <AnimatePresence>
              {showFood && (
                <motion.span
                  className="absolute -top-1 -right-1 text-xl"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, y: 10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  🍖
                </motion.span>
              )}
            </AnimatePresence>

            {/* Heart animation */}
            <AnimatePresence>
              {showHeart && (
                <motion.span
                  className="absolute -top-3 -right-3 text-xl pointer-events-none"
                  initial={{ scale: 0, y: 0 }}
                  animate={{ scale: [0, 1.2, 1], y: -8 }}
                  exit={{ scale: 0, y: -16, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  ❤️
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pet Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-lg">Buddy</h3>
              {pet.hunger >= 80 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs"
                >
                  ✨
                </motion.span>
              )}
            </div>
            <p className={`text-sm font-medium ${mood.color}`}>{mood.status}</p>
          </div>

          {/* Feedings Counter */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Today</div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: MAX_FEEDINGS_PER_DAY }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i < pet.fedToday
                      ? "bg-amber-400"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                  initial={false}
                  animate={
                    i === pet.fedToday - 1 && tapCount > 0
                      ? { scale: [1, 1.5, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hunger Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">
              {canFeed ? "Tap to feed!" : pet.hunger >= 100 ? "Full!" : "Come back tomorrow!"}
            </span>
            <span className="font-bold text-foreground">{pet.hunger}%</span>
          </div>

          <div className="h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className={`h-full rounded-full relative overflow-hidden ${
                pet.hunger >= 50
                  ? "bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400"
                  : pet.hunger >= 25
                    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400"
                    : "bg-gradient-to-r from-rose-400 via-red-400 to-pink-400"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${pet.hunger}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>

          {/* Expression text */}
          <p className="text-xs text-center text-muted-foreground italic">
            {mood.expression}
          </p>
        </div>
      </div>

      {/* Decorative paw prints (subtle) */}
      <div className="absolute bottom-2 right-3 text-lg opacity-10 pointer-events-none">
        🐾
      </div>
    </motion.div>
  );
}

export default MiniPet;
