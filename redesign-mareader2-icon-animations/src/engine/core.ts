// A faithful TypeScript port of crates/animated-icons/src/lib.rs:
// `values`, `clock`, `at`, `curve` and `part_transform` behave exactly as the
// Rust does, so a pack authored here plays the same once it is moved across.

export const GRID = 24;
export const PAD = 8.5;
export const FRAME_RATE = 60;

export type Prop =
  | "X"
  | "Y"
  | "Scale"
  | "ScaleX"
  | "ScaleY"
  | "Rotate"
  | "SkewX"
  | "SkewY"
  | "Opacity"
  | "PathLen"
  | "PathOff"
  | "StrokeW";

export const PROPS: Prop[] = [
  "X",
  "Y",
  "Scale",
  "ScaleX",
  "ScaleY",
  "Rotate",
  "SkewX",
  "SkewY",
  "Opacity",
  "PathLen",
  "PathOff",
  "StrokeW",
];

export interface Seg {
  part: number;
  prop: Prop;
  /** seconds */
  t0: number;
  /** seconds */
  dur: number;
  keys: number[];
  times: number[];
  eases: number[];
}

/** A cubic bezier, a damped spring, or linear. */
export type Ease = null | { b: [number, number, number, number] } | { z: number };

export interface Vals {
  X: number;
  Y: number;
  Scale: number;
  ScaleX: number;
  ScaleY: number;
  Rotate: number;
  SkewX: number;
  SkewY: number;
  Opacity: number;
  PathLen: number;
  PathOff: number;
  StrokeW: number;
}

export function restVals(width: number): Vals {
  return {
    X: 0,
    Y: 0,
    Scale: 1,
    ScaleX: 1,
    ScaleY: 1,
    Rotate: 0,
    SkewX: 0,
    SkewY: 0,
    Opacity: 1,
    PathLen: 1,
    PathOff: 0,
    StrokeW: width,
  };
}

/** lib.rs `curve`: bisection on x, 24 rounds. */
export function bezier([x1, y1, x2, y2]: [number, number, number, number], x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const axis = (a: number, b: number, t: number) => {
    const r = 1 - t;
    return 3 * r * r * t * a + 3 * r * t * t * b + t * t * t;
  };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) * 0.5;
    if (axis(x1, x2, mid) < x) lo = mid;
    else hi = mid;
  }
  return axis(y1, y2, (lo + hi) * 0.5);
}

/** How hard the envelope has decayed by the end of a segment: e^-DECAY. */
const DECAY = 6.2;

/**
 * A damped spring as an easing: 0 → 1 over u ∈ [0, 1], with real ringing.
 * `z` is the damping ratio. The stiffness is picked so the envelope has decayed
 * to 0.2 % at u = 1, which keeps the curve a pure function of (z, u) — the
 * only thing the Rust side has to learn.
 */
export function spring(z: number, u: number): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const zeta = Math.min(0.999, Math.max(0.05, z));
  const w = DECAY / zeta;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  const raw = (t: number) =>
    1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
  // Close the 0.2 % the envelope leaves so the last sample is exactly rest.
  return raw(u) + (1 - raw(1)) * u;
}

export function applyEase(e: Ease | undefined, x: number): number {
  if (!e) return x;
  if ("b" in e) return bezier(e.b, x);
  return spring(e.z, x);
}

/** lib.rs `clock`. */
export function clock(seg: Seg, time: number): number {
  if (seg.dur <= 0) return time >= seg.t0 ? 1 : 0;
  return Math.min(1, Math.max(0, (time - seg.t0) / seg.dur));
}

/** lib.rs `at`. */
export function at(seg: Seg, progress: number, easings: Ease[]): number {
  const count = seg.keys.length;
  if (count === 0) return 0;
  if (count === 1) return seg.keys[0];
  const gaps = count - 1;
  let index: number;
  let fraction: number;
  if (seg.times.length === count) {
    index = 0;
    while (index + 2 < count && seg.times[index + 1] <= progress) index++;
    const span = Math.max(1e-6, seg.times[index + 1] - seg.times[index]);
    fraction = Math.min(1, Math.max(0, (progress - seg.times[index]) / span));
  } else {
    const position = Math.min(gaps, Math.max(0, progress * gaps));
    index = Math.min(Math.floor(position), gaps - 1);
    fraction = Math.min(1, Math.max(0, position - index));
  }
  const easing = seg.eases[Math.min(index, Math.max(0, seg.eases.length - 1))] ?? 0;
  const eased = applyEase(easings[easing], fraction);
  return seg.keys[index] + (seg.keys[index + 1] - seg.keys[index]) * eased;
}

/**
 * lib.rs `values`: every segment assigns, in declared order, on every sample.
 * A later segment therefore owns its property for the whole run — it holds
 * its first key before it starts. (This is why new packs keep to one segment
 * per part and property.)
 */
export function values(
  widths: number[],
  segs: Seg[],
  time: number,
  easings: Ease[],
): Vals[] {
  const vals = widths.map(restVals);
  for (const seg of segs) {
    const v = vals[seg.part];
    if (!v) continue;
    v[seg.prop] = at(seg, clock(seg, time), easings);
  }
  return vals;
}

const num = (v: number) => (Math.abs(v) < 1e-5 ? "0" : String(Math.round(v * 10000) / 10000));

/** lib.rs `part_transform`, written the way parity.rs `moves` writes it. */
export function transformOf(ox: number, oy: number, v: Vals): string {
  const moved =
    v.X !== 0 ||
    v.Y !== 0 ||
    v.Scale !== 1 ||
    v.ScaleX !== 1 ||
    v.ScaleY !== 1 ||
    v.Rotate !== 0 ||
    v.SkewX !== 0 ||
    v.SkewY !== 0;
  if (!moved) return "";
  let s = `translate(${num(ox + v.X)} ${num(oy + v.Y)}) scale(${num(v.Scale * v.ScaleX)} ${num(
    v.Scale * v.ScaleY,
  )})`;
  if (v.Rotate !== 0) s += ` rotate(${num(v.Rotate)})`;
  if (v.SkewX !== 0) s += ` skewX(${num(v.SkewX)})`;
  if (v.SkewY !== 0) s += ` skewY(${num(v.SkewY)})`;
  return `${s} translate(${num(-ox)} ${num(-oy)})`;
}

/** anim.rs `frame_index`: the sample a run shows at `t`. */
export function frameTime(t: number, dur: number): number {
  const last = Math.max(1, Math.ceil(dur * FRAME_RATE)) - 1;
  const frame = Math.min(last, Math.floor(Math.max(0, t) * FRAME_RATE));
  return frame / FRAME_RATE;
}

/** source.rs `EASINGS`, the six curves the shipped packs name. */
export const ORIGINAL_EASINGS: Ease[] = [
  null,
  { b: [0.2, 0.9, 0.2, 1.0] },
  { b: [0.34, 1.56, 0.64, 1.0] },
  { b: [0.45, 0.0, 0.2, 1.0] },
  { b: [0.5, 0.0, 0.9, 0.5] },
  { b: [0.65, 0.0, 0.35, 1.0] },
];
export const ORIGINAL_EASE_NAMES = ["linear", "snap", "settle", "swing", "drop", "glide"];
