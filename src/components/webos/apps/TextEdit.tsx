import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX, ZoomIn, ZoomOut } from "lucide-react";
import { useOS } from "../OSContext";
import { getNode, kindFromName, makeFile, type FSFile } from "../vfs";

export function TextEdit(props: { path?: string }) {
  const { theme, fs, writeFsFile, addFsNode } = useOS();
  const initialPath = props.path ?? "/C:/Users/Saurabh/Desktop/untitled.txt";
  const [path, setPath] = useState(initialPath);
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (loadedFor.current === path) return;
    const node = getNode(fs, path);
    if (node && node.type === "file") setContent(node.content);
    else setContent("");
    loadedFor.current = path;
    setDirty(false);
  }, [path, fs]);

  function save() {
    const node = getNode(fs, path);
    if (node && node.type === "file") {
      writeFsFile(path, content);
    } else {
      const parts = path.split("/").filter(Boolean);
      const name = parts.pop() ?? "untitled.txt";
      const parent = "/" + parts.join("/");
      addFsNode(parent, makeFile(name, content, "text/plain"));
    }
    setDirty(false);
  }

  const name = path.split("/").pop() ?? "untitled.txt";
  void setPath;

  return (
    <div className="flex flex-col h-full" style={{ color: theme.fg }}>
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ borderBottom: `1px solid ${theme.border}`, background: theme.glass }}
      >
        <div className="opacity-70 truncate">{path}</div>
        <div className="flex items-center gap-2">
          {dirty && <span className="opacity-60">• unsaved</span>}
          <button
            onClick={save}
            className="px-3 py-1 rounded-md text-white text-xs font-medium"
            style={{ background: theme.accent }}
          >
            Save
          </button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setDirty(true);
        }}
        spellCheck={false}
        className="flex-1 w-full resize-none outline-none p-6 font-mono text-sm leading-relaxed"
        style={{ background: "transparent", color: theme.fg, caretColor: theme.accent }}
        placeholder={`Editing ${name}…`}
      />
    </div>
  );
}

export function Preview(props: { path?: string }) {
  const { theme, fs } = useOS();
  const path = props.path;
  const node = path ? (getNode(fs, path) as FSFile | null) : null;

  if (!node || node.type !== "file") {
    return (
      <div className="h-full grid place-items-center text-sm opacity-60" style={{ color: theme.fg }}>
        No file selected.
      </div>
    );
  }

  const kind = kindFromName(node.name);
  return (
    <div className="h-full flex flex-col" style={{ color: theme.fg }}>
      <div
        className="px-4 py-2 text-xs flex items-center justify-between"
        style={{ borderBottom: `1px solid ${theme.border}`, background: theme.glass }}
      >
        <div className="truncate">{path}</div>
        <div className="opacity-60">
          {node.mime} · {node.size.toLocaleString()} B
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {kind === "image" ? (
          <ImageViewer file={node} />
        ) : kind === "video" ? (
          <VideoPlayer file={node} />
        ) : kind === "audio" ? (
          <div className="h-full grid place-items-center p-6">
            <audio src={node.content} controls className="w-full max-w-md" />
          </div>
        ) : kind === "pdf" ? (
          <PdfViewer file={node} />
        ) : (
          <div className="h-full overflow-auto p-6 grid place-items-start">
            <pre className="text-xs whitespace-pre-wrap w-full max-w-3xl font-mono opacity-90">
              {node.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageViewer({ file }: { file: FSFile }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="h-full flex flex-col">
      <ZoomBar zoom={zoom} setZoom={setZoom} />
      <div className="flex-1 overflow-auto grid place-items-center p-6">
        <img
          src={file.content}
          alt={file.name}
          style={{ transform: `scale(${zoom})`, transition: "transform 0.15s" }}
          className="max-w-full max-h-full rounded-lg shadow-2xl origin-center"
        />
      </div>
    </div>
  );
}

function ZoomBar({ zoom, setZoom }: { zoom: number; setZoom: (n: number) => void }) {
  const { theme } = useOS();
  return (
    <div
      className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs"
      style={{ borderBottom: `1px solid ${theme.border}`, background: theme.glass }}
    >
      <button
        onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
        className="p-1 rounded hover:bg-white/10"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      <span className="w-12 text-center opacity-70">{Math.round(zoom * 100)}%</span>
      <button
        onClick={() => setZoom(Math.min(4, zoom + 0.25))}
        className="p-1 rounded hover:bg-white/10"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function PdfViewer({ file }: { file: FSFile }) {
  const { theme } = useOS();
  const [zoom, setZoom] = useState(1);

  // Split simulated PDF content into pages by blank line, or fallback chunks.
  const pages = useMemo(() => {
    const c = file.content ?? "";
    if (c.startsWith("data:application/pdf")) return [c]; // real PDF data URL
    const raw = c.split(/\n\s*\n/).filter(Boolean);
    if (raw.length > 0) return raw;
    return [c || "(empty document)"];
  }, [file.content]);

  const isDataPdf = pages[0]?.startsWith("data:application/pdf");

  if (isDataPdf) {
    return (
      <div className="h-full flex flex-col">
        <ZoomBar zoom={zoom} setZoom={setZoom} />
        <div className="flex-1 overflow-auto bg-black/30">
          <iframe
            src={file.content}
            title={file.name}
            className="w-full h-full border-0"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ZoomBar zoom={zoom} setZoom={setZoom} />
      <div className="flex-1 overflow-auto p-6" style={{ background: "rgba(0,0,0,0.25)" }}>
        <div
          className="mx-auto flex flex-col gap-4"
          style={{
            width: 640 * zoom,
            transformOrigin: "top center",
            transition: "width 0.15s",
          }}
        >
          {pages.map((p, i) => (
            <div
              key={i}
              className="rounded-md p-10 shadow-2xl"
              style={{
                background: "#faf9f6",
                color: "#111",
                minHeight: 800 * zoom,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="text-[10px] uppercase tracking-widest opacity-40 mb-4">
                Page {i + 1} of {pages.length}
              </div>
              <pre className="whitespace-pre-wrap font-serif text-[15px] leading-7">{p}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ file }: { file: FSFile }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => setT(v.currentTime);
    const onDur = () => setDur(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onDur);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onDur);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  function fmt(s: number) {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "#000" }}>
      <div className="flex-1 grid place-items-center overflow-hidden">
        <video
          ref={ref}
          src={file.content}
          className="max-w-full max-h-full"
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            v.paused ? v.play() : v.pause();
          }}
        />
      </div>
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(15,15,20,0.9)", color: "#eaeaea", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            v.paused ? v.play() : v.pause();
          }}
          className="w-9 h-9 rounded-full grid place-items-center bg-white/10 hover:bg-white/20 transition-colors"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
        </button>
        <span className="text-[11px] tabular-nums opacity-70 w-10 text-right">{fmt(t)}</span>
        <input
          type="range"
          min={0}
          max={dur || 0}
          step={0.1}
          value={t}
          onChange={(e) => {
            const v = ref.current;
            if (!v) return;
            v.currentTime = +e.target.value;
          }}
          className="flex-1"
          style={{ accentColor: "#5eaaff" }}
        />
        <span className="text-[11px] tabular-nums opacity-70 w-10">{fmt(dur)}</span>
        <button
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            v.muted = !v.muted;
            setMuted(v.muted);
          }}
          className="p-1.5 rounded hover:bg-white/10"
        >
          {muted || vol === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={vol}
          onChange={(e) => {
            const v = ref.current;
            const nv = +e.target.value;
            setVol(nv);
            if (v) v.volume = nv;
          }}
          className="w-20"
          style={{ accentColor: "#5eaaff" }}
        />
      </div>
    </div>
  );
}
