import { useEffect, useRef, useState } from "react";
import { useOS } from "../OSContext";
import type { ThemeId } from "../types";
import {
  getFolder,
  getNode,
  makeFolder,
  resolvePath,
} from "../vfs";

const NEOFETCH_ASCII = `      ██╗███╗   ██╗███████╗██╗███╗   ██╗██╗████████╗██╗   ██╗
      ██║████╗  ██║██╔════╝██║████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝
      ██║██╔██╗ ██║█████╗  ██║██╔██╗ ██║██║   ██║    ╚████╔╝
      ██║██║╚██╗██║██╔══╝  ██║██║╚██╗██║██║   ██║     ╚██╔╝
      ██║██║ ╚████║██║     ██║██║ ╚████║██║   ██║      ██║
      ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝`;

interface Line {
  kind: "in" | "out" | "err" | "ascii";
  text: string;
}

const BOOT_TIME = Date.now();
function fmtUptime() {
  const s = Math.floor((Date.now() - BOOT_TIME) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ${s % 60}s`;
}

export function TerminalApp() {
  const { theme, setTheme, fs, addFsNode } = useOS();
  const [cwd, setCwd] = useState("/Users/guest");
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "Infinity OS Terminal v2.0 — type 'help' to get started." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function push(...ls: Line[]) {
    setLines((prev) => [...prev, ...ls]);
  }

  function prompt() {
    return `guest@infinity ${cwd} $`;
  }

  function run(raw: string) {
    const cmd = raw.trim();
    push({ kind: "in", text: `${prompt()} ${cmd}` });
    if (!cmd) return;
    const [name, ...args] = cmd.split(/\s+/);
    switch (name) {
      case "help":
        push({
          kind: "out",
          text:
            "Commands:\n" +
            "  help                Show this help\n" +
            "  clear               Clear the screen\n" +
            "  neofetch            System info with logo\n" +
            "  pwd                 Print working directory\n" +
            "  ls [path]           List directory\n" +
            "  cd <path>           Change directory\n" +
            "  cat <file>          Print file contents\n" +
            "  mkdir <name>        Create folder\n" +
            "  touch <name>        Create empty file\n" +
            "  theme <name>        Switch theme (dark|light|cyberpunk|pastel)\n" +
            "  echo <text>         Print text\n" +
            "  whoami | date       Info",
        });
        break;
      case "clear":
        setLines([]);
        break;
      case "pwd":
        push({ kind: "out", text: cwd });
        break;
      case "ls": {
        const target = args[0] ? resolvePath(cwd, args[0]) : cwd;
        const folder = getFolder(fs, target);
        if (!folder) {
          push({ kind: "err", text: `ls: ${target}: No such directory` });
          break;
        }
        const entries = Object.values(folder.children)
          .map((c) => (c.type === "folder" ? `\x1b[b${c.name}/` : c.name))
          .join("   ");
        push({ kind: "out", text: entries || "(empty)" });
        break;
      }
      case "cd": {
        if (!args[0]) {
          setCwd("/Users/guest");
          break;
        }
        const target = resolvePath(cwd, args[0]);
        const folder = getFolder(fs, target);
        if (!folder) push({ kind: "err", text: `cd: ${target}: Not a directory` });
        else setCwd(target);
        break;
      }
      case "cat": {
        if (!args[0]) {
          push({ kind: "err", text: "cat: missing operand" });
          break;
        }
        const target = resolvePath(cwd, args[0]);
        const node = getNode(fs, target);
        if (!node) push({ kind: "err", text: `cat: ${target}: No such file` });
        else if (node.type !== "file") push({ kind: "err", text: `cat: ${target}: Is a directory` });
        else if (node.mime.startsWith("text/") || node.mime === "application/octet-stream")
          push({ kind: "out", text: node.content });
        else push({ kind: "out", text: `[binary file: ${node.mime}]` });
        break;
      }
      case "mkdir": {
        if (!args[0]) {
          push({ kind: "err", text: "mkdir: missing operand" });
          break;
        }
        addFsNode(cwd, makeFolder(args[0]));
        break;
      }
      case "touch": {
        if (!args[0]) {
          push({ kind: "err", text: "touch: missing operand" });
          break;
        }
        addFsNode(cwd, {
          type: "file",
          name: args[0],
          mime: "text/plain",
          content: "",
          size: 0,
          modified: Date.now(),
        });
        break;
      }
      case "theme": {
        const t = args[0] as ThemeId;
        if (!["dark", "light", "cyberpunk", "pastel"].includes(t)) {
          push({ kind: "err", text: "Usage: theme <dark|light|cyberpunk|pastel>" });
        } else {
          setTheme(t);
          push({ kind: "out", text: `Theme switched to ${t}.` });
        }
        break;
      }
      case "echo":
        push({ kind: "out", text: args.join(" ") });
        break;
      case "whoami":
        push({ kind: "out", text: "guest" });
        break;
      case "date":
        push({ kind: "out", text: new Date().toString() });
        break;
      case "neofetch":
        push(
          { kind: "ascii", text: NEOFETCH_ASCII },
          {
            kind: "out",
            text:
              `\nguest@infinity\n` +
              `--------------\n` +
              `OS:       Infinity OS 2.0 (Web Edition)\n` +
              `Kernel:   Nebula 6.2.0-infinity\n` +
              `Uptime:   ${fmtUptime()}\n` +
              `Shell:    infysh 2.0\n` +
              `Resolution: ${window.innerWidth}x${window.innerHeight}\n` +
              `DE:       Infinity Desktop\n` +
              `Theme:    ${theme.name}\n` +
              `CWD:      ${cwd}\n` +
              `CPU:      Quantum Core i∞ @ 8.88GHz\n` +
              `Memory:   4096MiB / 16384MiB`,
          },
        );
        break;
      default:
        push({ kind: "err", text: `command not found: ${name}. Try 'help'.` });
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const val = input;
      setHistory((h) => [...h, val].filter(Boolean));
      setHIdx(-1);
      setInput("");
      run(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const ni = hIdx === -1 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(ni);
      setInput(history[ni] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx === -1) return;
      const ni = hIdx + 1;
      if (ni >= history.length) {
        setHIdx(-1);
        setInput("");
      } else {
        setHIdx(ni);
        setInput(history[ni]);
      }
    }
  }

  const green = "#4ade80";
  const cyan = "#22d3ee";

  return (
    <div
      className="h-full w-full flex flex-col font-mono text-[13px]"
      style={{ background: "rgba(5,8,15,0.9)", color: "#e2e8f0" }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 leading-relaxed">
        {lines.map((l, i) => (
          <pre
            key={i}
            className="whitespace-pre-wrap font-mono"
            style={{
              color:
                l.kind === "err"
                  ? "#f87171"
                  : l.kind === "in"
                  ? cyan
                  : l.kind === "ascii"
                  ? theme.accent
                  : "#e2e8f0",
            }}
          >
            {l.text}
          </pre>
        ))}
        <div className="flex items-center gap-2">
          <span style={{ color: green }}>guest@infinity</span>
          <span style={{ color: "#94a3b8" }}>{cwd}</span>
          <span style={{ color: cyan }}>$</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            className="flex-1 bg-transparent outline-none border-0 caret-transparent"
            style={{ color: "#e2e8f0" }}
          />
          <span
            className="inline-block w-2 h-4 -ml-2 pointer-events-none"
            style={{ background: green, animation: "infy-blink 1s steps(2) infinite" }}
          />
        </div>
      </div>
      <style>{`@keyframes infy-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>
    </div>
  );
}
