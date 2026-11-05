import { useRef, useState } from "react";
import { ChevronDown, Plus, Sun, Moon, SunDim, Circle } from "lucide-react";
import { clsx } from "clsx";
import { Compare, Finding, Findings, Section } from "../lib/ui";
import { useAppearance } from "../lib/appearance";
import { HUES, PRESETS, hueColour, textPalette, type Appearance, type Mode } from "../theme";

const MODES: { m: Mode; label: string; icon: React.ReactNode }[] = [
  { m: "light", label: "Light", icon: <Sun size={14} /> }, { m: "dark", label: "Dark", icon: <Moon size={14} /> },
  { m: "dim", label: "Dim", icon: <SunDim size={14} /> }, { m: "black", label: "Black", icon: <Circle size={14} /> },
];

/** widgets::segments — 24 pt track, radius 6, 2 pt inset thumb radius 4 in `selected`. */
export function Segments<T extends string>({ value, all, onChange, h = 24 }: { value: T; all: { v: T; label: string; icon?: React.ReactNode }[]; onChange: (v: T) => void; h?: number }) {
  const i = all.findIndex((x) => x.v === value);
  return (
    <div className="relative grid rounded-[6px] border border-line" style={{ gridTemplateColumns: `repeat(${all.length}, 1fr)`, height: h }}>
      <span className="absolute rounded-[4px] transition-[left] duration-150" style={{ top: 2, bottom: 2, width: `calc(${100 / all.length}% - 4px)`, left: `calc(${(100 / all.length) * Math.max(0, i)}% + 2px)`, background: "var(--selected)" }} />
      {all.map((x) => (
        <button key={x.v} onClick={() => onChange(x.v)} className={clsx("relative z-10 inline-flex items-center justify-center gap-1.5 rounded-[4px] text-[12.5px] transition-colors", x.v === value ? "font-medium" : "ink hover:bg-[var(--hover)]")} style={x.v === value ? { color: "var(--accent)" } : undefined}>
          {x.icon}{x.label}
        </button>
      ))}
    </div>
  );
}

const Fold = ({ title, summary, open, onToggle, children, action }: { title: string; summary: string; open: boolean; onToggle: () => void; children: React.ReactNode; action?: React.ReactNode }) => (
  <div>
    <div className="flex h-[24px] items-center gap-2">
      <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
        <span className="text-[13px] font-medium ink">{title}</span>
        {!open && <span className="truncate text-[12px] muted">{summary}</span>}
        <ChevronDown size={14} className="ml-auto muted transition-transform" style={{ transform: `rotate(${open ? 0 : -90}deg)` }} />
      </button>
      {action}
    </div>
    {open && <div className="space-y-[6px] pt-1">{children}</div>}
  </div>
);

const Row = ({ name, value, children }: { name: string; value: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <span className="w-[64px] text-[13px] ink">{name}</span>
    <div className="flex-1">{children}</div>
    <span className="w-[52px] rounded-[6px] border border-line py-[2px] text-right text-[12px] tabular-nums ink pr-1.5">{value}</span>
  </div>
);

function HueStrip({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const pick = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); onChange(Math.round(Math.min(1, Math.max(0, (e.clientX - r.left - 9) / (r.width - 18))) * 359)); };
  return (
    <div ref={ref} className="relative h-[18px] cursor-pointer" onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); pick(e); }} onPointerMove={(e) => e.buttons && pick(e)}>
      <div className="absolute inset-x-[9px] inset-y-[3px] rounded-[3px] border border-line" style={{ background: `linear-gradient(to right, ${Array.from({ length: 37 }, (_, i) => hueColour(i * 10)).join(",")})` }} />
      <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white shadow-[0_0_0_1px_rgba(0,0,0,.25)]" style={{ left: `calc(9px + (100% - 18px) * ${hue / 359})`, background: hueColour(hue) }} />
    </div>
  );
}

const Slider = ({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) => (
  <input type="range" className="flat w-full" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} />
);

function PresetCard({ p, on, onClick, size = 44 }: { p: { name: string; a: Appearance }; on: boolean; onClick: () => void; size?: number }) {
  const pal = textPalette(p.a);
  const bg = `rgb(${pal.paper.join(" ")})`, fg = `rgb(${pal.ink.join(" ")})`;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <span className={clsx("relative overflow-hidden rounded-[6px] border", on ? "ring-2 ring-[var(--accent)] border-transparent" : "border-line")} style={{ width: size, height: size / 0.7, background: bg }}>
        <span className="absolute inset-x-[6px] top-[8px] space-y-[3px]">{[9, 7, 8, 6, 8].map((w, i) => <span key={i} className="block h-[2px] rounded-sm" style={{ width: `${w * 10}%`, background: fg, opacity: 0.8 }} />)}</span>
      </span>
      <span className={clsx("text-[11px]", on ? "font-medium ink" : "muted")}>{p.name}</span>
    </button>
  );
}

/** appearance_menu.rs::show — WIDTH 300, folds with summaries, dial rows, pinned pane switches. */
function CurrentMenu() {
  const c = useAppearance();
  const [open, setOpen] = useState({ presets: true, colour: true, text: false, texture: false, grain: false });
  const tog = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const picked = PRESETS.find((p) => p.a.base === c.a.base && p.a.tintHue === c.a.tintHue && p.a.tintStrength === c.a.tintStrength);
  const pct = Math.round((c.a.tintStrength / 50) * 100);
  const land = HUES.find(([h]) => h === c.a.tintHue)?.[1] ?? `${c.a.tintHue}°`;
  return (
    <div className="w-[300px] space-y-[6px] rounded-[12px] border border-line bg-surface p-3 shadow-pop">
      <Fold title="Presets" summary={picked?.name ?? "Unsaved look"} open={open.presets} onToggle={() => tog("presets")} action={<button className="sb" aria-label="Save current look"><Plus size={14} /></button>}>
        <div className="grid grid-cols-5 gap-[6px]">{PRESETS.slice(0, 5).map((p) => <PresetCard key={p.name} p={p} on={picked?.name === p.name} onClick={() => c.set(p.a)} />)}</div>
      </Fold>
      <div className="hairline" />
      <Fold title="Mode & colour" summary={`${c.a.base[0].toUpperCase() + c.a.base.slice(1)} · ${c.a.tintStrength ? `${land} ${pct}%` : "no tint"}`} open={open.colour} onToggle={() => tog("colour")}>
        <Segments value={c.a.base} all={MODES.map((m) => ({ v: m.m, label: m.label, icon: m.icon }))} onChange={(base) => c.set({ ...c.a, base })} />
        <Row name="Hue" value={`${c.a.tintHue}°`}><HueStrip hue={c.a.tintHue} onChange={(tintHue) => c.set({ ...c.a, tintHue, tintStrength: c.a.tintStrength || 18 })} /></Row>
        <div className="flex items-center justify-between pl-[72px] pr-[60px]">
          {HUES.map(([h, n]) => <button key={h} title={n} onClick={() => c.set({ ...c.a, tintHue: h, tintStrength: c.a.tintStrength || 18 })} className={clsx("h-5 w-5 rounded-full border border-line", c.a.tintHue === h && "ring-2 ring-[var(--accent)]")} style={{ background: hueColour(h), backgroundClip: "padding-box", boxShadow: "inset 0 0 0 2px var(--surface)" }} />)}
        </div>
        <Row name="Strength" value={`${pct}%`}><Slider value={pct} min={0} max={100} onChange={(v) => c.set({ ...c.a, tintStrength: Math.round((v * 50) / 100) })} /></Row>
        <Row name="Text ink" value={`${c.ink}%`}><Slider value={c.ink} min={60} max={140} onChange={c.setInk} /></Row>
      </Fold>
      <div className="hairline" />
      <Fold title="Text" summary="100% · 1.5×" open={open.text} onToggle={() => tog("text")}>
        <Row name="Size" value="100%"><Slider value={100} min={60} max={200} onChange={() => {}} /></Row>
        <Row name="Lines" value="1.5×"><Slider value={15} min={10} max={25} onChange={() => {}} /></Row>
        <Row name="Gaps" value="0.75"><Slider value={3} min={0} max={8} onChange={() => {}} /></Row>
      </Fold>
      <div className="hairline" />
      <Fold title="Page texture" summary={c.texture === "none" ? "None" : `${c.texture} · ${c.textureOpacity}%`} open={open.texture} onToggle={() => tog("texture")}>
        <Segments value={c.texture} all={[{ v: "none", label: "None" }, { v: "paper", label: "Paper" }, { v: "canvas", label: "Canvas" }]} onChange={c.setTexture} />
        {c.texture !== "none" && <><Row name="Opacity" value={`${c.textureOpacity}%`}><Slider value={c.textureOpacity} min={0} max={100} onChange={c.setTextureOpacity} /></Row><Row name="Scale" value="100%"><Slider value={100} min={25} max={400} onChange={() => {}} /></Row></>}
      </Fold>
      <div className="hairline" />
      <Fold title="Film grain" summary={c.grain === "off" ? "Off" : `${c.grain} · ${c.grainIntensity}%`} open={open.grain} onToggle={() => tog("grain")}>
        <Segments value={c.grain} all={[{ v: "off", label: "Off" }, { v: "static", label: "Static" }, { v: "animated", label: "Animated" }]} onChange={c.setGrain} />
        {c.grain !== "off" && <Row name="Intensity" value={`${c.grainIntensity}%`}><Slider value={c.grainIntensity} min={0} max={100} onChange={c.setGrainIntensity} /></Row>}
      </Fold>
    </div>
  );
}

/** A rotary knob: drag up/down or scroll; 270° sweep; value printed inside. */
export function Knob({ value, min, max, onChange, label, unit = "%", size = 44, disabled }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string; unit?: string; size?: number; disabled?: boolean }) {
  const start = useRef<{ y: number; v: number } | null>(null);
  const k = (value - min) / (max - min);
  const r = size / 2 - 3, c = size / 2, circ = 2 * Math.PI * r, sweep = 0.75;
  return (
    <div className={clsx("flex flex-col items-center gap-1", disabled && "opacity-35 pointer-events-none")}>
      <div className="relative cursor-ns-resize select-none touch-none" style={{ width: size, height: size }}
        onPointerDown={(e) => { start.current = { y: e.clientY, v: value }; (e.currentTarget as Element).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (!start.current) return; const dv = ((start.current.y - e.clientY) / 120) * (max - min); onChange(Math.round(Math.min(max, Math.max(min, start.current.v + dv)))); }}
        onPointerUp={() => (start.current = null)}
        onWheel={(e) => { e.preventDefault(); onChange(Math.min(max, Math.max(min, value + (e.deltaY < 0 ? 1 : -1) * Math.max(1, Math.round((max - min) / 50))))); }}
        onDoubleClick={() => onChange(Math.round((min + max) / 2))}
        role="slider" aria-label={label} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max}>
        <svg width={size} height={size} className="absolute inset-0" style={{ transform: "rotate(135deg)" }}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--track)" strokeWidth={3} strokeDasharray={`${circ * sweep} ${circ}`} strokeLinecap="round" />
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--accent)" strokeWidth={3} strokeDasharray={`${circ * sweep * k} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-[7px] grid place-items-center rounded-full bg-[var(--card)] shadow-[inset_0_0_0_1px_var(--line)]">
          <span className="text-[11px] font-semibold tabular-nums ink">{value}<span className="text-[8px] font-medium muted">{unit}</span></span>
        </div>
      </div>
      <span className="text-[10.5px] muted">{label}</span>
    </div>
  );
}

/** A 2-D puck: angle = hue, distance = strength. Landmarks sit on the rim. */
function HuePuck({ hue, strength, onChange, size = 116 }: { hue: number; strength: number; onChange: (h: number, s: number) => void; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const c = size / 2, R = c - 10;
  const pick = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect(); const dx = e.clientX - r.left - c, dy = e.clientY - r.top - c;
    let ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90; if (ang < 0) ang += 360;
    const dist = Math.min(1, Math.hypot(dx, dy) / R);
    // snap to a landmark within 8°
    const near = HUES.find(([h]) => Math.abs(((h - ang + 540) % 360) - 180) < 8);
    onChange(Math.round(near ? near[0] : ang) % 360, Math.round(dist * 50));
  };
  const a = ((hue - 90) * Math.PI) / 180, d = (strength / 50) * R;
  return (
    <div ref={ref} className="relative shrink-0 cursor-crosshair select-none touch-none" style={{ width: size, height: size }}
      onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); pick(e); }} onPointerMove={(e) => e.buttons && pick(e)}>
      <div className="absolute rounded-full" style={{ inset: 5, background: `conic-gradient(from 0deg, ${Array.from({ length: 37 }, (_, i) => hueColour(i * 10)).join(",")})` }} />
      <div className="absolute rounded-full" style={{ inset: 10, background: `radial-gradient(circle, var(--surface) 0%, var(--surface) 35%, ${hueColour(hue)} 100%)` }} />
      <div className="absolute rounded-full border border-line" style={{ inset: 10 }} />
      {HUES.map(([h, n]) => { const t = ((h - 90) * Math.PI) / 180; return <span key={h} title={n} className="absolute h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,.2)]" style={{ left: c + Math.cos(t) * (R + 6), top: c + Math.sin(t) * (R + 6), background: hueColour(h) }} />; })}
      <span className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white shadow-[0_0_0_1px_rgba(0,0,0,.3)] transition-[left,top] duration-75" style={{ left: c + Math.cos(a) * d, top: c + Math.sin(a) * d, background: strength ? hueColour(hue) : "var(--muted)" }} />
    </div>
  );
}

function ProposedMenu() {
  const c = useAppearance();
  const picked = PRESETS.find((p) => p.a.base === c.a.base && p.a.tintHue === c.a.tintHue && p.a.tintStrength === c.a.tintStrength);
  const land = HUES.find(([h]) => h === c.a.tintHue)?.[1] ?? `${c.a.tintHue}°`;
  const pct = Math.round((c.a.tintStrength / 50) * 100);
  return (
    <div className="w-[320px] rounded-[12px] border border-line bg-surface shadow-pop">
      {/* presets: a strip, the saved one ringed, + at the end */}
      <div className="flex items-end gap-[10px] overflow-x-auto px-3 pt-3 pb-2 thin-scroll">
        {PRESETS.map((p) => <PresetCard key={p.name} p={p} size={36} on={picked?.name === p.name} onClick={() => c.set(p.a)} />)}
        <button className="mb-[18px] grid h-[51px] w-[36px] shrink-0 place-items-center rounded-[6px] border border-dashed border-line muted hover:bg-[var(--hover)]" aria-label="Save current look"><Plus size={14} /></button>
      </div>
      <div className="hairline mx-3" />
      {/* mode + colour on one card */}
      <div className="flex gap-3 p-3">
        <HuePuck hue={c.a.tintHue} strength={c.a.tintStrength} onChange={(tintHue, tintStrength) => c.set({ ...c.a, tintHue, tintStrength })} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Segments h={28} value={c.a.base} all={MODES.map((m) => ({ v: m.m, label: "", icon: <span title={m.label}>{m.icon}</span> }))} onChange={(base) => c.set({ ...c.a, base })} />
          <div className="rounded-[8px] bg-[var(--card)] px-2.5 py-2 text-[12px] leading-tight">
            <div className="font-medium ink">{c.a.base[0].toUpperCase() + c.a.base.slice(1)} · {c.a.tintStrength ? land : "No tint"}</div>
            <div className="muted">{c.a.tintStrength ? `${pct}% strength · ${c.a.tintHue}°` : "Drag the puck outward to tint"}</div>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <Knob label="Text ink" value={c.ink} min={60} max={140} onChange={c.setInk} size={40} />
            <Knob label="Size" value={100} min={60} max={200} onChange={() => {}} size={40} />
            <Knob label="Lines" value={15} min={10} max={25} onChange={() => {}} size={40} unit="" />
          </div>
        </div>
      </div>
      <div className="hairline mx-3" />
      {/* texture & grain: a chip row each with its knobs in line */}
      <div className="space-y-2 p-3">
        <div className="flex items-center gap-2">
          <span className="w-[52px] text-[12px] muted">Texture</span>
          <div className="flex-1"><Segments value={c.texture} all={[{ v: "none", label: "None" }, { v: "paper", label: "Paper" }, { v: "canvas", label: "Canvas" }]} onChange={c.setTexture} /></div>
          <Knob label="Opacity" value={c.textureOpacity} min={0} max={100} onChange={c.setTextureOpacity} size={36} disabled={c.texture === "none"} />
          <Knob label="Scale" value={100} min={25} max={400} onChange={() => {}} size={36} disabled={c.texture === "none"} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-[52px] text-[12px] muted">Grain</span>
          <div className="flex-1"><Segments value={c.grain} all={[{ v: "off", label: "Off" }, { v: "static", label: "Static" }, { v: "animated", label: "Live" }]} onChange={c.setGrain} /></div>
          <Knob label="Intensity" value={c.grainIntensity} min={0} max={100} onChange={c.setGrainIntensity} size={36} disabled={c.grain === "off"} />
          <span className="w-[36px]" />
        </div>
      </div>
    </div>
  );
}

export default function AppearanceMenu() {
  return (
    <Section id="appearance" title="Appearance popover" source="crates/ui/src/appearance_menu.rs · widgets.rs (segments, switch) · appearance/tokens.rs" verdict="redesign"
      summary="Everything a look is made of lives here, and the engine behind it (OKLCH tint with per-token chroma ceilings, contrast gaps, instant restyle) is excellent. The popover itself is a 300 pt column of folds, each hiding a slider row with a 64 pt name box and a 52 pt value box: Hue, Strength, Text ink, Opacity, Scale, Intensity, Size, Lines, Gaps. Nine identical rows for nine different things. Both versions below change this page's live theme — try them.">
      <Compare tall
        current={<div className="p-4"><CurrentMenu /></div>}
        proposed={<div className="p-4"><ProposedMenu /></div>}
        currentNote="Folds remember themselves per session and read their setting out when shut (good). Open, Mode & colour alone is five rows: segments, hue strip, seven landmark swatches, strength, text ink — 128 pt for one decision."
        proposedNote="Hue and strength collapse into one puck (angle = hue, reach = strength; landmarks on the rim snap within 8°). Per-cent dials become 36–44 pt knobs that sit in line with the control they belong to, so a row owns its whole setting. Presets become a strip you can scroll instead of a 5-up grid that reflows. Height drops from ~512 pt (MAX_HEIGHT) to ~420 pt with every group open at once." />
      <Findings>
        <Finding kind="ok">Taking the tint's hue outright in OKLCH (so sepia never passes through magenta), the `SURFACE_GAP`/`LINE_GAP` contrast floors, and showing strength as 0–100 % over stored 0–50 are all right and are kept here untouched.</Finding>
        <Finding kind="bug">`name_box` 64 pt + `value_box` 52 pt + gaps leave a slider 160 pt long inside a 300 pt popover; the knob of an egui slider is 20 pt (`interact_size.y = 20`), so one slider step on Scale (25–400) is 2.3 pt of travel. A knob with 270° of sweep and scroll nudging gives finer control in a quarter of the width.</Finding>
        <Finding kind="bug">Hue has three controls that set the same value (strip, seven swatches, the value box) and strength a fourth row. Picking a hue silently sets strength to 18 (`STRENGTH_ON_HUE`) — a hidden side effect. On the puck, the gesture that picks a hue also sets how much of it, and “no tint” is simply the centre.</Finding>
        <Finding kind="idea">Texture and grain dials “show only when they act” (design.md), so the popover's height changes as you click segments and the pane switches pinned under the scroll jump. Dimmed knobs in a fixed row keep the layout still and still read as off.</Finding>
        <Finding kind="idea">Presets are cards with page thumbnails rendered by the GPU pass — keep that. But five across in a 300 pt popover is 48 pt cards with names elided (“Parchme…”, design.md). A horizontal strip at 36 pt never elides and takes any count of user presets.</Finding>
        <Finding kind="idea">Split-view switches (“Theme per pane”, “Texture per pane”) are pinned under the scroll. Keep: pane-scoped settings belong at the foot, where the foot does not move.</Finding>
      </Findings>
    </Section>
  );
}
