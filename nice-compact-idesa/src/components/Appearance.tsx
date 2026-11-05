import { useState, type ReactNode } from "react";
import { ChevronDown, Circle, CloudMoon, Moon, RotateCw, Sun } from "lucide-react";
import { BASES, DEFAULT_LOOK, PRESETS, hueName, lookStyle, useLook, type Base } from "../lib/look";
import { Knob } from "./Knob";
import { Button, Segmented, Slider, Switch, cx, type SegOption } from "./ui";

const MODES: SegOption<Base>[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dim", label: "Dim", icon: CloudMoon },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "black", label: "Black", icon: Circle },
];

const RAINBOW = `linear-gradient(to right, ${Array.from({ length: 7 }, (_, i) => `hsl(${i * 60} 72% 58%)`).join(", ")})`;

const presetLook = (name: string) => {
  const p = PRESETS.find((x) => x.name === name);
  return { ...DEFAULT_LOOK, ...(p?.look ?? {}) };
};

/** A round swatch that shows the preset's own paper and accent. */
function PresetDot({ name, active, onPick }: { name: string; active: boolean; onPick: () => void }) {
  const p = PRESETS.find((x) => x.name === name);
  return (
    <button
      type="button"
      title={`${name}: ${p?.note ?? ""}`}
      aria-label={`${name} preset`}
      aria-pressed={active}
      onClick={onPick}
      className={cx("grid size-[30px] shrink-0 place-items-center rounded-full ring-2 transition hover:scale-110", active ? "ring-accent" : "ring-transparent")}
    >
      <span
        className="grid size-6 place-items-center overflow-hidden rounded-full bg-paper ring-1 ring-black/10"
        style={lookStyle(presetLook(name))}
      >
        <span className="size-2 rounded-full bg-accent" />
      </span>
    </button>
  );
}

/** A preset as a small page: its own paper, ink lines, and accent. */
function PresetCard({ name, active, onPick }: { name: string; active: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={cx("flex flex-col gap-1.5 rounded-xl p-1.5 text-left transition", active ? "bg-accent-soft" : "hover:bg-ink/8")}
    >
      <span
        className="relative flex h-[60px] w-full flex-col justify-between overflow-hidden rounded-lg border border-line bg-paper p-2"
        style={lookStyle(presetLook(name))}
      >
        <span className="h-1.5 w-3/4 rounded-full bg-ink/70" />
        <span className="h-1 w-full rounded-full bg-ink/25" />
        <span className="h-1 w-5/6 rounded-full bg-ink/25" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" />
      </span>
      <span className="px-0.5 text-[12px] font-medium text-ink">{name}</span>
    </button>
  );
}

/** One fold of the full popover: its title, a summary when shut, and its controls when open. */
function Fold({ title, summary, open, onToggle, children }: { title: string; summary: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="border-b border-line/70 last:border-0">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center gap-2 py-2.5 pl-1.5 pr-1 text-left">
        <span className="flex-1 text-[13px] font-medium text-ink">{title}</span>
        {!open && <span className="max-w-[150px] truncate text-[12px] text-muted">{summary}</span>}
        <ChevronDown size={15} className={cx("text-muted transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="animate-rise space-y-3 pb-3 pl-1.5 pr-1">{children}</div>}
    </section>
  );
}

/** The current design: every setting as a slider, grouped in folds, as mareader's popover is. */
export function AppearanceFull() {
  const { look, patch, preset, reset } = useLook();
  const [open, setOpen] = useState({ presets: true, text: false, colour: true, grain: false });
  const toggle = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const grainOn = look.grain > 0;
  return (
    <div className="w-full max-w-[380px] rounded-2xl border border-line bg-surface p-2 shadow-pop">
      <Fold title="Presets" summary={look.preset ?? "Custom"} open={open.presets} onToggle={() => toggle("presets")}>
        <div className="grid grid-cols-3 gap-1">
          {PRESETS.map((p) => (
            <PresetCard key={p.name} name={p.name} active={look.preset === p.name} onPick={() => preset(p.name)} />
          ))}
        </div>
      </Fold>
      <Fold title="Text" summary={`${look.size} pt · ${look.lines.toFixed(1)}`} open={open.text} onToggle={() => toggle("text")}>
        <Slider label="Size" min={14} max={26} step={1} value={look.size} format={(v) => `${v} pt`} onChange={(size) => patch({ size })} />
        <Slider label="Lines" min={1.2} max={2.2} step={0.1} value={look.lines} format={(v) => v.toFixed(1)} onChange={(lines) => patch({ lines })} />
        <Slider label="Gaps" min={0} max={1.5} step={0.1} value={look.gaps} format={(v) => `${v.toFixed(1)} em`} onChange={(gaps) => patch({ gaps })} />
      </Fold>
      <Fold
        title="Mode & colour"
        summary={`${BASES[look.base].label}${look.tint !== null ? ` · ${hueName(look.tint)}` : ""}`}
        open={open.colour}
        onToggle={() => toggle("colour")}
      >
        <Segmented full size="sm" label="Mode" value={look.base} onChange={(base) => patch({ base })} options={MODES} />
        <Slider
          label="Hue"
          min={0}
          max={360}
          step={1}
          value={look.tint ?? 38}
          track={RAINBOW}
          format={(v) => hueName(v)}
          onChange={(tint) => patch({ tint, strength: look.strength || 40 })}
        />
        <Slider label="Strength" min={0} max={100} value={look.strength} format={(v) => `${v}%`} onChange={(strength) => patch({ strength })} />
      </Fold>
      <Fold title="Film grain" summary={grainOn ? `${look.grain}%` : "Off"} open={open.grain} onToggle={() => toggle("grain")}>
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] text-muted">Grain on</span>
          <Switch label="Film grain" checked={grainOn} onChange={(on) => patch({ grain: on ? 35 : 0 })} />
        </div>
        <Slider label="Intensity" min={0} max={100} value={look.grain} format={(v) => `${v}%`} onChange={(grain) => patch({ grain })} />
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] text-muted">Animated</span>
          <Switch label="Animated grain" checked={look.grainMotion} onChange={(grainMotion) => patch({ grainMotion })} />
        </div>
      </Fold>
      <div className="flex justify-end px-1 pt-2">
        <Button size="sm" variant="ghost" icon={RotateCw} onClick={reset}>
          Reset look
        </Button>
      </div>
    </div>
  );
}

/** The knob board: mode, six swatches, and six dials in two rows. Everything fits on one screen. */
export function AppearanceKnobs() {
  const { look, patch, preset, reset } = useLook();
  return (
    <div className="w-[300px] rounded-2xl border border-line bg-surface p-3 shadow-pop">
      <Segmented full size="sm" iconOnly label="Mode" value={look.base} onChange={(base) => patch({ base })} options={MODES} />
      <div className="mt-3 flex items-center justify-between px-0.5">
        {PRESETS.map((p) => (
          <PresetDot key={p.name} name={p.name} active={look.preset === p.name} onPick={() => preset(p.name)} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 place-items-center gap-y-4">
        <Knob label="Size" value={look.size} min={14} max={26} defaultValue={17} format={(v) => `${v} pt`} onChange={(size) => patch({ size })} />
        <Knob
          label="Lines"
          value={look.lines}
          min={1.2}
          max={2.2}
          step={0.1}
          defaultValue={1.6}
          format={(v) => v.toFixed(1)}
          onChange={(lines) => patch({ lines })}
        />
        <Knob
          label="Gaps"
          value={look.gaps}
          min={0}
          max={1.5}
          step={0.1}
          defaultValue={0.6}
          format={(v) => `${v.toFixed(1)} em`}
          onChange={(gaps) => patch({ gaps })}
        />
        <Knob
          label="Hue"
          hue
          size="lg"
          value={look.tint ?? 38}
          min={0}
          max={360}
          step={2}
          format={(v) => (look.tint === null ? "None" : hueName(v))}
          onChange={(tint) => patch({ tint, strength: look.strength || 40 })}
        />
        <Knob
          label="Strength"
          value={look.strength}
          min={0}
          max={100}
          defaultValue={60}
          format={(v) => `${v}%`}
          onChange={(strength) => patch({ strength })}
        />
        <Knob
          label="Grain"
          value={look.grain}
          min={0}
          max={100}
          defaultValue={0}
          format={(v) => (v ? `${v}%` : "Off")}
          onChange={(grain) => patch({ grain })}
        />
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[11px] text-muted">Drag, scroll or use arrows</span>
        <Button size="sm" variant="ghost" icon={RotateCw} onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

/** One row for the reader's toolbar: the same controls, no captions. */
export function AppearanceStrip() {
  const { look, patch, preset } = useLook();
  const divider = <span className="h-9 w-px shrink-0 bg-line" />;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-pop">
      <Segmented size="sm" iconOnly label="Mode" value={look.base} onChange={(base) => patch({ base })} options={MODES} />
      {divider}
      <Knob size="sm" bare label="Size" value={look.size} min={14} max={26} defaultValue={17} format={(v) => `${v} pt`} onChange={(size) => patch({ size })} />
      <Knob size="sm" bare label="Lines" value={look.lines} min={1.2} max={2.2} step={0.1} defaultValue={1.6} format={(v) => v.toFixed(1)} onChange={(lines) => patch({ lines })} />
      {divider}
      <div className="flex items-center gap-1.5">
        {PRESETS.map((p) => (
          <PresetDot key={p.name} name={p.name} active={look.preset === p.name} onPick={() => preset(p.name)} />
        ))}
      </div>
      {divider}
      <Knob size="sm" bare hue label="Hue" value={look.tint ?? 38} min={0} max={360} step={2} format={(v) => (look.tint === null ? "None" : hueName(v))} onChange={(tint) => patch({ tint, strength: look.strength || 40 })} />
      {/* Grain lives in the full popover; the strip stays on one row. */}
    </div>
  );
}

/** Paper with real type, so every change is visible where it matters. */
export function ReadingPreview() {
  return (
    <div className="grain relative overflow-hidden rounded-2xl border border-line bg-paper px-8 py-7 text-ink">
      <p className="mb-3 text-center font-reading text-[15px] font-semibold">Chapter 1</p>
      <div className="reading mx-auto max-w-[520px] text-ink">
        <p>
          It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a
          wife.
        </p>
        <p>
          However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth
          is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one
          or other of their daughters.
        </p>
      </div>
    </div>
  );
}
