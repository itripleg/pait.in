// app/layout.tsx - Dreamy pastel theme for Paitin
import type { Metadata } from "next";
import { Quicksand, Satisfy } from "next/font/google";
import "./globals.css";
import HolidayBackground from "@/components/HolidayBackground";
import BuddyPeek from "@/components/BuddyPeek";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const satisfy = Satisfy({
  variable: "--font-satisfy",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Paitin",
  description: "Your personal space - a safe place to connect with family and friends",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Paitin",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Paitin",
    title: "Paitin",
    description: "Your personal space - a safe place to connect with family and friends",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#a855f7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${satisfy.variable} antialiased`}
        style={{ fontFamily: "var(--font-quicksand), sans-serif" }}
      >
        {/* Dreamy animated background */}
        <div className="fixed inset-0 dreamy-gradient -z-10" />

        {/* Holiday-themed animated background (auto-detects holidays) */}
        <HolidayBackground />

        {/* Buddy peek microinteraction (appears when pet is happy) */}
        <BuddyPeek />

        {/* Floating decorative elements - hidden on mobile for performance */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5 hidden sm:block">
          {/* Soft blobs */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 blob-animated"
            style={{ background: "linear-gradient(135deg, hsl(280 60% 80%), hsl(330 50% 85%))" }}
          />
          <div
            className="absolute top-1/3 -left-48 w-80 h-80 rounded-full blur-3xl opacity-25 blob-animated"
            style={{
              background: "linear-gradient(135deg, hsl(200 60% 85%), hsl(280 50% 85%))",
              animationDelay: "-4s"
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 blob-animated"
            style={{
              background: "linear-gradient(135deg, hsl(330 55% 85%), hsl(200 60% 85%))",
              animationDelay: "-2s"
            }}
          />

          {/* Sparkle dots */}
          <div className="absolute top-20 left-[15%] w-2 h-2 rounded-full bg-purple-300 sparkle" />
          <div className="absolute top-40 right-[20%] w-1.5 h-1.5 rounded-full bg-pink-300 sparkle sparkle-delayed-1" />
          <div className="absolute top-[60%] left-[10%] w-2 h-2 rounded-full bg-blue-300 sparkle sparkle-delayed-2" />
          <div className="absolute top-[30%] right-[10%] w-1.5 h-1.5 rounded-full bg-purple-400 sparkle sparkle-delayed-3" />
          <div className="absolute bottom-32 left-[25%] w-2 h-2 rounded-full bg-pink-300 sparkle sparkle-delayed-1" />
          <div className="absolute bottom-48 right-[30%] w-1.5 h-1.5 rounded-full bg-blue-300 sparkle sparkle-delayed-2" />
        </div>

        {/* Main content */}
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
