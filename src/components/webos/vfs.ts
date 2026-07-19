// Virtual File System with localStorage persistence.
// Internal paths use POSIX form with a Windows-style drive prefix so we can
// present them as `file:///C:/Users/Saurabh/...` in the UI.
export type FSFile = {
  type: "file";
  name: string;
  mime: string;
  content: string; // text or data URL for binary
  size: number;
  modified: number;
};

export type FSFolder = {
  type: "folder";
  name: string;
  children: Record<string, FSNode>;
};

export type FSNode = FSFile | FSFolder;

export const VFS_KEY = "infinity-os.vfs.v3";
export const HOME_PATH = "/C:/Users/Saurabh";

export function makeFolder(name: string, children: Record<string, FSNode> = {}): FSFolder {
  return { type: "folder", name, children };
}
export function makeFile(name: string, content: string, mime = "text/plain"): FSFile {
  return {
    type: "file",
    name,
    mime,
    content,
    size: content.length,
    modified: Date.now(),
  };
}

export function defaultFS(): FSFolder {
  return makeFolder("/", {
    "C:": makeFolder("C:", {
      Users: makeFolder("Users", {
        Saurabh: makeFolder("Saurabh", {
          Desktop: makeFolder("Desktop", {
            "welcome.txt": makeFile(
              "welcome.txt",
              "Welcome to Infinity OS!\n\nDrag files into Finder to import them.\nDouble-click a .txt to open TextEdit, an image or PDF to open Preview,\nor an .mp4 to open the Media Player.\n\nTry the Terminal — it speaks the same file system.",
            ),
            "sample.pdf": makeFile(
              "sample.pdf",
              "Infinity OS — Simulated PDF\n\nPage 1\nThis is a rendered PDF preview inside Infinity OS. Scroll to see more pages.\n\nPage 2\nSupport for images, PDFs, videos and plain text is bundled with the Preview app.\n\nPage 3\nThat's all folks — swap this with a real PDF via drag & drop.",
              "application/pdf",
            ),
          }),
          Documents: makeFolder("Documents", {
            "readme.md": makeFile(
              "readme.md",
              "# Infinity OS\n\n- Virtual file system rooted at C:\\Users\\Saurabh\n- TextEdit + Preview (PDF, image, video)\n- Terminal with cd/ls/cat/mkdir/pwd",
              "text/markdown",
            ),
            "notes.txt": makeFile("notes.txt", "Ship it.\nAdd more apps.\nEnjoy the vibes."),
          }),
          Downloads: makeFolder("Downloads", {}),
          Music: makeFolder("Music", {}),
          Videos: makeFolder("Videos", {}),
          Pictures: makeFolder("Pictures", {}),
        }),
      }),
      "Program Files": makeFolder("Program Files", {}),
      Windows: makeFolder("Windows", {}),
    }),
  });
}

export function loadFS(): FSFolder {
  if (typeof window === "undefined") return defaultFS();
  try {
    const raw = localStorage.getItem(VFS_KEY);
    if (!raw) return defaultFS();
    const parsed = JSON.parse(raw) as FSFolder;
    if (parsed && parsed.type === "folder") return parsed;
  } catch {
    /* ignore */
  }
  return defaultFS();
}

export function saveFS(root: FSFolder) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VFS_KEY, JSON.stringify(root));
  } catch {
    /* ignore quota */
  }
}

export function splitPath(p: string): string[] {
  return p.split("/").filter(Boolean);
}
export function joinPath(parts: string[]): string {
  return "/" + parts.join("/");
}

export function getNode(root: FSFolder, path: string): FSNode | null {
  const parts = splitPath(path);
  let cur: FSNode = root;
  for (const seg of parts) {
    if (cur.type !== "folder") return null;
    const next: FSNode | undefined = cur.children[seg];
    if (!next) return null;
    cur = next;
  }
  return cur;
}

export function getFolder(root: FSFolder, path: string): FSFolder | null {
  const n = getNode(root, path);
  return n && n.type === "folder" ? n : null;
}

export function resolvePath(cwd: string, target: string): string {
  if (!target) return cwd;
  // Accept file:// URLs and Windows-style paths in commands too.
  let t = target.replace(/^file:\/\//, "");
  if (/^[a-zA-Z]:[\\/]/.test(t)) {
    t = "/" + t.replace(/\\/g, "/");
  }
  const startParts = t.startsWith("/") ? [] : splitPath(cwd);
  const parts = [...startParts];
  for (const seg of splitPath(t)) {
    if (seg === "." || seg === "") continue;
    if (seg === "..") parts.pop();
    else if (seg === "~") {
      parts.length = 0;
      parts.push(...splitPath(HOME_PATH));
    } else parts.push(seg);
  }
  return joinPath(parts);
}

/** `/C:/Users/Saurabh/Documents` → `file:///C:/Users/Saurabh/Documents/` */
export function toDisplayPath(p: string): string {
  const clean = p === "/" ? "" : p.replace(/\/+$/, "");
  return `file://${clean}/`;
}
/** `file:///C:/Users/Saurabh/Documents/` → `/C:/Users/Saurabh/Documents` */
export function fromDisplayPath(s: string): string {
  let p = s.trim().replace(/^file:\/\//i, "");
  p = p.replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(p)) p = "/" + p;
  p = p.replace(/\/+$/, "");
  return p || "/";
}

function clone(root: FSFolder): FSFolder {
  return JSON.parse(JSON.stringify(root)) as FSFolder;
}

export function addChild(root: FSFolder, parentPath: string, node: FSNode): FSFolder {
  const next = clone(root);
  const parent = getFolder(next, parentPath);
  if (!parent) return root;
  parent.children[node.name] = node;
  return next;
}

export function removeChild(root: FSFolder, parentPath: string, name: string): FSFolder {
  const next = clone(root);
  const parent = getFolder(next, parentPath);
  if (!parent) return root;
  delete parent.children[name];
  return next;
}

export function updateFileContent(
  root: FSFolder,
  path: string,
  content: string,
): FSFolder {
  const next = clone(root);
  const node = getNode(next, path);
  if (!node || node.type !== "file") return root;
  node.content = content;
  node.size = content.length;
  node.modified = Date.now();
  return next;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function totalSize(node: FSNode): number {
  if (node.type === "file") return node.size;
  return Object.values(node.children).reduce((s, c) => s + totalSize(c), 0);
}

export function kindFromName(name: string): "image" | "audio" | "video" | "text" | "pdf" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "audio";
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["txt", "md", "json", "js", "ts", "tsx", "css", "html", "log", "csv"].includes(ext))
    return "text";
  return "other";
}
