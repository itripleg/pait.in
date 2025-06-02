// app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientTime, ClientDate } from "@/components/ClientTime";
import { UserStatus } from "@/components/UserStatus";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAIT - Personal Assistant & Information Terminal",
  description: "Secure messaging platform for families",
  keywords: ["messaging", "secure", "family", "communication"],
  robots: "noindex, nofollow",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📟</text></svg>",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-green-400 font-mono overflow-x-hidden`}
      >
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black relative">
          {/* Matrix-style Background Pattern */}
          <div className="fixed inset-0 opacity-5 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #00ff41 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Animated Grid Lines */}
          <div className="fixed inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-px bg-gradient-to-b from-transparent via-green-500/20 to-transparent absolute left-[10%] animate-pulse"></div>
            <div
              className="h-full w-px bg-gradient-to-b from-transparent via-green-500/20 to-transparent absolute left-[20%] animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="h-full w-px bg-gradient-to-b from-transparent via-green-500/20 to-transparent absolute left-[80%] animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="h-full w-px bg-gradient-to-b from-transparent via-green-500/20 to-transparent absolute left-[90%] animate-pulse"
              style={{ animationDelay: "3s" }}
            ></div>
          </div>

          {/* Terminal Header */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-green-500/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="flex space-x-1 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 shadow-sm"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 shadow-sm animate-pulse"></div>
                  </div>
                  <UserStatus />
                  <div className="hidden lg:block">
                    <span className="text-green-500/60 font-mono text-xs">
                      Personal Assistant & Information Terminal
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-6 text-xs text-green-400/70">
                  <div className="hidden md:flex items-center space-x-2 sm:space-x-4 text-xs">
                    <span className="hidden sm:inline">System: ONLINE</span>
                    <span className="hidden lg:inline">Security: MAX</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                    <span className="font-mono tracking-wide text-xs">
                      SECURE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area with proper spacing */}
          <div className="relative z-10 pt-14 sm:pt-20 pb-16 sm:pb-20 min-h-screen">
            {children}
          </div>

          {/* Terminal Footer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-green-500/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 sm:space-x-4 text-green-400/60">
                  <span className="font-mono">PAIT v1.0.0</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Family Safe</span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 text-green-400/50">
                  <ClientDate />
                  <span className="text-green-500/30">•</span>
                  <ClientTime />
                </div>
              </div>
            </div>
          </div>

          {/* Subtle glow effects */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </body>
    </html>
  );
}
