import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BellRing, CheckCircle2, Copy, Undo2, X } from "lucide-react";
import { cn } from "../utils/cn";
import { CiteTag, Duel, Panel, Seg, SpaceMeter, Switch, VerdictCard } from "./kit";
import { SOURCES, VERDICTS } from "../data/audit";

type Tone = "info" | "error" | "warning";
type T = { id: number; msg: string; tone: Tone; action?: string; count: number; life: number; left: number };

let nid = 1;
const DUR: Record<Tone, number> = { info: 3.5, warning: 4.5, error: 6 };
const PRESETS: { msg: string; tone: Tone; action?: string }[] = [
  { msg: "Note saved to page 12", tone: "info" },
  { msg: "Highlight removed", tone: "info", action: "Undo" },
  { msg: "“notes.pdf” failed to open — file moved", tone: "error", action: "Locate" },
  { msg: "Copied to clipboard", tone: "info" },
];

const toneInk: Record<Tone, string> = { info: "#7cc4ff", error: "#ff7d7d", warning: "#f5b83d" };
const toneBg: Record<Tone, string> = { info: "rgba(124,196,255,.14)", error: "rgba(255,125,125,.14)", warning: "rgba(245,184,61,.14)" };

function useToasts() {
  const [items, setItems] = useState<T[]>([]);
  const hov = useRef<number | null>(null);
  const fire = useCallback((p: { msg: string; tone: Tone; action?: string }) => {
    setItems((xs) => {
      const dup = xs.find((t) => t.msg === p.msg && t.tone === p.tone);
      if (dup) return xs.map((t) => (t === dup ? { ...t, count: t.count + 1, left: DUR[p.tone] } : t));
      const life = DUR[p.tone] + (p.action ? 2.5 : 0);
      return [...xs.slice(-4), { id: nid++, ...p, count: 1, life, left: life }];
    });
  }, []);
  const kill = useCallback((id: number) => setItems((xs) => xs.filter((t) => t.id !== id)), []);
  useEffect(() => {
    const iv = setInterval(() => {
      setItems((xs) =>
        xs.map((t) => (hov.current === t.id ? t : { ...t, left: t.left - 0.1 })).filter((t) => t.left > 0)
      );
    }, 100);
    return () => clearInterval(iv);
  }, []);
  return { items, fire, kill, hov };
}

/* ------------------------- shipped replica: 360 fixed ------------------------ */

function ShippedCard({ t, onKill, onFire, peeking }: { t: T; onKill: () => void; onFire: () => void; peeking?: boolean }) {
  const wash = Math.max(0, Math.min(1, t.left / t.life));
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: peeking ? 0.85 : 1, x: 0, scale: peeking ? 0.96 : 1 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className="relative w-[min(360px,100%)] overflow-hidden rounded-xl border border-[#2c2620] bg-[#1e1a15] shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
    >
      {/* feathered countdown wash approximation: tone block + soft trailing edge */}
      <div className="pointer-events-none absolute inset-y-0 left-0" style={{ width: `${wash * 100}%`, background: toneBg[t.tone] }} />
      <div className="pointer-events-none absolute inset-y-0 w-10 bg-[#1e1a15] blur-md" style={{ left: `calc(${wash * 100}% - 20px)` }} />
      <div className="relative flex items-center gap-2.5 px-3 py-2.5">
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full" style={{ background: toneBg[t.tone] }}>
          {t.tone === "info" ? <CheckCircle2 size={15} style={{ color: toneInk[t.tone] }} /> : <AlertTriangle size={15} style={{ color: toneInk[t.tone] }} />}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-stone-200">
          {t.msg}
          {t.count > 1 && <span className="ml-2 font-mono text-[11px] text-stone-500">×{t.count}</span>}
        </span>
        {t.action && (
          <button onClick={onFire} className="shrink-0 rounded-md bg-[#7cc4ff]/15 px-2 py-1 text-[12px] font-semibold text-[#7cc4ff]">
            {t.action}
          </button>
        )}
        <button onClick={onKill} aria-label="Dismiss" className="shrink-0 rounded-md p-1 text-stone-500 hover:bg-white/8 hover:text-stone-200">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------ redesigned card ---------------------------- */

function NewCard({ t, onKill, compact, ring, onAction }: { t: T; onKill: () => void; compact: boolean; ring: boolean; onAction: () => void }) {
  const k = Math.max(0, Math.min(1, t.left / t.life));
  const R = 9;
  const C = 2 * Math.PI * R;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 90, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 480, damping: 36 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => info.offset.x > 70 && onKill()}
      className={cn(
        "relative w-[min(340px,100%)] cursor-grab overflow-hidden rounded-xl border bg-[#211c16] shadow-[0_14px_36px_rgba(0,0,0,0.55)] active:cursor-grabbing",
        t.tone === "error" ? "border-rose-500/45" : t.tone === "warning" ? "border-[#f5b83d]/40" : "border-[#3a332b]"
      )}
    >
      {!ring && <div className="absolute inset-x-0 top-0 h-[2.5px] bg-white/6"><div className="h-full" style={{ width: `${k * 100}%`, background: toneInk[t.tone] }} /></div>}
      <div className={cn("relative flex items-center gap-2.5", compact ? "px-3 py-2" : "px-3.5 py-3")}>
        <span className="relative flex shrink-0 items-center justify-center rounded-lg" style={{ width: compact ? 26 : 30, height: compact ? 26 : 30, background: toneBg[t.tone] }}>
          {ring ? (
            <svg width={compact ? 26 : 30} height={compact ? 26 : 30} className="-rotate-90">
              <circle cx="50%" cy="50%" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={2.5} />
              <circle cx="50%" cy="50%" r={R} fill="none" stroke={toneInk[t.tone]} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={`${C * k} ${C}`} />
            </svg>
          ) : null}
          <span className="absolute">
            {t.tone === "info" ? <CheckCircle2 size={compact ? 14 : 16} style={{ color: toneInk[t.tone] }} /> : <AlertTriangle size={compact ? 14 : 16} style={{ color: toneInk[t.tone] }} />}
          </span>
        </span>
        <span className={cn("min-w-0 flex-1 text-stone-100", compact ? "truncate text-[12.5px]" : "text-[13px] leading-snug")}>
          {t.msg}
          {t.count > 1 && (
            <motion.span key={t.count} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="ml-1.5 inline-block rounded-full bg-white/10 px-1.5 py-px font-mono text-[10.5px] font-semibold text-stone-200">
              ×{t.count}
            </motion.span>
          )}
        </span>
        {t.action && (
          <button onClick={onAction} className={cn("flex shrink-0 items-center gap-1 rounded-lg bg-[#f5b83d] font-semibold text-[#14100a] hover:bg-[#ffc95c]", compact ? "px-2 py-1 text-[11.5px]" : "px-2.5 py-1.5 text-[12px]")}>
            {t.action === "Undo" ? <Undo2 size={13} /> : null}{t.action}
          </button>
        )}
        <button onClick={onKill} aria-label="Dismiss" className="shrink-0 rounded-md p-1 text-stone-500 hover:bg-white/8 hover:text-stone-100">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ---------------------------------- lab ----------------------------------- */

export default function ToastLab() {
  const a = useToasts();
  const b = useToasts();
  const [pos, setPos] = useState<"br" | "bc" | "tc">("bc");
  const [compact, setCompact] = useState(true);
  const [ring, setRing] = useState(false);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const fireBoth = (i: number) => {
    a.fire(PRESETS[i]);
    b.fire(PRESETS[i]);
  };
  const spam = () => {
    for (let i = 0; i < 3; i++) setTimeout(() => fireBoth(3), i * 160);
  };
  const acted = (label: string) => {
    setActionNote(label);
    setTimeout(() => setActionNote(null), 1800);
  };

  const posCls = pos === "br" ? "right-3 bottom-3 items-end" : pos === "bc" ? "bottom-[64px] left-1/2 -translate-x-1/2 items-center" : "top-3 left-1/2 -translate-x-1/2 items-center";

  const readerShell = (stack: React.ReactNode, lane: boolean) => (
    <div className="relative h-[380px] overflow-hidden rounded-xl bg-[#efe7d8]">
      <div className="paper-noise absolute inset-0" />
      <div className="absolute inset-x-8 top-6 space-y-2 opacity-90">
        {["w-11/12", "w-full", "w-10/12", "w-full", "w-9/12", "w-full", "w-11/12"].map((w, i) => (
          <div key={i} className={cn("h-2 rounded-full bg-[#d8cdb4]", w)} />
        ))}
        <p className="pt-2 font-serif text-[15px] leading-relaxed text-[#4a4136]">
          “It is a truth universally <span className="rounded bg-[#f5b83d]/50 px-0.5">acknowledged</span>, that a single man in possession of a good fortune, must be in want of a wife.”
        </p>
        {["w-full", "w-10/12", "w-11/12"].map((w, i) => (
          <div key={"b" + i} className={cn("h-2 rounded-full bg-[#d8cdb4]", w)} />
        ))}
      </div>
      {/* page pill + player dock = the collision the audit flagged */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
        <span className="rounded-full bg-[#14100a]/85 px-3 py-1 font-mono text-[11px] text-stone-200">1 / 20</span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#14100a]/85 px-3 py-1 text-[11px] text-stone-200">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5b83d]" /> Reading aloud
        </span>
      </div>
      {lane && pos === "bc" && (
        <div className="pointer-events-none absolute inset-x-6 bottom-[58px] rounded-lg border border-dashed border-[#8a7a5c]/60 px-2 py-5 text-center font-mono text-[10px] tracking-wider text-[#8a7a5c] uppercase">
          toast lane · clears pill + dock
        </div>
      )}
      <div className={cn("absolute z-10 flex w-max max-w-full flex-col gap-2", pos === "br" && lane ? "right-3 bottom-3 items-end" : lane ? posCls : "right-3 bottom-3 items-end")}>
        {stack}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <CiteTag cite={SOURCES.toast} />
        <CiteTag cite={SOURCES.toastCard} />
      </div>
      <VerdictCard verdict={VERDICTS.toast} />

      <Panel label="fire control — every shot hits both stacks at once">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#2c2620] px-4 py-3">
          <button onClick={() => fireBoth(0)} className="flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-[12.5px] font-medium text-stone-200 hover:bg-white/12"><BellRing size={14} /> Note saved</button>
          <button onClick={() => fireBoth(1)} className="flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-[12.5px] font-medium text-stone-200 hover:bg-white/12"><Undo2 size={14} /> Removed + Undo</button>
          <button onClick={() => fireBoth(2)} className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 px-3 py-1.5 text-[12.5px] font-medium text-rose-300 hover:bg-rose-500/25"><AlertTriangle size={14} /> Open failed</button>
          <button onClick={spam} className="flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-[12.5px] font-medium text-stone-200 hover:bg-white/12"><Copy size={14} /> Spam ×3 (dedup)</button>
          <AnimatePresence>{actionNote && <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="font-mono text-[11.5px] text-emerald-400">→ action “{actionNote}” dispatched + toast closed</motion.span>}</AnimatePresence>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-stone-500 uppercase">Lane</span>
            <Seg value={pos} onChange={setPos} options={[{ value: "br", label: "Corner" }, { value: "bc", label: "Bottom lane" }, { value: "tc", label: "Top" }]} />
          </div>
          <Switch on={compact} onFlip={() => setCompact(!compact)} label="Compact density" />
          <Switch on={ring} onFlip={() => setRing(!ring)} label="Ring countdown" />
          <span className="text-[12px] text-stone-500">drag a new card sideways to fling it · hover pauses its clock</span>
        </div>
      </Panel>

      <Duel
        before={
          <Panel>
            <div className="p-3">
              {readerShell(
                <AnimatePresence initial={false}>
                  {a.items.slice(-3).map((t, i, arr) => (
                    <div key={t.id} onMouseEnter={() => (a.hov.current = t.id)} onMouseLeave={() => (a.hov.current = null)}>
                      <ShippedCard t={t} onKill={() => a.kill(t.id)} onFire={() => acted(t.action ?? "")} peeking={i < arr.length - 1} />
                    </div>
                  ))}
                </AnimatePresence>,
                false
              )}
              <p className="px-1 pt-2 font-mono text-[11px] leading-relaxed text-stone-500">
                fixed 360px · bottom-right · feather wash α≈0.13 · sits on the pill+dock
              </p>
            </div>
          </Panel>
        }
        after={
          <Panel>
            <div className="p-3">
              {readerShell(
                <AnimatePresence initial={false}>
                  {b.items.slice(-3).map((t) => (
                    <div key={t.id} onMouseEnter={() => (b.hov.current = t.id)} onMouseLeave={() => (b.hov.current = null)}>
                      <NewCard t={t} compact={compact} ring={ring} onKill={() => b.kill(t.id)} onAction={() => { acted(t.action ?? ""); b.kill(t.id); }} />
                    </div>
                  ))}
                </AnimatePresence>,
                true
              )}
              <p className="px-1 pt-2 font-mono text-[11px] leading-relaxed text-stone-500">
                fluid ≤340 · dedicated lane · legible meter (bar/ring) · lamp action · ×n pill
              </p>
            </div>
          </Panel>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SpaceMeter
          rows={[
            { label: "Card width (narrow window)", before: 360, after: 300, unit: "px" },
            { label: "Card height, one line (compact)", before: 48, after: 38, unit: "px" },
            { label: "Content occluded at rest", before: 100, after: 0, unit: "%" },
          ]}
        />
        <div className="space-y-3">
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why a lane, not a corner.</span> The audit's §10.1 fix (“lift above the pill”) is honored structurally: the lane is a reserved band, so toasts can never cover chrome no matter the route. Top-center is offered for readers who park the player at the bottom — same component, one prop.
          </div>
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why the wash had to go.</span> A 64pt feather at 13% alpha is atmosphere, not information — you can't tell 3s left from 0.3s. The hairline (or ring) keeps the “time as tint” poetry but reads at a glance. Errors keep the red edge from <span className="font-mono text-[12px] text-stone-400">look()</span>; everything else earns attention by position, not saturation.
          </div>
        </div>
      </div>
    </div>
  );
}
