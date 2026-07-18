import { useEffect, useRef, useState } from "react";
import { useOS } from "../OSContext";
import { getNode, kindFromName, makeFile, type FSFile } from "../vfs";

export function TextEdit(props: { path?: string }) {
  const { theme, fs, writeFsFile, addFsNode } = useOS();
  const initialPath = props.path ?? "/Users/guest/Desktop/untitled.txt";
  const [path, setPath] = useState(initialPath);
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (loadedFor.current === path) return;
    const node = getNode(fs, path);
    if (node && node.type === "file") {
      setContent(node.content);
    } else {
      setContent("");
    }
    loadedFor.current = path;
    setDirty(false);
  }, [path, fs]);

  function save() {
    const node = getNode(fs, path);
    if (node && node.type === "file") {
      writeFsFile(path, content);
    } else {
      // Create file in Desktop
      const parts = path.split("/").filter(Boolean);
      const name = parts.pop() ?? "untitled.txt";
      const parent = "/" + parts.join("/");
      addFsNode(parent, makeFile(name, content, "text/plain"));
    }
    setDirty(false);
  }

  const name = path.split("/").pop() ?? "untitled.txt";

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
        style={{
          background: "transparent",
          color: theme.fg,
          caretColor: theme.accent,
        }}
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
      <div className="flex-1 overflow-auto grid place-items-center p-6">
        {kind === "image" ? (
          <img
            src={node.content}
            alt={node.name}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        ) : kind === "audio" ? (
          <audio src={node.content} controls className="w-full max-w-md" />
        ) : kind === "video" ? (
          <video src={node.content} controls className="max-w-full max-h-full rounded-lg" />
        ) : (
          <pre className="text-xs whitespace-pre-wrap w-full max-w-3xl font-mono opacity-90">
            {node.content}
          </pre>
        )}
      </div>
    </div>
  );
}
