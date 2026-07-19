import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEMES } from "./themes";
import type { AppId, ThemeId, WindowState } from "./types";
import {
  addChild,
  loadFS,
  removeChild,
  saveFS,
  updateFileContent,
  type FSFolder,
  type FSNode,
} from "./vfs";

interface SystemState {
  volume: number;
  brightness: number;
  wifi: boolean;
  bluetooth: boolean;
  airdrop: boolean;
  focus: boolean;
  notifications: boolean;
  battery: number;
  charging: boolean;
  batterySupported: boolean;
}

interface OSContextValue {
  theme: (typeof THEMES)[ThemeId];
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  windows: WindowState[];
  openApp: (appId: AppId, props?: Record<string, unknown>, title?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateWindow: (id: string, patch: Partial<WindowState>) => void;
  activeId: string | null;
  activeWindow: WindowState | null;
  system: SystemState;
  setSystem: (patch: Partial<SystemState>) => void;
  fs: FSFolder;
  addFsNode: (parentPath: string, node: FSNode) => void;
  removeFsNode: (parentPath: string, name: string) => void;
  writeFsFile: (path: string, content: string) => void;
}

const OSContext = createContext<OSContextValue | null>(null);

const APP_TITLES: Record<AppId, string> = {
  files: "Finder",
  settings: "About This OS",
  themes: "Appearance",
  media: "Preview",
  music: "Music",
  terminal: "Terminal",
  textedit: "TextEdit",
  preview: "Preview",
};

let zCounter = 10;
let idCounter = 0;

// Battery API surface (not in all lib.dom versions).
interface BatteryLike {
  level: number;
  charging: boolean;
  addEventListener: (t: string, cb: () => void) => void;
  removeEventListener: (t: string, cb: () => void) => void;
}
interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryLike>;
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("dark");
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [system, setSystemState] = useState<SystemState>({
    volume: 65,
    brightness: 80,
    wifi: true,
    bluetooth: true,
    airdrop: false,
    focus: false,
    notifications: true,
    battery: 100,
    charging: false,
    batterySupported: false,
  });
  const [fs, setFs] = useState<FSFolder>(() => loadFS());

  useEffect(() => {
    saveFS(fs);
  }, [fs]);

  // Sync initial appearance with the host OS via prefers-color-scheme.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mm = window.matchMedia("(prefers-color-scheme: dark)");
    setThemeId(mm.matches ? "dark" : "light");
    const onChange = (e: MediaQueryListEvent) => setThemeId(e.matches ? "dark" : "light");
    mm.addEventListener?.("change", onChange);
    return () => mm.removeEventListener?.("change", onChange);
  }, []);

  // Live battery via the Web Battery Status API.
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as NavigatorWithBattery;
    if (!nav.getBattery) return;
    let battery: BatteryLike | null = null;
    let cancelled = false;
    const apply = () => {
      if (!battery) return;
      setSystemState((s) => ({
        ...s,
        battery: Math.round(battery!.level * 100),
        charging: battery!.charging,
        batterySupported: true,
      }));
    };
    nav.getBattery().then((b) => {
      if (cancelled) return;
      battery = b;
      apply();
      b.addEventListener("levelchange", apply);
      b.addEventListener("chargingchange", apply);
    });
    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener("levelchange", apply);
        battery.removeEventListener("chargingchange", apply);
      }
    };
  }, []);

  const openApp = useCallback(
    (appId: AppId, props?: Record<string, unknown>, title?: string) => {
      setWindows((prev) => {
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
        const w = Math.min(920, window.innerWidth - 120);
        const h = Math.min(620, window.innerHeight - 180);
        const win: WindowState = {
          id,
          appId,
          title: title ?? APP_TITLES[appId],
          x: 90 + ((idCounter * 30) % 220),
          y: 70 + ((idCounter * 30) % 140),
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
    },
    [],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    zCounter += 1;
    setActiveId(id);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, z: zCounter, minimized: false } : w)),
    );
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

  const addFsNode = useCallback((parentPath: string, node: FSNode) => {
    setFs((prev) => addChild(prev, parentPath, node));
  }, []);
  const removeFsNode = useCallback((parentPath: string, name: string) => {
    setFs((prev) => removeChild(prev, parentPath, name));
  }, []);
  const writeFsFile = useCallback((path: string, content: string) => {
    setFs((prev) => updateFileContent(prev, path, content));
  }, []);

  const activeWindow = useMemo(
    () => windows.find((w) => w.id === activeId) ?? null,
    [windows, activeId],
  );

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
      activeWindow,
      system,
      setSystem,
      fs,
      addFsNode,
      removeFsNode,
      writeFsFile,
    }),
    [
      themeId,
      windows,
      activeId,
      activeWindow,
      system,
      fs,
      openApp,
      closeWindow,
      focusWindow,
      toggleMinimize,
      toggleMaximize,
      updateWindow,
      setSystem,
      addFsNode,
      removeFsNode,
      writeFsFile,
    ],
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used within OSProvider");
  return ctx;
}
