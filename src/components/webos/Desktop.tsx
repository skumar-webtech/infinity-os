import { FolderOpen, Settings2, Palette, Image as ImageIcon, Music } from "lucide-react";
import { useOS } from "./OSContext";
import { OSWindow } from "./Window";
import { Dock, TopBar } from "./Dock";
import { FileExplorer } from "./apps/FileExplorer";
import { Settings } from "./apps/Settings";
import { ThemesApp } from "./apps/Themes";
import { MediaViewer, MusicPlayer } from "./apps/Media";
import type { AppId } from "./types";

const ICONS: { id: AppId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "files", label: "Finder", icon: FolderOpen },
  { id: "settings", label: "About", icon: Settings2 },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "media", label: "Gallery", icon: ImageIcon },
  { id: "music", label: "Music", icon: Music },
];

function renderApp(appId: AppId) {
  switch (appId) {
    case "files":
      return <FileExplorer />;
    case "settings":
      return <Settings />;
    case "themes":
      return <ThemesApp />;
    case "media":
      return <MediaViewer />;
    case "music":
      return <MusicPlayer />;
  }
}

export function Desktop() {
  const { theme, windows, openApp } = useOS();

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: theme.wallpaper,
        color: theme.fg,
        transition: "background 0.6s ease, color 0.3s ease",
      }}
    >
      <TopBar />

      <div className="absolute top-12 left-4 flex flex-col gap-4">
        {ICONS.map((i) => {
          const Icon = i.icon;
          return (
            <button
              key={i.id}
              onDoubleClick={() => openApp(i.id)}
              className="flex flex-col items-center gap-1 w-20 p-2 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <div
                className="w-14 h-14 rounded-2xl grid place-items-center transition-transform group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}88, ${theme.accent2}88)`,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                }}
              >
                <Icon className="w-7 h-7 text-white drop-shadow" />
              </div>
              <div
                className="text-xs text-center leading-tight px-1 rounded"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
              >
                {i.label}
              </div>
            </button>
          );
        })}
      </div>

      {windows.map((w) => (
        <OSWindow key={w.id} win={w}>
          {renderApp(w.appId)}
        </OSWindow>
      ))}

      <Dock />
    </div>
  );
}
