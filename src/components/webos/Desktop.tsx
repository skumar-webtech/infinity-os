import { FolderOpen, Settings2, Palette, Image as ImageIcon, Music, TerminalSquare } from "lucide-react";
import { useOS } from "./OSContext";
import { OSWindow } from "./Window";
import { Dock, TopBar } from "./Dock";
import { FileExplorer } from "./apps/FileExplorer";
import { Settings } from "./apps/Settings";
import { ThemesApp } from "./apps/Themes";
import { MediaViewer, MusicPlayer } from "./apps/Media";
import { TerminalApp } from "./apps/Terminal";
import type { AppId } from "./types";
import darkBg from "@/assets/dark-bg.mp4.asset.json";

const ICONS: { id: AppId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "files", label: "Finder", icon: FolderOpen },
  { id: "settings", label: "About", icon: Settings2 },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "media", label: "Gallery", icon: ImageIcon },
  { id: "music", label: "Music", icon: Music },
  { id: "terminal", label: "Terminal", icon: TerminalSquare },
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
    case "terminal":
      return <TerminalApp />;
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
        transition: "color 0.3s ease",
      }}
    >
      {/* Live video background */}
      <video
        src={darkBg.url}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
        aria-hidden
      />
      {/* Subtle readability overlay + themed tint */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: `${theme.wallpaper}`,
          opacity: 0.55,
          mixBlendMode: "multiply",
          transition: "opacity 0.6s ease",
        }}
      />
      <div className="absolute inset-0 pointer-events-none -z-10 bg-black/25" />

      <TopBar />

      <div className="absolute top-12 left-4 flex flex-col gap-4">
        {ICONS.map((i) => {
          const Icon = i.icon;
          return (
            <button
              key={i.id}
              onDoubleClick={() => openApp(i.id)}
              className="flex flex-col items-center gap-1 w-20 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
            >
              <div
                className="w-14 h-14 rounded-2xl grid place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
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
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
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
