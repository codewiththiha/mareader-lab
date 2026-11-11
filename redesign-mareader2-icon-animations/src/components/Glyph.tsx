import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  ORIGINAL_EASINGS,
  frameTime,
  transformOf,
  values,
  type Ease,
  type Prop,
  type Seg,
} from "../engine/core";
import type { Pack } from "../engine/motion";
import { groupAttrs, tree } from "../engine/svg";

// ───────────────────────────── one shared ticker ─────────────────────────────

type Tick = (now: number) => boolean;
const live = new Set<Tick>();
let raf = 0;
function loop(now: number) {
  for (const tick of [...live]) if (!tick(now)) live.delete(tick);
  raf = live.size ? requestAnimationFrame(loop) : 0;
}
function schedule(tick: Tick) {
  live.add(tick);
  if (!raf) raf = requestAnimationFrame(loop);
}

export interface GlyphHandle {
  /** Starts a run; a call that arrives mid-run queues exactly one replay. */
  play: () => void;
  /** Shows one sample, in seconds; null returns to rest. */
  seek: (t: number | null) => void;
  duration: () => number;
}

interface RunOpts {
  /** Playback rate; 1 is real time. */
  rate?: number;
  onTime?: (t: number | null) => void;
}

/**
 * The run policy of crates/ui/src/icons/anim.rs: samples land on 60 Hz
 * boundaries, a press mid-run is queued (`Order::Again`), and a landed run
 * hands back to the resting glyph.
 */
function useRun(apply: (t: number | null) => void, dur: number, opts: RunOpts): GlyphHandle {
  const state = useRef({ start: -1, again: false, gen: 0 });
  const latest = useRef({ apply, dur, opts });
  latest.current = { apply, dur, opts };

  const play = useCallback(() => {
    const s = state.current;
    if (s.start >= 0) {
      s.again = true;
      return;
    }
    s.start = performance.now();
    const gen = ++s.gen;
    schedule((now) => {
      // A seek, or a later run, has taken the glyph: leave it alone.
      if (s.gen !== gen) return false;
      const { apply: a, dur: d, opts: o } = latest.current;
      const t = ((now - s.start) / 1000) * (o.rate ?? 1);
      if (t >= d) {
        if (s.again) {
          s.again = false;
          s.start = now;
          a(0);
          return true;
        }
        s.start = -1;
        a(null);
        o.onTime?.(null);
        return false;
      }
      a(frameTime(t, d));
      o.onTime?.(t);
      return true;
    });
  }, []);

  const seek = useCallback((t: number | null) => {
    const s = state.current;
    s.start = -1;
    s.again = false;
    s.gen++;
    latest.current.apply(t);
  }, []);

  return useMemo(() => ({ play, seek, duration: () => latest.current.dur }), [play, seek]);
}

const ATTRS = [
  "transform",
  "opacity",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
];

interface GlyphProps extends RunOpts {
  pack: Pack;
  easings: Ease[];
  size?: number;
  className?: string;
  title?: string;
}

/** A redesigned glyph: built parts, driven sample by sample. */
export const Glyph = forwardRef<GlyphHandle, GlyphProps>(function Glyph(
  { pack, easings, size = 24, className, title, rate, onTime },
  ref,
) {
  const groups = useRef<(SVGGElement | null)[]>([]);
  const widths = useMemo(() => pack.parts.map((q) => q.w), [pack]);

  const apply = useCallback(
    (t: number | null) => {
      const vals = t === null ? null : values(widths, pack.segs, t, easings);
      pack.parts.forEach((part, i) => {
        const g = groups.current[i];
        if (!g) return;
        const attrs: Record<string, string> = vals
          ? groupAttrs(part.ox, part.oy, vals[i], part.w, part.ghost)
          : part.ghost
            ? { opacity: "0" }
            : {};
        for (const k of ATTRS) {
          const v = attrs[k];
          if (v === undefined) g.removeAttribute(k);
          else g.setAttribute(k, v);
        }
      });
    },
    [pack, easings, widths],
  );

  const run = useRun(apply, pack.dur, { rate, onTime });
  useImperativeHandle(ref, () => run, [run]);
  // A re-tuned pack starts from rest, never from a half-applied pose.
  useEffect(() => run.seek(null), [pack, run]);

  const { roots, kids } = useMemo(() => tree(pack), [pack]);
  const draw = (i: number): ReactNode => {
    const part = pack.parts[i];
    return (
      <g
        key={i}
        ref={(el) => {
          groups.current[i] = el;
        }}
        opacity={part.ghost ? 0 : undefined}
      >
        {part.shapes.map((s, k) =>
          s.fill ? (
            <path key={k} d={s.d} fill="currentColor" stroke="none" />
          ) : (
            <path key={k} d={s.d} pathLength={1} />
          ),
        )}
        {kids[i].map(draw)}
      </g>
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={widths[0] ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ overflow: "visible", display: "block", flex: "none" }}
      role="img"
      aria-label={title ?? pack.id}
    >
      {roots.map(draw)}
    </svg>
  );
});

// ───────────────────────── the shipped packs, as shipped ─────────────────────

/** One entry of src/data/original.json, parsed out of source.rs. */
export interface OriginalPack {
  id: string;
  doc: string;
  dur: number;
  /** name, ox, oy, len, w */
  parts: [string, number, number, number, number][];
  /** part, prop, t0, dur, keys, times, eases */
  segs: [number, string, number, number, number[], number[], number[]][];
  svg: string;
}

export function originalSegs(pack: OriginalPack): Seg[] {
  return pack.segs.map(([part, prop, t0, dur, keys, times, eases]) => ({
    part,
    prop: prop as Prop,
    t0,
    dur,
    keys,
    times,
    eases,
  }));
}

interface OriginalProps extends RunOpts {
  pack: OriginalPack;
  size?: number;
  className?: string;
  /** Hold the first sample, `values(pack, 0.0)`, instead of the drawn glyph. */
  firstSample?: boolean;
}

const n4 = (v: number) => String(Math.round(v * 10000) / 10000);

/**
 * A shipped Lucide pack, evaluated the way lib.rs evaluates it and written
 * the way parity.rs `moves` writes it. Shapes authored with `opacity="0"`
 * stay invisible, as they do once build.rs has dropped them.
 */
export const OriginalGlyph = forwardRef<GlyphHandle, OriginalProps>(function OriginalGlyph(
  { pack, size = 24, className, rate, onTime, firstSample },
  ref,
) {
  const svg = useRef<SVGSVGElement | null>(null);
  const segs = useMemo(() => originalSegs(pack), [pack]);
  const widths = useMemo(() => pack.parts.map((q) => q[4]), [pack]);

  const apply = useCallback(
    (time: number | null) => {
      const root = svg.current;
      if (!root) return;
      const t = time === null && firstSample ? 0 : time;
      const vals = t === null ? null : values(widths, segs, t, ORIGINAL_EASINGS);
      root.querySelectorAll<SVGElement>("[data-p]").forEach((el) => {
        const i = Number(el.getAttribute("data-p"));
        for (const k of ["transform", "stroke-dasharray", "stroke-dashoffset", "stroke"]) {
          el.removeAttribute(k);
        }
        el.style.opacity = "";
        if (!vals) return;
        const [, ox, oy, len] = pack.parts[i];
        const v = vals[i];
        const tf = transformOf(ox, oy, v);
        if (tf) el.setAttribute("transform", tf);
        if ((Math.abs(v.PathLen - 1) > 1e-4 || v.PathOff !== 0) && len > 0) {
          const p = Math.min(1, Math.max(0, v.PathLen));
          const o = Math.min(1, Math.max(0, v.PathOff));
          if (p <= 0) el.setAttribute("stroke", "none");
          else {
            el.setAttribute("stroke-dasharray", `${n4(p * len)} ${n4((1 - p) * len)}`);
            el.setAttribute("stroke-dashoffset", n4((1 - o) * len));
          }
        }
        if (Math.abs(v.Opacity - 1) > 1e-4) {
          el.style.opacity = n4(Math.min(1, Math.max(0, v.Opacity)));
        }
      });
      root.querySelectorAll<SVGElement>("[data-w]").forEach((el) => {
        const i = Number(el.getAttribute("data-w"));
        if (vals) el.setAttribute("stroke-width", n4(Math.max(0, vals[i].StrokeW)));
        else el.removeAttribute("stroke-width");
      });
    },
    [pack, segs, widths, firstSample],
  );

  const run = useRun(apply, pack.dur, { rate, onTime });
  useImperativeHandle(ref, () => run, [run]);
  useEffect(() => run.seek(null), [pack, run, firstSample]);

  // The shipped markup paints white for tinting; here the ink is the tint.
  const html = useMemo(() => pack.svg.replace(/fill="white"/g, 'fill="currentColor"'), [pack]);

  return (
    <svg
      ref={svg}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ overflow: "visible", display: "block", flex: "none" }}
      role="img"
      aria-label={`${pack.id} (shipped)`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
