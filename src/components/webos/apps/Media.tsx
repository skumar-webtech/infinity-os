import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Image as ImageIcon } from "lucide-react";
import { useOS } from "../OSContext";

const GALLERY = [
  { name: "Sunset", gradient: "linear-gradient(135deg,#f59e0b,#ec4899,#7c3aed)" },
  { name: "Mountains", gradient: "linear-gradient(135deg,#0ea5e9,#1e40af,#312e81)" },
  { name: "Ocean", gradient: "linear-gradient(135deg,#06b6d4,#0891b2,#134e4a)" },
  { name: "Forest", gradient: "linear-gradient(135deg,#22c55e,#065f46,#052e16)" },
  { name: "Aurora", gradient: "linear-gradient(135deg,#22d3ee,#a78bfa,#ec4899)" },
  { name: "Desert", gradient: "linear-gradient(135deg,#fbbf24,#dc2626,#7c2d12)" },
];

export function MediaViewer() {
  const { theme } = useOS();
  const [selected, setSelected] = useState(0);
  const g = GALLERY[selected];
  return (
    <div className="h-full flex">
      <div
        className="w-48 p-3 overflow-auto"
        style={{ background: theme.glass, borderRight: `1px solid ${theme.border}` }}
      >
        <div className="text-xs uppercase opacity-50 mb-2 px-2">Gallery</div>
        <div className="grid grid-cols-2 gap-2">
          {GALLERY.map((img, i) => (
            <button
              key={img.name}
              onClick={() => setSelected(i)}
              className="aspect-square rounded-lg transition-transform hover:scale-105"
              style={{
                background: img.gradient,
                outline: selected === i ? `2px solid ${theme.accent}` : "none",
                outlineOffset: 2,
              }}
              aria-label={img.name}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div
          className="flex-1 grid place-items-center p-8"
          style={{ background: theme.glass }}
        >
          <div
            className="w-full h-full rounded-2xl grid place-items-center relative overflow-hidden"
            style={{ background: g.gradient, boxShadow: theme.shadow }}
          >
            <ImageIcon className="w-20 h-20 text-white/40" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="font-medium">{g.name}.jpg</div>
              <div className="text-xs opacity-70">
                {selected + 1} / {GALLERY.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TRACKS = [
  { title: "Chill Beats", artist: "Lo-Fi Collective", duration: 184 },
  { title: "Synthwave Dreams", artist: "Neon Rider", duration: 212 },
  { title: "Lo-Fi Study", artist: "Cafe Sessions", duration: 156 },
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function MusicPlayer() {
  const { theme } = useOS();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const track = TRACKS[i];

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setT((v) => {
        if (v >= track.duration) {
          setI((n) => (n + 1) % TRACKS.length);
          return 0;
        }
        return v + 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, track.duration]);

  useEffect(() => setT(0), [i]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 gap-6">
      <div
        className="w-56 h-56 rounded-2xl grid place-items-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
          boxShadow: theme.shadow,
          transform: playing ? "scale(1)" : "scale(0.95)",
          transition: "transform 0.4s ease",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "repeating-radial-gradient(circle at center, transparent 0, transparent 8px, rgba(0,0,0,0.2) 8px, rgba(0,0,0,0.2) 9px)",
            animation: playing ? "spin 8s linear infinite" : "none",
          }}
        />
        <div className="w-8 h-8 rounded-full bg-black/40 z-10" />
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold">{track.title}</div>
        <div className="text-sm opacity-60">{track.artist}</div>
      </div>
      <div className="w-full max-w-sm">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.border }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${(t / track.duration) * 100}%`, background: theme.accent, transition: "width 1s linear" }}
          />
        </div>
        <div className="flex justify-between text-xs opacity-60 mt-1">
          <span>{fmt(t)}</span>
          <span>{fmt(track.duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={() => setI((n) => (n - 1 + TRACKS.length) % TRACKS.length)}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-14 h-14 rounded-full grid place-items-center transition-transform hover:scale-105"
          style={{ background: theme.accent, color: "#fff" }}
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button
          onClick={() => setI((n) => (n + 1) % TRACKS.length)}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
