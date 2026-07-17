import { useEffect, useState } from "react";
import { FolderOpen, Settings2, Palette, Image as ImageIcon, Music, TerminalSquare, Wifi, WifiOff, Volume2, VolumeX, Battery } from "lucide-react";
import { useOS } from "./OSContext";
import type { AppId } from "./types";

const APPS: { id: AppId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "files", label: "Finder", icon: FolderOpen },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "media", label: "Gallery", icon: ImageIcon },
  { id: "music", label: "Music", icon: Music },
  { id: "terminal", label: "Terminal", icon: TerminalSquare },
];

export function Dock() {
  const { theme, openApp, windows, focusWindow, activeId } = useOS();
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[9999] flex items-end gap-2 px-3 py-2 rounded-2xl"
      style={{
        background: theme.dockBg,
        backdropFilter: "blur(24px) saturate(180%)",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
      }}
    >
      {APPS.map((a) => {
        const Icon = a.icon;
        const openWin = windows.find((w) => w.appId === a.id);
        const isActive = openWin && activeId === openWin.id && !openWin.minimized;
        return (
          <button
            key={a.id}
            title={a.label}
            onClick={() => {
              if (openWin) focusWindow(openWin.id);
              else openApp(a.id);
            }}
            className="group relative flex flex-col items-center"
          >
            <div
              className="w-12 h-12 rounded-xl grid place-items-center transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-125 group-hover:rotate-[-6deg] group-active:scale-110"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}55, ${theme.accent2}55)`,
                border: `1px solid ${theme.border}`,
                color: theme.fg,
                boxShadow: isActive ? `0 8px 24px ${theme.accent}55` : undefined,
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div
              className="w-1 h-1 rounded-full mt-1 transition-opacity"
              style={{ background: theme.fg, opacity: openWin ? (isActive ? 1 : 0.5) : 0 }}
            />
            <div
              className="absolute -top-8 opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-md whitespace-nowrap transition-opacity pointer-events-none"
              style={{ background: theme.glassStrong, border: `1px solid ${theme.border}`, color: theme.fg }}
            >
              {a.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function TopBar() {
  const { theme, system, setSystem } = useOS();
  const [now, setNow] = useState(new Date());
  const [showTray, setShowTray] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-8 flex items-center justify-between px-4 text-xs"
      style={{
        background: theme.dockBg,
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${theme.border}`,
        color: theme.fg,
      }}
    >
      <div className="flex items-center gap-3 font-medium">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}
        />
        <span>Infinity OS</span>
        <span className="opacity-50">·</span>
        <span className="opacity-70">Desktop</span>
      </div>
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => setSystem({ wifi: !system.wifi })}
          className="opacity-80 hover:opacity-100"
          title="Wi-Fi"
        >
          {system.wifi ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => setSystem({ volume: system.volume > 0 ? 0 : 60 })}
          className="opacity-80 hover:opacity-100"
          title="Volume"
        >
          {system.volume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
        <div className="flex items-center gap-1 opacity-80">
          <Battery className="w-3.5 h-3.5" />
          <span>{system.battery}%</span>
        </div>
        <button
          onClick={() => setShowTray((v) => !v)}
          className="font-medium hover:opacity-80"
        >
          {date} · {time}
        </button>
        {showTray && (
          <div
            className="absolute top-8 right-0 w-64 rounded-xl p-4"
            style={{
              background: theme.glassStrong,
              backdropFilter: "blur(24px)",
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
            }}
          >
            <div className="text-2xl font-semibold">{time}</div>
            <div className="text-xs opacity-70 mb-3">{now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            <MiniCalendar date={now} />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCalendar({ date }: { date: Date }) {
  const { theme } = useOS();
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const today = date.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-[10px] opacity-60 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-[11px]">
        {cells.map((c, i) => (
          <div
            key={i}
            className="aspect-square grid place-items-center rounded"
            style={{
              background: c === today ? theme.accent : "transparent",
              color: c === today ? "#fff" : "inherit",
              opacity: c ? 1 : 0,
            }}
          >
            {c || ""}
          </div>
        ))}
      </div>
    </div>
  );
}
