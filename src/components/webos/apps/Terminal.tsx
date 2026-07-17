import { useEffect, useRef, useState } from "react";
import { useOS } from "../OSContext";
import type { ThemeId } from "../types";

const MOCK_FS: Record<string, string> = {
  "readme.txt": "Welcome to Infinity OS!\nA gorgeous glassmorphic Web OS simulator.\nTry: help, neofetch, ls, cat readme.txt, theme cyberpunk",
  "notes.md": "# Notes\n- Ship it\n- Add more apps\n- Enjoy the vibes",
  "secret.txt": "The cake is a lie. 🍰",
};

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
  const { theme, setTheme } = useOS();
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "Infinity OS Terminal v1.0 — type 'help' to get started." },
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

  function run(raw: string) {
    const cmd = raw.trim();
    push({ kind: "in", text: `guest@infinity ~ $ ${cmd}` });
    if (!cmd) return;
    const [name, ...args] = cmd.split(/\s+/);
    switch (name) {
      case "help":
        push({
          kind: "out",
          text:
            "Available commands:\n" +
            "  help              Show this help\n" +
            "  clear             Clear the screen\n" +
            "  neofetch          Show system info with logo\n" +
            "  ls                List files\n" +
            "  cat <file>        Show file contents\n" +
            "  theme <name>      Switch theme (dark|light|cyberpunk|pastel)\n" +
            "  echo <text>       Print text\n" +
            "  whoami            Print current user\n" +
            "  date              Show current date/time",
        });
        break;
      case "clear":
        setLines([]);
        break;
      case "ls":
        push({ kind: "out", text: Object.keys(MOCK_FS).join("   ") });
        break;
      case "cat": {
        const f = args[0];
        if (!f) push({ kind: "err", text: "cat: missing file operand" });
        else if (MOCK_FS[f]) push({ kind: "out", text: MOCK_FS[f] });
        else push({ kind: "err", text: `cat: ${f}: No such file or directory` });
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
              `OS:       Infinity OS 1.0 (Web Edition)\n` +
              `Kernel:   Nebula 6.2.0-infinity\n` +
              `Uptime:   ${fmtUptime()}\n` +
              `Shell:    infysh 1.0\n` +
              `Resolution: ${window.innerWidth}x${window.innerHeight}\n` +
              `DE:       Infinity Desktop\n` +
              `Theme:    ${theme.name}\n` +
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
      style={{ background: "rgba(5,8,15,0.85)", color: "#e2e8f0" }}
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
          <span style={{ color: "#94a3b8" }}>~</span>
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
