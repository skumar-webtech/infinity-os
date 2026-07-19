import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  FileIcon,
  Upload,
  Trash2,
  Star,
  Home,
  Download,
  Camera,
} from "lucide-react";
import { useOS } from "../OSContext";
import {
  formatBytes,
  fromDisplayPath,
  getFolder,
  HOME_PATH,
  kindFromName,
  makeFile,
  resolvePath,
  toDisplayPath,
  type FSNode,
} from "../vfs";

const SIDEBAR: { label: string; path: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Saurabh", path: HOME_PATH, icon: Home },
  { label: "Desktop", path: `${HOME_PATH}/Desktop`, icon: Star },
  { label: "Documents", path: `${HOME_PATH}/Documents`, icon: FileText },
  { label: "Downloads", path: `${HOME_PATH}/Downloads`, icon: Download },
  { label: "Pictures", path: `${HOME_PATH}/Pictures`, icon: Camera },
  { label: "Music", path: `${HOME_PATH}/Music`, icon: Music },
  { label: "Videos", path: `${HOME_PATH}/Videos`, icon: Video },
];

function iconFor(node: FSNode) {
  if (node.type === "folder") return Folder;
  const k = kindFromName(node.name);
  if (k === "image") return ImageIcon;
  if (k === "audio") return Music;
  if (k === "video") return Video;
  if (k === "text") return FileText;
  return FileIcon;
}

export function FileExplorer() {
  const { theme, fs, addFsNode, removeFsNode, openApp } = useOS();
  const [stack, setStack] = useState<string[]>([HOME_PATH]);
  const [forward, setForward] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = stack[stack.length - 1];
  const folder = getFolder(fs, current);
  const items = folder ? Object.values(folder.children) : [];

  const [pathInput, setPathInput] = useState(toDisplayPath(current));
  useEffect(() => setPathInput(toDisplayPath(current)), [current]);


  function navigate(path: string) {
    setStack((s) => [...s, path]);
    setForward([]);
    setSelected(null);
  }
  function back() {
    if (stack.length <= 1) return;
    setForward((f) => [stack[stack.length - 1], ...f]);
    setStack((s) => s.slice(0, -1));
    setSelected(null);
  }
  function fwd() {
    if (!forward.length) return;
    setStack((s) => [...s, forward[0]]);
    setForward((f) => f.slice(1));
    setSelected(null);
  }

  function open(node: FSNode) {
    if (node.type === "folder") {
      navigate(resolvePath(current, node.name));
      return;
    }
    const k = kindFromName(node.name);
    const path = resolvePath(current, node.name);
    if (k === "image" || k === "video" || k === "audio") {
      openApp("preview", { path }, node.name);
    } else if (k === "text" || k === "other") {
      openApp("textedit", { path }, node.name);
    }
  }

  async function importFiles(files: FileList | File[]) {
    const list = Array.from(files);
    for (const file of list) {
      const kind = kindFromName(file.name);
      let content: string;
      let mime = file.type || "application/octet-stream";
      if (kind === "text" || (mime.startsWith("text/") && file.size < 2_000_000)) {
        content = await file.text();
      } else {
        content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.readAsDataURL(file);
        });
      }
      addFsNode(current, makeFile(file.name, content, mime));
    }
  }

  return (
    <div className="flex h-full">
      <div
        className="w-52 p-3 flex flex-col gap-0.5 text-sm"
        style={{ background: theme.glass, borderRight: `1px solid ${theme.border}` }}
      >
        <div className="text-[10px] uppercase tracking-wider opacity-50 px-2 pb-2 pt-1">
          Favorites
        </div>
        {SIDEBAR.map((s) => {
          const Icon = s.icon;
          const active = current === s.path;
          return (
            <button
              key={s.path}
              onClick={() => {
                setStack([s.path]);
                setForward([]);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors text-[13px]"
              style={{
                background: active ? theme.accent + "33" : "transparent",
                color: active ? theme.accent : "inherit",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="h-11 flex items-center gap-2 px-3 text-sm"
          style={{ borderBottom: `1px solid ${theme.border}`, background: theme.glass }}
        >
          <button
            disabled={stack.length <= 1}
            onClick={back}
            className="p-1 rounded-md disabled:opacity-30 hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={!forward.length}
            onClick={fwd}
            className="p-1 rounded-md disabled:opacity-30 hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 opacity-80 text-xs">
            {current.split("/").filter(Boolean).map((p, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className={i === arr.length - 1 ? "font-medium" : "opacity-60"}>{p}</span>
                {i < arr.length - 1 && <span className="opacity-40">›</span>}
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            {selected && (
              <button
                onClick={() => {
                  removeFsNode(current, selected);
                  setSelected(null);
                }}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-xs"
              title="Import files"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) importFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) importFiles(e.dataTransfer.files);
          }}
          className="flex-1 overflow-auto p-6 relative"
          style={{
            background: dragOver ? `${theme.accent}15` : "transparent",
            transition: "background 0.2s",
          }}
        >
          {dragOver && (
            <div
              className="absolute inset-3 rounded-xl grid place-items-center pointer-events-none text-sm"
              style={{ border: `2px dashed ${theme.accent}`, color: theme.accent }}
            >
              Drop files to import into {current}
            </div>
          )}
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50 gap-3">
              <Upload className="w-12 h-12" />
              <div className="text-sm">Empty folder — drag files here to import</div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
              {items.map((n) => {
                const Icon = iconFor(n);
                const isSel = selected === n.name;
                const isImg = n.type === "file" && kindFromName(n.name) === "image";
                return (
                  <button
                    key={n.name}
                    onDoubleClick={() => open(n)}
                    onClick={() => setSelected(n.name)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors group"
                    style={{ background: isSel ? theme.accent + "22" : "transparent" }}
                  >
                    <div
                      className="w-16 h-16 rounded-lg grid place-items-center transition-transform group-hover:scale-105"
                      style={{
                        background:
                          isImg && n.type === "file"
                            ? `center / cover no-repeat url(${n.content})`
                            : "transparent",
                      }}
                    >
                      {!isImg && (
                        <Icon
                          className="w-12 h-12"
                          style={{
                            color: n.type === "folder" ? theme.accent : theme.accent2,
                          }}
                        />
                      )}
                    </div>
                    <div className="text-[11px] text-center break-all line-clamp-2 max-w-[92px]">
                      {n.name}
                    </div>
                    {n.type === "file" && (
                      <div className="text-[10px] opacity-50">{formatBytes(n.size)}</div>
                    )}
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
