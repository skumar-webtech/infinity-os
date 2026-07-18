import {
  FolderOpen,
  Palette,
  Image as ImageIcon,
  Music,
  TerminalSquare,
  FileText,
  Info,
} from "lucide-react";
import { useOS } from "./OSContext";
import { OSWindow } from "./Window";
import { Dock, TopBar } from "./Dock";
import { FileExplorer } from "./apps/FileExplorer";
import { Settings } from "./apps/Settings";
import { ThemesApp } from "./apps/Themes";
import { MediaViewer, MusicPlayer } from "./apps/Media";
import { TerminalApp } from "./apps/Terminal";
import { TextEdit, Preview } from "./apps/TextEdit";
import type { AppId } from "./types";
import darkBg from "@/assets/dark-bg.mp4.asset.json";

const DOCK_ICONS: { id: AppId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "files", label: "Finder", icon: FolderOpen },
  { id: "textedit", label: "TextEdit", icon: FileText },
  { id: "preview", label: "Preview", icon: ImageIcon },
  { id: "media", label: "Gallery", icon: ImageIcon },
  { id: "music", label: "Music", icon: Music },
  { id: "themes", label: "Appearance", icon: Palette },
  { id: "terminal", label: "Terminal", icon: TerminalSquare },
  { id: "settings", label: "About", icon: Info },
];

function renderApp(appId: AppId, props?: Record<string, unknown>) {
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
    case "textedit":
      return <TextEdit path={props?.path as string | undefined} />;
    case "preview":
      return <Preview path={props?.path as string | undefined} />;
  }
}

export function Desktop() {
  const { theme, windows, openApp, system } = useOS();

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: theme.wallpaper,
        color: theme.fg,
        transition: "color 0.3s ease",
      }}
    >
      <video
        src={darkBg.url}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
        style={{ filter: `brightness(${system.brightness / 100})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: theme.wallpaper,
          opacity: 0.5,
          mixBlendMode: "multiply",
          transition: "opacity 0.6s ease",
        }}
      />
      <div className="absolute inset-0 pointer-events-none -z-10 bg-black/20" />

      <TopBar />

      <div className="absolute top-10 right-6 flex flex-col gap-4">
        {[
          { id: "files" as const, label: "Finder", icon: FolderOpen },
          { id: "terminal" as const, label: "Terminal", icon: TerminalSquare },
          { id: "settings" as const, label: "About", icon: Info },
        ].map((i) => {
          const Icon = i.icon;
          return (
            <button
              key={i.id}
              onDoubleClick={() => openApp(i.id)}
              className="flex flex-col items-center gap-1 w-20 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 group"
            >
              <div
                className="w-14 h-14 rounded-2xl grid place-items-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                  boxShadow: `0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)`,
                }}
              >
                <Icon className="w-7 h-7 text-white drop-shadow" />
              </div>
              <div
                className="text-xs text-center leading-tight px-1"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
              >
                {i.label}
              </div>
            </button>
          );
        })}
      </div>

      {windows.map((w) => (
        <OSWindow key={w.id} win={w}>
          {renderApp(w.appId, w.props)}
        </OSWindow>
      ))}

      <Dock items={DOCK_ICONS} />
    </div>
  );
}
