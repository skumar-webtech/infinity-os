import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Moon,
  Radio,
  Sun,
  Volume2,
  Volume1,
  VolumeX,
  Battery,
  BatteryCharging,
  Search,
} from "lucide-react";
import { useOS } from "./OSContext";
import { dockPositions } from "./dockPositions";
import type { AppId, ThemeId } from "./types";

const APPLE_MENU: { label: string; action?: string; separator?: boolean }[] = [
  { label: "About This Mac", action: "about" },
  { label: "System Settings…", action: "settings" },
  { label: "sep", separator: true },
  { label: "Sleep", action: "sleep" },
  { label: "Restart…", action: "restart" },
  { label: "Shut Down…", action: "shutdown" },
  { label: "sep", separator: true },
  { label: "Lock Screen", action: "lock" },
];

export function TopBar() {
  const { theme, activeWindow, openApp } = useOS();
  const [now, setNow] = useState(new Date());
  const [openMenu, setOpenMenu] = useState<"apple" | "app" | "control" | "clock" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  function handleAppleAction(a?: string) {
    setOpenMenu(null);
    if (a === "about") openApp("settings");
    if (a === "settings") openApp("themes");
    if (a === "restart" || a === "shutdown") {
      // Confetti-free: reload to restart
      if (typeof window !== "undefined") window.location.reload();
    }
  }

  const appTitle = activeWindow?.title ?? "Finder";

  return (
    <div
      ref={wrapRef}
      className="fixed top-0 left-0 right-0 z-[9999] h-7 flex items-center justify-between px-3 text-[13px] select-none"
      style={{
        background: theme.dockBg,
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${theme.border}`,
        color: theme.fg,
      }}
    >
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setOpenMenu(openMenu === "apple" ? null : "apple")}
          className="px-1.5 py-0.5 rounded hover:bg-white/15 flex items-center"
          aria-label="Apple menu"
        >
          <span className="text-base leading-none">∞</span>
        </button>
        <span className="font-semibold">{appTitle}</span>
        <span className="opacity-70 text-[12px]">File</span>
        <span className="opacity-70 text-[12px]">Edit</span>
        <span className="opacity-70 text-[12px]">View</span>
        <span className="opacity-70 text-[12px]">Window</span>
        <span className="opacity-70 text-[12px]">Help</span>

        {openMenu === "apple" && (
          <div
            className="absolute top-7 left-0 min-w-[220px] rounded-md py-1 text-[13px] shadow-2xl"
            style={{
              background: theme.glassStrong,
              backdropFilter: "blur(30px) saturate(180%)",
              border: `1px solid ${theme.border}`,
              color: theme.fg,
            }}
          >
            {APPLE_MENU.map((m, i) =>
              m.separator ? (
                <div key={i} className="my-1 h-px" style={{ background: theme.border }} />
              ) : (
                <button
                  key={i}
                  onClick={() => handleAppleAction(m.action)}
                  className="w-full text-left px-3 py-1 hover:bg-blue-500/70 hover:text-white transition-colors"
                >
                  {m.label}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 relative">
        <StatusIcons />
        <button
          onClick={() => setOpenMenu(openMenu === "control" ? null : "control")}
          className="p-1 rounded hover:bg-white/15"
          title="Control Center"
        >
          <div className="flex flex-col gap-[2px]">
            <span className="block w-3.5 h-0.5 rounded-full bg-current opacity-80" />
            <span className="block w-3.5 h-0.5 rounded-full bg-current opacity-80" />
          </div>
        </button>
        <button
          onClick={() => setOpenMenu(openMenu === "clock" ? null : "clock")}
          className="hover:opacity-80 text-[12px]"
        >
          {date} {time}
        </button>

        {openMenu === "control" && <ControlCenter onClose={() => setOpenMenu(null)} />}
        {openMenu === "clock" && <ClockPopover now={now} />}
      </div>
    </div>
  );
}

function StatusIcons() {
  const { system } = useOS();
  const Icon = system.charging ? BatteryCharging : Battery;
  return (
    <div className="flex items-center gap-2 opacity-90">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[11px]">
        {system.battery}%{system.charging ? " ⚡" : ""}
      </span>
      {system.wifi ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
      <Search className="w-3.5 h-3.5" />
    </div>
  );
}

function ControlCenter({ onClose }: { onClose: () => void }) {
  const { theme, system, setSystem, setTheme, themeId } = useOS();
  const themes: { id: ThemeId; label: string }[] = [
    { id: "dark", label: "Dark" },
    { id: "light", label: "Light" },
    { id: "cyberpunk", label: "Cyberpunk" },
    { id: "pastel", label: "Pastel" },
  ];
  return (
    <div
      className="absolute top-8 right-0 w-80 rounded-2xl p-3 shadow-2xl"
      style={{
        background: theme.glassStrong,
        backdropFilter: "blur(30px) saturate(180%)",
        border: `1px solid ${theme.border}`,
        color: theme.fg,
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div
          className="col-span-2 rounded-xl p-3"
          style={{ background: theme.glass, border: `1px solid ${theme.border}` }}
        >
          <div className="grid grid-cols-3 gap-2">
            <PillToggle
              icon={system.wifi ? Wifi : WifiOff}
              label="Wi-Fi"
              sub={system.wifi ? "AnnaNet" : "Off"}
              on={system.wifi}
              onToggle={() => setSystem({ wifi: !system.wifi })}
            />
            <PillToggle
              icon={Bluetooth}
              label="Bluetooth"
              sub={system.bluetooth ? "On" : "Off"}
              on={system.bluetooth}
              onToggle={() => setSystem({ bluetooth: !system.bluetooth })}
            />
            <PillToggle
              icon={Radio}
              label="AirDrop"
              sub={system.airdrop ? "Everyone" : "Off"}
              on={system.airdrop}
              onToggle={() => setSystem({ airdrop: !system.airdrop })}
            />
          </div>
        </div>

        <PillCard theme={theme} className="col-span-2">
          <PillToggle
            icon={Moon}
            label="Focus"
            sub={system.focus ? "Do Not Disturb" : "Off"}
            on={system.focus}
            onToggle={() => setSystem({ focus: !system.focus })}
            wide
          />
        </PillCard>

        <PillCard theme={theme} className="col-span-2">
          <div className="text-xs opacity-70 mb-1 flex items-center gap-2">
            <Sun className="w-3.5 h-3.5" /> Display
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={system.brightness}
            onChange={(e) => setSystem({ brightness: +e.target.value })}
            className="w-full"
            style={{ accentColor: theme.accent }}
          />
        </PillCard>

        <PillCard theme={theme} className="col-span-2">
          <div className="text-xs opacity-70 mb-1 flex items-center gap-2">
            {system.volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : system.volume < 50 ? (
              <Volume1 className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            Sound
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={system.volume}
            onChange={(e) => setSystem({ volume: +e.target.value })}
            className="w-full"
            style={{ accentColor: theme.accent }}
          />
        </PillCard>

        <PillCard theme={theme} className="col-span-2">
          <div className="text-xs opacity-70 mb-2">Appearance</div>
          <div className="grid grid-cols-4 gap-1.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  onClose();
                }}
                className="text-[11px] py-1 rounded-md transition-colors"
                style={{
                  background: themeId === t.id ? theme.accent : theme.border,
                  color: themeId === t.id ? "#fff" : theme.fg,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </PillCard>
      </div>
    </div>
  );
}

function PillCard({
  children,
  theme,
  className,
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof useOS>["theme"];
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${className ?? ""}`}
      style={{ background: theme.glass, border: `1px solid ${theme.border}` }}
    >
      {children}
    </div>
  );
}

function PillToggle({
  icon: Icon,
  label,
  sub,
  on,
  onToggle,
  wide,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
  wide?: boolean;
}) {
  const { theme } = useOS();
  return (
    <button
      onClick={onToggle}
      className={`flex ${wide ? "flex-row items-center gap-3" : "flex-col items-start gap-1"} p-2 rounded-lg transition-colors text-left`}
      style={{ background: on ? theme.accent + "cc" : theme.border, color: on ? "#fff" : theme.fg }}
    >
      <div
        className="w-7 h-7 rounded-full grid place-items-center"
        style={{ background: on ? "rgba(255,255,255,0.25)" : theme.glassStrong }}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium leading-tight truncate">{label}</div>
        <div className="text-[10px] opacity-80 truncate">{sub}</div>
      </div>
    </button>
  );
}

function ClockPopover({ now }: { now: Date }) {
  const { theme } = useOS();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div
      className="absolute top-8 right-0 w-64 rounded-xl p-4"
      style={{
        background: theme.glassStrong,
        backdropFilter: "blur(24px)",
        border: `1px solid ${theme.border}`,
        color: theme.fg,
      }}
    >
      <div className="text-3xl font-semibold">{time}</div>
      <div className="text-xs opacity-70">
        {now.toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  );
}

// Dock is now driven by Desktop-provided icon set for consistency.
export function Dock({
  items,
}: {
  items: { id: AppId; label: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  const { theme, openApp, windows, focusWindow, activeId } = useOS();
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-3 z-[9999] flex items-end gap-1.5 px-3 pt-2 pb-1.5 rounded-2xl"
      style={{
        background: theme.dockBg,
        backdropFilter: "blur(30px) saturate(200%)",
        border: `1px solid ${theme.border}`,
        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      {items.map((a) => {
        const Icon = a.icon;
        const openWin = windows.find((w) => w.appId === a.id);
        const isActive = openWin && activeId === openWin.id && !openWin.minimized;
        const btnRef = useRef<HTMLButtonElement>(null);
        useLayoutEffect(() => {
          function measure() {
            const el = btnRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            dockPositions.set(a.id, { cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
          }
          measure();
          window.addEventListener("resize", measure);
          return () => window.removeEventListener("resize", measure);
        }, [a.id]);
        return (
          <button
            key={a.id}
            ref={btnRef}
            title={a.label}
            onClick={() => {
              if (openWin) focusWindow(openWin.id);
              else openApp(a.id);
            }}
            className="group relative flex flex-col items-center"
          >
            <div
              className="absolute -top-9 opacity-0 group-hover:opacity-100 text-[11px] px-2 py-1 rounded-md whitespace-nowrap transition-opacity pointer-events-none"
              style={{
                background: theme.glassStrong,
                border: `1px solid ${theme.border}`,
                color: theme.fg,
              }}
            >
              {a.label}
            </div>
            <div
              className="w-12 h-12 rounded-xl grid place-items-center transition-all duration-200 ease-out group-hover:-translate-y-3 group-hover:scale-125 group-active:scale-110 origin-bottom"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                boxShadow: `0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)`,
                color: "#fff",
              }}
            >
              <Icon className="w-6 h-6 drop-shadow" />
            </div>
            <div
              className="w-1 h-1 rounded-full mt-0.5 transition-opacity"
              style={{ background: theme.fg, opacity: openWin ? 1 : 0 }}
            />
          </button>
        );
      })}
    </div>
  );
}
