// app/theme/ColorThemeProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { gsap } from "gsap";

interface ThemeColor {
  name: string;
  label: string;
  description: string;
  hue: number;
  saturation: number;
  lightness: number;
  cssVar: string;
}

interface ColorThemeContextType {
  colors: ThemeColor[];
  isLoading: boolean;
  applyColors: (colors: ThemeColor[]) => void;
  resetToDefault: () => void;
}

const defaultColors: ThemeColor[] = [
  {
    name: "primary",
    label: "Primary",
    description: "Main brand color - buttons, links, highlights",
    hue: 263,
    saturation: 70,
    lightness: 50,
    cssVar: "--primary",
  },
  {
    name: "secondary",
    label: "Secondary",
    description: "Supporting color - cards, sections, backgrounds",
    hue: 240,
    saturation: 5,
    lightness: 11,
    cssVar: "--secondary",
  },
  {
    name: "accent",
    label: "Accent",
    description: "Special highlights and call-to-actions",
    hue: 240,
    saturation: 6,
    lightness: 8,
    cssVar: "--accent",
  },
  {
    name: "foreground",
    label: "Text Color",
    description: "Primary text and content color",
    hue: 0,
    saturation: 0,
    lightness: 98,
    cssVar: "--foreground",
  },
];

const ColorThemeContext = createContext<ColorThemeContextType>({
  colors: defaultColors,
  isLoading: false,
  applyColors: () => {},
  resetToDefault: () => {},
});

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};

interface ColorThemeProviderProps {
  children: React.ReactNode;
}

export const ColorThemeProvider: React.FC<ColorThemeProviderProps> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState<ThemeColor[]>(defaultColors);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply colors to CSS variables with GSAP animation
  const applyColorsToCSS = (themeColors: ThemeColor[], animate = true) => {
    if (!mounted) return;

    const root = document.documentElement;

    if (!animate) {
      // Apply immediately without animation
      themeColors.forEach((color) => {
        root.style.setProperty(
          color.cssVar,
          `${color.hue} ${color.saturation}% ${color.lightness}%`
        );
      });
      return;
    }

    // Create temporary objects to animate the HSL values
    const animations = themeColors.map((color) => {
      const currentStyle = getComputedStyle(root).getPropertyValue(
        color.cssVar
      );
      const currentHSL = currentStyle.match(/(\d+)\s+(\d+)%\s+(\d+)%/);

      const currentValues = currentHSL
        ? {
            hue: parseInt(currentHSL[1]),
            saturation: parseInt(currentHSL[2]),
            lightness: parseInt(currentHSL[3]),
          }
        : {
            hue: color.hue,
            saturation: color.saturation,
            lightness: color.lightness,
          };

      const targetValues = {
        hue: color.hue,
        saturation: color.saturation,
        lightness: color.lightness,
      };

      return gsap.to(currentValues, {
        duration: 0.8,
        ease: "power2.out",
        hue: targetValues.hue,
        saturation: targetValues.saturation,
        lightness: targetValues.lightness,
        onUpdate: () => {
          root.style.setProperty(
            color.cssVar,
            `${Math.round(currentValues.hue)} ${Math.round(
              currentValues.saturation
            )}% ${Math.round(currentValues.lightness)}%`
          );
        },
      });
    });

    return animations;
  };

  // Check authentication status
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = () => {
      const authCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_auth="));
      setIsAuthenticated(!!authCookie);
    };

    checkAuth();
  }, [mounted]);

  // Load user's saved colors from API
  useEffect(() => {
    const loadUserColors = async () => {
      if (!mounted) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/user-preferences");

        if (response.ok) {
          const data = await response.json();

          if (data.customTheme && data.customTheme.colors) {
            console.log("🎨 Loading saved custom theme colors");
            const savedColors = data.customTheme.colors;

            // Handle migration from 3 colors to 4 colors
            if (savedColors.length === 3) {
              console.log("🎨 Migrating from 3 colors to 4 colors");
              const migratedColors = [
                ...savedColors,
                defaultColors[3] // Add default text color
              ];
              setColors(migratedColors);
              applyColorsToCSS(migratedColors, true);
            } else {
              setColors(savedColors);
              applyColorsToCSS(savedColors, true); // Animate user colors
            }
          } else {
            console.log("🎨 No saved colors found, using defaults");
            applyColorsToCSS(colors, false);
          }
        } else {
          console.log("🎨 User not authenticated or no preferences, using defaults");
          applyColorsToCSS(colors, false);
        }
      } catch (error) {
        console.error("Error loading colors:", error);
        applyColorsToCSS(colors, false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserColors();
  }, [mounted]);

  // Apply default colors on mount if no user is authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      console.log("🎨 No user authenticated, applying default colors");
      applyColorsToCSS(colors, false); // No animation for initial load
    }
  }, [mounted, isAuthenticated, colors]);

  // Programmatic color application (for theme customizer)
  const applyColors = (newColors: ThemeColor[]) => {
    setColors(newColors);
    applyColorsToCSS(newColors, true); // Animate when manually applying
  };

  // Reset to default colors
  const resetToDefault = () => {
    setColors(defaultColors);
    applyColorsToCSS(defaultColors, true); // Animate reset
  };

  // Don't render children until mounted (prevents hydration issues)
  if (!mounted) {
    return null;
  }

  const contextValue: ColorThemeContextType = {
    colors,
    isLoading,
    applyColors,
    resetToDefault,
  };

  return (
    <ColorThemeContext.Provider value={contextValue}>
      {children}
    </ColorThemeContext.Provider>
  );
};