import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, Minus, Square } from "lucide-react";
import { useOS } from "./OSContext";
import { getDockPosition } from "./dockPositions";
import type { WindowState } from "./types";

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const MENU_H = 28; // top menu bar height
const DOCK_H = 88; // reserved dock area

export function OSWindow({ win, children }: { win: WindowState; children: ReactNode }) {
  const { theme, focusWindow, closeWindow, toggleMinimize, toggleMaximize, updateWindow, activeId } = useOS();
  const active = activeId === win.id;
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

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
          y: Math.max(MENU_H, d.oy + e.clientY - d.startY),
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

  // Fullscreen leaves room for the top menu bar so traffic-lights stay visible.
  const style: React.CSSProperties = win.maximized
    ? {
        left: 0,
        top: MENU_H,
        width: "100vw",
        height: `calc(100vh - ${MENU_H}px - ${DOCK_H}px)`,
      }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  // Compute genie transform toward the dock icon slot for this app.
  const dock = getDockPosition(win.appId);
  const centerX = (win.maximized ? window.innerWidth / 2 : win.x + win.w / 2);
  const centerY = (win.maximized ? window.innerHeight / 2 : win.y + win.h / 2);
  const dx = dock.cx - centerX;
  const dy = dock.cy - centerY;
  const genie = `translate(${dx}px, ${dy}px) scale(0.05)`;

  const hidden = minimized || closing || !mounted;
  const transform = hidden ? genie : "translate(0,0) scale(1)";
  const opacity = hidden ? 0 : 1;

  function handleClose() {
    setClosing(true);
    window.setTimeout(() => closeWindow(win.id), 320);
  }

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
        transformOrigin: "center center",
        pointerEvents: hidden ? "none" : "auto",
        transition: dragging
          ? "none"
          : `transform 0.42s ${SPRING}, opacity 0.28s ease, width 0.32s ${SPRING}, height 0.32s ${SPRING}, left 0.32s ${SPRING}, top 0.32s ${SPRING}, box-shadow 0.2s`,
      }}
    >
      <div
        onPointerDown={(e) => {
          if (win.maximized) return;
          dragRef.current = { startX: e.clientX, startY: e.clientY, ox: win.x, oy: win.y };
          setDragging(true);
        }}
        onDoubleClick={() => toggleMaximize(win.id)}
        className="h-10 flex items-center px-3 gap-2 cursor-grab active:cursor-grabbing shrink-0"
        style={{ borderBottom: `1px solid ${theme.border}`, background: theme.glass }}
      >
        <div className="flex items-center gap-2 pl-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleClose}
            className="w-3 h-3 rounded-full grid place-items-center group transition-transform hover:scale-110"
            style={{
              background: "linear-gradient(180deg, #ff6058, #d64541)",
              boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.3)",
            }}
            aria-label="Close"
          >
            <X className="w-2 h-2 opacity-0 group-hover:opacity-90" style={{ color: "#4c0000" }} strokeWidth={3} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMinimize(win.id)}
            className="w-3 h-3 rounded-full grid place-items-center group transition-transform hover:scale-110"
            style={{
              background: "linear-gradient(180deg, #ffbd2e, #dea123)",
              boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.3)",
            }}
            aria-label="Minimize"
          >
            <Minus className="w-2 h-2 opacity-0 group-hover:opacity-90" style={{ color: "#5c3800" }} strokeWidth={3} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMaximize(win.id)}
            className="w-3 h-3 rounded-full grid place-items-center group transition-transform hover:scale-110"
            style={{
              background: "linear-gradient(180deg, #28c941, #1aa334)",
              boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.3)",
            }}
            aria-label="Maximize"
          >
            <Square className="w-1.5 h-1.5 opacity-0 group-hover:opacity-90" style={{ color: "#003d0a" }} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 text-center text-[13px] font-semibold tracking-tight opacity-90 truncate px-2">
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
