import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

/* ------------------------------------------------------------------ */
/* IconBtn — mirrors widgets::icon_button / small_icon_button (24/32) */
/* ------------------------------------------------------------------ */
export function IconBtn({
  icon: I, label, size = 32, icon_size = 16, onClick, active, className, disabled,
}: { icon: LucideIcon; label: string; size?: number; icon_size?: number; onClick?: () => void; active?: boolean; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      style={{ width: size, height: size }}
      className={cn(
        "grid place-items-center rounded-lg shrink-0 transition-colors disabled:opacity-35",
        active ? "bg-accent-soft text-accent" : "text-ink hover:bg-line",
        className,
      )}
    >
      <I size={icon_size} strokeWidth={1.75} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Ring — a progress ring, used around play and as toast countdown    */
/* ------------------------------------------------------------------ */
export function Ring({ size, stroke = 2.5, value, color = "var(--accent)", track = "var(--line)", className }: { size: number; stroke?: number; value: number; color?: string; track?: string; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={cn("pointer-events-none -rotate-90", className)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))} style={{ transition: "stroke-dashoffset .25s linear" }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented — widgets::segments (a sliding track)                    */
/* ------------------------------------------------------------------ */
export function Segmented<T extends string>({ value, options, onChange, size = "md", iconOnly, className }: {
  value: T; options: { v: T; label: string; icon?: LucideIcon }[]; onChange: (v: T) => void; size?: "sm" | "md"; iconOnly?: boolean; className?: string;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.v === value));
  const h = size === "sm" ? 26 : 30;
  return (
    <div className={cn("relative grid rounded-lg bg-line/70 p-[2px]", className)} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)`, height: h }} role="radiogroup">
      <div className="absolute top-[2px] bottom-[2px] rounded-md bg-paper shadow-sm transition-all duration-200" style={{ left: `calc(${(idx * 100) / options.length}% + 2px)`, width: `calc(${100 / options.length}% - 4px)` }} />
      {options.map((o) => {
        const I = o.icon;
        const on = o.v === value;
        return (
          <button key={o.v} type="button" role="radio" aria-checked={on} title={o.label} onClick={() => onChange(o.v)}
            className={cn("relative z-10 flex items-center justify-center gap-1.5 rounded-md text-[12px] transition-colors", on ? "text-ink font-medium" : "text-muted hover:text-ink")}>
            {I && <I size={14} strokeWidth={1.75} />}
            {!iconOnly && <span className="truncate">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Switch — egui toggle as themed in theme.rs                         */
/* ------------------------------------------------------------------ */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn("relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors", on ? "bg-accent" : "bg-track/70")}>
      <span className={cn("absolute top-[2px] h-[14px] w-[14px] rounded-full bg-paper shadow transition-all", on ? "left-[16px]" : "left-[2px]")} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* useDrag — vertical-drag helper for knobs and wheels                */
/* ------------------------------------------------------------------ */
function useLatest<T>(v: T) { const r = useRef(v); r.current = v; return r; }

/* ------------------------------------------------------------------ */
/* Knob — rotary dial: drag ↕, wheel, arrows, ⇧ fine, dbl-click reset */
/* ------------------------------------------------------------------ */
export function Knob({ value, min, max, step, onChange, label, format, size = 52, def }: {
  value: number; min: number; max: number; step: number; onChange: (v: number) => void; label: string; format: (v: number) => string; size?: number; def?: number;
}) {
  const [drag, setDrag] = useState(false);
  const start = useRef({ y: 0, v: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const cb = useLatest({ onChange, value });
  const clamp = useCallback((v: number) => Math.round(Math.min(max, Math.max(min, v)) / step) * step, [min, max, step]);
  const k = (value - min) / (max - min);
  const a0 = -135, a1 = 135, ang = a0 + (a1 - a0) * k;
  const r = size / 2 - 4;
  const arc = (from: number, to: number) => {
    const p = (a: number) => { const t = ((a - 90) * Math.PI) / 180; return [size / 2 + r * Math.cos(t), size / 2 + r * Math.sin(t)]; };
    const [x0, y0] = p(from), [x1, y1] = p(to);
    return `M${x0} ${y0} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const wheel = (e: WheelEvent) => { e.preventDefault(); const s = e.shiftKey ? step : step * 2; cb.current.onChange(clamp(cb.current.value + (e.deltaY < 0 ? s : -s))); };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [clamp, step, cb]);
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        ref={ref} role="slider" tabIndex={0} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={format(value)}
        title={`${label} — drag, scroll or arrow keys · ⇧ for fine · double-click resets`}
        className="relative cursor-ns-resize rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        style={{ width: size, height: size }}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); start.current = { y: e.clientY, v: value }; setDrag(true); }}
        onPointerMove={(e) => { if (!drag) return; const range = max - min; const px = e.shiftKey ? 600 : 160; onChange(clamp(start.current.v + ((start.current.y - e.clientY) / px) * range)); }}
        onPointerUp={() => setDrag(false)}
        onDoubleClick={() => def !== undefined && onChange(def)}
        onKeyDown={(e) => {
          const s = e.shiftKey ? step : step * (max - min > 20 * step ? 5 : 1);
          if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); onChange(clamp(value + s)); }
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); onChange(clamp(value - s)); }
          if (e.key === "Home") onChange(min); if (e.key === "End") onChange(max);
        }}
      >
        <svg width={size} height={size} className="absolute inset-0">
          <path d={arc(a0, a1)} fill="none" stroke="var(--line)" strokeWidth={3.5} strokeLinecap="round" />
          {k > 0.002 && <path d={arc(a0, ang)} fill="none" stroke="var(--accent)" strokeWidth={3.5} strokeLinecap="round" />}
        </svg>
        <div className="absolute rounded-full bg-paper pop" style={{ inset: 8 }}>
          <div className="absolute left-1/2 top-1/2 h-full w-full" style={{ transform: `translate(-50%,-50%) rotate(${ang}deg)` }}>
            <span className="absolute left-1/2 top-[4px] h-[7px] w-[2.5px] -translate-x-1/2 rounded-full bg-accent" />
          </div>
        </div>
        {drag && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-medium text-paper">{format(value)}</div>
        )}
      </div>
      <div className="text-center leading-tight">
        <div className="text-[11px] text-muted">{label}</div>
        <div className="text-[12px] font-medium tabular-nums text-ink">{format(value)}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TintWheel — angle = hue, radius = strength. Replaces hue strip,     */
/* 7 swatches and the Strength slider (3 rows) with one gesture.       */
/* ------------------------------------------------------------------ */
export const HUES: [number, string][] = [[34, "Sepia"], [14, "Rose"], [104, "Green"], [160, "Mint"], [200, "Sky"], [240, "Blue"], [290, "Violet"]];
export function hueColour(h: number, s = 60, l = 55) { return `hsl(${h} ${s}% ${l}%)`; }

export function TintWheel({ hue, strength, onChange, size = 104 }: { hue: number; strength: number; onChange: (h: number, s: number) => void; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const set = (x: number, y: number, snap: boolean) => {
    const b = ref.current!.getBoundingClientRect();
    const dx = x - b.left - b.width / 2, dy = y - b.top - b.height / 2;
    let h = Math.round(((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360);
    const near = HUES.find(([v]) => Math.abs(((v - h + 540) % 360) - 180) < 6);
    if (snap && near) h = near[0];
    const s = Math.round(Math.min(1, Math.hypot(dx, dy) / (b.width / 2 - 6)) * 100);
    onChange(h, s);
  };
  const rad = ((hue - 90) * Math.PI) / 180;
  const rr = (size / 2 - 6) * (strength / 100);
  const name = HUES.find(([v]) => v === hue)?.[1];
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={ref} role="slider" tabIndex={0} aria-label="Tint hue and strength" aria-valuetext={`${hue}°, ${strength}%`}
        title="Drag: angle sets hue, distance sets strength · arrows: hue · ⇧+arrows: strength · double-click: no tint"
        className="relative cursor-crosshair rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/60 select-none"
        style={{ width: size, height: size, background: `radial-gradient(circle, var(--paper) 0%, transparent 72%), conic-gradient(${Array.from({ length: 13 }, (_, i) => hueColour(i * 30)).join(",")})` }}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); setDrag(true); set(e.clientX, e.clientY, true); }}
        onPointerMove={(e) => drag && set(e.clientX, e.clientY, !e.shiftKey)}
        onPointerUp={() => setDrag(false)}
        onDoubleClick={() => onChange(hue, 0)}
        onKeyDown={(e) => {
          if (e.shiftKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); onChange(hue, Math.max(0, Math.min(100, strength + (e.key === "ArrowUp" ? 5 : -5)))); return; }
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange((hue + 5) % 360, strength); }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange((hue + 355) % 360, strength); }
        }}
      >
        <div className="absolute inset-[3px] rounded-full ring-1 ring-black/10" />
        {HUES.map(([h, n]) => {
          const t = ((h - 90) * Math.PI) / 180, R = size / 2 - 2;
          return <span key={h} title={n} className="absolute h-[5px] w-[5px] rounded-full bg-ink/60" style={{ left: size / 2 + R * Math.cos(t) - 2.5, top: size / 2 + R * Math.sin(t) - 2.5 }} />;
        })}
        <span className="absolute h-[16px] w-[16px] rounded-full border-2 border-paper shadow-md transition-[left,top] duration-75"
          style={{ left: size / 2 + rr * Math.cos(rad) - 8, top: size / 2 + rr * Math.sin(rad) - 8, background: strength < 4 ? "var(--paper)" : hueColour(hue) }} />
      </div>
      <div className="text-center leading-tight">
        <div className="text-[11px] text-muted">Tint</div>
        <div className="text-[12px] font-medium tabular-nums text-ink">{strength < 2 ? "None" : `${name ?? hue + "°"} · ${strength}%`}</div>
      </div>
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-line bg-paper px-1 font-sans text-[10.5px] font-medium text-muted shadow-[0_1px_0_var(--line)]">{children}</kbd>;
}

export function EgSlider({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return <input className="egui w-full" type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} />;
}
