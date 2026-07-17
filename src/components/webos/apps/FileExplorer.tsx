import { useState } from "react";
import {
  Home,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Folder,
  ChevronLeft,
  FileIcon,
  Inbox,
} from "lucide-react";
import { useOS } from "../OSContext";

type Node =
  | { type: "folder"; name: string; children: Node[] }
  | { type: "file"; name: string; kind: "image" | "audio" | "video" | "doc" };

const FS: Record<string, Node[]> = {
  Home: [
    { type: "folder", name: "Documents", children: [] },
    { type: "folder", name: "Images", children: [] },
    { type: "folder", name: "Music", children: [] },
    { type: "folder", name: "Videos", children: [] },
    { type: "file", name: "readme.txt", kind: "doc" },
  ],
  Documents: [
    { type: "file", name: "Resume.doc", kind: "doc" },
    { type: "file", name: "Notes.txt", kind: "doc" },
    { type: "folder", name: "Projects", children: [] },
  ],
  Images: [
    { type: "file", name: "Sunset.jpg", kind: "image" },
    { type: "file", name: "Mountains.jpg", kind: "image" },
    { type: "file", name: "Ocean.jpg", kind: "image" },
    { type: "file", name: "Forest.jpg", kind: "image" },
  ],
  Music: [
    { type: "file", name: "Chill Beats.mp3", kind: "audio" },
    { type: "file", name: "Lo-Fi Study.mp3", kind: "audio" },
    { type: "file", name: "Synthwave Dreams.mp3", kind: "audio" },
  ],
  Videos: [
    { type: "file", name: "Vacation.mp4", kind: "video" },
    { type: "file", name: "Tutorial.mp4", kind: "video" },
  ],
  Projects: [{ type: "file", name: "Idea.txt", kind: "doc" }],
};

const SIDEBAR = [
  { name: "Home", icon: Home },
  { name: "Documents", icon: FileText },
  { name: "Images", icon: ImageIcon },
  { name: "Music", icon: Music },
  { name: "Videos", icon: Video },
];

export function FileExplorer() {
  const { theme, openApp } = useOS();
  const [path, setPath] = useState<string[]>(["Home"]);
  const current = path[path.length - 1];
  const items = FS[current] || [];

  function open(node: Node) {
    if (node.type === "folder") {
      setPath([...path, node.name]);
    } else {
      if (node.kind === "image" || node.kind === "video") openApp("media", { file: node.name });
      else if (node.kind === "audio") openApp("music", { file: node.name });
      else openApp("media", { file: node.name });
    }
  }

  return (
    <div className="flex h-full">
      <div
        className="w-48 p-3 flex flex-col gap-1 text-sm"
        style={{ background: theme.glass, borderRight: `1px solid ${theme.border}` }}
      >
        <div className="text-xs uppercase opacity-50 px-2 pb-2">Favorites</div>
        {SIDEBAR.map((s) => {
          const Icon = s.icon;
          const active = current === s.name;
          return (
            <button
              key={s.name}
              onClick={() => setPath([s.name])}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors"
              style={{
                background: active ? theme.accent + "33" : "transparent",
                color: active ? theme.accent : "inherit",
              }}
            >
              <Icon className="w-4 h-4" />
              {s.name}
            </button>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="h-10 flex items-center gap-2 px-3 text-sm"
          style={{ borderBottom: `1px solid ${theme.border}`, background: theme.glass }}
        >
          <button
            disabled={path.length <= 1}
            onClick={() => setPath(path.slice(0, -1))}
            className="p-1 rounded-md disabled:opacity-30 hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 opacity-80">
            {path.map((p, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="opacity-40">/</span>}
                <span className={i === path.length - 1 ? "font-medium" : "opacity-60"}>{p}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50 gap-2">
              <Inbox className="w-16 h-16" />
              <div className="text-sm">This folder is empty</div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4">
              {items.map((n) => {
                const Icon =
                  n.type === "folder"
                    ? Folder
                    : n.kind === "image"
                      ? ImageIcon
                      : n.kind === "audio"
                        ? Music
                        : n.kind === "video"
                          ? Video
                          : FileIcon;
                return (
                  <button
                    key={n.name}
                    onDoubleClick={() => open(n)}
                    onClick={(e) => {
                      if (e.detail === 2) return;
                    }}
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <Icon
                      className="w-12 h-12 transition-transform group-hover:scale-110"
                      style={{ color: n.type === "folder" ? theme.accent : theme.accent2 }}
                    />
                    <div className="text-xs text-center break-all line-clamp-2">{n.name}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
