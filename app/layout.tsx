// app/layout.tsx - Updated with theme system
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientTime, ClientDate } from "@/components/ClientTime";
import { UserStatus } from "@/components/UserStatus";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ColorThemeProvider } from "@/app/theme/ColorThemeProvider";

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
      >
        <ThemeProvider>
          <ColorThemeProvider>
            <div className="min-h-screen relative">
              {/* Matrix-style Background Pattern */}
              <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              {/* Animated Grid Lines */}
              <div className="fixed inset-0 opacity-10 pointer-events-none">
                <div
                  className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[10%] animate-pulse"
                  style={{
                    background: `linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.2), transparent)`,
                  }}
                ></div>
                <div
                  className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[20%] animate-pulse"
                  style={{
                    background: `linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.2), transparent)`,
                    animationDelay: "1s",
                  }}
                ></div>
                <div
                  className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[80%] animate-pulse"
                  style={{
                    background: `linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.2), transparent)`,
                    animationDelay: "2s",
                  }}
                ></div>
                <div
                  className="h-full w-px bg-gradient-to-b from-transparent to-transparent absolute left-[90%] animate-pulse"
                  style={{
                    background: `linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.2), transparent)`,
                    animationDelay: "3s",
                  }}
                ></div>
              </div>

              {/* Terminal Header */}
              <div
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-lg"
                style={{
                  backgroundColor: "#000000e6",
                  borderBottomColor: "hsl(var(--primary) / 0.3)",
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
                          style={{
                            backgroundColor: "hsl(var(--primary))",
                            boxShadow: `0 0 4px hsl(var(--primary) / 0.5)`,
                          }}
                        ></div>
                      </div>
                      <UserStatus />
                      <div className="hidden lg:block">
                        <span className="font-mono text-xs text-primary/70">
                          Personal Assistant & Information Terminal
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-6 text-xs">
                      {/* Theme Selector in Header */}
                      <ThemeSelector showInHeader />

                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs">
                        <span className="hidden sm:inline text-primary/70">
                          System: ONLINE
                        </span>
                        <span className="hidden lg:inline text-primary/70">
                          Security: MAX
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse shadow-sm"
                          style={{
                            backgroundColor: "hsl(var(--primary))",
                            boxShadow: `0 0 4px hsl(var(--primary) / 0.5)`,
                          }}
                        ></div>
                        <span className="font-mono tracking-wide text-xs text-primary">
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
                  backgroundColor: "#000000e6",
                  borderTopColor: "hsl(var(--primary) / 0.3)",
                }}
              >
                <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 sm:space-x-4 text-primary/70">
                      <span className="font-mono">PAIT v0.2.0</span>
                      {/* <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Family Safe</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">
                      End-to-End Encrypted
                    </span> */}
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 text-primary/70">
                      <ClientDate />
                      <span className="text-primary/30">•</span>
                      <ClientTime />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle glow effects */}
              <div className="fixed inset-0 pointer-events-none z-0">
                <div
                  className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
                  style={{ backgroundColor: "hsl(var(--primary))" }}
                ></div>
                <div
                  className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
                  style={{ backgroundColor: "hsl(var(--accent))" }}
                ></div>
              </div>
            </div>
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
