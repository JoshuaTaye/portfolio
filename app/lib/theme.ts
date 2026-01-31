/**
 * Centralized theme configuration.
 * Light and dark mode; customize colors, timing, and easing here.
 */

export const theme = {
  light: {
    background: "#ffffff",
    base: "#1a1a1a",
    baseMuted: "#6b6b6b",
    accent: "#7d9a8a",
    accentHover: "#6a8576",
    pencil: "#2d2d2d",
    pencilLight: "#9a9a9a",
  },
  dark: {
    background: "#000000",
    base: "#e8e8e8",
    baseMuted: "#a8a8a8",
    accent: "#8faa9b",
    accentHover: "#9eb8ab",
    pencil: "#c4c4c4",
    pencilLight: "#6a6a6a",
  },
  colors: {
    background: "#ffffff",
    base: "#1a1a1a",
    baseMuted: "#6b6b6b",
    accent: "#7d9a8a",
    accentHover: "#6a8576",
    pencil: "#2d2d2d",
    pencilLight: "#9a9a9a",
  },
  timing: {
    fill: 0.35,
    hover: 0.2,
    focus: 0.4,
    lineJitter: 0.15,
    edgeDraw: 0.5,
    nodeSettle: 0.45,
  },
  easing: {
    calm: [0.4, 0, 0.2, 1] as const,
    smooth: [0.25, 0.1, 0.25, 1] as const,
  },
} as const;

export type Theme = typeof theme;
