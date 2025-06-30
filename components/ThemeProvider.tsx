// components/ThemeProvider.tsx - Theme context and provider
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Theme,
  themes,
  defaultTheme,
  applyTheme,
  getUserTheme,
  saveUserTheme,
} from "@/lib/themes";

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => Promise<void>;
  themes: Theme[];
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Check if user is authenticated
        const authCookie = document.cookie
          .split(";")
          .find((cookie) => cookie.trim().startsWith("pait_auth="));

        let themeId = defaultTheme.id;

        if (authCookie) {
          // User is logged in, try to get their saved theme
          const savedTheme = await getUserTheme();
          if (savedTheme) {
            themeId = savedTheme;
          }
        } else {
          // Guest user, check localStorage
          const localTheme = localStorage.getItem("pait_theme");
          if (localTheme) {
            themeId = localTheme;
          }
        }

        // Find and apply the theme
        const theme = themes.find((t) => t.id === themeId) || defaultTheme;
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error("Failed to initialize theme:", error);
        // Fallback to default theme
        setCurrentTheme(defaultTheme);
        applyTheme(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  const setTheme = async (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);
    applyTheme(theme);

    try {
      // Check if user is authenticated
      const authCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_auth="));

      if (authCookie) {
        // Save to database for authenticated users
        const saved = await saveUserTheme(themeId);
        if (!saved) {
          console.warn(
            "Failed to save theme to database, falling back to localStorage"
          );
          localStorage.setItem("pait_theme", themeId);
        }
      } else {
        // Save to localStorage for guests
        localStorage.setItem("pait_theme", themeId);
      }
    } catch (error) {
      console.error("Failed to save theme preference:", error);
      // Fallback to localStorage
      localStorage.setItem("pait_theme", themeId);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
