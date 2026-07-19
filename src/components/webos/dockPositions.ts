import type { AppId } from "./types";

// Shared registry: each Dock icon reports its viewport-center coords here so
// windows can animate from/to their launcher origin (macOS "genie"-style).
export const dockPositions = new Map<AppId, { cx: number; cy: number }>();

export function getDockPosition(appId: AppId): { cx: number; cy: number } {
  const p = dockPositions.get(appId);
  if (p) return p;
  // Fallback: center of dock area at bottom of screen.
  return {
    cx: typeof window !== "undefined" ? window.innerWidth / 2 : 640,
    cy: typeof window !== "undefined" ? window.innerHeight - 40 : 800,
  };
}
