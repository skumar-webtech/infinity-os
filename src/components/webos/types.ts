export type AppId = "files" | "settings" | "themes" | "media" | "music" | "terminal";

export type ThemeId = "dark" | "light" | "cyberpunk" | "pastel";

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  props?: Record<string, unknown>;
}

export interface Theme {
  id: ThemeId;
  name: string;
  wallpaper: string;
  bg: string;
  fg: string;
  glass: string;
  glassStrong: string;
  border: string;
  accent: string;
  accent2: string;
  dockBg: string;
  shadow: string;
}
