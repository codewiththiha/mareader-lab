import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { HUE_MARKS } from "../lib/look";
import { cx } from "./ui";

export type KnobSize = "sm" | "md" | "lg";

const PX: Record<KnobSize, number> = { sm: 38, md: 50, lg: 72 };
/** The sweep runs 270°, open at the bottom, as mareader's dials do. */
const FROM = -135;
const TO = 135;

/** A point at `deg` (0 is up, clockwise) on a circle centred at (cx, cy). */
function at(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arc(from: number, to: number) {
  if (to - from < 0.5) return "";
  const [x0, y0] = at(50, 50, 40, from);
  const [x1, y1] = at(50, 50, 40, to);
  return `M ${x0} ${y0} A 40 40 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

export interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  format?: (v: number) => string;
  /** Double-click returns to this value. */
  defaultValue?: number;
  size?: KnobSize;
  /** Hue mode: a ring you turn through the whole colour wheel. */
  hue?: boolean;
  /** Leave out the caption; the value is still announced. */
  bare?: boolean;
}

/**
 * A rotary control. Drag up or sideways, scroll, or use the arrow, Page and
 * Home/End keys. Double-click resets. It replaces a slider where space is tight.
 */
export function Knob({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  format = String,
  defaultValue,
  size = "md",
  hue = false,
  bare = false,
}: KnobProps) {
  const px = PX[size];
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({ value, min, max, step, onChange, hue, defaultValue });
  latest.current = { value, min, max, step, onChange, hue, defaultValue };
  const drag = useRef<{ x: number; y: number; v: number } | null>(null);

  const snap = (v: number) => {
    const { min: lo, max: hi, step: s } = latest.current;
    const n = Math.round((v - lo) / s) * s + lo;
    return Math.min(hi, Math.max(lo, Number(n.toFixed(3))));
  };

  /** Hue mode: the angle from the knob's centre to the pointer. */
  const aim = (x: number, y: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const deg = (Math.atan2(x - (r.left + r.width / 2), -(y - (r.top + r.height / 2))) * 180) / Math.PI;
    latest.current.onChange(Math.round((deg + 360) % 360));
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { value: v, step: s, onChange: change } = latest.current;
      change(snap(v + (e.deltaY < 0 ? s : -s)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, v: latest.current.value };
    if (latest.current.hue) aim(e.clientX, e.clientY);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (latest.current.hue) {
      aim(e.clientX, e.clientY);
      return;
    }
    const span = latest.current.max - latest.current.min;
    const travel = (d.y - e.clientY + (e.clientX - d.x)) / 150;
    latest.current.onChange(snap(d.v + travel * span));
  };

  const onUp = () => {
    drag.current = null;
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const { value: v, step: s, min: lo, max: hi, onChange: change } = latest.current;
    const moves: Record<string, number> = {
      ArrowUp: s,
      ArrowRight: s,
      ArrowDown: -s,
      ArrowLeft: -s,
      PageUp: s * 10,
      PageDown: -s * 10,
    };
    if (e.key in moves) {
      e.preventDefault();
      change(snap(v + moves[e.key]));
    } else if (e.key === "Home") {
      e.preventDefault();
      change(lo);
    } else if (e.key === "End") {
      e.preventDefault();
      change(hi);
    }
  };

  const onDbl = () => {
    const d = latest.current.defaultValue;
    if (d !== undefined) latest.current.onChange(d);
  };

  const t = (value - min) / (max - min);
  const angle = FROM + t * (TO - FROM);
  const [px1, py1] = at(50, 50, 10, angle);
  const [px2, py2] = at(50, 50, 25, angle);

  return (
    <div className={cx("flex flex-col items-center", bare ? "gap-0" : "gap-1.5")}>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        onDoubleClick={onDbl}
        title={`${label}: drag, scroll or use the arrow keys. Double-click to reset.`}
        className="relative cursor-grab touch-none select-none rounded-full active:cursor-grabbing"
        style={{ width: px, height: px }}
      >
        {hue ? (
          <HueFace value={value} px={px} />
        ) : (
          <svg viewBox="0 0 100 100" className="size-full overflow-visible" aria-hidden>
            <g style={{ stroke: "var(--muted)" }} strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
              {Array.from({ length: 11 }, (_, i) => {
                const d = FROM + (i * (TO - FROM)) / 10;
                const [x1, y1] = at(50, 50, 45, d);
                const [x2, y2] = at(50, 50, 48.5, d);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
            </g>
            <path
              d={arc(FROM, TO)}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              style={{ stroke: "color-mix(in oklch, var(--ink) 14%, transparent)" }}
            />
            <path d={arc(FROM, angle)} fill="none" strokeWidth="6" strokeLinecap="round" style={{ stroke: "var(--accent)" }} />
            <circle cx="50" cy="50" r="30" strokeWidth="1" style={{ fill: "var(--paper)", stroke: "var(--line)" }} />
            <line x1={px1} y1={py1} x2={px2} y2={py2} strokeWidth="4.5" strokeLinecap="round" style={{ stroke: "var(--ink)" }} />
          </svg>
        )}
      </div>
      {!bare && (
        <div className="text-center leading-none">
          <div className="whitespace-nowrap text-[11px] text-muted">{label}</div>
          <div className="mt-1 whitespace-nowrap text-[12px] font-medium tabular-nums text-ink">{format(value)}</div>
        </div>
      )}
    </div>
  );
}

/** The colour wheel: a conic ring, a swatch of the tint, and a grip on the current hue. */
function HueFace({ value, px }: { value: number; px: number }) {
  const c = px / 2;
  const [dx, dy] = at(c, c, c - 7, value);
  const ring = `conic-gradient(${Array.from({ length: 13 }, (_, i) => `hsl(${i * 30} 78% 60%)`).join(", ")})`;
  const mask = "radial-gradient(farthest-side, transparent 74%, #000 76%)";
  return (
    <>
      <div className="absolute inset-0 rounded-full" style={{ background: ring, WebkitMask: mask, mask }} />
      <div
        className="absolute rounded-full"
        style={{ inset: px * 0.24, background: `hsl(${value} 62% 52%)`, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.1)" }}
      />
      {HUE_MARKS.map((m) => {
        const [x, y] = at(c, c, c + 4, m.h);
        return (
          <span
            key={m.h}
            title={m.name}
            className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/70"
            style={{ left: x, top: y }}
          />
        );
      })}
      <span
        className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper-base shadow-md ring-2 ring-white/90"
        style={{ left: dx, top: dy }}
      />
    </>
  );
}
