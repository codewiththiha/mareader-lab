import { useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Eclipse, Moon, Plus, Sun, SunMoon, Type, Palette, Layers } from "lucide-react";
import { Grid, Notes, Section, Specimen } from "../kit/frame";
import { HUES, Knob, Segmented, Switch, TintWheel, hueColour } from "../kit/primitives";
import { cn } from "../kit/cn";

type Base = "Light" | "Dark" | "Dim" | "Black";
type Tex = "None" | "Real paper" | "Lined" | "Grid" | "Dotted" | "Cross";
type Grain = "Off" | "Static" | "Animated";
type A = { base: Base; hue: number; strength: number; ink: number; size: number; lines: number; gaps: number; font: boolean; layout: boolean; tex: Tex; opacity: number; scale: number; grain: Grain; intensity: number; preset: string };
const INIT: A = { base: "Light", hue: 34, strength: 60, ink: 50, size: 100, lines: 1.5, gaps: 0.75, font: false, layout: false, tex: "None", opacity: 40, scale: 100, grain: "Static", intensity: 25, preset: "Sepia" };
const MODES = [{ v: "Light" as Base, label: "Light", icon: Sun }, { v: "Dark" as Base, label: "Dark", icon: Moon }, { v: "Dim" as Base, label: "Dim", icon: SunMoon }, { v: "Black" as Base, label: "Black", icon: Eclipse }];
const TEX: Tex[] = ["None", "Real paper", "Lined", "Grid", "Dotted", "Cross"];
const PRESETS: { name: string; base: Base; hue: number; strength: number; tex?: Tex }[] = [
  { name: "Sepia", base: "Light", hue: 34, strength: 60 }, { name: "Green", base: "Light", hue: 104, strength: 40 }, { name: "Night", base: "Dark", hue: 240, strength: 20 },
  { name: "Parchment", base: "Light", hue: 40, strength: 80, tex: "Real paper" }, { name: "Cinema", base: "Black", hue: 30, strength: 30 },
];

function paperOf(a: Pick<A, "base" | "hue" | "strength">) {
  const base = { Light: [0, 0, 100], Dark: [240, 8, 8], Dim: [215, 9, 11], Black: [0, 0, 0] }[a.base];
  const s = a.strength / 100;
  if (a.base === "Black") return "#000";
  const l = a.base === "Light" ? 100 - 12 * s : base[2] + 3 * s;
  return `hsl(${s > 0.02 ? a.hue : base[0]} ${Math.round(base[1] + 55 * s)}% ${l}%)`;
}
function inkOf(a: A) { return a.base === "Light" ? `hsl(${a.hue} ${a.strength * 0.3}% ${22 - a.ink / 10}%)` : `hsl(${a.hue} 10% ${70 + a.ink / 5}%)`; }
export function texStyle(t: Tex, op: number, scale = 100): CSSProperties {
  const c = `rgba(60,40,20,${op / 220})`, s = (8 * scale) / 100;
  switch (t) {
    case "Lined": return { backgroundImage: `repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px ${s * 1.4}px)` };
    case "Grid": return { backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: `${s}px ${s}px` };
    case "Dotted": return { backgroundImage: `radial-gradient(${c} 1px, transparent 1.3px)`, backgroundSize: `${s}px ${s}px` };
    case "Cross": return { backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: `${s}px ${s}px`, backgroundPosition: `${s / 2}px ${s / 2}px`, maskImage: `radial-gradient(circle, #000 2px, transparent 2.5px)`, WebkitMaskImage: `radial-gradient(circle, #000 2px, transparent 2.5px)`, WebkitMaskSize: `${s}px ${s}px` } as CSSProperties;
    case "Real paper": return { backgroundImage: `radial-gradient(${c} .6px, transparent .8px)`, backgroundSize: `3px 3px` };
    default: return {};
  }
}
function MiniPage({ a, w, h, name }: { a: Pick<A, "base" | "hue" | "strength"> & { tex?: Tex }; w: number; h: number; name?: string }) {
  const ink = a.base === "Light" ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.4)";
  return (
    <div className="relative overflow-hidden rounded-[6px] border border-line" style={{ width: w, height: h, background: paperOf(a) }}>
      <div className="absolute inset-0" style={texStyle(a.tex ?? "None", 50)} />
      <div className="absolute inset-x-[16%] top-[18%] space-y-[3px]">{[90, 100, 80, 100, 60].map((x, i) => <div key={i} className="h-[2px] rounded" style={{ width: `${x}%`, background: ink }} />)}</div>
      {name && <span className="sr-only">{name}</span>}
    </div>
  );
}

/* ============================ CURRENT ============================ */
/* widgets::segments as rendered at HEAD: outlined track, the pick filled accent-soft with accent text. */
function CurSeg<T extends string>({ value, options, onChange, cols }: { value: T; options: { v: T; label: string; icon?: typeof Sun }[]; onChange: (v: T) => void; cols?: number }) {
  return (
    <div className="grid gap-[2px] rounded-[8px] border border-line p-[2px]" style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, 1fr)` }}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={cn("flex h-[22px] items-center justify-center gap-1 rounded-[6px] text-[13px]", o.v === value ? "bg-accent-soft text-accent" : "text-ink hover:bg-line/60")}>
          {o.icon && <o.icon size={13} strokeWidth={1.75} />}{o.label}
        </button>
      ))}
    </div>
  );
}
/* egui slider as themed: filled part accent-soft, hollow knob edged in ink. */
function CurSlider({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const k = (value - min) / (max - min);
  return (
    <div className="relative h-[20px]">
      <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full" style={{ background: `linear-gradient(90deg, var(--accent-soft) ${k * 100}%, var(--line) ${k * 100}%)` }} />
      <span className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-line" style={{ left: `${k * 100}%` }} />
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="absolute inset-0 w-full cursor-pointer opacity-0" />
    </div>
  );
}
/* appearance_menu.rs: WIDTH 300, NAME_W 64, VALUE_W 52, HEADER 24, MAX_HEIGHT 512, cards 5-across. */
function Fold({ title, summary, open, onToggle, extra, children }: { title: string; summary: string; open: boolean; onToggle: () => void; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="py-1">
      <div className="flex h-[24px] items-center gap-1">
        <button onClick={onToggle} className="flex flex-1 items-center gap-1.5 text-left">
          {open ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
          <span className="text-[13px] font-medium text-ink">{title}</span>
          {!open && <span className="ml-auto truncate pl-2 text-[12px] text-muted">{summary}</span>}
        </button>
        {extra}
      </div>
      {open && <div className="space-y-[6px] pt-[6px]">{children}</div>}
    </div>
  );
}
function Row({ name, value, children }: { name: string; value: string; children: ReactNode }) {
  return (
    <div className="flex h-[20px] items-center gap-2">
      <span className="w-[64px] shrink-0 text-[13px] text-muted">{name}</span>
      <div className="flex-1">{children}</div>
      <span className="w-[52px] shrink-0 text-right text-[13px] tabular-nums text-ink">{value}</span>
    </div>
  );
}

export function AppearanceCurrent({ a, set }: { a: A; set: (p: Partial<A>) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ presets: true, colour: true, text: false, texture: true, grain: true });
  const t = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  return (
    <div className="w-[316px] rounded-[12px] border border-line bg-surface p-2 pop">
      <div className="thin-scroll max-h-[512px] overflow-y-auto px-1">
        <Fold title="Presets" summary={a.preset || "Unsaved look"} open={open.presets} onToggle={() => t("presets")} extra={<button className="grid h-5 w-5 place-items-center rounded hover:bg-line" title="Save current look"><Plus size={13} /></button>}>
          <div className="grid grid-cols-5 gap-[6px]">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => set({ base: p.base, hue: p.hue, strength: p.strength, tex: p.tex ?? "None", preset: p.name })} className="flex flex-col items-center gap-[3px]">
                <div className={cn("relative rounded-[6px]", a.preset === p.name ? "ring-2 ring-accent" : "ring-1 ring-line")}>
                  <MiniPage a={p} w={52} h={36} />
                  <span className="absolute right-[3px] top-[3px] h-[6px] w-[6px] rounded-full" style={{ background: p.base === "Light" ? `hsl(${p.hue} 90% ${p.hue > 90 && p.hue < 200 ? 28 : 26}%)` : `hsl(${p.hue} 60% 62%)` }} />
                </div>
                <span className={cn("w-full truncate text-center text-[11px]", a.preset === p.name ? "text-accent" : "text-ink")}>{p.name}</span>
              </button>
            ))}
          </div>
        </Fold>
        <div className="my-1 h-px bg-line" />
        <Fold title="Mode & colour" summary={`${a.base} · ${HUES.find(([h]) => h === a.hue)?.[1] ?? a.hue + "°"} ${a.strength}%`} open={open.colour} onToggle={() => t("colour")}>
          <CurSeg value={a.base} onChange={(base) => set({ base, preset: "" })} options={MODES} />
          <Row name="Hue" value={`${a.hue}°`}>
            <div className="relative h-[12px] rounded-[4px]" style={{ background: `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, i) => hueColour(i * 30)).join(",")})` }}>
              <input type="range" min={0} max={359} value={a.hue} onChange={(e) => set({ hue: +e.target.value, preset: "" })} className="absolute inset-0 w-full cursor-pointer opacity-0" />
              <span className="absolute top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper shadow ring-1 ring-black/25" style={{ left: `${(a.hue / 359) * 100}%`, background: hueColour(a.hue) }} />
            </div>
          </Row>
          <div className="flex justify-between pl-[72px] pr-[60px]">
            {HUES.map(([h, n]) => <button key={h} title={n} onClick={() => set({ hue: h, preset: "" })} className={cn("h-[20px] w-[20px] rounded-full", a.hue === h && "ring-2 ring-accent ring-offset-1 ring-offset-surface")} style={{ background: hueColour(h) }} />)}
          </div>
          <Row name="Strength" value={`${a.strength}%`}><CurSlider value={a.strength} min={0} max={100} onChange={(v) => set({ strength: v, preset: "" })} /></Row>
          {false && <Row name="Text ink" value={`${a.ink}`}><CurSlider value={a.ink} min={0} max={100} onChange={(v) => set({ ink: v })} /></Row>}
        </Fold>
        <div className="my-1 h-px bg-line" />
        <Fold title="Text (with a book open)" summary={`${a.size}% · ${a.lines.toFixed(1)}×`} open={open.text} onToggle={() => t("text")}>
          <Row name="Size" value={`${a.size}%`}><CurSlider value={a.size} min={50} max={200} onChange={(v) => set({ size: v })} /></Row>
          <Row name="Lines" value={`${a.lines.toFixed(1)}×`}><CurSlider value={a.lines * 10} min={10} max={24} onChange={(v) => set({ lines: v / 10 })} /></Row>
          <Row name="Gaps" value={a.gaps.toFixed(2)}><CurSlider value={a.gaps * 4} min={0} max={8} onChange={(v) => set({ gaps: v / 4 })} /></Row>
          {([["font", "Override book font", "Your fonts and text size for all of a book's text"], ["layout", "Override book layout", "Your spacing, indent and justification for its paragraphs"]] as const).map(([k, title, hint]) => (
            <div key={k} className="flex items-start gap-2 py-0.5"><div className="flex-1"><div className="text-[13px] text-ink">{title}</div><div className="text-[11.5px] leading-tight text-muted">{hint}</div></div><Switch on={a[k]} onChange={(v) => set({ [k]: v })} /></div>
          ))}
        </Fold>
        <div className="my-1 h-px bg-line" />
        <Fold title="Page texture" summary={a.tex === "None" ? "None" : `${a.tex} · ${a.opacity}%`} open={open.texture} onToggle={() => t("texture")}>
          <CurSeg cols={3} value={a.tex} onChange={(tex) => set({ tex })} options={TEX.map((x) => ({ v: x, label: x }))} />
          {a.tex !== "None" && <><Row name="Opacity" value={`${a.opacity}%`}><CurSlider value={a.opacity} min={0} max={100} onChange={(v) => set({ opacity: v })} /></Row><Row name="Scale" value={`${a.scale}%`}><CurSlider value={a.scale} min={25} max={400} onChange={(v) => set({ scale: v })} /></Row></>}
        </Fold>
        <div className="my-1 h-px bg-line" />
        <Fold title="Film grain" summary={a.grain === "Off" ? "Off" : `${a.grain} · ${a.intensity}%`} open={open.grain} onToggle={() => t("grain")}>
          <CurSeg value={a.grain} onChange={(grain) => set({ grain })} options={[{ v: "Off" as Grain, label: "Off" }, { v: "Static" as Grain, label: "Static" }, { v: "Animated" as Grain, label: "Animated" }]} />
          {a.grain !== "Off" && <Row name="Intensity" value={`${a.intensity}%`}><CurSlider value={a.intensity} min={0} max={100} onChange={(v) => set({ intensity: v })} /></Row>}
        </Fold>
      </div>
    </div>
  );
}

/* ============================ PROPOSED ============================ */
function Head({ icon: I, children, right }: { icon: typeof Type; children: ReactNode; right?: ReactNode }) {
  return <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"><I size={12} />{children}<span className="ml-auto normal-case tracking-normal">{right}</span></div>;
}
function TexTile({ t, on, onClick }: { t: Tex; on: boolean; onClick: () => void }) {
  return (
    <button title={t} aria-label={t} aria-pressed={on} onClick={onClick} className={cn("relative h-[34px] flex-1 overflow-hidden rounded-lg border bg-paper transition-all", on ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-track")}>
      <div className="absolute inset-0" style={texStyle(t, 90)} />
      {t === "None" && <div className="absolute left-1/2 top-1/2 h-px w-[60%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-muted" />}
    </button>
  );
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} aria-pressed={on} className={cn("flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg border text-[12px] transition-colors", on ? "border-accent/40 bg-accent-soft text-accent" : "border-line text-muted hover:text-ink")}><span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-accent" : "bg-track")} />{children}</button>;
}

function LookBlock({ a, set }: { a: A; set: (p: Partial<A>) => void }) {
  return (
    <div className="flex gap-3">
      <TintWheel hue={a.hue} strength={a.strength} onChange={(hue, strength) => set({ hue, strength, preset: "" })} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Segmented value={a.base} onChange={(base) => set({ base, preset: "" })} options={MODES} iconOnly />
        <div className="relative flex-1 overflow-hidden rounded-lg border border-line p-2" style={{ background: paperOf(a) }}>
          <div className="absolute inset-0" style={texStyle(a.tex, a.opacity, a.scale)} />
          <p className="relative font-serif leading-snug" style={{ color: inkOf(a), fontSize: 9 * (a.size / 100), lineHeight: a.lines }}>It is a truth universally acknowledged, that a single man in possession…</p>
        </div>
      </div>
    </div>
  );
}
function PresetStrip({ a, set }: { a: A; set: (p: Partial<A>) => void }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
      {PRESETS.map((p) => (
        <button key={p.name} title={p.name} onClick={() => set({ base: p.base, hue: p.hue, strength: p.strength, tex: p.tex ?? "None", preset: p.name })}
          className={cn("flex shrink-0 items-center gap-1.5 rounded-full border py-[3px] pl-[3px] pr-2.5 text-[12px] transition-colors", a.preset === p.name ? "border-accent bg-accent-soft text-accent" : "border-line text-ink hover:bg-line/50")}>
          <span className="h-[20px] w-[20px] overflow-hidden rounded-full border border-black/10" style={{ background: paperOf(p) }} />{p.name}
        </button>
      ))}
      <button title="Save current look" className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full border border-dashed border-track text-muted hover:text-ink"><Plus size={14} /></button>
    </div>
  );
}
function TextBlock({ a, set }: { a: A; set: (p: Partial<A>) => void }) {
  return (
    <>
      <div className="grid grid-cols-4 gap-1">
        <Knob label="Size" value={a.size} min={50} max={200} step={5} def={100} onChange={(size) => set({ size })} format={(v) => `${v}%`} size={48} />
        <Knob label="Lines" value={a.lines} min={1} max={2.4} step={0.1} def={1.5} onChange={(lines) => set({ lines })} format={(v) => `${v.toFixed(1)}×`} size={48} />
        <Knob label="Gaps" value={a.gaps} min={0} max={2} step={0.25} def={0.75} onChange={(gaps) => set({ gaps })} format={(v) => v.toFixed(2)} size={48} />
        <Knob label="Ink" value={a.ink} min={0} max={100} step={1} def={50} onChange={(ink) => set({ ink })} format={(v) => `${v}`} size={48} />
      </div>
      <div className="flex gap-1.5">
        <Chip on={a.font} onClick={() => set({ font: !a.font })}>My font</Chip>
        <Chip on={a.layout} onClick={() => set({ layout: !a.layout })}>My layout</Chip>
      </div>
    </>
  );
}
function SurfaceBlock({ a, set }: { a: A; set: (p: Partial<A>) => void }) {
  return (
    <>
      <div className="flex gap-1">{TEX.map((t) => <TexTile key={t} t={t} on={a.tex === t} onClick={() => set({ tex: t })} />)}</div>
      <div className="grid grid-cols-[1fr_1fr_1.25fr] items-start gap-1">
        <div className={cn("transition-opacity", a.tex === "None" && "pointer-events-none opacity-35")}><Knob label="Opacity" value={a.opacity} min={0} max={100} step={1} def={40} onChange={(opacity) => set({ opacity })} format={(v) => `${v}%`} size={42} /></div>
        <div className={cn("transition-opacity", a.tex === "None" && "pointer-events-none opacity-35")}><Knob label="Scale" value={a.scale} min={25} max={400} step={5} def={100} onChange={(scale) => set({ scale })} format={(v) => `${v}%`} size={42} /></div>
        <div className="flex flex-col items-center gap-1">
          <Segmented size="sm" className="w-full" value={a.grain} onChange={(grain) => set({ grain, intensity: grain !== "Off" && a.intensity === 0 ? 25 : a.intensity })} options={[{ v: "Off", label: "Off" }, { v: "Static", label: "Still" }, { v: "Animated", label: "Live" }]} />
          <div className="flex w-full items-center gap-1.5 text-[11px] text-muted">Grain
            <input type="range" min={0} max={100} value={a.intensity} disabled={a.grain === "Off"} onChange={(e) => set({ intensity: +e.target.value })} className="egui min-w-0 flex-1 disabled:opacity-35" />
          </div>
        </div>
      </div>
    </>
  );
}

export function AppearanceDeck({ a, set }: { a: A; set: (p: Partial<A>) => void }) {
  return (
    <div className="w-[316px] space-y-3 rounded-[16px] border border-line bg-surface p-3 pop">
      <PresetStrip a={a} set={set} />
      <LookBlock a={a} set={set} />
      <div className="h-px bg-line" />
      <Head icon={Type} right={<span className="text-[11px] text-muted">dbl-click resets</span>}>Text</Head>
      <TextBlock a={a} set={set} />
      <div className="h-px bg-line" />
      <Head icon={Layers}>Surface</Head>
      <SurfaceBlock a={a} set={set} />
    </div>
  );
}

export function AppearanceTabs({ a, set }: { a: A; set: (p: Partial<A>) => void }) {
  const [tab, setTab] = useState<"look" | "text" | "surface">("look");
  return (
    <div className="w-[276px] space-y-3 rounded-[16px] border border-line bg-surface p-3 pop">
      <Segmented value={tab} onChange={setTab} options={[{ v: "look", label: "Look", icon: Palette }, { v: "text", label: "Text", icon: Type }, { v: "surface", label: "Surface", icon: Layers }]} />
      <div className="min-h-[196px] space-y-3">
        {tab === "look" && <><PresetStrip a={a} set={set} /><LookBlock a={a} set={set} /></>}
        {tab === "text" && <TextBlock a={a} set={set} />}
        {tab === "surface" && <SurfaceBlock a={a} set={set} />}
      </div>
    </div>
  );
}

export function AppearanceSection() {
  const [a, setA] = useState<A>(INIT);
  const set = (p: Partial<A>) => setA((x) => ({ ...x, ...p }));
  return (
    <Section id="appearance" kicker="appearance_menu.rs · widgets.rs" title="Appearance popover"
      intro={<>The current popover is careful work: one-source controls, summaries on folded headers, preset names that shrink before eliding, height capped to the window's foot. But it is a <b>vertical list of 13+ slider rows</b> behind five folds, capped at 512 pt and scrolling. You are tuning a look while scrolling away from what you're tuning. Both menus below share state: drag either one and the other follows.</>}>
      <Grid>
        <Specimen tag="current" title="Popover · 300 wide, 512 max, scrolls" src="appearance_menu.rs" stageClass="items-start py-8"><AppearanceCurrent a={a} set={set} /></Specimen>
        <Specimen tag="proposed" title="Knob deck · 300 wide, ~470 tall, no scroll, no folds" stageClass="items-start py-8" note="One tint wheel (angle = hue, distance = strength, ticks for the 7 named hues, snapping within 6°) replaces the hue strip, the swatch row and the Strength slider. Four knobs replace four slider rows. Textures show as what they look like. A live mini page previews the result where you're looking. Every control is visible at once.">
          <AppearanceDeck a={a} set={set} />
        </Specimen>
      </Grid>
      <Grid>
        <Specimen tag="variant" title="Tabbed deck · 260 wide for narrow windows / splits" stageClass="items-start py-8" note="When the window is short (a split, a laptop), three tabs keep the popover at about 260 pt tall, which the current menu can only do by scrolling."><AppearanceTabs a={a} set={set} /></Specimen>
        <Notes title="Review" items={[
          ["keep", "Folded headers that read out their setting ('Light · Sepia 60%'), the 'Strength as % of full effect' mapping, dials hidden until they act, and Save-current-look on the header +. Carry these into any redesign."],
          ["issue", "Hue is set in two places (strip plus 7 swatches) and strength in a third, so tint takes three rows and about 80 pt for what is a single 2-D choice."],
          ["issue", "Five 50×70 preset cards take about 100 pt for 5 choices. A chip strip with paper swatches does the job in 28 pt and scrolls sideways as user presets grow."],
          ["issue", "Texture choice is six text buttons ('Cross', 'Dotted'). These are visual choices, so they should be visual tiles."],
          ["warn", "Knobs are less precise than sliders and unfamiliar to some users. Ship with vertical drag, scroll, arrow keys, ⇧ for fine steps, double-click to reset, a value bubble while dragging, and role=slider with aria-valuetext (all in the component here). If testing shows confusion, the tabbed deck works with ordinary sliders too."],
          ["warn", "The tint wheel must not lose the exact named hues: keep snapping, and show the hue's name in the readout."],
        ]} />
      </Grid>
    </Section>
  );
}
