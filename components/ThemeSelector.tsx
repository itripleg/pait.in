// components/ThemeSelector.tsx - Theme selection UI
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColorTheme } from "@/app/theme/ColorThemeProvider";
import { presetThemes } from "@/app/theme/presetThemes";
import { motion, AnimatePresence } from "motion/react";

interface ThemeSelectorProps {
  compact?: boolean;
  showInHeader?: boolean;
}

export function ThemeSelector({
  compact = false,
  showInHeader = false,
}: ThemeSelectorProps) {
  const { colors, applyColors } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="w-8 h-8 bg-zinc-700 rounded"></div>
      </div>
    );
  }

  // Find current theme by matching colors
  const getCurrentThemeName = () => {
    const currentHue = colors[0]?.hue;
    const currentSat = colors[0]?.saturation;
    const currentLight = colors[0]?.lightness;

    const matchedTheme = presetThemes.find(theme =>
      theme.colors[0].hue === currentHue &&
      theme.colors[0].saturation === currentSat &&
      theme.colors[0].lightness === currentLight
    );

    return matchedTheme?.name || "Custom";
  };

  const applyPreset = (preset: typeof presetThemes[0]) => {
    const newColors = colors.map((color, index) => ({
      ...color,
      ...preset.colors[index],
    }));
    applyColors(newColors);
  };

  if (showInHeader) {
    return (
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
        >
          🎨 {getCurrentThemeName()}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <Card className="w-64 bg-black/95 border-primary/30 shadow-xl backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-primary">
                    🎨 Choose Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {presetThemes.map((theme) => {
                    const isSelected =
                      theme.colors[0].hue === colors[0]?.hue &&
                      theme.colors[0].saturation === colors[0]?.saturation &&
                      theme.colors[0].lightness === colors[0]?.lightness;

                    return (
                      <motion.button
                        key={theme.name}
                        onClick={() => {
                          applyPreset(theme);
                          setIsOpen(false);
                        }}
                        className={`
                          w-full p-2 rounded-lg border transition-all duration-200 text-left
                          ${isSelected ? "border-primary bg-primary/10" : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"}
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-sm text-primary font-bold">
                            {theme.name}
                          </span>
                          {isSelected && (
                            <span className="text-xs font-mono text-primary">✓</span>
                          )}
                        </div>
                        <div className="flex gap-1 mb-1">
                          {theme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full border border-primary/30"
                              style={{
                                backgroundColor: `hsl(${color.hue}deg ${color.saturation}% ${color.lightness}%)`,
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-mono text-primary/60">
                          {theme.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Return null for compact mode (not used)
  return null;
}
