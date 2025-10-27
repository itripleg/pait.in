// components/HomePage.tsx
"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { hasOptedIn } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  const handlePaiger = () => {
    // Navigate to messaging route
    router.push("/messaging");
  };

  const handleContacts = () => {
    // TODO: Create contacts route
    router.push("/contacts");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen text-green-400 font-mono flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-6xl font-bold mb-4">📟 PAIT</h1>
          <p className="text-xl text-green-400/80">
            Personal Assistant & Information Terminal
          </p>
          <p className="text-sm text-green-400/60 mt-2">
            Your family&apos;s secure digital companion
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
        >
          {/* Messaging */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card
              className="bg-zinc-900 border-green-500/30 hover:border-green-500/60 transition-all duration-300 cursor-pointer h-40"
              onClick={handlePaiger}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  PAIGER
                </h2>
                <p className="text-green-400/70 text-xs text-center">
                  Send secure messages
                </p>
                {!hasOptedIn() && (
                  <p className="text-yellow-400/60 text-xs mt-2">
                    • SMS consent required
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contacts */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card
              className="bg-zinc-900 border-green-500/30 hover:border-green-500/60 transition-all duration-300 cursor-pointer h-40"
              onClick={handleContacts}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-4xl mb-4">👥</div>
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  CONTACTS
                </h2>
                <p className="text-green-400/70 text-xs text-center">
                  Manage approved contacts
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coming Soon Features */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-zinc-900/50 border-zinc-600/30 h-40 opacity-60">
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-4xl mb-4">🎮</div>
                <h2 className="text-xl font-bold text-zinc-400 mb-2">GAMES</h2>
                <p className="text-zinc-500 text-xs text-center">Coming Soon</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-zinc-900/50 border-zinc-600/30 h-40 opacity-60">
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-4xl mb-4">🖼️</div>
                <h2 className="text-xl font-bold text-zinc-400 mb-2">
                  GALLERY
                </h2>
                <p className="text-zinc-500 text-xs text-center">Coming Soon</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-zinc-900/50 border-zinc-600/30 h-40 opacity-60">
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h2 className="text-xl font-bold text-zinc-400 mb-2">
                  AI CHAT
                </h2>
                <p className="text-zinc-500 text-xs text-center">Coming Soon</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-zinc-900/50 border-zinc-600/30 h-40 opacity-60">
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-4xl mb-4">⚙️</div>
                <h2 className="text-xl font-bold text-zinc-400 mb-2">
                  SETTINGS
                </h2>
                <p className="text-zinc-500 text-xs text-center">Coming Soon</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 space-y-4">
          <div className="text-xs text-green-400/40">
            pait.in • Secure • Safe • Simple
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
