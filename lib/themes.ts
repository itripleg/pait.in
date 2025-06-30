// lib/themes.ts - Theme configuration and management
export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const themes: Theme[] = [
  {
    id: "matrix",
    name: "Matrix Green",
    description: "Classic terminal green on black",
    colors: {
      primary: "#00ff41",
      primaryDark: "#00cc33",
      secondary: "#00ff4180",
      background: "#000000",
      backgroundSecondary: "#0a0a0a",
      text: "#00ff41",
      textSecondary: "#00ff4170",
      border: "#00ff4130",
      accent: "#00ff41",
      success: "#00ff41",
      warning: "#ffff00",
      error: "#ff4444",
    },
  },
  {
    id: "amber",
    name: "Amber Terminal",
    description: "Warm amber CRT monitor style",
    colors: {
      primary: "#ffb000",
      primaryDark: "#ff8800",
      secondary: "#ffb00080",
      background: "#1a0f00",
      backgroundSecondary: "#2a1500",
      text: "#ffb000",
      textSecondary: "#ffb00070",
      border: "#ffb00030",
      accent: "#ffd700",
      success: "#90ee90",
      warning: "#ffa500",
      error: "#ff6b6b",
    },
  },
  {
    id: "cyan",
    name: "Cyan Blue",
    description: "Electric blue cyberpunk aesthetic",
    colors: {
      primary: "#00ffff",
      primaryDark: "#0088cc",
      secondary: "#00ffff80",
      background: "#001122",
      backgroundSecondary: "#002244",
      text: "#00ffff",
      textSecondary: "#00ffff70",
      border: "#00ffff30",
      accent: "#66ccff",
      success: "#00ff88",
      warning: "#ffcc00",
      error: "#ff4466",
    },
  },
  {
    id: "purple",
    name: "Neon Purple",
    description: "Synthwave purple vibes",
    colors: {
      primary: "#bb44ff",
      primaryDark: "#8833cc",
      secondary: "#bb44ff80",
      background: "#1a0033",
      backgroundSecondary: "#2a0055",
      text: "#bb44ff",
      textSecondary: "#bb44ff70",
      border: "#bb44ff30",
      accent: "#dd66ff",
      success: "#44ff88",
      warning: "#ffaa44",
      error: "#ff4488",
    },
  },
  {
    id: "red",
    name: "Red Alert",
    description: "High contrast red terminal",
    colors: {
      primary: "#ff4444",
      primaryDark: "#cc2222",
      secondary: "#ff444480",
      background: "#220000",
      backgroundSecondary: "#330000",
      text: "#ff4444",
      textSecondary: "#ff444470",
      border: "#ff444430",
      accent: "#ff6666",
      success: "#44ff44",
      warning: "#ffaa00",
      error: "#ff2222",
    },
  },
  {
    id: "white",
    name: "Paper White",
    description: "Clean light theme for daylight use",
    colors: {
      primary: "#2563eb",
      primaryDark: "#1d4ed8",
      secondary: "#64748b",
      background: "#ffffff",
      backgroundSecondary: "#f8fafc",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      accent: "#3b82f6",
      success: "#059669",
      warning: "#d97706",
      error: "#dc2626",
    },
  },
];

export const defaultTheme = themes[0]; // Matrix Green

export function getThemeById(id: string): Theme {
  return themes.find((theme) => theme.id === id) || defaultTheme;
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty("--theme-primary-dark", theme.colors.primaryDark);
  root.style.setProperty("--theme-secondary", theme.colors.secondary);
  root.style.setProperty("--theme-background", theme.colors.background);
  root.style.setProperty(
    "--theme-background-secondary",
    theme.colors.backgroundSecondary
  );
  root.style.setProperty("--theme-text", theme.colors.text);
  root.style.setProperty("--theme-text-secondary", theme.colors.textSecondary);
  root.style.setProperty("--theme-border", theme.colors.border);
  root.style.setProperty("--theme-accent", theme.colors.accent);
  root.style.setProperty("--theme-success", theme.colors.success);
  root.style.setProperty("--theme-warning", theme.colors.warning);
  root.style.setProperty("--theme-error", theme.colors.error);

  // Update body classes for theme switching
  document.body.className = document.body.className.replace(/theme-\w+/g, "");
  document.body.classList.add(`theme-${theme.id}`);
}

// Save theme preference for authenticated users
export async function saveUserTheme(themeId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/user-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: themeId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to save theme preference:", error);
    return false;
  }
}

// Get user's saved theme
export async function getUserTheme(): Promise<string | null> {
  try {
    const response = await fetch("/api/user-preferences");
    if (response.ok) {
      const data = await response.json();
      return data.theme || null;
    }
  } catch (error) {
    console.error("Failed to get theme preference:", error);
  }
  return null;
}
