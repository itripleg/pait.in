// app/page.tsx - Dreamy landing page for Paitin
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

// Icons as simple SVG components for a clean look
const MailIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
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
                paitin
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
            {/* Decorative element */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-purple-200/50 text-purple-600 text-sm mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SparklesIcon />
              <span>Welcome to your space</span>
            </motion.div>

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

            {/* Quote Card */}
            <motion.div
              className="glass-card rounded-3xl p-8 relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute top-4 right-4 text-6xl text-purple-200/50 leading-none">
                "
              </div>
              <div className="relative z-10">
                <p className="text-lg text-foreground/90 italic leading-relaxed mb-4">
                  Dream big, work hard, stay focused.
                </p>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <HeartIcon />
                  <span>Daily reminder</span>
                </div>
              </div>
            </motion.div>

            {/* Activity Card */}
            <motion.div
              className="glass-card rounded-3xl p-8 relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-300/30">
                  ⚽
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Stay Active</h3>
                  <p className="text-sm text-muted-foreground">Keep moving!</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This week</span>
                  <span className="text-foreground font-medium">Great job!</span>
                </div>
                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
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
