import { useEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { ChevronDown, Circle, Moon, Menu, Palette, PanelLeft, Plus, Search, Sun, SunDim, Type, Layers, Droplets } from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { IconButton, Range, Segmented, Surface, Switch, Tip } from "../ui/kit";
import { Knob } from "../ui/Knob";
import { cn } from "../utils/cn";
import { tintedTok, tokenVars, type Base } from "../theme";

/* ═════ model — mirrors mareader_appearance::Appearance (+ the text dials of QuickText) ═════ */
type Texture = "none" | "paper" | "lined" | "grid" | "dotted" | "cross";
type Noise = "off" | "static" | "animated";
type Look = {
  base: Base;
  hue: number;
  strength: number; // shown 0–100 % (stored 0–50)
  ink: number;
  texture: Texture;
  texOpacity: number;
  texScale: number;
  noise: Noise;
  grain: number;
  size: number;
  lines: number;
  gaps: number;
  overrideFont: boolean;
  overrideLayout: boolean;
};
const DEFAULT: Look = {
  base: "light", hue: 40, strength: 56, ink: 50, texture: "paper", texOpacity: 85, texScale: 110,
  noise: "static", grain: 18, size: 100, lines: 1.5, gaps: 1, overrideFont: false, overrideLayout: false,
};
const PRESETS: { id: string; name: string; look: Partial<Look> }[] = [
  { id: "sepia", name: "Sepia", look: { base: "light", hue: 34, strength: 46, texture: "none", noise: "off" } },
  { id: "green", name: "Green", look: { base: "light", hue: 104, strength: 40, texture: "none", noise: "off" } },
  { id: "night", name: "Night", look: { base: "dark", hue: 110, strength: 36, texture: "none", noise: "off" } },
  { id: "parchment", name: "Parchment", look: { base: "light", hue: 40, strength: 56, texture: "paper", texOpacity: 85, texScale: 110, noise: "static", grain: 18 } },
  { id: "cinema", name: "Cinema", look: { base: "dim", hue: 220, strength: 30, texture: "none", noise: "animated", grain: 30 } },
];
const HUES: [number, string][] = [[34, "Sepia"], [14, "Rose"], [104, "Green"], [160, "Mint"], [200, "Sky"], [240, "Blue"], [290, "Violet"]];
const MODE_ICON = { light: Sun, dark: Moon, dim: SunDim, black: Circle } as const;
const MODES: { value: Base; label: string }[] = [
  { value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "dim", label: "Dim" }, { value: "black", label: "Black" },
];
const hueName = (h: number) => {
  let best = HUES[0];
  for (const x of HUES) if (Math.abs(x[0] - h) < Math.abs(best[0] - h)) best = x;
  return Math.abs(best[0] - h) <= 12 ? best[1] : `${h}°`;
};
const hueColour = (h: number) => `hsl(${h} 60% 55%)`;
const hueStrip = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => hueColour(i * 30)).join(", ")})`;

/* ═════ the preview both popovers drive ═════ */
function Pattern({ look }: { look: Look }): CSSProperties | undefined {
  const o = (look.texOpacity / 100) * 0.35;
  const s = (look.texScale / 100) * 24;
  const c = `color-mix(in oklab, var(--ink) ${o * 100}%, transparent)`;
  switch (look.texture) {
    case "lined": return { backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${s - 1}px, ${c} ${s - 1}px ${s}px)` };
    case "grid": return { backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: `${s}px ${s}px` };
    case "dotted": return { backgroundImage: `radial-gradient(${c} 1.2px, transparent 1.4px)`, backgroundSize: `${s}px ${s}px` };
    case "cross": return { backgroundImage: `linear-gradient(45deg, transparent 49%, ${c} 49% 51%, transparent 51%), linear-gradient(-45deg, transparent 49%, ${c} 49% 51%, transparent 51%)`, backgroundSize: `${s}px ${s}px` };
    default: return undefined;
  }
}

function MiniReader({ look, className }: { look: Look; className?: string }) {
  const tok = useMemo(() => tintedTok(look.base, look.hue, look.strength), [look.base, look.hue, look.strength]);
  const para = "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.";
  const inkMix = look.base === "black" ? undefined : `color-mix(in oklab, var(--ink) ${40 + look.ink}%, var(--paper))`;
  return (
    <div
      style={{ ...tokenVars(tok), ["--grain" as string]: (look.texOpacity / 100) * 0.55, ["--gsz" as string]: `${(look.texScale / 100) * 220}px` }}
      className={cn("relative flex flex-col overflow-hidden rounded-xl border border-line bg-paper text-ink transition-colors duration-150", className)}
    >
      <div className="relative z-10 flex h-9 shrink-0 items-center gap-0.5 border-b border-line bg-surface px-2">
        <PanelLeft size={15} className="mx-1.5" />
        <Search size={15} className="mx-1.5" />
        <span className="mx-auto truncate text-[12px] font-medium">Pride and Prejudice, by Jane Austen</span>
        <Palette size={15} className="mx-1.5 text-accent" />
        <Menu size={15} className="mx-1.5" />
      </div>
      <div className={cn("relative flex-1 px-7 py-5", look.texture === "paper" && "grain")} style={Pattern({ look })}>
        <div className="relative z-10 columns-2 gap-8 font-serif text-justify" style={{ fontSize: 11.5 * (look.size / 100), lineHeight: look.lines, color: inkMix }}>
          <p className="mb-[var(--gp)] indent-4" style={{ ["--gp" as string]: `${look.gaps}em` }}>
            It is a truth <mark className="rounded-[2px] bg-accent-soft px-px text-inherit">universally acknowledged</mark>
            {para.slice(para.indexOf(","))}
          </p>
          <p className="indent-4">{para}</p>
          <p className="mt-[var(--gp)] indent-4" style={{ ["--gp" as string]: `${look.gaps}em` }}>{para.slice(60)}</p>
        </div>
        {look.noise !== "off" && (
          <div aria-hidden className={cn("film pointer-events-none absolute inset-0 z-20", look.noise === "animated" && "film-anim")} style={{ opacity: (look.grain / 100) * 0.6 }} />
        )}
      </div>
      <div className="absolute right-3 bottom-2 z-30 rounded-full bg-surface/90 px-2.5 py-0.5 text-[11px] text-muted">2 / 234</div>
    </div>
  );
}

/* ═════ preset card (shared) ═════ */
function PresetCard({ name, look, on, onClick, w = 52, compact }: { name: string; look: Partial<Look>; on: boolean; onClick: () => void; w?: number; compact?: boolean }) {
  const l = { ...DEFAULT, ...look };
  const tok = tintedTok(l.base, l.hue, l.strength);
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={name} className="group flex shrink-0 flex-col items-center gap-1 outline-none">
      <span
        style={{ ...tokenVars(tok), width: w, height: w * 1.25 }}
        className={cn(
          "relative block overflow-hidden rounded-md border bg-paper transition-shadow",
          on ? "border-accent ring-2 ring-accent/40" : "border-line group-hover:ring-2 group-hover:ring-line group-focus-visible:ring-2 group-focus-visible:ring-accent/50",
          l.texture === "paper" && "grain"
        )}
      >
        <span className="absolute inset-x-1.5 top-2 flex flex-col gap-[3px]" aria-hidden>
          {[100, 88, 94, 70, 96, 60].map((x, i) => (<span key={i} className="h-[2px] rounded bg-ink/45" style={{ width: `${x}%` }} />))}
        </span>
        <span className="absolute inset-x-0 top-0 h-1.5 bg-surface" />
      </span>
      {!compact && <span className={cn("whitespace-nowrap text-[11px] leading-none", on ? "font-medium text-ink" : "text-muted")}>{name}</span>}
    </button>
  );
}

/* ═════════════ TODAY — appearance_menu.rs (WIDTH 300, NAME_W 64, VALUE_W 52, HEADER 24, MAX_HEIGHT 512) ═════════════ */

function Fold({ title, summary, open, onToggle, action, children }: { title: string; summary: string; open: boolean; onToggle: () => void; action?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex h-6 items-center">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex h-6 flex-1 items-center gap-1.5 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          <ChevronDown size={14} className={cn("text-muted transition-transform", !open && "-rotate-90")} />
          <span className="text-[14px] font-medium">{title}</span>
          {!open && <span className="ml-auto truncate pr-1 text-[12px] text-muted">{summary}</span>}
        </button>
        {action}
      </div>
      {open && <div className="flex flex-col gap-1.5 pt-1.5 pb-1">{children}</div>}
    </div>
  );
}
function TRow({ label, children, value }: { label: string; children: ReactNode; value: string }) {
  return (
    <div className="flex h-5 items-center gap-2">
      <span className="w-16 shrink-0 text-[14px]">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
      <span className="w-[52px] shrink-0 rounded-md border border-line px-1 py-px text-center text-[12px] tabular-nums text-muted">{value}</span>
    </div>
  );
}
const sep = <div className="my-1.5 h-px bg-line" />;

export function TodayPopover({ look, set, onHeight }: { look: Look; set: (p: Partial<Look>) => void; onHeight?: (h: number) => void }) {
  const [open, setOpen] = useState({ presets: true, colour: true, text: false, texture: false, grain: false });
  const tg = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !onHeight) return;
    const ro = new ResizeObserver(() => onHeight(ref.current!.offsetHeight));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [onHeight]);
  const picked = PRESETS.find((p) => ({ ...DEFAULT, ...p.look }).hue === look.hue && ({ ...DEFAULT, ...p.look }).base === look.base && ({ ...DEFAULT, ...p.look }).strength === look.strength);
  return (
    <Surface className="w-[300px] p-2.5" style={{}}>
      <div ref={ref}>
        <div className="max-h-[512px] overflow-y-auto pr-0.5">
          <Fold title="Presets" summary={picked?.name ?? "Unsaved look"} open={open.presets} onToggle={() => tg("presets")} action={<IconButton icon={Plus} label="Save current look" size="xs" />}>
            <div className="grid grid-cols-5 justify-items-center gap-1">
              {PRESETS.map((p) => (<PresetCard key={p.id} name={p.name} look={p.look} w={44} on={picked?.id === p.id} onClick={() => set(p.look)} />))}
            </div>
          </Fold>
          {sep}
          <Fold title="Mode & colour" summary={`${look.base[0].toUpperCase() + look.base.slice(1)} · ${hueName(look.hue)} ${look.strength}%`} open={open.colour} onToggle={() => tg("colour")}>
            <Segmented<Base> items={MODES.map((m) => ({ ...m, icon: MODE_ICON[m.value] }))} value={look.base} onChange={(base) => set({ base })} />
            <TRow label="Hue" value={`${look.hue}°`}>
              <div className="relative h-4 rounded-full" style={{ background: hueStrip }}>
                <input aria-label="Hue" type="range" min={0} max={360} value={look.hue} onChange={(e) => set({ hue: +e.target.value, strength: look.strength === 0 ? 36 : look.strength })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                <span className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${(look.hue / 360) * 100}%`, background: hueColour(look.hue) }} />
              </div>
            </TRow>
            <div className="flex items-center gap-2 pl-[72px] pr-[60px]">
              <div className="flex flex-1 justify-between">
                {HUES.map(([h, n]) => (
                  <Tip key={n} label={n}>
                    <button aria-label={n} onClick={() => set({ hue: h, strength: look.strength === 0 ? 36 : look.strength })} className={cn("size-5 rounded-full border border-black/10", look.hue === h && "ring-2 ring-ink ring-offset-1 ring-offset-surface")} style={{ background: hueColour(h) }} />
                  </Tip>
                ))}
              </div>
            </div>
            <TRow label="Strength" value={`${look.strength}%`}><Range label="Strength" value={look.strength} min={0} max={100} onChange={(strength) => set({ strength })} /></TRow>
            <TRow label="Ink" value={`${look.ink}%`}><Range label="Ink" value={look.ink} min={0} max={100} onChange={(ink) => set({ ink })} /></TRow>
          </Fold>
          {sep}
          <Fold title="Text" summary={`${look.size}% · ${look.lines.toFixed(1)}×`} open={open.text} onToggle={() => tg("text")}>
            <TRow label="Size" value={`${look.size}%`}><Range label="Size" value={look.size} min={60} max={200} step={5} onChange={(size) => set({ size })} /></TRow>
            <TRow label="Lines" value={`${look.lines.toFixed(1)}×`}><Range label="Lines" value={look.lines} min={1} max={2.4} step={0.1} onChange={(lines) => set({ lines })} /></TRow>
            <TRow label="Gaps" value={look.gaps.toFixed(2)}><Range label="Gaps" value={look.gaps} min={0} max={2} step={0.25} onChange={(gaps) => set({ gaps })} /></TRow>
            <div className="flex items-center justify-between text-[14px]"><span>Override book font</span><Switch on={look.overrideFont} onChange={(overrideFont) => set({ overrideFont })} label="Override book font" /></div>
            <div className="flex items-center justify-between text-[14px]"><span>Override book layout</span><Switch on={look.overrideLayout} onChange={(overrideLayout) => set({ overrideLayout })} label="Override book layout" /></div>
          </Fold>
          {sep}
          <Fold title="Page texture" summary={look.texture === "none" ? "None" : `${look.texture} · ${look.texOpacity}%`} open={open.texture} onToggle={() => tg("texture")}>
            <Segmented<Texture> height={48} items={(["none", "paper", "lined", "grid", "dotted", "cross"] as Texture[]).map((v) => ({ value: v, label: v === "paper" ? "Real paper" : v[0].toUpperCase() + v.slice(1) }))} value={look.texture} onChange={(texture) => set({ texture })} className="[&>span]:hidden [&_button]:!text-[13px]" />
            {look.texture !== "none" && (<>
              <TRow label="Opacity" value={`${look.texOpacity}%`}><Range label="Opacity" value={look.texOpacity} min={0} max={100} onChange={(texOpacity) => set({ texOpacity })} /></TRow>
              <TRow label="Scale" value={`${look.texScale}%`}><Range label="Scale" value={look.texScale} min={25} max={400} onChange={(texScale) => set({ texScale })} /></TRow>
            </>)}
          </Fold>
          {sep}
          <Fold title="Film grain" summary={look.noise === "off" ? "Off" : `${look.noise} · ${look.grain}%`} open={open.grain} onToggle={() => tg("grain")}>
            <Segmented<Noise> items={[{ value: "off", label: "Off" }, { value: "static", label: "Static" }, { value: "animated", label: "Animated" }]} value={look.noise} onChange={(noise) => set({ noise, grain: look.grain === 0 ? 25 : look.grain })} />
            {look.noise !== "off" && <TRow label="Intensity" value={`${look.grain}%`}><Range label="Intensity" value={look.grain} min={0} max={100} onChange={(grain) => set({ grain })} /></TRow>}
          </Fold>
        </div>
      </div>
    </Surface>
  );
}

/* ═════════════ PROPOSED — Dial deck ═════════════ */

function HueRing({ hue, onChange, size = 112 }: { hue: number; onChange: (h: number) => void; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const from = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    onChange(Math.round(((a * 180) / Math.PI + 90 + 360) % 360));
  };
  const thick = 16;
  const a = ((hue - 90) * Math.PI) / 180;
  const R = size / 2 - thick / 2;
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={hue}
      aria-valuetext={`${hueName(hue)}, ${hue} degrees`}
      onKeyDown={(e) => {
        const d = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange((hue + d) % 360); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange((hue - d + 360) % 360); }
      }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); active.current = true; from(e); }}
      onPointerMove={(e) => active.current && from(e)}
      onPointerUp={() => (active.current = false)}
      className="relative shrink-0 cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      style={{
        width: size, height: size,
        background: `conic-gradient(from 0deg, ${Array.from({ length: 13 }, (_, i) => hueColour(i * 30)).join(", ")})`,
        WebkitMask: `radial-gradient(circle, transparent ${size / 2 - thick - 0.5}px, #000 ${size / 2 - thick}px)`,
        mask: `radial-gradient(circle, transparent ${size / 2 - thick - 0.5}px, #000 ${size / 2 - thick}px)`,
      }}
    >
      <span
        className="absolute size-[22px] rounded-full border-[3px] border-white shadow-[0_1px_4px_rgba(0,0,0,.4)]"
        style={{ left: size / 2 + R * Math.cos(a) - 11, top: size / 2 + R * Math.sin(a) - 11, background: hueColour(hue) }}
      />
    </div>
  );
}

function Tile({ v, on, onClick }: { v: Texture; on: boolean; onClick: () => void }) {
  const look = { ...DEFAULT, texture: v, texOpacity: 70, texScale: 60 };
  return (
    <Tip label={v === "paper" ? "Real paper" : v === "none" ? "No texture" : v[0].toUpperCase() + v.slice(1)}>
      <button
        aria-label={v}
        aria-pressed={on}
        onClick={onClick}
        className={cn("relative size-[42px] overflow-hidden rounded-lg border bg-paper outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-accent/50", on ? "border-accent ring-2 ring-accent/40" : "border-line hover:ring-2 hover:ring-line", v === "paper" && "grain")}
        style={Pattern({ look })}
      >
        {v === "none" && <span className="absolute inset-0 grid place-items-center text-[10px] text-muted">None</span>}
      </button>
    </Tip>
  );
}

export function DialDeck({ look, set, onHeight }: { look: Look; set: (p: Partial<Look>) => void; onHeight?: (h: number) => void }) {
  const [tab, setTab] = useState<"colour" | "surface" | "text">("colour");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !onHeight) return;
    const ro = new ResizeObserver(() => onHeight(ref.current!.offsetHeight));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [onHeight]);
  const picked = PRESETS.find((p) => ({ ...DEFAULT, ...p.look }).hue === look.hue && ({ ...DEFAULT, ...p.look }).base === look.base && ({ ...DEFAULT, ...p.look }).strength === look.strength)?.id;
  return (
    <Surface className="w-[300px] p-3">
      <div ref={ref} className="flex flex-col gap-2.5">
        {/* presets: always visible, one scrolling row */}
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none]" role="group" aria-label="Presets">
          {PRESETS.map((p) => (<PresetCard key={p.id} name={p.name} look={p.look} on={picked === p.id} onClick={() => set(p.look)} w={46} />))}
          <Tip label="Save current look"><button aria-label="Save current look" className="grid h-[57px] w-[46px] shrink-0 place-items-center rounded-md border border-dashed border-line text-muted outline-none hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50"><Plus size={16} /></button></Tip>
        </div>
        <Segmented<Base> height={30} items={MODES.map((m) => ({ ...m, icon: MODE_ICON[m.value] }))} value={look.base} onChange={(base) => set({ base })} ariaLabel="Mode" />
        <div className="flex gap-1 border-b border-line">
          {([["colour", "Colour", Droplets], ["surface", "Surface", Layers], ["text", "Text", Type]] as const).map(([k, n, I]) => (
            <button key={k} onClick={() => setTab(k)} role="tab" aria-selected={tab === k} className={cn("-mb-px flex h-7 flex-1 items-center justify-center gap-1.5 border-b-2 text-[13px] outline-none transition-colors focus-visible:bg-hover", tab === k ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink")}>
              <I size={13} />{n}
            </button>
          ))}
        </div>
        <div className="h-[132px]">
          {tab === "colour" && (
            <div className="pop-in flex items-center gap-3">
              <div className="relative">
                <HueRing hue={look.hue} onChange={(hue) => set({ hue, strength: look.strength === 0 ? 36 : look.strength })} />
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center leading-tight">
                  <div><div className="text-[13px] font-medium">{hueName(look.hue)}</div><div className="text-[11px] tabular-nums text-muted">{look.hue}°</div></div>
                </div>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2.5">
                <div className="flex gap-1">
                  <Knob label="Strength" value={look.strength} def={50} format={(v) => `${v}%`} onChange={(strength) => set({ strength })} size={52} />
                  <Knob label="Ink" value={look.ink} def={50} format={(v) => `${v}%`} onChange={(ink) => set({ ink })} size={52} />
                </div>
                <div className="flex gap-1">
                  {HUES.slice(0, 5).map(([h, n]) => (<Tip key={n} label={n}><button aria-label={n} onClick={() => set({ hue: h })} className={cn("size-4 rounded-full border border-black/10", look.hue === h && "ring-2 ring-ink ring-offset-1 ring-offset-surface")} style={{ background: hueColour(h) }} /></Tip>))}
                </div>
              </div>
            </div>
          )}
          {tab === "surface" && (
            <div className="pop-in flex flex-col gap-2.5">
              <div className="flex justify-between" role="group" aria-label="Page texture">
                {(["none", "paper", "lined", "grid", "dotted", "cross"] as Texture[]).map((v) => (<Tile key={v} v={v} on={look.texture === v} onClick={() => set({ texture: v })} />))}
              </div>
              <div className="flex items-start justify-between">
                <Knob label="Opacity" value={look.texOpacity} def={85} disabled={look.texture === "none"} format={(v) => `${v}%`} onChange={(texOpacity) => set({ texOpacity })} size={48} />
                <Knob label="Scale" value={look.texScale} min={25} max={400} step={5} def={100} disabled={look.texture === "none"} format={(v) => `${v}%`} onChange={(texScale) => set({ texScale })} size={48} />
                <Knob label="Grain" value={look.grain} def={18} disabled={look.noise === "off"} format={(v) => `${v}%`} onChange={(grain) => set({ grain })} size={48} />
                <div className="flex w-[78px] flex-col gap-1 pt-0.5">
                  {(["off", "static", "animated"] as Noise[]).map((n) => (
                    <button key={n} aria-pressed={look.noise === n} onClick={() => set({ noise: n, grain: look.grain === 0 ? 25 : look.grain })} className={cn("h-[15px] rounded px-1.5 text-left text-[11px] leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50", look.noise === n ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover")}>
                      {n === "off" ? "Grain off" : n === "static" ? "Static" : "Animated"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "text" && (
            <div className="pop-in flex flex-col gap-2">
              <div className="flex justify-between px-1">
                <Knob label="Size" value={look.size} min={60} max={200} step={5} def={100} format={(v) => `${v}%`} onChange={(size) => set({ size })} size={52} />
                <Knob label="Lines" value={look.lines} min={1} max={2.4} step={0.1} def={1.5} format={(v) => `${v.toFixed(1)}×`} onChange={(lines) => set({ lines })} size={52} />
                <Knob label="Gaps" value={look.gaps} min={0} max={2} step={0.25} def={1} format={(v) => v.toFixed(2)} onChange={(gaps) => set({ gaps })} size={52} />
              </div>
              <div className="flex gap-1.5">
                {([["overrideFont", "Use my font"], ["overrideLayout", "Use my layout"]] as const).map(([k, n]) => (
                  <button key={k} aria-pressed={look[k]} onClick={() => set({ [k]: !look[k] })} className={cn("h-6 flex-1 rounded-full border text-[12px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50", look[k] ? "border-transparent bg-accent-soft text-accent" : "border-line text-muted hover:bg-hover")}>{n}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Surface>
  );
}

/* ═════════════ PROPOSED — quick strip (lives in the title bar, no popover) ═════════════ */
function QuickStrip({ look, set }: { look: Look; set: (p: Partial<Look>) => void }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-2 shadow-[0_8px_24px_var(--shadow)]">
      <Segmented<Base> height={30} iconOnly items={MODES.map((m) => ({ value: m.value, label: m.label, tip: m.label, icon: MODE_ICON[m.value] }))} value={look.base} onChange={(base) => set({ base })} className="w-[124px]" />
      <div className="h-[18px] w-px bg-line" />
      <div className="flex gap-1.5">
        {HUES.map(([h, n]) => (<Tip key={n} label={n}><button aria-label={n} onClick={() => set({ hue: h, strength: look.strength || 36 })} className={cn("size-[18px] rounded-full border border-black/10", look.hue === h && "ring-2 ring-ink ring-offset-1 ring-offset-surface")} style={{ background: hueColour(h) }} /></Tip>))}
      </div>
      <div className="w-24"><Range label="Strength" value={look.strength} min={0} max={100} onChange={(strength) => set({ strength })} /></div>
      <IconButton icon={Palette} label="All appearance settings" size="md" round active />
    </div>
  );
}

export default function AppearanceSection() {
  const [look, setLook] = useState<Look>(DEFAULT);
  const set = (p: Partial<Look>) => setLook((l) => ({ ...l, ...p }));
  const [h1, setH1] = useState(0);
  const [h2, setH2] = useState(0);
  return (
    <Block
      id="appearance"
      n="05"
      title="Appearance popover"
      verdict="redesign"
      source="appearance_menu.rs · widgets.rs (segments, switch) · crates/appearance"
      lead="The most-used popover in a reading app is also its tallest: five folding groups, every value a full-width slider with a 64 pt label and a 52 pt readout, scrolling inside a 512 pt cap. The controls are all correct — they're just spending space like settings, not like a quick-adjust popover. Both columns below drive the same live reader, so you can feel the difference."
      notes={[
        { kind: "idea", text: "Hue is a circle, so draw a circle: one ring replaces the strip + 7 swatches + readout (three rows), and it can be dragged without aiming at a 4 pt track." },
        { kind: "idea", text: "Knobs earn their place for the 3–4 forgiving 0–100 values (strength, ink, opacity, scale, grain, size, lines, gaps): 52 pt each, three to a row, value always printed. Sliders stay for anything long or precise — the page slider, seek." },
        { kind: "warn", text: <>Knobs are poor for exact entry and for touch. This one is an ARIA slider (arrows, PageUp/Down, Home/End), takes wheel, <b>double-click resets</b> and marks its default with a tick, and a drag is vertical — not circular — so it works with a trackpad. If a touch build ships, keep the sliders there.</> },
        { kind: "ok", text: "Keep presets visible and the pane switches pinned at the foot when split (design.md). Folding is the right idea for a list; for four short groups, tabs avoid the scroll entirely." },
      ]}
    >
      <div className="grid items-start gap-8 xl:grid-cols-[334px_minmax(0,1fr)_334px]">
        <Specimen kind="today" title="Popover" caption={`${h1} pt tall`} bodyClassName="flex justify-center p-4">
          <TodayPopover look={look} set={set} onHeight={setH1} />
        </Specimen>
        <div className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-20">
          <div className="text-[12px] font-medium uppercase tracking-wider text-muted">Live reader</div>
          <MiniReader look={look} className="h-[360px]" />
          <div className="flex justify-center"><QuickStrip look={look} set={set} /></div>
          <div className="text-center text-[12px] text-muted">Quick strip — a third form: the three things people change daily, inline, no popover.</div>
        </div>
        <Specimen kind="proposed" title="Dial deck" caption={`${h2} pt · no scroll`} bodyClassName="flex justify-center p-4">
          <DialDeck look={look} set={set} onHeight={setH2} />
        </Specimen>
      </div>
    </Block>
  );
}
