import { Check } from "lucide-react";
import { useOS } from "../OSContext";
import { THEMES } from "../themes";
import type { ThemeId } from "../types";

export function ThemesApp() {
  const { theme, themeId, setTheme } = useOS();
  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-2xl font-semibold mb-1">Personalization</div>
        <div className="text-sm opacity-60 mb-6">
          Pick a theme. Wallpaper, dock, and windows update instantly.
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const t = THEMES[id];
            const active = id === themeId;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className="rounded-2xl p-1 relative overflow-hidden transition-transform hover:scale-[1.02]"
                style={{
                  border: `2px solid ${active ? theme.accent : "transparent"}`,
                }}
              >
                <div
                  className="rounded-xl h-40 relative overflow-hidden"
                  style={{ background: t.wallpaper }}
                >
                  <div
                    className="absolute inset-x-6 top-6 h-16 rounded-lg"
                    style={{
                      background: t.glassStrong,
                      backdropFilter: "blur(12px)",
                      border: `1px solid ${t.border}`,
                    }}
                  />
                  <div
                    className="absolute inset-x-10 bottom-3 h-8 rounded-full flex items-center justify-center gap-1"
                    style={{
                      background: t.dockBg,
                      backdropFilter: "blur(12px)",
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <div className="w-4 h-4 rounded" style={{ background: t.accent }} />
                    <div className="w-4 h-4 rounded" style={{ background: t.accent2 }} />
                    <div className="w-4 h-4 rounded" style={{ background: t.fg, opacity: 0.4 }} />
                  </div>
                  {active && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full grid place-items-center"
                      style={{ background: theme.accent }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-3 text-left">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs opacity-60">
                    {id === "dark" && "Sleek slate & blue"}
                    {id === "light" && "Clean minimalist"}
                    {id === "cyberpunk" && "Neon pink & cyan"}
                    {id === "pastel" && "Soft warm tones"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
