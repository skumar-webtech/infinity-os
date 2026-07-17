import type { Theme, ThemeId } from "./types";

export const THEMES: Record<ThemeId, Theme> = {
  dark: {
    id: "dark",
    name: "Dark",
    wallpaper:
      "radial-gradient(1200px 800px at 15% 10%, #1e3a8a 0%, transparent 60%), radial-gradient(1000px 700px at 90% 90%, #0f172a 0%, transparent 55%), linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)",
    bg: "#0b1220",
    fg: "#e2e8f0",
    glass: "rgba(255,255,255,0.06)",
    glassStrong: "rgba(255,255,255,0.1)",
    border: "rgba(255,255,255,0.12)",
    accent: "#60a5fa",
    accent2: "#a78bfa",
    dockBg: "rgba(15,23,42,0.55)",
    shadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  light: {
    id: "light",
    name: "Light",
    wallpaper:
      "radial-gradient(1000px 700px at 10% 10%, #dbeafe 0%, transparent 55%), radial-gradient(1200px 800px at 90% 90%, #fce7f3 0%, transparent 55%), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    bg: "#f8fafc",
    fg: "#0f172a",
    glass: "rgba(255,255,255,0.55)",
    glassStrong: "rgba(255,255,255,0.75)",
    border: "rgba(15,23,42,0.08)",
    accent: "#2563eb",
    accent2: "#7c3aed",
    dockBg: "rgba(255,255,255,0.6)",
    shadow: "0 20px 50px rgba(15,23,42,0.15)",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    wallpaper:
      "radial-gradient(900px 700px at 15% 20%, #ec4899 0%, transparent 55%), radial-gradient(1100px 800px at 85% 85%, #06b6d4 0%, transparent 55%), linear-gradient(135deg, #0b0014 0%, #1a0033 60%, #08001a 100%)",
    bg: "#0a0014",
    fg: "#f0abfc",
    glass: "rgba(236,72,153,0.08)",
    glassStrong: "rgba(6,182,212,0.12)",
    border: "rgba(236,72,153,0.35)",
    accent: "#ec4899",
    accent2: "#06b6d4",
    dockBg: "rgba(10,0,20,0.6)",
    shadow: "0 20px 60px rgba(236,72,153,0.35)",
  },
  pastel: {
    id: "pastel",
    name: "Pastel",
    wallpaper:
      "radial-gradient(1000px 700px at 20% 20%, #fed7aa 0%, transparent 60%), radial-gradient(1000px 800px at 80% 80%, #fbcfe8 0%, transparent 55%), linear-gradient(135deg, #fef3c7 0%, #fce7f3 60%, #ddd6fe 100%)",
    bg: "#fff7ed",
    fg: "#4c1d95",
    glass: "rgba(255,255,255,0.5)",
    glassStrong: "rgba(255,255,255,0.7)",
    border: "rgba(124,58,237,0.15)",
    accent: "#f472b6",
    accent2: "#a78bfa",
    dockBg: "rgba(255,255,255,0.55)",
    shadow: "0 20px 50px rgba(244,114,182,0.25)",
  },
};
