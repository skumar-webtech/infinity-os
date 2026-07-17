import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { THEMES } from "./themes";
import type { AppId, ThemeId, WindowState } from "./types";

interface SystemState {
  volume: number;
  wifi: boolean;
  notifications: boolean;
  battery: number;
}

interface OSContextValue {
  theme: (typeof THEMES)[ThemeId];
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  windows: WindowState[];
  openApp: (appId: AppId, props?: Record<string, unknown>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateWindow: (id: string, patch: Partial<WindowState>) => void;
  activeId: string | null;
  system: SystemState;
  setSystem: (patch: Partial<SystemState>) => void;
}

const OSContext = createContext<OSContextValue | null>(null);

const APP_TITLES: Record<AppId, string> = {
  files: "Finder",
  settings: "System Settings",
  themes: "Personalization",
  media: "Gallery",
  music: "Music",
  terminal: "Terminal",
};

let zCounter = 10;
let idCounter = 0;

export function OSProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("dark");
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [system, setSystemState] = useState<SystemState>({
    volume: 65,
    wifi: true,
    notifications: true,
    battery: 87,
  });

  const openApp = useCallback((appId: AppId, props?: Record<string, unknown>) => {
    setWindows((prev) => {
      // If already open, just focus & unminimize
      const existing = prev.find((w) => w.appId === appId && !props);
      if (existing) {
        zCounter += 1;
        setActiveId(existing.id);
        return prev.map((w) =>
          w.id === existing.id ? { ...w, minimized: false, z: zCounter } : w,
        );
      }
      idCounter += 1;
      zCounter += 1;
      const id = `w-${idCounter}`;
      const w = Math.min(900, window.innerWidth - 120);
      const h = Math.min(600, window.innerHeight - 180);
      const win: WindowState = {
        id,
        appId,
        title: APP_TITLES[appId],
        x: 80 + ((idCounter * 30) % 200),
        y: 60 + ((idCounter * 30) % 120),
        w,
        h,
        z: zCounter,
        minimized: false,
        maximized: false,
        props,
      };
      setActiveId(id);
      return [...prev, win];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    zCounter += 1;
    setActiveId(id);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z: zCounter, minimized: false } : w)));
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  }, []);

  const updateWindow = useCallback((id: string, patch: Partial<WindowState>) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const setSystem = useCallback((patch: Partial<SystemState>) => {
    setSystemState((s) => ({ ...s, ...patch }));
  }, []);

  const value = useMemo<OSContextValue>(
    () => ({
      theme: THEMES[themeId],
      themeId,
      setTheme: setThemeId,
      windows,
      openApp,
      closeWindow,
      focusWindow,
      toggleMinimize,
      toggleMaximize,
      updateWindow,
      activeId,
      system,
      setSystem,
    }),
    [themeId, windows, activeId, system, openApp, closeWindow, focusWindow, toggleMinimize, toggleMaximize, updateWindow, setSystem],
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used within OSProvider");
  return ctx;
}
