import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, Minus, Square } from "lucide-react";
import { useOS } from "./OSContext";
import type { WindowState } from "./types";

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export function OSWindow({ win, children }: { win: WindowState; children: ReactNode }) {
  const { theme, focusWindow, closeWindow, toggleMinimize, toggleMaximize, updateWindow, activeId } = useOS();
  const active = activeId === win.id;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; ow: number; oh: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (dragRef.current) {
        const d = dragRef.current;
        updateWindow(win.id, {
          x: Math.max(0, d.ox + e.clientX - d.startX),
          y: Math.max(0, d.oy + e.clientY - d.startY),
        });
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        updateWindow(win.id, {
          w: Math.max(360, r.ow + e.clientX - r.startX),
          h: Math.max(240, r.oh + e.clientY - r.startY),
        });
      }
    }
    function onUp() {
      dragRef.current = null;
      resizeRef.current = null;
      setDragging(false);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [win.id, updateWindow]);

  const minimized = win.minimized;

  const style: React.CSSProperties = win.maximized
    ? { left: 0, top: 0, width: "100vw", height: "calc(100vh - 96px)" }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  const transform = minimized
    ? "scale(0.15) translateY(60vh)"
    : mounted
    ? "scale(1) translateY(0)"
    : "scale(0.85) translateY(20px)";
  const opacity = minimized ? 0 : mounted ? 1 : 0;

  return (
    <div
      onPointerDown={() => focusWindow(win.id)}
      className="absolute rounded-2xl overflow-hidden flex flex-col select-none"
      style={{
        ...style,
        zIndex: win.z,
        background: theme.glassStrong,
        backdropFilter: "blur(24px) saturate(160%)",
        border: `1px solid ${theme.border}`,
        boxShadow: active ? theme.shadow : "0 8px 24px rgba(0,0,0,0.25)",
        color: theme.fg,
        transform,
        opacity,
        transformOrigin: "center bottom",
        pointerEvents: minimized ? "none" : "auto",
        transition: dragging
          ? "none"
          : `transform 0.45s ${SPRING}, opacity 0.3s ease, width 0.35s ${SPRING}, height 0.35s ${SPRING}, left 0.35s ${SPRING}, top 0.35s ${SPRING}, box-shadow 0.2s`,
      }}
    >

      <div
        onPointerDown={(e) => {
          if (win.maximized) return;
          dragRef.current = { startX: e.clientX, startY: e.clientY, ox: win.x, oy: win.y };
          setDragging(true);
        }}
        onDoubleClick={() => toggleMaximize(win.id)}
        className="h-10 flex items-center px-3 gap-2 cursor-grab active:cursor-grabbing"
        style={{ borderBottom: `1px solid ${theme.border}`, background: theme.glass }}
      >
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => closeWindow(win.id)}
            className="w-3.5 h-3.5 rounded-full grid place-items-center group"
            style={{ background: "#ef4444" }}
            aria-label="Close"
          >
            <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-black/70" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMinimize(win.id)}
            className="w-3.5 h-3.5 rounded-full grid place-items-center group"
            style={{ background: "#f59e0b" }}
            aria-label="Minimize"
          >
            <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-black/70" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMaximize(win.id)}
            className="w-3.5 h-3.5 rounded-full grid place-items-center group"
            style={{ background: "#10b981" }}
            aria-label="Maximize"
          >
            <Square className="w-2 h-2 opacity-0 group-hover:opacity-100 text-black/70" />
          </button>
        </div>
        <div className="flex-1 text-center text-xs font-medium tracking-wide opacity-80">
          {win.title}
        </div>
        <div className="w-16" />
      </div>
      <div className="flex-1 overflow-hidden relative">{children}</div>
      {!win.maximized && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            resizeRef.current = { startX: e.clientX, startY: e.clientY, ow: win.w, oh: win.h };
          }}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${theme.border} 50%, ${theme.border} 60%, transparent 60%, transparent 75%, ${theme.border} 75%, ${theme.border} 85%, transparent 85%)`,
          }}
        />
      )}
    </div>
  );
}
