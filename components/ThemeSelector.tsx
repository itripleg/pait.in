// components/ThemeSelector.tsx - Theme selection UI
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeSelectorProps {
  compact?: boolean;
  showInHeader?: boolean;
}

export function ThemeSelector({
  compact = false,
  showInHeader = false,
}: ThemeSelectorProps) {
  const { currentTheme, setTheme, themes, isLoading } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="w-8 h-8 bg-zinc-700 rounded"></div>
      </div>
    );
  }

  if (showInHeader) {
    return (
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="border-current text-current hover:bg-current/10 font-mono text-xs"
          style={{
            borderColor: "var(--theme-border)",
            color: "var(--theme-text)",
          }}
        >
          🎨 {currentTheme.name}
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
              <Card
                className="w-64 border-current shadow-xl"
                style={{
                  backgroundColor: "var(--theme-background-secondary)",
                  borderColor: "var(--theme-border)",
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-sm font-mono"
                    style={{ color: "var(--theme-text)" }}
                  >
                    🎨 Choose Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {themes.map((theme) => (
                    <ThemeOption
                      key={theme.id}
                      theme={theme}
                      isSelected={currentTheme.id === theme.id}
                      onSelect={() => {
                        setTheme(theme.id);
                        setIsOpen(false);
                      }}
                      compact
                    />
                  ))}
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

  if (compact) {
    return (
      <Card
        className="border-current"
        style={{
          backgroundColor: "var(--theme-background-secondary)",
          borderColor: "var(--theme-border)",
        }}
      >
        <CardHeader>
          <CardTitle
            className="font-mono text-lg"
            style={{ color: "var(--theme-text)" }}
          >
            🎨 Theme Selector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {themes.map((theme) => (
            <ThemeOption
              key={theme.id}
              theme={theme}
              isSelected={currentTheme.id === theme.id}
              onSelect={() => setTheme(theme.id)}
              compact
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-current"
      style={{
        backgroundColor: "var(--theme-background-secondary)",
        borderColor: "var(--theme-border)",
      }}
    >
      <CardHeader>
        <CardTitle
          className="font-mono text-xl"
          style={{ color: "var(--theme-text)" }}
        >
          🎨 Theme Selector
        </CardTitle>
        <p
          className="text-sm font-mono"
          style={{ color: "var(--theme-text-secondary)" }}
        >
          Choose your preferred color palette
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <ThemeOption
            key={theme.id}
            theme={theme}
            isSelected={currentTheme.id === theme.id}
            onSelect={() => setTheme(theme.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface ThemeOptionProps {
  theme: any;
  isSelected: boolean;
  onSelect: () => void;
  compact?: boolean;
}

function ThemeOption({
  theme,
  isSelected,
  onSelect,
  compact = false,
}: ThemeOptionProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-200 w-full text-left
        ${isSelected ? "ring-2 ring-offset-2" : "hover:scale-105"}
        ${compact ? "p-2" : "p-4"}
      `}
      style={{
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        // ringColor: theme.colors.primary,
        // ringOffsetColor: theme.colors.background,
      }}
      whileHover={{ scale: compact ? 1.02 : 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Color preview */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.success }}
          />
        </div>
        {isSelected && (
          <div
            className="text-xs font-mono"
            style={{ color: theme.colors.primary }}
          >
            ✓ ACTIVE
          </div>
        )}
      </div>

      <div>
        <h3
          className={`font-mono font-bold ${compact ? "text-sm" : "text-base"}`}
          style={{ color: theme.colors.text }}
        >
          {theme.name}
        </h3>
        {!compact && (
          <p
            className="text-xs font-mono mt-1"
            style={{ color: theme.colors.textSecondary }}
          >
            {theme.description}
          </p>
        )}
      </div>

      {/* Sample text preview */}
      <div className="mt-2 space-y-1">
        <div className="text-xs font-mono" style={{ color: theme.colors.text }}>
          user@pait.in:~$ echo &quot;hello world&quot;
        </div>
        <div
          className="text-xs font-mono"
          style={{ color: theme.colors.primary }}
        >
          hello world
        </div>
      </div>
    </motion.button>
  );
}
