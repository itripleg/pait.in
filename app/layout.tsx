// app/layout.tsx - Updated with theme system
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientTime, ClientDate } from "@/components/ClientTime";
import { UserStatus } from "@/components/UserStatus";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSelector } from "@/components/ThemeSelector";

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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-mono overflow-x-hidden`}
        // style={{
        //   backgroundColor: "var(--theme-background)",
        //   color: "var(--theme-text)",
        // }}
      >
        <ThemeProvider>
          <div className="min-h-screen relative">
            {/* Matrix-style Background Pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, var(--theme-primary) 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            {/* Animated Grid Lines */}
            <div className="fixed inset-0 opacity-10 pointer-events-none">
              <div
                className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[10%] animate-pulse"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--theme-primary)20, transparent)`,
                }}
              ></div>
              <div
                className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[20%] animate-pulse"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--theme-primary)20, transparent)`,
                  animationDelay: "1s",
                }}
              ></div>
              <div
                className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[80%] animate-pulse"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--theme-primary)20, transparent)`,
                  animationDelay: "2s",
                }}
              ></div>
              <div
                className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[90%] animate-pulse"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--theme-primary)20, transparent)`,
                  animationDelay: "3s",
                }}
              ></div>
            </div>

            {/* Terminal Header */}
            <div
              className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-lg"
              style={{
                backgroundColor: "var(--theme-background)90",
                borderBottomColor: "var(--theme-border)",
              }}
            >
              <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex space-x-1 sm:space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 shadow-sm"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-sm animate-pulse"
                        style={{ backgroundColor: "var(--theme-success)" }}
                      ></div>
                    </div>
                    <UserStatus />
                    <div className="hidden lg:block">
                      <span
                        className="font-mono text-xs"
                        style={{ color: "var(--theme-text-secondary)" }}
                      >
                        Personal Assistant & Information Terminal
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-6 text-xs">
                    {/* Theme Selector in Header */}
                    <ThemeSelector showInHeader />

                    <div className="flex items-center space-x-2 sm:space-x-4 text-xs">
                      <span
                        className="hidden sm:inline"
                        style={{ color: "var(--theme-text-secondary)" }}
                      >
                        System: ONLINE
                      </span>
                      <span
                        className="hidden lg:inline"
                        style={{ color: "var(--theme-text-secondary)" }}
                      >
                        Security: MAX
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse shadow-sm"
                        style={{
                          backgroundColor: "var(--theme-success)",
                          boxShadow: `0 0 4px var(--theme-success)50`,
                        }}
                      ></div>
                      <span
                        className="font-mono tracking-wide text-xs"
                        style={{ color: "var(--theme-text)" }}
                      >
                        SECURE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area with proper spacing */}
            <div className="relative z-10 pt-14 sm:pt-20 pb-16 sm:pb-20 min-h-screen ">
              {children}
            </div>

            {/* Terminal Footer */}
            <div
              className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t shadow-lg"
              style={{
                backgroundColor: "var(--theme-background)90",
                borderTopColor: "var(--theme-border)",
              }}
            >
              <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-between text-xs">
                  <div
                    className="flex items-center space-x-2 sm:space-x-4"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    <span className="font-mono">PAIT v1.0.0</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Family Safe</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">
                      End-to-End Encrypted
                    </span>
                  </div>
                  <div
                    className="flex items-center space-x-2 sm:space-x-3"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    <ClientDate />
                    <span style={{ color: "var(--theme-border)" }}>•</span>
                    <ClientTime />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle glow effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div
                className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
                style={{ backgroundColor: "var(--theme-primary)" }}
              ></div>
              <div
                className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
                style={{ backgroundColor: "var(--theme-accent)" }}
              ></div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
