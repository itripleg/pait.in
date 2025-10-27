// app/theme/presetThemes.ts
// Preset themes for PAIT - Terminal/Retro aesthetic

export const presetThemes = [
  {
    name: "Matrix Green",
    description: "Classic terminal green on black",
    colors: [
      { hue: 123, saturation: 100, lightness: 50 }, // #00ff41 primary
      { hue: 0, saturation: 0, lightness: 3 }, // #0a0a0a background
      { hue: 123, saturation: 100, lightness: 25 }, // darker green accent
      { hue: 123, saturation: 100, lightness: 50 }, // #00ff41 text
    ],
  },
  {
    name: "Amber Terminal",
    description: "Warm amber CRT monitor style",
    colors: [
      { hue: 40, saturation: 100, lightness: 50 }, // #ffb000 primary
      { hue: 30, saturation: 100, lightness: 5 }, // #1a0f00 background
      { hue: 51, saturation: 100, lightness: 50 }, // #ffd700 accent
      { hue: 40, saturation: 100, lightness: 50 }, // amber text
    ],
  },
  {
    name: "Cyan Blue",
    description: "Electric blue cyberpunk aesthetic",
    colors: [
      { hue: 180, saturation: 100, lightness: 50 }, // #00ffff primary
      { hue: 210, saturation: 100, lightness: 7 }, // #001122 background
      { hue: 200, saturation: 100, lightness: 70 }, // #66ccff accent
      { hue: 180, saturation: 100, lightness: 50 }, // cyan text
    ],
  },
  {
    name: "Neon Purple",
    description: "Synthwave purple vibes",
    colors: [
      { hue: 277, saturation: 85, lightness: 63 }, // #bb44ff primary
      { hue: 270, saturation: 100, lightness: 10 }, // #1a0033 background
      { hue: 285, saturation: 100, lightness: 70 }, // #dd66ff accent
      { hue: 277, saturation: 85, lightness: 63 }, // purple text
    ],
  },
  {
    name: "Red Alert",
    description: "High contrast red terminal",
    colors: [
      { hue: 0, saturation: 100, lightness: 63 }, // #ff4444 primary
      { hue: 0, saturation: 100, lightness: 7 }, // #220000 background
      { hue: 0, saturation: 100, lightness: 70 }, // #ff6666 accent
      { hue: 0, saturation: 100, lightness: 63 }, // red text
    ],
  },
  {
    name: "Paper White",
    description: "Clean light theme for daylight use",
    colors: [
      { hue: 221, saturation: 83, lightness: 53 }, // #2563eb primary
      { hue: 0, saturation: 0, lightness: 100 }, // #ffffff background
      { hue: 221, saturation: 83, lightness: 60 }, // #3b82f6 accent
      { hue: 215, saturation: 25, lightness: 27 }, // #1e293b text
    ],
  },
];
