// app/page.tsx - Dreamy landing page for Paitin
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import MiniPet from "@/components/MiniPet";
import DailyQuote from "@/components/DailyQuote";

// Icons as simple SVG components for a clean look
const MailIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-between max-w-4xl mx-auto">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-2xl">✨</span>
              <span
                className="text-xl font-semibold gradient-text"
                style={{ fontFamily: "var(--font-satisfy), cursive" }}
              >
                pait.in
              </span>
            </motion.div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {currentTime}
              </span>
              <Link
                href="/mail"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-400/80 to-pink-400/80 text-white text-sm font-medium hover:from-purple-500/90 hover:to-pink-500/90 transition-all shadow-lg shadow-purple-300/30"
              >
                <MailIcon />
                <span className="hidden sm:inline">My Mail</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center mb-12"
          >
            {/* Main heading */}
            <motion.h1
              className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span
                className="gradient-text"
                style={{ fontFamily: "var(--font-satisfy), cursive" }}
              >
                Hey, Paitin
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Your own little corner of the internet.
              <br />
              <span className="text-purple-500/80">Check your mail, stay connected.</span>
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Mail Card - Primary Action */}
            <Link href="/mail" className="sm:col-span-2 lg:col-span-1 group">
              <motion.div
                className="glass-card rounded-3xl p-8 h-full cursor-pointer overflow-hidden relative"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-300/40 group-hover:shadow-purple-400/50 transition-shadow">
                    <MailIcon />
                  </div>

                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    My Mail
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Check your inbox, send messages to family and friends.
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-purple-500 font-medium">
                    <span>Open mailbox</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Daily Quote Card */}
            <DailyQuote />

            {/* Mini Pet Card */}
            <MiniPet />
          </motion.div>

          {/* Bottom decoration */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <p className="text-sm text-muted-foreground/60">
              Made with{" "}
              <motion.span
                className="inline-block text-pink-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ♥
              </motion.span>
              {" "}by Dad
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
