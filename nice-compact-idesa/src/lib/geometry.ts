import { useLayoutEffect, useRef, useState } from "react";

/** A rectangle in a stage's own coordinates. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  w: number;
  h: number;
}

export type Side = "top" | "bottom";
export type Align = "start" | "center" | "end";

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, Math.max(lo, hi)));

/** An element's box, measured inside a stage. */
export function boxWithin(el: Element, stage: Element): Box {
  const a = el.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  return { x: a.left - s.left, y: a.top - s.top, w: a.width, h: a.height };
}

/** A pointer position, measured inside a stage. */
export function pointWithin(clientX: number, clientY: number, stage: Element): { x: number; y: number } {
  const s = stage.getBoundingClientRect();
  return { x: clientX - s.left, y: clientY - s.top };
}

/** The whole stage as a room to place things in. */
export function roomOf(size: Size): Box {
  return { x: 0, y: 0, w: size.w, h: size.h };
}

/**
 * Place a card beside its anchor. It takes the preferred side if it fits,
 * else the other side if that fits, else the roomier one. Horizontally it
 * follows the anchor and is kept inside the room. The caret stays on the
 * anchor's middle, clear of the card's corners.
 */
export function placeAnchored(
  anchor: Box,
  size: Size,
  room: Box,
  o: { prefer?: Side; align?: Align; gap?: number; margin?: number } = {},
) {
  const prefer: Side = o.prefer ?? "bottom";
  const other: Side = prefer === "bottom" ? "top" : "bottom";
  const gap = o.gap ?? 12;
  const m = o.margin ?? 8;
  const below = room.y + room.h - m - (anchor.y + anchor.h + gap);
  const above = anchor.y - gap - (room.y + m);
  const space: Record<Side, number> = { bottom: below, top: above };
  const side: Side =
    space[prefer] >= size.h
      ? prefer
      : space[other] >= size.h
        ? other
        : space[prefer] >= space[other]
          ? prefer
          : other;
  const y = side === "bottom" ? anchor.y + anchor.h + gap : anchor.y - gap - size.h;
  const left =
    o.align === "end"
      ? anchor.x + anchor.w - size.w
      : o.align === "start"
        ? anchor.x
        : anchor.x + anchor.w / 2 - size.w / 2;
  const x = clamp(left, room.x + m, room.x + room.w - m - size.w);
  const caret = clamp(anchor.x + anchor.w / 2 - x, 18, Math.max(18, size.w - 18));
  return { x, y: clamp(y, room.y + m, room.y + room.h - m - size.h), side, caret };
}

/** A pointer-opened menu: it flips left or up when it would leave the room. */
export function placeAtPoint(p: { x: number; y: number }, size: Size, room: Box, m = 8) {
  let x = p.x;
  let y = p.y;
  if (x + size.w > room.x + room.w - m) x = p.x - size.w;
  if (y + size.h > room.y + room.h - m) y = p.y - size.h;
  return {
    x: clamp(x, room.x + m, room.x + room.w - m - size.w),
    y: clamp(y, room.y + m, room.y + room.h - m - size.h),
  };
}

/** Tracks an element's rendered size. Keep the element mounted while using it. */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}
