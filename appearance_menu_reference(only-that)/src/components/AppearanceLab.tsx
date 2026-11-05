import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronRight, CloudMoon, Coffee, Moon, Plus, Sun } from "lucide-react";
import { cn } from "../utils/cn";
import { CiteTag, Duel, Knob, Panel, SpaceMeter, Switch, VerdictCard } from "./kit";
import { SOURCES, VERDICTS } from "../data/audit";

/* ---------------------------------- state ---------------------------------- */

type Mode = "Light" | "Sepia" | "Dim" | "Dark";
type Tex = "None" | "Paper" | "Fiber" | "Canvas";
type Grain = "Off" | "Static" | "Animated";

const MODES: { name: Mode; icon: React.ReactNode; page: string; ink: string; muted: string }[] = [
  { name: "Light", icon: <Sun size={14} />, page: "#f4eee1", ink: "#2c261d", muted: "#8a7d64" },
  { name: "Sepia", icon: <Coffee size={14} />, page: "#e9d9b4", ink: "#3a2c17", muted: "#93805c" },
  { name: "Dim", icon: <CloudMoon size={14} />, page: "#2b2723", ink: "#d9d1bf", muted: "#847b6b" },
  { name: "Dark", icon: <Moon size={14} />, page: "#16140f", ink: "#cfc7b6", muted: "#6f675a" },
];

const HUES: [number, string][] = [[34, "Sepia"], [14, "Rose"], [104, "Green"], [160, "Mint"], [200, "Sky"], [240, "Blue"], [290, "Violet"]];

type Look = { mode: Mode; hue: number; strength: number; size: number; lines: number; tex: Tex; texOp: number; grain: Grain; grainIn: number };

const PRESETS: { name: string; look: Look }[] = [
  { name: "Classic", look: { mode: "Light", hue: 40, strength: 12, size: 100, lines: 150, tex: "None", texOp: 40, grain: "Off", grainIn: 0 } },
  { name: "Sepia", look: { mode: "Sepia", hue: 34, strength: 34, size: 102, lines: 155, tex: "Paper", texOp: 45, grain: "Static", grainIn: 22 } },
  { name: "Forest", look: { mode: "Dim", hue: 104, strength: 26, size: 100, lines: 150, tex: "Fiber", texOp: 30, grain: "Off", grainIn: 0 } },
  { name: "Midnight", look: { mode: "Dark", hue: 224, strength: 30, size: 98, lines: 150, tex: "None", texOp: 40, grain: "Static", grainIn: 30 } },
  { name: "Cinema", look: { mode: "Dark", hue: 20, strength: 42, size: 104, lines: 160, tex: "Canvas", texOp: 35, grain: "Animated", grainIn: 45 } },
];

const nearestHue = (h: number) => HUES.reduce((a, b) => (Math.abs(((b[0] - h + 540) % 360) - 180) < Math.abs(((a[0] - h + 540) % 360) - 180) ? b : a));

/* ------------------------------- svg textures ------------------------------ */

const svg = (inner: string, w = 120, h = 120) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${inner}</svg>`)}")`;

const TEX_BG: Record<Exclude<Tex, "None">, string> = {
  Paper: svg(`<circle cx='20' cy='20' r='1.4' fill='%23000' fill-opacity='0.10'/><circle cx='70' cy='55' r='1.1' fill='%23000' fill-opacity='0.08'/><circle cx='40' cy='95' r='1.3' fill='%23000' fill-opacity='0.09'/><circle cx='105' cy='100' r='1' fill='%23000' fill-opacity='0.07'/>`),
  Fiber: svg(`<line x1='0' y1='20' x2='120' y2='16' stroke='%23000' stroke-opacity='0.08'/><line x1='0' y1='55' x2='120' y2='60' stroke='%23000' stroke-opacity='0.06'/><line x1='0' y1='90' x2='120' y2='86' stroke='%23000' stroke-opacity='0.08'/><line x1='0' y1='110' x2='120' y2='113' stroke='%23fff' stroke-opacity='0.10'/>`, 120, 120),
  Canvas: svg(`<path d='M0 15h120M0 45h120M0 75h120M0 105h120M15 0v120M45 0v120M75 0v120M105 0v120' stroke='%23000' stroke-opacity='0.07'/>`),
};
const GRAIN_BG = svg(`<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='120' height='120' filter='url(%23n)'/>`);

/* -------------------------------- hue ring --------------------------------- */

function HueRing({ hue, onHue }: { hue: number; onHue: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const set = (cx: number, cy: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const a = (Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2)) * 180) / Math.PI;
    onHue(Math.round((a + 360) % 360));
  };
  const dot = (h: number, R: number) => {
    const a = ((h - 90) * Math.PI) / 180;
    return { left: `${50 + Math.cos(a) * R}%`, top: `${50 + Math.sin(a) * R}%` };
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        ref={ref}
        role="slider" tabIndex={0} aria-label="Tint hue" aria-valuenow={hue} aria-valuemin={0} aria-valuemax={359}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); set(e.clientX, e.clientY); }}
        onPointerMove={(e) => e.buttons === 1 && set(e.clientX, e.clientY)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") onHue((hue + 5) % 360);
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") onHue((hue + 355) % 360);
        }}
        title="Tint hue — drag around the ring"
        className="knob-focus relative h-[92px] w-[92px] cursor-pointer touch-none rounded-full"
        style={{ background: "conic-gradient(#ff5d5d,#ffb84d,#f5e65c,#7ddc7d,#5cb8ff,#8d7bff,#e07bff,#ff5d5d)" }}
      >
        <div className="absolute inset-[13px] rounded-full bg-[#16130f]" />
        <div className="absolute inset-[13px] flex flex-col items-center justify-center rounded-full">
          <span className="font-mono text-[15px] font-semibold text-stone-100">{hue}°</span>
          <span className="text-[10px] text-stone-500">{nearestHue(hue)[1]}</span>
        </div>
        {HUES.map(([h, n]) => (
          <button key={n} onClick={() => onHue(h)} title={`${n} · ${h}°`} aria-label={`Hue ${n}`}
            style={dot(h, 42)} className="absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/60"
          >
            <span className="block h-full w-full rounded-full" style={{ background: `hsl(${h} 80% 62%)` }} />
          </button>
        ))}
        <span style={dot(hue, 42)} className="pointer-events-none absolute h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white shadow" />
      </div>
      <div className="text-center leading-tight">
        <div className="text-[11px] font-medium text-stone-300">Hue</div>
        <div className="font-mono text-[11px] text-stone-500">7 landmarks</div>
      </div>
    </div>
  );
}

/* ------------------------------ live preview ------------------------------- */

function Preview({ look }: { look: Look }) {
  const m = MODES.find((x) => x.name === look.mode)!;
  const dark = look.mode === "Dim" || look.mode === "Dark";
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#2c2620]" style={{ background: m.page }}>
      {/* tint */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `hsl(${look.hue} 55% 55%)`, opacity: (look.strength / 100) * (dark ? 0.4 : 0.32) }} />
      {look.tex !== "None" && <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: TEX_BG[look.tex], opacity: look.texOp / 100 }} />}
      {look.grain !== "Off" && (
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN_BG, opacity: look.grainIn / 100 / 2.2, mixBlendMode: dark ? "screen" : "multiply" }} />
      )}
      {look.grain === "Animated" && (
        <motion.div className="pointer-events-none absolute -inset-4" style={{ backgroundImage: GRAIN_BG, opacity: look.grainIn / 100 / 3, mixBlendMode: dark ? "screen" : "multiply" }}
          animate={{ x: [0, -8, 4, 0], y: [0, 5, -6, 0] }} transition={{ duration: 0.9, repeat: Infinity }} />
      )}
      <div className="relative mx-auto max-w-[430px] px-8 py-6" style={{ fontSize: `${15 * (look.size / 100)}px`, lineHeight: look.lines / 100 }}>
        <div className="flex items-center justify-between font-mono" style={{ color: m.muted, fontSize: 10.5 }}>
          <span className="tracking-widest uppercase">Pride and Prejudice</span>
          <span>ch. 1</span>
        </div>
        <p className="mt-3 font-serif" style={{ color: m.ink }}>
          <span className="float-left mr-2 font-serif leading-[0.9]" style={{ fontSize: "2.6em" }}>I</span>t is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.
        </p>
        <p className="mt-2 font-serif" style={{ color: m.ink }}>However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families…</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-[2px] flex-1 rounded-full" style={{ background: `${m.muted}44` }}>
            <div className="h-full w-[34%] rounded-full" style={{ background: m.muted }} />
          </div>
          <span className="font-mono" style={{ color: m.muted, fontSize: 10.5 }}>34%</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- shipped tower replica ------------------------- */

function ShippedTower({ look, set }: { look: Look; set: (p: Partial<Look>) => void }) {
  const [folds, setFolds] = useState({ presets: false, colour: true, text: false, tex: false, grain: false });
  const flip = (k: keyof typeof folds) => setFolds((f) => ({ ...f, [k]: !f[k] }));
  const Fold = ({ k, title, summary, children }: { k: keyof typeof folds; title: string; summary: string; children?: React.ReactNode }) => (
    <div className="border-b border-white/6 last:border-0">
      <button onClick={() => flip(k)} className="flex h-6 w-full items-center gap-1.5 px-1 text-left hover:bg-white/4">
        {folds[k] ? <ChevronDown size={12} className="text-stone-500" /> : <ChevronRight size={12} className="text-stone-500" />}
        <span className="text-[12px] text-stone-200">{title}</span>
        {!folds[k] && <span className="ml-auto truncate font-mono text-[10.5px] text-stone-500">{summary}</span>}
      </button>
      {folds[k] && <div className="space-y-2 px-1 pt-1 pb-2.5">{children}</div>}
    </div>
  );
  const Dial = ({ label, value, min, max, fmt, on }: { label: string; value: number; min: number; max: number; fmt: (v: number) => string; on: (v: number) => void }) => (
    <div className="flex h-5 items-center gap-2">
      <span className="w-16 shrink-0 truncate text-[12px] text-stone-500">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => on(Number(e.target.value))} className="demo-range min-w-0 flex-1" aria-label={label} />
      <span className="w-[52px] shrink-0 text-right font-mono text-[11.5px] text-stone-200">{fmt(value)}</span>
    </div>
  );
  return (
    <div className="mx-auto w-[300px] overflow-hidden rounded-xl border border-[#3a332b] bg-[#211c16]">
      <div className="slim-scroll max-h-[418px] overflow-y-auto p-2.5">
        <Fold k="presets" title="Presets" summary="Unsaved look">
          <div className="grid grid-cols-4 gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => set(p.look)} className="overflow-hidden rounded-md border border-white/10">
                <span className="block h-8" style={{ background: MODES.find((m) => m.name === p.look.mode)!.page }} />
                <span className="block bg-black/30 py-0.5 text-center font-mono text-[8px] tracking-wide text-stone-400 uppercase">{p.name}</span>
              </button>
            ))}
          </div>
          <p className="font-mono text-[10px] text-rose-300/80">§6.2 lives here: Cinema orphaned on row 2</p>
        </Fold>
        <Fold k="colour" title="Mode & colour" summary={`${look.mode} · ${look.hue}°`}>
          <div className="grid grid-cols-4 gap-1">
            {MODES.map((m) => (
              <button key={m.name} onClick={() => set({ mode: m.name })} className={cn("flex flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px]", look.mode === m.name ? "bg-[#f5b83d]/15 text-[#f5b83d]" : "text-stone-400 hover:bg-white/6")}>
                {m.icon}{m.name}
              </button>
            ))}
          </div>
          <Dial label="Strength" value={look.strength} min={0} max={100} fmt={(v) => `${v}%`} on={(v) => set({ strength: v })} />
          <Dial label="Hue" value={look.hue} min={0} max={359} fmt={(v) => `${v}°`} on={(v) => set({ hue: v })} />
        </Fold>
        <Fold k="text" title="Text" summary={`${look.size}% · ${(look.lines / 100).toFixed(1)}×`}>
          <Dial label="Size" value={look.size} min={80} max={140} fmt={(v) => `${v}%`} on={(v) => set({ size: v })} />
          <Dial label="Lines" value={look.lines} min={100} max={200} fmt={(v) => `${(v / 100).toFixed(1)}×`} on={(v) => set({ lines: v })} />
        </Fold>
        <Fold k="tex" title="Page texture" summary={look.tex === "None" ? "None" : `${look.tex} · ${look.texOp}%`}>
          <div className="grid grid-cols-4 gap-1">
            {(["None", "Paper", "Fiber", "Canvas"] as Tex[]).map((t) => (
              <button key={t} onClick={() => set({ tex: t })} className={cn("rounded-md py-1 text-[10.5px]", look.tex === t ? "bg-[#f5b83d]/15 text-[#f5b83d]" : "text-stone-400 hover:bg-white/6")}>{t}</button>
            ))}
          </div>
          {look.tex !== "None" && <Dial label="Opacity" value={look.texOp} min={0} max={100} fmt={(v) => `${v}%`} on={(v) => set({ texOp: v })} />}
        </Fold>
        <Fold k="grain" title="Film grain" summary={look.grain === "Off" ? "Off" : `${look.grain} · ${look.grainIn}%`}>
          <div className="grid grid-cols-3 gap-1">
            {(["Off", "Static", "Animated"] as Grain[]).map((g) => (
              <button key={g} onClick={() => set({ grain: g, grainIn: g !== "Off" && look.grainIn === 0 ? 25 : look.grainIn })} className={cn("rounded-md py-1 text-[10.5px]", look.grain === g ? "bg-[#f5b83d]/15 text-[#f5b83d]" : "text-stone-400 hover:bg-white/6")}>{g}</button>
            ))}
          </div>
          {look.grain !== "Off" && <Dial label="Intensity" value={look.grainIn} min={0} max={100} fmt={(v) => `${v}%`} on={(v) => set({ grainIn: v })} />}
        </Fold>
      </div>
      <div className="border-t border-white/8 px-3 py-2">
        <p className="text-[11px] text-stone-500">Split view <span className="text-stone-600">· pinned footer · grain stays shared</span></p>
      </div>
    </div>
  );
}

/* ------------------------------- knob console ------------------------------- */

function Console({ look, set }: { look: Look; set: (p: Partial<Look>) => void }) {
  const [tab, setTab] = useState<"look" | "text" | "page" | "sets">("look");
  const seg = (opts: string[], v: string, on: (s: string) => void) => (
    <div className="flex gap-1 rounded-lg bg-black/25 p-1">
      {opts.map((o) => (
        <button key={o} onClick={() => on(o)} className={cn("flex-1 rounded-md py-1.5 text-[11.5px] font-medium transition-colors", v === o ? "bg-[#f5b83d] text-[#14100a]" : "text-stone-400 hover:text-stone-200")}>{o}</button>
      ))}
    </div>
  );
  return (
    <div className="mx-auto w-[min(340px,100%)] overflow-hidden rounded-2xl border border-[#f5b83d]/25 bg-[#1c1813] shadow-[0_18px_44px_rgba(0,0,0,0.5)]">
      <div className="flex gap-1 border-b border-white/8 p-2">
        {(["look", "text", "page", "sets"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-lg py-1.5 text-[12px] font-semibold capitalize", tab === t ? "bg-white/10 text-stone-100" : "text-stone-500 hover:text-stone-300")}>
            {t === "sets" ? "Presets" : t}
          </button>
        ))}
      </div>
      <div className="min-h-[318px] p-3.5">
        {tab === "look" && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-1.5">
              {MODES.map((m) => (
                <button key={m.name} onClick={() => set({ mode: m.name })} className={cn("flex flex-col items-center gap-1 rounded-lg border py-2 text-[10.5px] font-medium", look.mode === m.name ? "border-[#f5b83d]/60 bg-[#f5b83d]/10 text-[#f5b83d]" : "border-transparent text-stone-400 hover:bg-white/6")}>
                  {m.icon}{m.name}
                </button>
              ))}
            </div>
            <div className="flex items-start justify-around rounded-xl bg-black/20 px-1 py-3">
              <HueRing hue={look.hue} onHue={(h) => set({ hue: h, strength: look.strength === 0 ? 18 : look.strength })} />
              <Knob label="Strength" value={look.strength} onChange={(v) => set({ strength: v })} display={`${look.strength}%`} />
              <Knob label="Size" value={look.size} min={80} max={140} onChange={(v) => set({ size: v })} display={`${look.size}%`} />
            </div>
            <p className="text-center font-mono text-[10.5px] text-stone-500">3 dials, 1 row · hue ring carries the 7 landmarks</p>
          </div>
        )}
        {tab === "text" && (
          <div className="space-y-3">
            <div className="flex items-start justify-around rounded-xl bg-black/20 px-1 py-3">
              <Knob label="Size" value={look.size} min={80} max={140} onChange={(v) => set({ size: v })} display={`${look.size}%`} />
              <Knob label="Lines" value={look.lines} min={100} max={200} onChange={(v) => set({ lines: v })} display={`${(look.lines / 100).toFixed(2)}`} />
              <Knob label="Gaps" value={50} onChange={() => {}} display="0.50" />
            </div>
            <div className="space-y-2 rounded-xl bg-black/20 p-3">
              <Switch on={true} onFlip={() => {}} label="Override book font" />
              <Switch on={false} onFlip={() => {}} label="Override book layout" />
            </div>
            <p className="text-center font-mono text-[10.5px] text-stone-500">quick dials stay; the rest lives in Settings</p>
          </div>
        )}
        {tab === "page" && (
          <div className="space-y-3">
            {seg(["None", "Paper", "Fiber", "Canvas"], look.tex, (s) => set({ tex: s as Tex }))}
            <div className="flex items-start justify-around rounded-xl bg-black/20 px-1 py-3">
              <Knob label="Opacity" value={look.texOp} onChange={(v) => set({ texOp: v })} display={look.tex === "None" ? "—" : `${look.texOp}%`} />
              <Knob label="Grain" value={look.grainIn} onChange={(v) => set({ grainIn: v, grain: v === 0 ? "Off" : look.grain === "Off" ? "Static" : look.grain })} display={look.grain === "Off" ? "Off" : `${look.grainIn}%`} accent="#7cc4ff" />
            </div>
            {seg(["Off", "Static", "Animated"], look.grain, (s) => set({ grain: s as Grain, grainIn: s !== "Off" && look.grainIn === 0 ? 25 : look.grainIn }))}
            <p className="text-center font-mono text-[10.5px] text-stone-500">grain knob doubles as its switch · 0 = Off</p>
          </div>
        )}
        {tab === "sets" && (
          <div className="space-y-2">
            {PRESETS.map((p) => {
              const active = JSON.stringify(p.look) === JSON.stringify(look);
              return (
                <button key={p.name} onClick={() => set(p.look)} className={cn("flex w-full items-center gap-2.5 rounded-xl border p-2 text-left", active ? "border-[#f5b83d]/60 bg-[#f5b83d]/8" : "border-white/8 hover:border-white/20")}>
                  <span className="h-9 w-12 shrink-0 overflow-hidden rounded-md border border-black/40" style={{ background: MODES.find((m) => m.name === p.look.mode)!.page }}>
                    <span className="mx-1.5 mt-1.5 block h-[3px] rounded-full" style={{ background: MODES.find((m) => m.name === p.look.mode)!.muted }} />
                    <span className="mx-1.5 mt-1 block h-[3px] w-2/3 rounded-full" style={{ background: MODES.find((m) => m.name === p.look.mode)!.muted }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-stone-100">{p.name}</span>
                    <span className="block truncate font-mono text-[10.5px] text-stone-500">{p.look.mode} · {p.look.hue}° · {p.look.strength}% · {p.look.tex}{p.look.grain !== "Off" ? ` · ${p.look.grain}` : ""}</span>
                  </span>
                  {active && <Check size={14} className="shrink-0 text-[#f5b83d]" />}
                </button>
              );
            })}
            <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2 text-[12.5px] text-stone-400 hover:border-[#f5b83d]/50 hover:text-[#f5b83d]">
              <Plus size={13} /> Save current look
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- lab ----------------------------------- */

export default function AppearanceLab() {
  const [look, setLook] = useState<Look>(PRESETS[1].look);
  const set = (p: Partial<Look>) => setLook((l) => ({ ...l, ...p }));
  const activePreset = PRESETS.find((p) => JSON.stringify(p.look) === JSON.stringify(look))?.name ?? "Custom";

  return (
    <div className="space-y-5">
      <CiteTag cite={SOURCES.appearance} />
      <VerdictCard verdict={VERDICTS.appearance} />

      <Panel label={`live page — both panels below drive this · now showing “${activePreset}”`}>
        <div className="grid gap-3 p-3 md:p-4 lg:grid-cols-[1fr_220px]">
          <Preview look={look} />
          <div>
            <div className="mb-2 font-mono text-[11px] tracking-wider text-stone-500 uppercase">Preset rail · 5-across, centered</div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col">
              {PRESETS.map((p) => {
                const active = p.name === activePreset;
                return (
                  <button key={p.name} onClick={() => set(p.look)} className={cn("flex min-w-[150px] flex-1 items-center gap-2 rounded-xl border p-2 text-left lg:min-w-0", active ? "border-[#f5b83d]/60 bg-[#f5b83d]/8" : "border-white/8 hover:border-white/20")}>
                    <span className="h-8 w-10 shrink-0 rounded-md border border-black/40" style={{ background: MODES.find((m) => m.name === p.look.mode)!.page }} />
                    <span>
                      <span className="block text-[12.5px] font-semibold text-stone-100">{p.name}</span>
                      <span className="block font-mono text-[10px] text-stone-500">{p.look.mode} · {p.look.hue}°</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-stone-500">fixes §6.2: no orphan tile — rail scrolls instead of wrapping 4+1</p>
          </div>
        </div>
      </Panel>

      <Duel
        before={<Panel><div className="p-4"><ShippedTower look={look} set={set} /><p className="pt-3 text-center font-mono text-[11px] text-stone-500">300px tower · 5 folds · each dial burns a full row · scrolls to 512</p></div></Panel>}
        after={<Panel><div className="p-4"><Console look={look} set={set} /><p className="pt-3 text-center font-mono text-[11px] text-stone-500">4 tabs · 6 numbers fit one row of knobs · nothing scrolls</p></div></Panel>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SpaceMeter
          rows={[
            { label: "Panel height to reach Grain", before: 512, after: 430, unit: "px" },
            { label: "Rows for 6 numeric dials", before: 6, after: 2, unit: "" },
            { label: "Clicks: preset → Cinema", before: 2, after: 1, unit: "" },
          ]}
        />
        <div className="space-y-3">
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why knobs, honestly.</span> A slider row spends ~250px of width to say one number. Six numbers × full rows is the tower. Knobs aren't nostalgia — they're density with a physical metaphor readers already know from audio gear, and they keep label + control + value in a 76px column. Sliders stay where length <em>means</em> something (seek, zoom); for scalar taste-dials, knobs win.
          </div>
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why the hue ring.</span> The shipped hue slider is a number line for a circle — 359° sits next to 0° but the control puts them at opposite ends. The ring restores the topology, keeps all 7 shipped landmarks as clickable dots, and absorbs the “hue picked at zero strength shows nothing” trap by auto-raising strength to 18 (the <span className="font-mono text-[12px] text-stone-400">STRENGTH_ON_HUE</span> rule, kept, just visible now).
          </div>
        </div>
      </div>
    </div>
  );
}
