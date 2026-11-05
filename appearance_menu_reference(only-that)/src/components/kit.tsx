import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, FileCode2, TriangleAlert, Wrench } from "lucide-react";
import { cn } from "../utils/cn";
import type { Cite, Verdict } from "../data/audit";

/* ---------------------------------- layout --------------------------------- */

export function Section(props: {
  id: string;
  index: string;
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <section id={props.id} className="scroll-mt-20 border-t border-[#221d16]">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="mb-2 flex items-center gap-3">
          <span className="font-mono text-xs font-semibold tracking-widest text-[#f5b83d]">
            {props.index}
          </span>
          <span className="h-px w-10 bg-[#f5b83d]/40" />
          <span className="font-mono text-xs tracking-widest text-stone-500 uppercase">
            {props.kicker}
          </span>
        </div>
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-stone-100 md:text-4xl">
          {props.title}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-400">{props.lede}</p>
        <div className="mt-10">{props.children}</div>
      </div>
    </section>
  );
}

export function Panel(props: { className?: string; children: ReactNode; label?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-[#2c2620] bg-[#16130f]", props.className)}>
      {props.label && (
        <div className="flex items-center justify-between border-b border-[#2c2620] px-4 py-2.5">
          <span className="font-mono text-[11px] tracking-wider text-stone-500 uppercase">{props.label}</span>
        </div>
      )}
      {props.children}
    </div>
  );
}

/* --------------------------------- citation -------------------------------- */

export function CiteTag({ cite, tone = "dim" }: { cite: Cite; tone?: "dim" | "lamp" }) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-2.5 py-1.5 font-mono text-[11px]",
        tone === "lamp" ? "border-[#f5b83d]/30 bg-[#f5b83d]/8 text-[#f5b83d]" : "border-[#2c2620] bg-[#0d0b09] text-stone-400"
      )}
    >
      <FileCode2 size={12} className="shrink-0 opacity-70" />
      <span className="font-semibold text-stone-300">{cite.file}</span>
      <span className="hidden text-stone-600 sm:inline">·</span>
      <span className="hidden text-stone-500 md:inline">{cite.what}</span>
      <span className="flex flex-wrap gap-1">
        {cite.consts.map((c) => (
          <span key={c} className="rounded bg-white/6 px-1.5 py-0.5 text-[10px] text-stone-400 ring-1 ring-white/8 ring-inset">
            {c}
          </span>
        ))}
      </span>
    </div>
  );
}

/* --------------------------------- verdicts -------------------------------- */

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/6 p-4">
        <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-emerald-300">
          <Check size={14} /> Keep — already great
        </div>
        <ul className="space-y-1.5">
          {verdict.keep.map((k) => (
            <li key={k} className="text-[13px] leading-relaxed text-stone-300/90">
              <span className="mr-1.5 text-emerald-500">·</span>
              {k}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-[#f5b83d]/25 bg-[#f5b83d]/6 p-4">
        <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-[#f5b83d]">
          <Wrench size={14} /> Redesign — demonstrated below
        </div>
        <ul className="space-y-1.5">
          {verdict.fix.map((k) => (
            <li key={k} className="text-[13px] leading-relaxed text-stone-300/90">
              <span className="mr-1.5 text-[#f5b83d]">·</span>
              {k}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Warn({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/6 px-3.5 py-3 text-[13px] leading-relaxed text-stone-300">
      <TriangleAlert size={15} className="mt-0.5 shrink-0 text-rose-400" />
      <div>{children}</div>
    </div>
  );
}

/* ---------------------------------- meters --------------------------------- */

export function SpaceMeter(props: { rows: { label: string; before: number; after: number; unit: string }[] }) {
  const max = Math.max(...props.rows.map((r) => r.before));
  return (
    <div className="space-y-3 rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4">
      <div className="font-mono text-[11px] tracking-wider text-stone-500 uppercase">Footprint: shipped vs redesign</div>
      {props.rows.map((r) => (
        <div key={r.label} className="space-y-1">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="font-medium text-stone-300">{r.label}</span>
            <span className="font-mono text-[11px] text-stone-500">
              {r.before}
              {r.unit} → <span className="font-semibold text-emerald-400">{r.after}{r.unit}</span>
            </span>
          </div>
          <div className="space-y-1">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(r.before / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-2 rounded-full bg-stone-600"
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(r.after / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="h-2 rounded-full bg-[#f5b83d]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- controls -------------------------------- */

export function Seg<T extends string>(props: {
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-[#2c2620] bg-[#0d0b09] p-1">
      {props.options.map((o) => (
        <button
          key={o.value}
          onClick={() => props.onChange(o.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
            props.value === o.value ? "bg-[#f5b83d] text-[#14100a]" : "text-stone-400 hover:text-stone-200"
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch(props: { on: boolean; onFlip: () => void; label: string }) {
  return (
    <button onClick={props.onFlip} className="group flex items-center gap-2.5" role="switch" aria-checked={props.on}>
      <span
        className={cn(
          "relative h-[20px] w-[34px] rounded-full transition-colors",
          props.on ? "bg-[#f5b83d]" : "bg-stone-700"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white shadow transition-all",
            props.on ? "left-[16px]" : "left-[2px]"
          )}
        />
      </span>
      <span className="text-[13px] text-stone-300 group-hover:text-white">{props.label}</span>
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-white/10 bg-white/6 px-1.5 py-0.5 font-mono text-[10.5px] text-stone-300">
      {children}
    </kbd>
  );
}

export function SliderRow(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-[12px] text-stone-400">{props.label}</span>
      <input
        type="range"
        className="demo-range flex-1"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        aria-label={props.label}
      />
      <span className="w-13 shrink-0 text-right font-mono text-[12px] text-stone-200">{props.format(props.value)}</span>
    </div>
  );
}

/* ------------------------------- rotary knob ------------------------------- */
/* A compact dial: vertical drag, wheel, arrow keys. 6 numbers, one row. */

export function Knob(props: {
  label: string;
  value: number; // 0..100
  onChange: (v: number) => void;
  display?: string;
  size?: number;
  accent?: string;
  min?: number;
  max?: number;
}) {
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const size = props.size ?? 56;
  const accent = props.accent ?? "#f5b83d";
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; v: number } | null>(null);
  const [, setTick] = useState(0);

  const pct = (props.value - min) / (max - min);
  const angle = -135 + pct * 270;

  const commit = useCallback(
    (v: number) => props.onChange(Math.round(Math.min(max, Math.max(min, v)))),
    [min, max, props]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      const dy = drag.current.y - e.clientY;
      commit(drag.current.v + (dy / 120) * (max - min));
      setTick((t) => t + 1);
    };
    const up = () => {
      drag.current = null;
      (document.activeElement as HTMLElement)?.blur?.();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [commit, max, min]);

  const R = 20;
  const C = 2 * Math.PI * R;
  const arc = C * (0.75 * pct);

  return (
    <div className="flex w-[76px] flex-col items-center gap-1.5">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={props.label}
        aria-valuenow={Math.round(props.value)}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          drag.current = { y: e.clientY, v: props.value };
        }}
        onWheel={(e) => commit(props.value + (e.deltaY < 0 ? 1 : -1) * ((max - min) / 40))}
        onKeyDown={(e) => {
          const step = (max - min) / 20;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") commit(props.value + step);
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") commit(props.value - step);
          if (e.key === "Home") commit(min);
          if (e.key === "End") commit(max);
        }}
        onDoubleClick={() => commit(min)}
        title={`${props.label} — drag, scroll, or use arrow keys. Double-click resets.`}
        className="knob-focus relative cursor-ns-resize touch-none rounded-full select-none"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-[225deg]">
          <circle cx={size / 2} cy={size / 2} r={(R / 48) * size} fill="none" stroke="#3a332b" strokeWidth={4.5}
            strokeLinecap="round" strokeDasharray={`${C * 0.75 * (size / 48)} ${C * (size / 48)}`} />
          <circle cx={size / 2} cy={size / 2} r={(R / 48) * size} fill="none" stroke={accent} strokeWidth={4.5}
            strokeLinecap="round" strokeDasharray={`${arc * (size / 48)} ${C * (size / 48)}`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-[#3a332b] bg-[#221d16] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            style={{ width: size * 0.62, height: size * 0.62 }}>
            <div className="relative h-full w-full" style={{ transform: `rotate(${angle}deg)` }}>
              <div className="absolute left-1/2 top-[4px] h-[34%] w-[2.5px] -translate-x-1/2 rounded-full" style={{ background: accent }} />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center leading-tight">
        <div className="text-[11px] font-medium text-stone-300">{props.label}</div>
        <div className="font-mono text-[11px] text-stone-500">{props.display ?? `${Math.round(props.value)}`}</div>
      </div>
    </div>
  );
}

/* ------------------------------ before / after ----------------------------- */

export function Duel(props: { before: ReactNode; after: ReactNode; beforeLabel?: string; afterLabel?: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-stone-700/60 px-2 py-0.5 font-mono text-[10.5px] font-semibold tracking-wider text-stone-300 uppercase">
            {props.beforeLabel ?? "Shipped"}
          </span>
          <span className="text-[12px] text-stone-500">replica of current behavior</span>
        </div>
        {props.before}
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-[#f5b83d] px-2 py-0.5 font-mono text-[10.5px] font-semibold tracking-wider text-[#14100a] uppercase">
            {props.afterLabel ?? "Redesign"}
          </span>
          <span className="text-[12px] text-stone-500">working proposal — touch it</span>
        </div>
        {props.after}
      </div>
    </div>
  );
}
