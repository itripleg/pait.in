// components/BuddyPeek.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PetState {
  hunger: number;
  lastUpdated: number;
  fedToday: number;
  lastFedDate: string;
}

export function BuddyPeek() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [peekSide, setPeekSide] = useState<"left" | "right" | "bottom">("right");
  const [showHearts, setShowHearts] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHappy, setIsHappy] = useState(false);

  // Check pet happiness from localStorage
  const checkPetHappiness = useCallback(() => {
    try {
      const saved = localStorage.getItem("pait-mini-pet");
      if (saved) {
        const pet: PetState = JSON.parse(saved);
        // Consider happy if hunger is 80% or above
        return pet.hunger >= 80;
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  useEffect(() => {
    setMounted(true);

    // Check happiness periodically
    const checkInterval = setInterval(() => {
      const happy = checkPetHappiness();
      setIsHappy(happy);
    }, 5000);

    // Initial check
    setIsHappy(checkPetHappiness());

    return () => clearInterval(checkInterval);
  }, [checkPetHappiness]);

  // Schedule random peeks when happy
  useEffect(() => {
    if (!mounted || !isHappy) {
      setIsVisible(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const scheduleNextPeek = () => {
      // Random delay between 1-4 minutes
      const delay = 60000 + Math.random() * 180000;
      timeoutId = setTimeout(() => {
        showPeek();
      }, delay);
    };

    const showPeek = () => {
      if (isVisible) return;

      // Random side
      const sides: Array<"left" | "right" | "bottom"> = ["left", "right", "bottom"];
      const randomSide = sides[Math.floor(Math.random() * sides.length)];
      setPeekSide(randomSide);
      setIsVisible(true);

      // Show tooltip after peek animation
      setTimeout(() => setShowTooltip(true), 400);

      // Auto-hide after 4-6 seconds
      const hideDelay = 4000 + Math.random() * 2000;
      setTimeout(() => {
        setShowTooltip(false);
        setTimeout(() => {
          setIsVisible(false);
          scheduleNextPeek();
        }, 300);
      }, hideDelay);
    };

    // Initial peek after 10-30 seconds
    const initialDelay = 10000 + Math.random() * 20000;
    timeoutId = setTimeout(() => {
      showPeek();
    }, initialDelay);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mounted, isHappy, isVisible]);

  const handleClick = () => {
    setShowTooltip(false);
    setShowHearts(true);

    setTimeout(() => {
      setShowHearts(false);
      setTimeout(() => setIsVisible(false), 200);
    }, 1500);
  };

  if (!mounted || !isHappy) return null;

  const getPositionConfig = () => {
    switch (peekSide) {
      case "left":
        return {
          className: "fixed left-0 top-1/2 -translate-y-1/2 z-[100]",
          initial: { x: "-80%", opacity: 0 },
          animate: { x: "-40%", opacity: 1 },
          exit: { x: "-100%", opacity: 0 },
          tooltipPosition: "top-0 left-full ml-1",
          flip: true,
        };
      case "right":
        return {
          className: "fixed right-0 top-1/2 -translate-y-1/2 z-[100]",
          initial: { x: "80%", opacity: 0 },
          animate: { x: "40%", opacity: 1 },
          exit: { x: "100%", opacity: 0 },
          tooltipPosition: "top-0 right-full mr-1",
          flip: false,
        };
      case "bottom":
        return {
          className: "fixed bottom-0 left-1/2 -translate-x-1/2 z-[100]",
          initial: { y: "80%", opacity: 0 },
          animate: { y: "30%", opacity: 1 },
          exit: { y: "100%", opacity: 0 },
          tooltipPosition: "bottom-full mb-2 left-1/2 -translate-x-1/2",
          flip: false,
        };
    }
  };

  const config = getPositionConfig();

  const emojis = ["🐾", "💕", "🥰", "✨", "🎉", "💖", "🦴", "⭐"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={config.className}
          initial={config.initial}
          animate={config.animate}
          exit={config.exit}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          onClick={handleClick}
        >
          <motion.div
            className="relative cursor-pointer select-none"
            animate={{
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Dog emoji */}
            <motion.div
              className="text-5xl sm:text-6xl drop-shadow-lg"
              animate={{
                y: [0, -4, 0],
                rotateY: config.flip ? 180 : 0,
              }}
              transition={{
                y: {
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotateY: {
                  duration: 0,
                },
              }}
            >
              🐕
            </motion.div>

            {/* Sparkles around happy dog */}
            <motion.span
              className="absolute -top-2 -right-1 text-lg"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
                rotate: [0, 15, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ✨
            </motion.span>

            <motion.span
              className="absolute -bottom-1 -left-2 text-sm"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              ✨
            </motion.span>

            {/* Hearts animation on click */}
            <AnimatePresence>
              {showHearts && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-xl pointer-events-none"
                      style={{
                        left: "50%",
                        top: "50%",
                      }}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1.2, 1, 0.8],
                        x: (Math.random() - 0.5) * 80,
                        y: -40 - Math.random() * 40,
                        rotate: (Math.random() - 0.5) * 30,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                    >
                      {["💖", "💕", "❤️", "💗", "🩷"][i % 5]}
                    </motion.span>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Emoji bubble */}
            <AnimatePresence>
              {showTooltip && !showHearts && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={`absolute ${config.tooltipPosition} text-2xl`}
                >
                  {randomEmoji}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BuddyPeek;
