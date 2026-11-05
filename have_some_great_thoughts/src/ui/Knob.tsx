import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../utils/cn";

/**
 * A rotary dial for 3–4 related, forgiving values (strength, opacity, scale, grain).
 * Drag up/down (or around), wheel, arrow keys / PageUp/Down / Home/End, double-click to reset.
 * It is a real ARIA slider and always prints its value — a knob without a readout is decoration.
 */
export function Knob({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  def,
  onChange,
  format = (v: number) => `${Math.round(v)}`,
  size = 54,
  track,
  className,
  disabled,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  def?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  size?: number;
  /** Optional CSS gradient for the arc track (e.g. a hue wheel). */
  track?: string;
  className?: string;
  disabled?: boolean;
}) {
  const ref = useRef<{ y: number; v: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const range = max - min;
  const snap = (v: number) => {
    const s = Math.round((v - min) / step) * step + min;
    return Math.min(max, Math.max(min, +s.toFixed(4)));
  };
  const set = (v: number) => {
    const n = snap(v);
    if (n !== value) onChange(n);
  };
  const k = (value - min) / range;
  const START = -135;
  const SWEEP = 270;
  const ang = START + SWEEP * k;
  const cx = size / 2;
  const R = size / 2 - 3;
  const pt = (deg: number, r = R) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cx + r * Math.sin(a)] as const;
  };
  const arc = (a0: number, a1: number, r = R) => {
    const [x0, y0] = pt(a0, r);
    const [x1, y1] = pt(a1, r);
    return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const onKey = (e: KeyboardEvent) => {
    const big = Math.max(step, range / 10);
    const map: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    };
    if (e.key in map) {
      e.preventDefault();
      set(map[e.key]);
    }
  };
  const dflt = def !== undefined ? START + SWEEP * ((def - min) / range) : null;
  return (
    <div className={cn("flex w-[64px] select-none flex-col items-center gap-1", className, disabled && "pointer-events-none opacity-40")}>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        onKeyDown={onKey}
        onDoubleClick={() => def !== undefined && set(def)}
        onWheel={(e) => {
          set(value + (e.deltaY < 0 ? step : -step));
        }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          ref.current = { y: e.clientY, v: value };
          setDrag(true);
        }}
        onPointerMove={(e) => {
          if (!ref.current) return;
          const dy = ref.current.y - e.clientY;
          set(ref.current.v + (dy / (e.shiftKey ? 600 : 150)) * range);
        }}
        onPointerUp={() => {
          ref.current = null;
          setDrag(false);
        }}
        className="relative cursor-ns-resize touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} aria-hidden>
          <defs>
            {track && (
              <linearGradient id={`kt-${label}`} x1="0" x2="1" y1="0" y2="0">
                {track.split(",").map((c, i, a) => (
                  <stop key={i} offset={`${(i / (a.length - 1)) * 100}%`} stopColor={c.trim()} />
                ))}
              </linearGradient>
            )}
          </defs>
          <path d={arc(START, START + SWEEP)} fill="none" stroke="var(--track)" strokeWidth={3} strokeLinecap="round" />
          {k > 0.001 && (
            <path
              d={arc(START, ang)}
              fill="none"
              stroke={track ? `url(#kt-${label})` : "var(--accent)"}
              strokeWidth={3}
              strokeLinecap="round"
            />
          )}
          {dflt !== null && (
            <line
              x1={pt(dflt, R + 4.5)[0]}
              y1={pt(dflt, R + 4.5)[1]}
              x2={pt(dflt, R - 4.5)[0]}
              y2={pt(dflt, R - 4.5)[1]}
              stroke="var(--muted)"
              strokeOpacity={0.55}
              strokeWidth={1}
            />
          )}
          <circle
            cx={cx}
            cy={cx}
            r={R - 6}
            fill="var(--card)"
            stroke={drag ? "var(--accent)" : "var(--line)"}
            strokeWidth={1}
            style={{ filter: "drop-shadow(0 1px 1.5px var(--shadow-soft))" }}
          />
          <line
            x1={pt(ang, R - 7)[0]}
            y1={pt(ang, R - 7)[1]}
            x2={pt(ang, R - 12)[0]}
            y2={pt(ang, R - 12)[1]}
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] font-medium tabular-nums text-ink"
          style={{ paddingTop: 2 }}
        >
          {format(value)}
        </span>
      </div>
      <span className="text-[11px] leading-none text-muted">{label}</span>
    </div>
  );
}
