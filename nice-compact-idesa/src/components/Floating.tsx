import { useEffect, type ReactNode, type RefObject } from "react";
import { placeAnchored, useSize, type Align, type Box, type Side } from "../lib/geometry";
import { cx } from "./ui";

/**
 * Closes a floating layer on Escape or a press outside every ref.
 * Elements marked data-keep-open (the buttons that open it) don't count as outside.
 */
export function useDismiss(open: boolean, onClose: () => void, ...refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (refs.some((r) => r.current?.contains(t))) return;
      if (t.closest?.("[data-keep-open]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
    // The refs are stable objects from useRef, so they don't belong in the deps.
  }, [open, onClose]);
}

/**
 * A card placed beside an anchor inside a stage. It measures itself, picks the
 * side that fits, stays inside the stage, and keeps its caret on the anchor.
 */
export function Anchored({
  anchor,
  room,
  prefer = "bottom",
  align = "center",
  caret = true,
  width,
  className,
  label,
  children,
}: {
  anchor: Box;
  room: Box;
  prefer?: Side;
  align?: Align;
  caret?: boolean;
  width?: number;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const [ref, size] = useSize<HTMLDivElement>();
  const p = placeAnchored(anchor, { w: size.w || width || 300, h: size.h || 220 }, room, { prefer, align });
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      className={cx("absolute z-30 animate-rise", className)}
      style={{ left: p.x, top: p.y, width }}
    >
      {caret && <Caret side={p.side} x={p.caret} />}
      {children}
    </div>
  );
}

/** The caret sits over the card's border, so the join reads as one shape. */
function Caret({ side, x }: { side: Side; x: number }) {
  const below = side === "bottom";
  return (
    <svg
      aria-hidden
      width="18"
      height="9"
      viewBox="0 0 18 9"
      className="pointer-events-none absolute z-10 overflow-visible"
      style={{ left: x - 9, ...(below ? { top: -8 } : { bottom: -8 }) }}
    >
      <path d={below ? "M0 9 L9 0 L18 9 Z" : "M0 0 L9 9 L18 0 Z"} className="fill-surface stroke-line" strokeWidth="1" />
    </svg>
  );
}
