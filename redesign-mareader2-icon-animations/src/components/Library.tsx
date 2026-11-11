import { useEffect, useMemo, useRef, useState } from "react";
import { ORIGINAL_EASE_NAMES } from "../engine/core";
import { EASE_NAMES, type Cat, type IconDef, type Pack } from "../engine/motion";
import { measure, rustPack } from "../engine/rust";
import { svgDoc } from "../engine/svg";
import { CATS, STATIC_TODAY, USES } from "../icons";
import { IconButton, ORIGINAL_BY_ID, THEMES, useIcon, useLab, useTrigger } from "../lab";
import { cn } from "../utils/cn";
import { Glyph, OriginalGlyph, type GlyphHandle } from "./Glyph";
import { Section } from "./Intro";

function Tile({ def, order, compare }: { def: IconDef; order: number; compare: boolean }) {
  const { select, selected } = useLab();
  const quill = useIcon({ id: def.id, size: 28 });
  const shipped = useIcon({ id: def.id, size: 28, shipped: true });
  const showShipped = compare && shipped.node !== null;
  const { handlers, press } = useTrigger(() => {
    quill.play();
    if (showShipped) shipped.play();
  }, order);
  const on = selected === def.id;
  return (
    <button
      type="button"
      {...handlers}
      onClick={() => {
        press();
        select(def.id);
      }}
      aria-label={`${def.id}: inspect`}
      className={cn(
        "focusable group flex flex-col items-center rounded-[14px] border px-2 pb-3 pt-5 text-center transition-colors",
        on ? "border-accent bg-accent-soft" : "border-line bg-paper hover:bg-raise",
      )}
    >
      <span className="flex h-10 items-center justify-center gap-4 text-ink">
        {showShipped && <span className="text-muted">{shipped.node}</span>}
        {quill.node}
      </span>
      <span className="code mt-4 block max-w-full truncate text-[11px] text-ink">{def.id}</span>
      <span className="mt-0.5 block max-w-full truncate text-[11px] text-muted">
        {(USES[def.id] ?? []).join(" · ")}
      </span>
    </button>
  );
}

export function Library() {
  const { defs } = useLab();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat | "All">("All");
  const [compare, setCompare] = useState(false);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return defs.filter((d) => {
      if (cat !== "All" && d.cat !== cat) return false;
      if (!needle) return true;
      return (
        d.id.includes(needle) ||
        d.say.toLowerCase().includes(needle) ||
        (USES[d.id] ?? []).some((u) => u.toLowerCase().includes(needle))
      );
    });
  }, [defs, q, cat]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: defs.length };
    for (const d of defs) c[d.cat] = (c[d.cat] ?? 0) + 1;
    return c;
  }, [defs]);

  return (
    <Section
      id="library"
      n="03 — The library"
      title="All 104, ready to touch."
      lead="Hover or tap any glyph to play it; select one to scrub its timeline, compare it with the shipped pack and copy its Rust declaration. Names are the pack ids the app already uses, with the Icon variants that draw them."
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full sm:w-[280px]">
          <span className="sr-only">Search glyphs</span>
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M17.6 17.6l2.9 2.9" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by id, variant or motion"
            className="focusable h-10 w-full rounded-full border border-line bg-paper pl-10 pr-4 text-[13.5px] text-ink placeholder:text-muted"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
          {(["All", ...CATS] as (Cat | "All")[]).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "focusable h-8 rounded-full border px-3 text-[12.5px] transition-colors",
                cat === c
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-muted hover:text-ink",
              )}
            >
              {c} <span className="tabular-nums opacity-60">{counts[c] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="ml-auto flex cursor-pointer select-none items-center gap-2.5 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-5 w-9 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-paper after:transition-transform after:duration-200 peer-checked:bg-accent peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
          Beside the shipped glyph
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="mt-8 rounded-[16px] border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-[22px]">Nothing matches “{q}”.</p>
          <p className="mt-2 text-[14px] text-muted">
            Try a pack id like <code className="code text-ink">book-open</code> or a variant like{" "}
            <code className="code text-ink">Sidebar</code>.
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("All");
            }}
            className="focusable mt-5 h-9 rounded-full border border-line px-4 text-[13px] hover:bg-raise"
          >
            Clear the search
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
          {shown.map((d, i) => (
            <Tile key={d.id} def={d} order={i} compare={compare} />
          ))}
        </div>
      )}
    </Section>
  );
}

// ──────────────────────────────── inspector ─────────────────────────────────

function CopyButton({ text, label }: { text: () => string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text());
          setState("done");
        } catch {
          setState("failed");
        }
        window.setTimeout(() => setState("idle"), 1600);
      }}
      className="focusable h-8 rounded-full border border-line px-3.5 text-[12.5px] text-ink transition-colors hover:bg-raise"
    >
      {state === "done" ? "Copied" : state === "failed" ? "Select and copy by hand" : label}
    </button>
  );
}

function Timeline({ pack, t }: { pack: Pack; t: number | null }) {
  return (
    <div className="relative">
      <div className="space-y-1">
        {pack.segs.map((s, i) => {
          const part = pack.parts[s.part];
          const left = (s.t0 / pack.dur) * 100;
          const width = Math.max(1.2, (s.dur / pack.dur) * 100);
          const times =
            s.times.length === s.keys.length
              ? s.times
              : s.keys.map((_, k) => k / Math.max(1, s.keys.length - 1));
          return (
            <div key={i} className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3">
              <div className="code truncate text-[10.5px] text-muted">
                <span className="text-ink">{part.name}</span>.{s.prop}
              </div>
              <div className="relative h-[14px] rounded-[4px] bg-sunk">
                <div
                  className="absolute inset-y-0 rounded-[4px] bg-accent/30"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={s.eases.map((e) => EASE_NAMES[e]).join(" → ")}
                >
                  {times.map((u, k) => (
                    <i
                      key={k}
                      className="absolute top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-accent"
                      style={{ left: `${u * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {t !== null && (
        <div className="pointer-events-none absolute inset-y-0 left-[124px] right-0">
          <div
            className="absolute inset-y-[-4px] w-px bg-ink"
            style={{ left: `${Math.min(1, t / pack.dur) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

const RATES: [string, number][] = [
  ["1×", 1],
  ["½×", 0.5],
  ["¼×", 0.25],
];

export function Inspector() {
  const { selected, select, packs, defs, easings } = useLab();
  const def = defs.find((d) => d.id === selected);
  const pack = selected ? packs.get(selected) : undefined;
  const original = selected ? ORIGINAL_BY_ID.get(selected) : undefined;

  const quill = useRef<GlyphHandle | null>(null);
  const shipped = useRef<GlyphHandle | null>(null);
  const [t, setT] = useState<number | null>(null);
  const [rate, setRate] = useState(1);
  const [rust, setRust] = useState("");

  useEffect(() => {
    if (!pack || !def) return;
    setRust(rustPack(pack, def.say, measure(pack)));
  }, [pack, def]);

  useEffect(() => setT(null), [selected]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  // Opening a glyph plays it once, so the panel never opens on a still.
  useEffect(() => {
    if (!selected) return;
    const id = window.setTimeout(() => {
      quill.current?.play();
      shipped.current?.play();
    }, 280);
    return () => window.clearTimeout(id);
  }, [selected]);

  if (!def || !pack) return null;

  const index = defs.indexOf(def);
  const step = (d: number) => select(defs[(index + d + defs.length) % defs.length].id);
  const playBoth = () => {
    quill.current?.play();
    shipped.current?.play();
  };
  const scrub = (p: number) => {
    setT(p * pack.dur);
    quill.current?.seek(p * pack.dur);
    if (original) shipped.current?.seek(p * original.dur);
  };
  const release = () => {
    setT(null);
    quill.current?.seek(null);
    shipped.current?.seek(null);
  };

  return (
    <aside
      aria-label={`${def.id} inspector`}
      className="thin-scroll sheet-in fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-line bg-paper sm:w-[452px]"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-line bg-paper/90 px-4 py-2.5 backdrop-blur-md">
        <div className="min-w-0 flex-1 pl-1">
          <div className="eyebrow !text-[9.5px]">{def.cat}</div>
          <h3 className="truncate font-display text-[23px] leading-tight">{def.id}</h3>
        </div>
        <IconButton id="chevron-left" act="Click" label="Previous glyph" onPress={() => step(-1)} />
        <IconButton id="chevron-right" act="Click" label="Next glyph" onPress={() => step(1)} />
        <IconButton id="x" act="Click" label="Close inspector" onPress={() => select(null)} />
      </div>

      <div className="space-y-7 p-5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => quill.current?.play()}
            className="focusable rounded-[16px] border border-line bg-raise p-3 text-left"
            aria-label="Play the redesigned glyph"
          >
            <div className="stage-grid mx-auto grid aspect-square w-full max-w-[168px] place-items-center text-ink">
              <Glyph
                ref={quill}
                pack={pack}
                easings={easings}
                size={168}
                rate={rate}
                onTime={setT}
                className="!h-full !w-full"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="eyebrow !text-[9.5px] !text-accent">quill</span>
              <span className="code text-[10.5px] text-muted">
                {pack.dur.toFixed(2)} s · {pack.segs.length} segs
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => shipped.current?.play()}
            disabled={!original}
            className="focusable rounded-[16px] border border-line bg-raise p-3 text-left disabled:cursor-default"
            aria-label="Play the shipped glyph"
          >
            <div className="stage-grid mx-auto grid aspect-square w-full max-w-[168px] place-items-center text-muted">
              {original ? (
                <OriginalGlyph
                  ref={shipped}
                  pack={original}
                  size={168}
                  rate={rate}
                  className="!h-full !w-full"
                />
              ) : (
                <span className="px-4 text-center text-[12px] leading-snug">
                  {STATIC_TODAY.has(def.id)
                    ? "A static SVG in the app today. It has no pack, so it never moves."
                    : "No shipped pack."}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="eyebrow !text-[9.5px]">shipped</span>
              <span className="code text-[10.5px] text-muted">
                {original ? `${original.dur.toFixed(2)} s · ${original.segs.length} segs` : "—"}
              </span>
            </div>
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playBoth}
              className="focusable inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-paper transition-transform duration-150 active:scale-[0.96]"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 1.6v8.8L10 6z" fill="currentColor" />
              </svg>
              Play{original ? " both" : ""}
            </button>
            <div
              className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5"
              role="group"
              aria-label="Playback rate"
            >
              {RATES.map(([label, r]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={rate === r}
                  onClick={() => setRate(r)}
                  className={cn(
                    "focusable h-7 rounded-full px-2.5 text-[12.5px]",
                    rate === r ? "bg-ink text-paper" : "text-muted hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="code ml-auto text-[11px] text-muted tabular-nums">
              {t === null ? "rest" : `${Math.round(t * 1000)} ms`}
            </span>
          </div>
          <input
            type="range"
            className="slider mt-3"
            min={0}
            max={1}
            step={0.002}
            value={t === null ? 0 : Math.min(1, t / pack.dur)}
            onChange={(e) => scrub(Number(e.target.value))}
            onPointerUp={release}
            onKeyUp={(e) => e.key === "Escape" && release()}
            aria-label="Scrub the run"
          />
        </div>

        <p className="font-display text-[19px] leading-[1.35] text-ink">{def.say}</p>
        {original && (
          <p className="-mt-4 text-[13px] leading-[1.55] text-muted">
            <span className="text-ink">Shipped:</span> {original.doc}
          </p>
        )}

        <div>
          <div className="eyebrow mb-3">Timeline</div>
          <Timeline pack={pack} t={t} />
          {pack.issues.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[12px] text-[#e5484d]">
              {pack.issues.map((issue) => (
                <li key={issue}>Invariant broken: {issue}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[12px] text-muted">
              Starts and lands on the drawn pose; one segment per part and property.
            </p>
          )}
          {original && (
            <p className="code mt-1 text-[10.5px] text-muted">
              shipped curves: {[...new Set(original.segs.flatMap((s) => s[6]))]
                .map((e) => ORIGINAL_EASE_NAMES[e])
                .join(", ")}
            </p>
          )}
        </div>

        <div>
          <div className="eyebrow mb-3">Sizes, in every base mode</div>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((th) => (
              <div
                key={th}
                className={cn(
                  `theme-${th.toLowerCase()}`,
                  "flex items-center justify-between rounded-[12px] border border-line bg-paper px-2 py-1.5",
                )}
              >
                {[15, 18, 24].map((size) => (
                  <IconButton key={size} id={def.id} size={size} label={`${def.id} at ${size} pt`} />
                ))}
                <span className="code pr-1.5 text-[9.5px] text-muted">{th}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow mb-3">Drawn for</div>
          <div className="flex flex-wrap gap-1.5">
            {(USES[def.id] ?? []).map((u) => (
              <span key={u} className="code rounded-full border border-line px-2.5 py-1 text-[11px]">
                Icon::{u}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="eyebrow">source.rs</div>
            <div className="flex gap-1.5">
              <CopyButton label="Copy SVG" text={() => svgDoc(pack, easings, null)} />
              <CopyButton label="Copy Rust" text={() => rust} />
            </div>
          </div>
          <pre className="code thin-scroll max-h-[300px] overflow-auto rounded-[12px] border border-line bg-sunk p-3.5 text-[10.5px] text-muted">
            {rust}
          </pre>
        </div>
      </div>
    </aside>
  );
}
