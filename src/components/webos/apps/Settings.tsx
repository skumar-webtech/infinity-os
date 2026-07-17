import { useEffect, useState } from "react";
import { Cpu, HardDrive, MemoryStick, Wifi, Volume2, Bell, Battery } from "lucide-react";
import { useOS } from "../OSContext";

function Ring({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90">
          <circle cx="56" cy="56" r={r} stroke="currentColor" strokeWidth="8" fill="none" className="opacity-15" />
          <circle
            cx="56"
            cy="56"
            r={r}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={off}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-lg font-semibold">{value}%</div>
      </div>
      <div className="text-xs uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}

export function Settings() {
  const { theme, system, setSystem } = useOS();
  const [cpu, setCpu] = useState(32);
  const [ram, setRam] = useState(58);
  const storage = 47;

  useEffect(() => {
    const t = setInterval(() => {
      setCpu((v) => Math.max(8, Math.min(95, v + (Math.random() - 0.5) * 20)));
      setRam((v) => Math.max(20, Math.min(90, v + (Math.random() - 0.5) * 8)));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full overflow-auto p-6" style={{ color: theme.fg }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div
          className="rounded-2xl p-6"
          style={{ background: theme.glass, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl grid place-items-center text-2xl font-bold"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}
            >
              A
            </div>
            <div>
              <div className="text-xl font-semibold">AnnaOS v1.0</div>
              <div className="text-sm opacity-60">Aurora Build 26.11 · Web Edition</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <Ring value={Math.round(cpu)} label="CPU" color={theme.accent} />
            <Ring value={Math.round(ram)} label="Memory" color={theme.accent2} />
            <Ring value={storage} label="Storage" color={theme.accent} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-xs opacity-70 pt-4">
            <div><Cpu className="w-4 h-4 mx-auto mb-1" />8-core Neural</div>
            <div><MemoryStick className="w-4 h-4 mx-auto mb-1" />16 GB Unified</div>
            <div><HardDrive className="w-4 h-4 mx-auto mb-1" />512 GB SSD</div>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: theme.glass, border: `1px solid ${theme.border}` }}
        >
          <div className="text-sm font-semibold opacity-80 uppercase tracking-wider">Controls</div>

          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5" />
            <div className="flex-1">
              <div className="text-sm mb-1">Volume · {system.volume}%</div>
              <input
                type="range"
                min={0}
                max={100}
                value={system.volume}
                onChange={(e) => setSystem({ volume: +e.target.value })}
                className="w-full accent-current"
                style={{ color: theme.accent }}
              />
            </div>
          </div>

          <Toggle
            icon={<Wifi className="w-5 h-5" />}
            label="Wi-Fi"
            sub={system.wifi ? "Connected · AnnaNet 5G" : "Off"}
            value={system.wifi}
            onChange={(v) => setSystem({ wifi: v })}
          />
          <Toggle
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            sub={system.notifications ? "All apps allowed" : "Do Not Disturb"}
            value={system.notifications}
            onChange={(v) => setSystem({ notifications: v })}
          />
          <div className="flex items-center gap-4">
            <Battery className="w-5 h-5" />
            <div className="flex-1">
              <div className="text-sm">Battery · {system.battery}%</div>
              <div className="h-2 rounded-full mt-1 overflow-hidden" style={{ background: theme.border }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${system.battery}%`, background: theme.accent }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  icon,
  label,
  sub,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { theme } = useOS();
  return (
    <div className="flex items-center gap-4">
      {icon}
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs opacity-60">{sub}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full relative transition-colors"
        style={{ background: value ? theme.accent : theme.border }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
          style={{ left: value ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}
