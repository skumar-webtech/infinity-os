import { useEffect, useState } from "react";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { useOS } from "../OSContext";
import { formatBytes, totalSize } from "../vfs";

export function Settings() {
  const { theme, fs } = useOS();
  const [cpu, setCpu] = useState(32);
  const [ram, setRam] = useState(58);
  const used = totalSize(fs);
  const total = 512 * 1024 * 1024 * 1024;
  const storagePct = Math.max(2, Math.min(100, (used / total) * 100 + 47));

  useEffect(() => {
    const t = setInterval(() => {
      setCpu((v) => Math.max(8, Math.min(95, v + (Math.random() - 0.5) * 18)));
      setRam((v) => Math.max(20, Math.min(90, v + (Math.random() - 0.5) * 8)));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full overflow-auto p-8" style={{ color: theme.fg }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div
            className="w-32 h-32 rounded-3xl grid place-items-center text-6xl font-bold shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              boxShadow: theme.shadow,
            }}
          >
            ∞
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight">Infinity OS</div>
            <div className="text-sm opacity-60">Version 2.0 · Nebula Build 26.11</div>
          </div>
        </div>

        <Section title="Overview" theme={theme}>
          <Row label="Chip" value="Infinity M∞ · 8-core Neural" icon={<Cpu className="w-4 h-4" />} />
          <Row
            label="Memory"
            value="16 GB Unified Memory"
            icon={<MemoryStick className="w-4 h-4" />}
          />
          <Row label="Storage" value="512 GB SSD" icon={<HardDrive className="w-4 h-4" />} />
          <Row label="Serial Number" value="INF-∞-2026-XYZ" icon={<span className="text-xs">#</span>} />
        </Section>

        <Section title="Resources" theme={theme}>
          <Meter label="CPU" pct={cpu} color={theme.accent} theme={theme} />
          <Meter label="Memory" pct={ram} color={theme.accent2} theme={theme} />
          <Meter
            label={`Storage · ${formatBytes(used)} used in virtual FS`}
            pct={storagePct}
            color={theme.accent}
            theme={theme}
          />
        </Section>

        <div className="text-center text-xs opacity-50 mt-6">
          © Infinity Systems — Made with love in the browser
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useOS>["theme"];
}) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{ background: theme.glass, border: `1px solid ${theme.border}` }}
    >
      <div className="text-xs uppercase tracking-wider opacity-60 mb-3">{title}</div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 opacity-70">
        {icon}
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Meter({
  label,
  pct,
  color,
  theme,
}: {
  label: string;
  pct: number;
  color: string;
  theme: ReturnType<typeof useOS>["theme"];
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="opacity-80">{label}</span>
        <span className="opacity-60">{Math.round(pct)}%</span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: theme.border }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${theme.accent2})`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
