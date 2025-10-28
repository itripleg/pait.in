// components/SplashScreen.tsx
"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(true);
    }, 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: showLogo ? 1 : 0, rotate: showLogo ? 0 : -180 }}
          transition={{
            type: "spring" as const,
            stiffness: 200,
            damping: 20,
            duration: 1,
          }}
          className="text-8xl mb-4"
        >
          📟
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: showLogo ? 0 : 50, opacity: showLogo ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl font-bold font-mono text-primary mb-2"
        >
          PAIT
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: showLogo ? 0 : 30, opacity: showLogo ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-primary font-mono text-lg"
        >
          Personal Assistant & Information Terminal
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: showLogo ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
