// app/settings/page.tsx - Settings page with theme selector
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useUserRole } from "@/lib/hooks/useUserRole";

export default function SettingsPage() {
  const router = useRouter();
  const { userRole, userInfo, isLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState("theme");

  const handleLogout = () => {
    document.cookie =
      "pait_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "pait_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen font-mono flex items-center justify-center"
        style={{
          backgroundColor: "var(--theme-background)",
          color: "var(--theme-text)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-pulse"
            style={{ color: "var(--theme-primary)" }}
          >
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-mono p-2 sm:p-4"
      style={{
        backgroundColor: "var(--theme-background)",
        color: "var(--theme-text)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-4 border-b space-y-3 sm:space-y-0"
          style={{ borderBottomColor: "var(--theme-border)" }}
        >
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "var(--theme-text)" }}
            >
              ⚙️ SETTINGS
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Customize your PAIT experience
            </p>
            {userInfo && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--theme-accent)" }}
              >
                Logged in as {userInfo.emoji} {userInfo.name} ({userRole})
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => router.push("/messaging")}
              size="sm"
              variant="outline"
              className="font-mono text-xs flex-1 sm:flex-none"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text)",
                backgroundColor: "transparent",
              }}
            >
              <span className="sm:hidden">💬</span>
              <span className="hidden sm:inline">💬 MESSAGES</span>
            </Button>
            <Button
              onClick={() => router.push("/contacts")}
              size="sm"
              variant="outline"
              className="font-mono text-xs flex-1 sm:flex-none"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text)",
                backgroundColor: "transparent",
              }}
            >
              <span className="sm:hidden">👥</span>
              <span className="hidden sm:inline">👥 CONTACTS</span>
            </Button>
            <Button
              onClick={() => router.push("/")}
              size="sm"
              variant="outline"
              className="font-mono text-xs flex-1 sm:flex-none"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text)",
                backgroundColor: "transparent",
              }}
            >
              <span className="sm:hidden">🏠</span>
              <span className="hidden sm:inline">🏠 HOME</span>
            </Button>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="destructive"
              className="font-mono text-xs flex-1 sm:flex-none"
            >
              <span className="sm:hidden">🚪</span>
              <span className="hidden sm:inline">LOGOUT</span>
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "theme", label: "🎨 Theme", icon: "🎨" },
              { id: "account", label: "👤 Account", icon: "👤" },
              { id: "privacy", label: "🔒 Privacy", icon: "🔒" },
              { id: "about", label: "ℹ️ About", icon: "ℹ️" },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                className="font-mono text-xs"
                style={
                  activeTab === tab.id
                    ? {
                        backgroundColor: "var(--theme-primary)",
                        color: "var(--theme-background)",
                      }
                    : {
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text)",
                        backgroundColor: "transparent",
                      }
                }
              >
                <span className="sm:hidden">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        {activeTab === "theme" && (
          <div className="space-y-6">
            <ThemeSelector />

            <Card
              style={{
                backgroundColor: "var(--theme-background-secondary)",
                borderColor: "var(--theme-border)",
              }}
            >
              <CardHeader>
                <CardTitle
                  className="font-mono"
                  style={{ color: "var(--theme-text)" }}
                >
                  🎨 Theme Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p
                  className="text-sm"
                  style={{ color: "var(--theme-text-secondary)" }}
                >
                  Themes are automatically saved to your account when logged in,
                  or stored locally for guest users.
                </p>
                <div className="space-y-2">
                  <h4
                    className="font-bold text-sm"
                    style={{ color: "var(--theme-text)" }}
                  >
                    Current Theme Features:
                  </h4>
                  <ul
                    className="text-xs space-y-1"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    <li>• Persistent storage across sessions</li>
                    <li>• Real-time preview updates</li>
                    <li>• Multiple terminal-inspired palettes</li>
                    <li>• Smooth transitions between themes</li>
                    <li>• Accessibility-focused color contrasts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "account" && (
          <Card
            style={{
              backgroundColor: "var(--theme-background-secondary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <CardHeader>
              <CardTitle
                className="font-mono"
                style={{ color: "var(--theme-text)" }}
              >
                👤 Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{userInfo.emoji}</span>
                    <div>
                      <p
                        className="font-bold"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {userInfo.name}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--theme-text-secondary)" }}
                      >
                        Role: {userRole} • ID: {userInfo.id}
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-sm space-y-2"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    <p>• Session-based authentication</p>
                    <p>• 4-hour automatic timeout</p>
                    <p>• Secure cookie storage</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--theme-text-secondary)" }}>
                  Not logged in. Please log in to view account information.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "privacy" && (
          <Card
            style={{
              backgroundColor: "var(--theme-background-secondary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <CardHeader>
              <CardTitle
                className="font-mono"
                style={{ color: "var(--theme-text)" }}
              >
                🔒 Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="space-y-3 text-sm"
                style={{ color: "var(--theme-text-secondary)" }}
              >
                <h4
                  className="font-bold"
                  style={{ color: "var(--theme-text)" }}
                >
                  Security Features:
                </h4>
                <ul className="space-y-1 ml-4">
                  <li>• End-to-end encrypted messaging</li>
                  <li>• Password-protected access</li>
                  <li>• Secure cookie management</li>
                  <li>• No tracking or analytics</li>
                  <li>• Local data storage only</li>
                </ul>

                <h4
                  className="font-bold mt-4"
                  style={{ color: "var(--theme-text)" }}
                >
                  Data Storage:
                </h4>
                <ul className="space-y-1 ml-4">
                  <li>• Messages stored locally in memory</li>
                  <li>• Theme preferences saved per user</li>
                  <li>• No external data sharing</li>
                  <li>• Family-only contact list</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "about" && (
          <Card
            style={{
              backgroundColor: "var(--theme-background-secondary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <CardHeader>
              <CardTitle
                className="font-mono"
                style={{ color: "var(--theme-text)" }}
              >
                ℹ️ About PAIT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">📟</div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: "var(--theme-text)" }}
                >
                  Personal Assistant & Information Terminal
                </h3>
                <p
                  className="text-sm mt-2"
                  style={{ color: "var(--theme-text-secondary)" }}
                >
                  Version 1.0.0 • Built with Next.js
                </p>
              </div>

              <div
                className="space-y-3 text-sm"
                style={{ color: "var(--theme-text-secondary)" }}
              >
                <p>
                  PAIT is a secure, family-focused messaging platform designed
                  with privacy and simplicity in mind. Built to feel like a
                  retro terminal while providing modern functionality.
                </p>

                <h4
                  className="font-bold"
                  style={{ color: "var(--theme-text)" }}
                >
                  Features:
                </h4>
                <ul className="space-y-1 ml-4">
                  <li>• Secure SMS and email messaging</li>
                  <li>• Multi-user authentication system</li>
                  <li>• Customizable terminal themes</li>
                  <li>• Real-time message updates</li>
                  <li>• Family-safe contact management</li>
                  <li>• Mobile-responsive design</li>
                </ul>

                <div
                  className="text-center pt-4"
                  style={{ color: "var(--theme-text-secondary)" }}
                >
                  {/* <p>🔒 Secure • 👨‍👩‍👧‍👦 Family Safe • 🌟 Simple</p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
