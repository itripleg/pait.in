// components/HolidayBackground.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

type Holiday = "valentines" | "christmas" | "halloween" | "none";

interface HolidayElement {
  id: string;
  type: "falling" | "floating" | "rising";
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  rotationEnd: number;
  size: "small" | "medium" | "large" | "xl" | "giant";
  opacity: number;
  top?: number;
}

// Seeded random for consistent SSR/client values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getHoliday(): Holiday {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Valentine's Day: Feb 13-14
  if (month === 2 && (day === 13 || day === 14)) return "valentines";

  // Halloween: Oct 28-31
  if (month === 10 && day >= 28) return "halloween";

  // Christmas: Dec 20-26
  if (month === 12 && day >= 20 && day <= 26) return "christmas";

  return "none";
}

const HOLIDAY_CONFIG: Record<Holiday, {
  emojis: string[];
  floatingEmojis: string[];
  gradient: string;
  particleColor: string;
}> = {
  valentines: {
    emojis: ["❤️", "💕", "💗", "💖", "💘", "💝", "💓", "💞"],
    floatingEmojis: ["💕", "💖", "✨", "💗"],
    gradient: "from-pink-500/10 via-red-500/5 to-rose-500/10",
    particleColor: "bg-pink-400/30",
  },
  christmas: {
    emojis: ["🎄", "⭐", "🎁", "❄️", "🔔", "🎅", "✨"],
    floatingEmojis: ["⭐", "❄️", "✨", "🎄"],
    gradient: "from-red-500/10 via-green-500/5 to-red-500/10",
    particleColor: "bg-red-400/30",
  },
  halloween: {
    emojis: ["🎃", "👻", "🦇", "🕷️", "💀", "🕸️", "🌙"],
    floatingEmojis: ["👻", "🦇", "✨", "🎃"],
    gradient: "from-orange-500/10 via-purple-500/5 to-orange-500/10",
    particleColor: "bg-orange-400/30",
  },
  none: {
    emojis: [],
    floatingEmojis: [],
    gradient: "",
    particleColor: "",
  },
};

export const HolidayBackground: React.FC<{ forceHoliday?: Holiday }> = ({
  forceHoliday,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    // Delay appearance so page loads first
    const showTimer = setTimeout(() => setVisible(true), 800);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(showTimer);
    };
  }, []);

  const holiday = forceHoliday ?? getHoliday();

  if (holiday === "none" || !mounted) return null;

  const config = HOLIDAY_CONFIG[holiday];
  // Fewer elements, bigger sizes - sparse dramatic effect
  const fallingCount = isMobile ? 4 : 6;
  const floatingCount = isMobile ? 2 : 3;

  // Generate falling elements with seeded random values
  const fallingElements: HolidayElement[] = Array.from({ length: fallingCount }).map((_, i) => {
    const isGiant = i % 6 === 0;
    const seed = i * 1337;

    return {
      id: `falling-${i}`,
      type: "falling",
      emoji: config.emojis[i % config.emojis.length],
      left: seededRandom(seed) * 90 + 5,
      delay: i * 3 + seededRandom(seed + 1) * 4,
      duration: 20 + seededRandom(seed + 2) * 15,
      rotation: seededRandom(seed + 3) * 360,
      rotationEnd: seededRandom(seed + 4) * 360 + 360,
      size: isGiant ? "giant" : (["medium", "large", "xl"][i % 3] as HolidayElement["size"]),
      opacity: isGiant ? 0.08 : 0.15,
    };
  });

  // Generate floating elements with grid-based positioning
  const floatingElements: HolidayElement[] = Array.from({ length: floatingCount }).map((_, i) => {
    const gridCols = 3;
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const baseLeft = 15 + col * 30;
    const baseTop = 25 + row * 40;
    const seed = i * 7919;

    return {
      id: `floating-${i}`,
      type: "floating",
      emoji: config.floatingEmojis[i % config.floatingEmojis.length],
      left: baseLeft + (seededRandom(seed) * 10 - 5),
      top: baseTop + (seededRandom(seed + 1) * 10 - 5),
      delay: i * 2 + seededRandom(seed + 2) * 3,
      duration: 8 + seededRandom(seed + 3) * 6,
      rotation: seededRandom(seed + 4) * 30 - 15,
      rotationEnd: seededRandom(seed + 5) * 30 - 15,
      size: "large",
      opacity: 0.12,
    };
  });

  // Rising hearts (Valentine's special) - sparse on both
  const risingElements: HolidayElement[] = holiday === "valentines"
    ? Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => {
        const seed = i * 2749;
        return {
          id: `rising-${i}`,
          type: "rising",
          emoji: ["💗", "💕", "❤️", "💖"][i % 4],
          left: seededRandom(seed) * 80 + 10,
          delay: i * 5 + seededRandom(seed + 1) * 8,
          duration: 25 + seededRandom(seed + 2) * 10,
          rotation: seededRandom(seed + 3) * 40 - 20,
          rotationEnd: seededRandom(seed + 4) * 40 - 20,
          size: "medium",
          opacity: 0.1,
        };
      })
    : [];

  const getSizeClass = (size: string) => {
    if (isMobile) {
      // Slightly smaller on mobile, but keep the big heart effect
      switch (size) {
        case "small": return "text-3xl";
        case "medium": return "text-4xl";
        case "large": return "text-5xl";
        case "xl": return "text-6xl";
        case "giant": return "text-[8rem]";
        default: return "text-4xl";
      }
    }
    // Desktop: bigger sizes for dramatic sparse effect
    switch (size) {
      case "small": return "text-4xl";
      case "medium": return "text-6xl";
      case "large": return "text-8xl";
      case "xl": return "text-9xl";
      case "giant": return "text-[16rem]";
      default: return "text-6xl";
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Holiday gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />

      {/* Falling elements */}
      {fallingElements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${getSizeClass(element.size)} select-none`}
          style={{
            left: `${element.left}%`,
            willChange: "transform",
            // Only blur on desktop for performance
            filter: isMobile ? "none" : "blur(1px)",
          }}
          initial={{
            y: "-15vh",
            opacity: 0,
            rotate: element.rotation,
          }}
          animate={{
            y: "115vh",
            // Simpler rotation on mobile
            rotate: isMobile ? element.rotation : element.rotationEnd,
            opacity: [0, element.opacity, element.opacity, 0],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "linear",
            times: [0, 0.05, 0.95, 1],
          }}
        >
          {element.emoji}
        </motion.div>
      ))}

      {/* Floating elements with pulse - simplified on mobile */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${getSizeClass(element.size)} select-none`}
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
            willChange: "transform",
            opacity: element.opacity,
          }}
          animate={
            isMobile
              ? {
                  // Simpler animation on mobile - just gentle bob
                  y: [-8, 8, -8],
                }
              : {
                  y: [-15, 15, -15],
                  x: [-8, 8, -8],
                  scale: [1, 1.15, 1],
                  rotate: [element.rotation, element.rotationEnd, element.rotation],
                }
          }
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut",
          }}
        >
          {element.emoji}
        </motion.div>
      ))}

      {/* Rising elements (Valentine's hearts floating up) - skip on mobile for performance */}
      {!isMobile && risingElements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${getSizeClass(element.size)} select-none`}
          style={{
            left: `${element.left}%`,
            willChange: "transform",
            filter: "blur(1px)",
          }}
          initial={{
            y: "110vh",
            opacity: 0,
            rotate: element.rotation,
            scale: 0.5,
          }}
          animate={{
            y: "-20vh",
            rotate: element.rotationEnd,
            opacity: [0, element.opacity, element.opacity * 0.8, 0],
            scale: [0.5, 1, 1.2, 0.8],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeOut",
            times: [0, 0.1, 0.7, 1],
          }}
        >
          {element.emoji}
        </motion.div>
      ))}

      {/* Sparkle particles - skip on mobile for performance */}
      {!isMobile && <div className="absolute inset-0">
        {Array.from({ length: 6 }).map((_, i) => {
          const seed = i * 3571;
          return (
            <motion.div
              key={`particle-${i}`}
              className={`absolute w-1.5 h-1.5 rounded-full ${config.particleColor}`}
              style={{
                left: `${seededRandom(seed) * 100}%`,
                top: `${seededRandom(seed + 1) * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2 + seededRandom(seed + 2) * 2,
                repeat: Infinity,
                delay: seededRandom(seed + 3) * 4,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>}

      {/* Valentine's special: floating heart burst on edges (desktop only) */}
      {holiday === "valentines" && !isMobile && (
        <>
          <motion.div
            className="absolute -left-12 top-1/4 text-[12rem] opacity-[0.04] select-none"
            animate={{ x: [-20, 10, -20], rotate: [-10, 10, -10] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            💕
          </motion.div>
          <motion.div
            className="absolute -right-12 top-2/3 text-[12rem] opacity-[0.04] select-none"
            animate={{ x: [20, -10, 20], rotate: [10, -10, 10] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            💖
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default HolidayBackground;
