import { useEffect, useMemo, type ReactNode } from "react";
import { ORIGINAL_EASINGS, values, type Seg } from "../engine/core";
import { P, build, easingsFor, type IconDef } from "../engine/motion";
import { IconButton, ORIGINALS, ORIGINAL_BY_ID, THEMES, useIcon, useLab, type Theme } from "../lab";
import { OriginalGlyph, originalSegs } from "./Glyph";

export function Section({
  id,
  n,
  title,
  lead,
  children,
}: {
  id: string;
  n: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 sm:py-28">
      <div className="eyebrow">{n}</div>
      <h2 className="mt-3 max-w-[20ch] font-display text-[34px] leading-[1.08] tracking-[-0.01em] text-balance sm:text-[44px]">
        {title}
      </h2>
      {lead && (
        <p className="mt-5 max-w-[64ch] text-[15.5px] leading-[1.65] text-muted">{lead}</p>
      )}
      <div className="mt-12">{children}</div>
    </section>
  );
}

const THEME_ICON: Record<Theme, string> = {
  Light: "sun",
  Dark: "moon",
  Dim: "sun-moon",
  Black: "eclipse",
};

function Logo() {
  const { node, play } = useIcon({ id: "feather", size: 20 });
  return (
    <a
      href="#top"
      onPointerEnter={play}
      className="focusable flex items-center gap-2.5 rounded-md py-1 text-ink"
    >
      {node}
      <span className="font-display text-[20px] leading-none">Quill</span>
      <span className="hidden text-[12.5px] text-muted sm:inline">icons for Mareader</span>
    </a>
  );
}

export function Nav() {
  const { theme, setTheme, selected } = useLab();
  const links = [
    ["#diagnosis", "Diagnosis"],
    ["#formula", "Formula"],
    ["#library", "Library"],
    ["#in-place", "In place"],
    ["#port", "Port"],
  ];
  return (
    <header
      className={`sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md ${
        selected ? "lg:pr-[452px]" : ""
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-4 px-5 sm:px-8">
        <Logo />
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Sections">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="focusable rounded-md px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <div
          className="ml-auto flex items-center gap-0.5 rounded-[10px] border border-line p-0.5 md:ml-3"
          role="group"
          aria-label="Base mode"
        >
          {THEMES.map((t) => (
            <IconButton
              key={t}
              id={THEME_ICON[t]}
              size={16}
              act="Click"
              label={`${t} mode`}
              pressed={theme === t}
              onPress={() => setTheme(t)}
              className="!h-7 !w-7 !rounded-[7px]"
            />
          ))}
        </div>
      </div>
    </header>
  );
}

const FEATURED = [
  "book-open",
  "search",
  "bookmark",
  "highlighter",
  "panel-left",
  "settings",
  "check",
  "download",
  "headphones",
  "moon",
  "folder-open",
  "ai-mark",
  "trash-2",
  "eye",
  "pencil",
  "sun",
  "keyboard",
  "circle-check",
  "volume-2",
  "list",
  "refresh-cw",
  "feather",
  "pin",
  "palette",
];

export function Hero() {
  const { packs, defs, playAll, select } = useLab();
  const stats = useMemo(() => {
    const all = [...packs.values()];
    const durs = all.map((p) => p.dur).sort((a, b) => a - b);
    return {
      count: defs.length,
      broken: all.filter((p) => p.issues.length).length,
      median: durs[durs.length >> 1] ?? 0,
      segs: all.reduce((a, p) => a + p.segs.length, 0),
    };
  }, [packs, defs]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(playAll, 650);
    return () => window.clearTimeout(id);
  }, [playAll]);

  return (
    <section id="top" className="mx-auto max-w-[1180px] px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
      <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className="rise">
          <div className="eyebrow">A proposal for mareader2 · crates/animated-icons</div>
          <h1 className="mt-5 font-display text-[52px] leading-[0.98] tracking-[-0.02em] text-balance sm:text-[76px]">
            Icons that <em className="font-display italic">answer back.</em>
          </h1>
          <p className="mt-7 max-w-[54ch] text-[16.5px] leading-[1.65] text-muted">
            Every glyph the app draws, redrawn so its parts can move on their own and
            choreographed by one small formula. Each one plays here through a port of the
            evaluator in <code className="code text-ink">lib.rs</code>, so what moves on this
            page is what the Rust will play.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={playAll}
              className="focusable inline-flex h-11 items-center gap-2.5 rounded-full bg-ink px-5 text-[14px] font-medium text-paper transition-transform duration-150 active:scale-[0.97]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 1.6v8.8L10 6z" fill="currentColor" />
              </svg>
              Play all {stats.count}
            </button>
            <a
              href="#library"
              className="focusable inline-flex h-11 items-center rounded-full border border-line px-5 text-[14px] text-ink transition-colors hover:bg-raise"
            >
              Browse the library
            </a>
          </div>
        </div>

        <div
          className="rise grid grid-cols-6 gap-1.5 rounded-[20px] border border-line bg-raise p-2.5"
          style={{ animationDelay: "90ms" }}
        >
          {FEATURED.map((id, i) => (
            <IconButton
              key={id}
              id={id}
              size={28}
              order={i}
              onPress={() => select(id)}
              className="!aspect-square !h-auto !w-full !rounded-[12px] bg-paper"
            />
          ))}
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
        {[
          [String(stats.count), "glyphs: 98 packs and 6 voice marks"],
          [String(stats.broken), "invariant breaks across the set"],
          [`${Math.round(stats.median * 1000)} ms`, "median run, start to rest"],
          [String(stats.segs), "segments, one per part and property"],
        ].map(([value, label]) => (
          <div key={label}>
            <dt className="font-display text-[34px] leading-none tabular-nums">{value}</dt>
            <dd className="mt-2 text-[13px] leading-snug text-muted">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ───────────────────────────────── the curve ─────────────────────────────────

const PROBE: IconDef = {
  id: "probe",
  cat: "Chrome",
  say: "",
  parts: () => [P("p", "M0 0h1")],
  move: (m) => m.go("p", { x: 1 }),
};
const TEMPLATE: Seg = {
  part: 0,
  prop: "X",
  t0: 0,
  dur: 0.5,
  keys: [0, 1, 0],
  times: [0, 0.4, 1],
  eases: [1, 2],
};

/** One out-and-back move: the shipped template against Cue · Act · Rest. */
export function CurvePlot() {
  const { feel } = useLab();
  const W = 460;
  const H = 210;
  const SPAN = 0.64;
  const { mine, theirs, marks } = useMemo(() => {
    const pack = build(PROBE, { ...feel, travel: 1 });
    const eas = easingsFor(feel);
    const N = 220;
    const x = (t: number) => 36 + (t / SPAN) * (W - 48);
    const y = (v: number) => 150 - v * 104;
    const line = (fn: (t: number) => number) =>
      Array.from({ length: N + 1 }, (_, i) => {
        const t = (i / N) * SPAN;
        return `${i ? "L" : "M"}${x(t).toFixed(1)} ${y(fn(t)).toFixed(1)}`;
      }).join("");
    const cue = feel.cue > 0.01 ? 0.045 / feel.tempo : 0;
    const act = cue + 0.12 / feel.tempo;
    return {
      mine: line((t) => values([2], pack.segs, t, eas)[0].X),
      theirs: line((t) => values([2], [TEMPLATE], t, ORIGINAL_EASINGS)[0].X),
      marks: { x, y, cue, act, end: pack.dur },
    };
  }, [feel]);
  const { x, y, cue, act, end } = marks;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full"
      role="img"
      aria-label="Displacement over time: the shipped out-and-back curve against the new cue, act and rest curve."
    >
      {cue > 0 && (
        <rect x={x(0)} y={18} width={x(cue) - x(0)} height={168} fill="var(--accent)" opacity={0.1} />
      )}
      <rect x={x(cue)} y={18} width={x(act) - x(cue)} height={168} fill="var(--accent)" opacity={0.2} />
      <rect
        x={x(act)}
        y={18}
        width={Math.max(0, x(Math.min(end, SPAN)) - x(act))}
        height={168}
        fill="var(--accent)"
        opacity={0.05}
      />
      <line x1={36} x2={W - 12} y1={y(0)} y2={y(0)} stroke="var(--line)" />
      <line x1={36} x2={W - 12} y1={y(1)} y2={y(1)} stroke="var(--line)" strokeDasharray="2 4" />
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={186} y2={190} stroke="var(--muted)" />
          <text x={x(t)} y={203} textAnchor="middle" fontFamily="var(--font-mono)" fill="var(--muted)" fontSize={11}>
            {t * 1000}
          </text>
        </g>
      ))}
      <text x={30} y={y(0) + 3.5} textAnchor="end" fontFamily="var(--font-mono)" fill="var(--muted)" fontSize={11}>
        rest
      </text>
      <text x={30} y={y(1) + 3.5} textAnchor="end" fontFamily="var(--font-mono)" fill="var(--muted)" fontSize={11}>
        mark
      </text>
      {cue > 0 && (
        <text x={(x(0) + x(cue)) / 2} y={13} textAnchor="middle" fontFamily="var(--font-mono)" fill="var(--accent)" fontSize={10.5}>
          cue
        </text>
      )}
      <text x={(x(cue) + x(act)) / 2} y={13} textAnchor="middle" fontFamily="var(--font-mono)" fill="var(--accent)" fontSize={10.5}>
        act
      </text>
      <text x={x(act) + 8} y={13} fontFamily="var(--font-mono)" fill="var(--accent)" fontSize={10.5}>
        rest: a real spring
      </text>
      <path d={theirs} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="4 4" />
      <path d={mine} fill="none" stroke="var(--accent)" strokeWidth={2.25} strokeLinecap="round" />
    </svg>
  );
}

// ──────────────────────────────── diagnosis ─────────────────────────────────

/** Everything below is counted from source.rs as parsed into original.json. */
function useAudit() {
  return useMemo(() => {
    let segs = 0;
    let template = 0;
    let strokeW = 0;
    let skew = 0;
    let deadShapes = 0;
    let deadPacks = 0;
    const travel: number[] = [];
    const firstHidden: string[] = [];
    const parser = new DOMParser();
    for (const p of ORIGINALS) {
      const list = originalSegs(p);
      segs += list.length;
      for (const s of list) {
        const same =
          s.keys.length === 3 &&
          s.times.length === 3 &&
          Math.abs(s.times[1] - 0.4) < 0.06 &&
          s.keys[0] === s.keys[2];
        if (same) template++;
        if (s.prop === "StrokeW") strokeW++;
        if (s.prop === "SkewX" || s.prop === "SkewY") skew++;
        if (s.prop === "X" || s.prop === "Y") travel.push(Math.max(...s.keys.map(Math.abs)));
      }
      const dead = (p.svg.match(/opacity="0"/g) ?? []).length;
      if (dead) {
        deadShapes += dead;
        deadPacks++;
      }
      const vals = values(
        p.parts.map((q) => q[4]),
        list,
        0,
        ORIGINAL_EASINGS,
      );
      const doc = parser.parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg">${p.svg}</svg>`,
        "image/svg+xml",
      );
      let hidden = false;
      doc.querySelectorAll("[data-p]").forEach((el) => {
        const v = vals[Number(el.getAttribute("data-p"))];
        if (!v || !(v.Opacity <= 0.001 || v.PathLen <= 0.001)) return;
        const shapes = el.matches("path,rect,circle,line")
          ? [el]
          : [...el.querySelectorAll("path,rect,circle,line")];
        if (shapes.some((sh) => !sh.closest('[opacity="0"]'))) hidden = true;
      });
      if (hidden) firstHidden.push(p.id);
    }
    travel.sort((a, b) => a - b);
    return {
      packs: ORIGINALS.length,
      segs,
      template,
      strokeW,
      skew,
      deadShapes,
      deadPacks,
      median: travel[travel.length >> 1] ?? 0,
      firstHidden,
    };
  }, []);
}

function Versus({ id }: { id: string }) {
  const shipped = useIcon({ id, size: 30, shipped: true });
  const quill = useIcon({ id, size: 30 });
  const both = () => {
    shipped.play();
    quill.play();
  };
  return (
    <button
      type="button"
      onPointerEnter={(e) => e.pointerType !== "touch" && both()}
      onClick={both}
      aria-label={`Play ${id}: shipped and redesigned`}
      className="focusable group grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-line bg-line text-left"
    >
      <span className="grid place-items-center gap-2 bg-paper px-3 pb-2.5 pt-4 text-muted">
        {shipped.node}
        <span className="eyebrow !text-[9px]">shipped</span>
      </span>
      <span className="grid place-items-center gap-2 bg-paper px-3 pb-2.5 pt-4 text-ink">
        {quill.node}
        <span className="eyebrow !text-[9px] !text-accent">quill</span>
      </span>
    </button>
  );
}

function Finding({
  n,
  title,
  where,
  children,
  demo,
}: {
  n: string;
  title: string;
  where: string;
  children: ReactNode;
  demo: ReactNode;
}) {
  return (
    <article className="grid gap-6 border-t border-line py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-12">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="code text-accent">{n}</span>
          <h3 className="font-display text-[25px] leading-tight">{title}</h3>
        </div>
        <div className="mt-3.5 max-w-[60ch] space-y-3 text-[14.5px] leading-[1.65] text-muted [&_b]:font-medium [&_b]:text-ink [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-ink">
          {children}
        </div>
        <div className="code mt-4 text-[11px] text-muted">{where}</div>
      </div>
      <div className="self-start rounded-[16px] border border-line bg-raise p-4">{demo}</div>
    </article>
  );
}

export function Diagnosis() {
  const a = useAudit();
  const samples = ["plus", "check", "columns-2", "table", "list"].filter(
    (id) => a.firstHidden.includes(id) && ORIGINAL_BY_ID.has(id),
  );
  const pct = Math.round((a.template / a.segs) * 100);

  return (
    <Section
      id="diagnosis"
      n="01 — What the code says"
      title="Why the shipped set feels still."
      lead={
        <>
          Before drawing anything I read the pipeline end to end: the {a.packs} declarations in{" "}
          <code className="code text-ink">source.rs</code>, the generator in{" "}
          <code className="code text-ink">build.rs</code>, the evaluator and atlas in{" "}
          <code className="code text-ink">lib.rs</code>, and the trigger policy in{" "}
          <code className="code text-ink">icons/anim.rs</code>. Then I replayed all {a.segs}{" "}
          segments through a port of <code className="code text-ink">values()</code>. Every
          number below is counted from that data on this page. I have not compiled or run the
          Rust build, so treat the last two findings as things to confirm.
        </>
      }
    >
      <Finding
        n="A"
        title={`One sentence, said ${a.template} times`}
        where="source.rs · EASINGS[1] snap, EASINGS[2] settle"
        demo={
          <>
            <CurvePlot />
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted">
              <span className="flex items-center gap-2">
                <i className="inline-block h-0 w-5 border-t-2 border-dashed border-muted" /> shipped
                template
              </span>
              <span className="flex items-center gap-2">
                <i className="inline-block h-0.5 w-5 rounded bg-accent" /> cue · act · rest
              </span>
            </div>
          </>
        }
      >
        <p>
          <b>
            {a.template} of {a.segs} segments ({pct} %)
          </b>{" "}
          are the same shape: out to a value at 40 % of the run on <code>snap</code>, back on{" "}
          <code>settle</code>. Whatever the glyph is, it says the same thing at the same pace.
        </p>
        <p>
          <code>settle</code> is a bezier with one overshoot. It reads as a slide with a bump,
          not as something with mass: there is no wind-up before the move and no ringing after
          it.
        </p>
      </Finding>

      <Finding
        n="B"
        title="Travel below what the eye catches"
        where="theme.rs · Tokens::icon = 18.0 · source.rs keys"
        demo={
          <div className="grid grid-cols-3 gap-2.5">
            {["copy", "layout-template", "panel-left-close"].map((id) => (
              <Versus key={id} id={id} />
            ))}
            <p className="col-span-3 mt-1 text-[12px] leading-snug text-muted">
              Hover or tap a pair. Both play at once, on the same evaluator.
            </p>
          </div>
        }
      >
        <p>
          The median translation is <b>{a.median} grid units</b>. The toolbar draws icons at 18
          pt, so that is <b>{(a.median * 0.75).toFixed(1)} px</b> of movement, spread over half
          a second.
        </p>
        <p>
          The properties that still read at that size are barely used: stroke width appears in{" "}
          <b>{a.strokeW}</b> segments and skew in <b>{a.skew}</b>.
        </p>
      </Finding>

      <Finding
        n="C"
        title="The liveliest layers never render"
        where="build.rs · fn hidden, fn nodes · lib.rs · render_nodes"
        demo={
          <div className="grid grid-cols-3 gap-2.5">
            {["chevron-right", "moon", "headphones"].map((id) => (
              <Versus key={id} id={id} />
            ))}
            <p className="col-span-3 mt-1 text-[12px] leading-snug text-muted">
              The shipped packs declare an echo, two stars and an equaliser here. Watch for
              them on the left.
            </p>
          </div>
        }
      >
        <p>
          <b>
            {a.deadShapes} shapes in {a.deadPacks} packs
          </b>{" "}
          are authored with <code>opacity="0"</code>: the ghost windows, the chevrons' echo, the
          bookmark's flash, the moon's stars, the equaliser in the headphones, the AI spark.
        </p>
        <p>
          <code>hidden()</code> drops any shape whose own opacity is zero, and a part's{" "}
          <code>Opacity</code> multiplies the enclosing group, never that attribute. So the
          segments that were written to fade those layers in have nothing to act on.
        </p>
      </Finding>

      <Finding
        n="D"
        title="The first sample is not always the glyph"
        where="lib.rs · raster_resting → values(pack, 0.0) · fn clock"
        demo={
          <div>
            <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] items-center gap-x-2 gap-y-3 text-muted">
              <span className="eyebrow !text-[9px]">drawn</span>
              {samples.map((id) => (
                <span key={id} className="grid place-items-center text-ink">
                  <OriginalGlyph pack={ORIGINAL_BY_ID.get(id)!} size={28} />
                </span>
              ))}
              <span className="eyebrow !text-[9px]">t = 0</span>
              {samples.map((id) => (
                <span key={id} className="grid place-items-center text-ink">
                  <OriginalGlyph pack={ORIGINAL_BY_ID.get(id)!} size={28} firstSample />
                </span>
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-snug text-muted">
              Top: the markup as authored. Bottom: the same pack at{" "}
              <code className="code">values(pack, 0.0)</code>, from the port.
            </p>
          </div>
        }
      >
        <p>
          The resting texture is the pack's sample at <code>t = 0</code>. But{" "}
          <code>values()</code> lets every segment assign on every sample, and a zero-length
          segment at <code>t0: 0.0</code> has already fired. In{" "}
          <b>{a.firstHidden.length} packs</b> that leaves at least one drawn part hidden in the
          first sample.
        </p>
        <p>
          The parity test compares against the same evaluation, so it would pass either way. If
          the app does show these glyphs incomplete at rest, this is the cause. The redesign
          sidesteps it: one segment per part and property, each starting and ending on the
          drawn pose.
        </p>
      </Finding>
    </Section>
  );
}
