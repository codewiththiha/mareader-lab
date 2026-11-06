import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Copy, Download, RotateCcw, Dices, Grid3x3 } from "lucide-react";
import { ALL, CAT_LABEL, type Cat } from "../data/registry";
import { IconView, copyText, downloadSvg, serializeFromNode, useReveal } from "../lib/kit";

const TINTS = [
  ["Paper", "#f0e7d3"],
  ["Lamp", "#e8a33d"],
  ["Teal", "#45b3a0"],
  ["Ember", "#e0653a"],
  ["Iris", "#8b95f2"],
  ["Moss", "#8fb75f"],
  ["Rose", "#d76a8c"],
] as const;

const SURFACES = [
  { id: "ink", label: "Ink", bg: "#16130e", guide: "#f0e7d3" },
  { id: "paper", label: "Paper", bg: "#f0e7d3", guide: "#16130e" },
  { id: "lamp", label: "Lamplight", bg: "#2b1e0c", guide: "#e8a33d" },
  { id: "night", label: "Night teal", bg: "#0d1f1b", guide: "#45b3a0" },
] as const;

interface LabState {
  id: string; size: number; sw: number; pad: number;
  cap: "round" | "square"; tint: string; surface: string; grid: boolean;
}

const DEFAULTS: LabState = {
  id: "engine-kokoro", size: 128, sw: 2, pad: 0,
  cap: "round", tint: "#e8a33d", surface: "ink", grid: true,
};

function Slider({ label, value, min, max, step, unit, disabled, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; disabled?: boolean; onChange: (v: number) => void;
}) {
  const fill = `${((value - min) / (max - min)) * 100}%`;
  return (
    <label className={`block ${disabled ? "opacity-45" : ""}`}>
      <span className="mb-2 flex items-baseline justify-between">
        <span className="text-[11.5px] font-medium text-cream">{label}</span>
        <span className="font-mono text-[10.5px] text-amber">{value}{unit}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ "--fill": fill } as CSSProperties}
      />
    </label>
  );
}

export function Lab({ labId, notify }: { labId: string | null; notify: (m: string) => void }) {
  const [s, setS] = useState<LabState>(DEFAULTS);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const { ref, seen } = useReveal();

  useEffect(() => {
    if (labId) setS((p) => ({ ...p, id: labId }));
  }, [labId]);

  const entry = ALL.find((e) => e.id === s.id) ?? ALL[0];
  const isRaw = !!entry.raw;
  const surface = SURFACES.find((x) => x.id === s.surface) ?? SURFACES[0];
  const set = <K extends keyof LabState>(k: K, v: LabState[K]) => setS((p) => ({ ...p, [k]: v }));

  const groups = useMemo(() => {
    const m = new Map<Cat, typeof ALL>();
    ALL.forEach((e) => { m.set(e.cat, [...(m.get(e.cat) ?? []), e]); });
    return [...m.entries()];
  }, []);

  const vb = s.pad ? `${-s.pad} ${-s.pad} ${24 + s.pad * 2} ${24 + s.pad * 2}` : "0 0 24 24";
  const grab = () => serializeFromNode(previewRef.current, s.size, s.tint);

  const shuffle = () => {
    const e = ALL[Math.floor(Math.random() * ALL.length)];
    const t = TINTS[Math.floor(Math.random() * TINTS.length)][1];
    setS((p) => ({ ...p, id: e.id, tint: t }));
    notify(`Shuffled to ${e.label}`);
  };

  return (
    <section id="lab" className="relative scroll-mt-14 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,#2b1e0c_0%,#16130e_62%)]" />
      <div className="aurora left-[8%] top-[30%] h-[360px] w-[420px] bg-amber/12" style={{ animationDelay: "-8s" }} />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div ref={ref} className={`reveal ${seen ? "seen" : ""} max-w-3xl`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber">the icon lab</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Bend the marks. <em className="font-light italic text-amber">Keep the grid.</em>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-cream">
            Every mark in the ledger, live on the drafting table. Change the size,
            weight, cap, tint or paper — the export is exactly what you see,
            keylines left behind.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ---------- drafting table ---------- */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-paper/12 bg-ink2/70">
            <div className="flex items-center justify-between border-b border-paper/10 px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/60">drafting table</span>
              <span className="font-mono text-[10.5px] text-amber">{entry.label}</span>
            </div>

            <div
              className="relative flex min-h-[360px] grow items-center justify-center p-8 transition-colors duration-300"
              style={{ background: surface.bg }}
            >
              <div ref={previewRef} className="relative" style={{ width: s.size, height: s.size }}>
                <IconView entry={entry} size={s.size} sw={s.sw} cap={s.cap} pad={isRaw ? 0 : s.pad} tint={s.tint} />
                {s.grid && !isRaw && (
                  <svg
                    viewBox={vb} width={s.size} height={s.size}
                    className="pointer-events-none absolute left-0 top-0"
                    style={{ color: surface.guide }}
                  >
                    {Array.from({ length: 25 }, (_, i) => (
                      <g key={i} className="keyline" strokeWidth={i % 6 === 0 ? 0.14 : 0.06}>
                        <line x1={i} y1={-s.pad} x2={i} y2={24 + s.pad} stroke="currentColor" />
                        <line x1={-s.pad} y1={i} x2={24 + s.pad} y2={i} stroke="currentColor" />
                      </g>
                    ))}
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.14" className="keyline" />
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="0.14" className="keyline" />
                  </svg>
                )}
                {s.grid && isRaw && (
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-widest" style={{ color: surface.guide, opacity: 0.6 }}>
                    fill mark · fixed geometry
                  </span>
                )}
              </div>
            </div>

            {/* pixel ladder */}
            <div className="border-t border-paper/10 px-5 py-4">
              <p className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.25em] text-cream/50">pixel ladder — true sizes</p>
              <div className="flex flex-wrap items-end gap-3">
                {[16, 20, 24, 32, 48].map((px) => (
                  <div key={px} className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex items-center justify-center rounded-lg border border-paper/12 transition-colors duration-300"
                      style={{ background: surface.bg, width: Math.max(px + 20, 40), height: Math.max(px + 20, 40) }}
                    >
                      <IconView entry={entry} size={px} sw={s.sw} cap={s.cap} tint={s.tint} />
                    </div>
                    <span className="font-mono text-[9px] text-cream/50">{px}</span>
                  </div>
                ))}
                <p className="ml-auto max-w-[180px] text-right font-mono text-[9.5px] leading-relaxed text-cream/45">
                  {entry.glyph}
                </p>
              </div>
            </div>
          </div>

          {/* ---------- the rail ---------- */}
          <div className="flex flex-col gap-5 rounded-2xl border border-paper/12 bg-ink2/90 p-5">
            <label className="block">
              <span className="mb-2 block text-[11.5px] font-medium text-cream">Mark</span>
              <select
                value={s.id}
                onChange={(e) => set("id", e.target.value)}
                className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2.5 text-[13px] text-paper focus:border-amber focus:outline-none"
              >
                {groups.map(([c, list]) => (
                  <optgroup key={c} label={CAT_LABEL[c]}>
                    {list.map((e) => (
                      <option key={e.id} value={e.id}>{e.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <Slider label="Size" value={s.size} min={16} max={192} step={4} unit="px" onChange={(v) => set("size", v)} />
            <Slider label="Stroke weight" value={s.sw} min={1} max={3} step={0.25} disabled={isRaw} onChange={(v) => set("sw", v)} />
            <Slider label="Optical padding" value={s.pad} min={0} max={6} step={0.5} disabled={isRaw} onChange={(v) => set("pad", v)} />

            <div className={isRaw ? "opacity-45" : ""}>
              <span className="mb-2 block text-[11.5px] font-medium text-cream">Caps &amp; joins</span>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-paper/15 bg-ink p-1">
                {(["round", "square"] as const).map((c) => (
                  <button
                    key={c}
                    disabled={isRaw}
                    onClick={() => set("cap", c)}
                    className={`rounded-md py-1.5 text-[11.5px] font-medium capitalize transition-colors ${s.cap === c ? "bg-amber text-ink" : "text-cream/70 hover:text-paper"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[11.5px] font-medium text-cream">Tint</span>
              <div className="flex items-center gap-2">
                {TINTS.map(([name, hex]) => (
                  <button
                    key={hex}
                    title={name}
                    onClick={() => set("tint", hex)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${s.tint === hex ? "border-paper" : "border-transparent"}`}
                    style={{ background: hex }}
                  />
                ))}
                <input
                  type="color"
                  value={s.tint}
                  onChange={(e) => set("tint", e.target.value)}
                  title="Custom tint"
                  className="h-7 w-9"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[11.5px] font-medium text-cream">Paper</span>
              <div className="grid grid-cols-4 gap-1.5">
                {SURFACES.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => set("surface", sf.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${s.surface === sf.id ? "border-amber bg-amber/10" : "border-paper/12 hover:border-paper/30"}`}
                  >
                    <span className="h-5 w-full rounded" style={{ background: sf.bg, border: "1px solid rgba(240,231,211,0.2)" }} />
                    <span className="text-[9px] font-medium text-cream/75">{sf.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => set("grid", !s.grid)}
              className="flex items-center justify-between rounded-lg border border-paper/15 bg-ink px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-[11.5px] font-medium text-cream">
                <Grid3x3 size={13} className="text-amber" /> Keyline grid
              </span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${s.grid ? "bg-amber" : "bg-paper/15"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all ${s.grid ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2 border-t border-paper/10 pt-4">
              <button
                onClick={() => { setS({ ...DEFAULTS, id: s.id }); notify("Table reset"); }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-paper/20 py-2.5 text-[12px] font-medium text-paper hover:border-amber/60 hover:text-amber"
              >
                <RotateCcw size={13} /> Reset
              </button>
              <button
                onClick={shuffle}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-paper/20 py-2.5 text-[12px] font-medium text-paper hover:border-iris/70 hover:text-iris"
              >
                <Dices size={13} /> Shuffle
              </button>
              <button
                onClick={async () => {
                  const svg = grab();
                  if (svg && (await copyText(svg))) notify(`${entry.label} copied — exactly as set`);
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-amber py-2.5 text-[12px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                <Copy size={13} /> Copy SVG
              </button>
              <button
                onClick={() => {
                  const svg = grab();
                  if (svg) { downloadSvg(svg, `mareader-${entry.id}`); notify(`${entry.label} exported at ${s.size}px`); }
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-paper py-2.5 text-[12px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                <Download size={13} /> Download
              </button>
            </div>

            <p className="font-mono text-[9.5px] leading-relaxed text-cream/45">
              {entry.id}.svg · {s.size}px · {isRaw ? "fill" : `stroke ${s.sw}`} · {isRaw ? "fixed" : s.cap} · {s.tint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
