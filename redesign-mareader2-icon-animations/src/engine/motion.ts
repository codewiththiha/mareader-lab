// The motion half of the formula: one Feel, a handful of verbs, and a builder
// that turns a glyph's declaration into the same Pack { parts, segs } the
// Rust crate already plays.

import { FRAME_RATE, type Ease, type Prop, type Seg } from "./core";
import { pen, type Shape } from "./geo";

/** The few numbers the whole family is tuned by. */
export interface Feel {
  /** Speed multiplier: 1 is the authored tempo. */
  tempo: number;
  /** 0 = critically damped, 1 = very springy. */
  bounce: number;
  /** Scales every distance, angle and squash. */
  travel: number;
  /** Scales the pressure swell of the stroke. */
  ink: number;
  /** Scales the wind-up before a move. */
  cue: number;
  /** Scales the pen-lift gap; 0 closes every container. */
  lift: number;
  /** Stroke width in grid units. */
  weight: number;
}

export const FEELS: Record<string, Feel> = {
  Quiet: { tempo: 1.1, bounce: 0.28, travel: 0.7, ink: 0.5, cue: 0.6, lift: 1, weight: 2 },
  Crisp: { tempo: 1, bounce: 0.5, travel: 1, ink: 1, cue: 1, lift: 1, weight: 2 },
  Lively: { tempo: 0.94, bounce: 0.7, travel: 1.25, ink: 1.5, cue: 1.3, lift: 1, weight: 2 },
};

export const EASE = {
  lin: 0,
  flick: 1,
  cue: 2,
  glide: 3,
  spring: 4,
  heavy: 5,
  drop: 6,
  soft: 7,
} as const;
export type EaseName = keyof typeof EASE;
export const EASE_NAMES = Object.keys(EASE) as EaseName[];

/** Damping ratio for a bounce setting. */
export const zeta = (bounce: number) => 0.85 - 0.7 * Math.min(1, Math.max(0, bounce));

/** The easing table a Feel names; indices match `EASE`. */
export function easingsFor(feel: Feel): Ease[] {
  const z = zeta(feel.bounce);
  return [
    null,
    { b: [0.16, 1, 0.3, 1] },
    { b: [0.33, 0, 0.5, 1] },
    { b: [0.65, 0, 0.35, 1] },
    { z },
    { z: Math.min(0.96, z + 0.28) },
    { b: [0.55, 0, 1, 0.45] },
    { b: [0.25, 0.1, 0.25, 1] },
  ];
}

export interface Part {
  name: string;
  ox: number;
  oy: number;
  w: number;
  shapes: Shape[];
  /** Index of the enclosing part, or -1. */
  parent: number;
  /** Invisible at rest: an echo, a wash, a spark. */
  ghost: boolean;
  /** Rotational symmetry in degrees, when a turn may land on itself. */
  sym: number;
}

export interface Pack {
  id: string;
  dur: number;
  parts: Part[];
  segs: Seg[];
  /** Broken invariants; empty when the pack is sound. */
  issues: string[];
}

export interface PartSpec {
  name: string;
  shapes: (string | Shape)[];
  ox: number;
  oy: number;
  in?: string;
  ghost?: boolean;
  sym?: number;
}

/** Declares a part: its strokes and the point it turns and scales about. */
export function P(
  name: string,
  shapes: string | Shape | (string | Shape)[],
  ox = 12,
  oy = 12,
  opt: { in?: string; ghost?: boolean; sym?: number } = {},
): PartSpec {
  return { name, shapes: Array.isArray(shapes) ? shapes : [shapes], ox, oy, ...opt };
}

export type Cat = "Chrome" | "Reading" | "Navigate" | "Library" | "Sound & light" | "Voices";

export interface IconDef {
  id: string;
  cat: Cat;
  /** One line: what the glyph does when it is touched. */
  say: string;
  parts: () => PartSpec[];
  move: (m: Motion) => void;
}

type To = Partial<{
  x: number;
  y: number;
  r: number;
  s: number;
  sx: number;
  sy: number;
  kx: number;
  ky: number;
  o: number;
  w: number;
}>;

const MAP: Record<keyof To, Prop> = {
  x: "X",
  y: "Y",
  r: "Rotate",
  s: "Scale",
  sx: "ScaleX",
  sy: "ScaleY",
  kx: "SkewX",
  ky: "SkewY",
  o: "Opacity",
  w: "StrokeW",
};

interface GoOpt {
  /** Start, in milliseconds at tempo 1. */
  at?: number;
  /** Wind-up strength; 0 skips it. */
  cue?: number;
  act?: number;
  hold?: number;
  rest?: number;
  ease?: EaseName;
}

/** How long the wind-up lasts, in milliseconds. */
const CUE_MS = 45;
/** The share of a stroke that stays on the paper while it is re-inked. */
const NUB = 0.06;

export class Motion {
  segs: Seg[] = [];
  issues: string[] = [];
  private owned = new Set<string>();

  constructor(
    private parts: Part[],
    readonly f: Feel,
  ) {}

  private idx(name: string): number {
    const i = this.parts.findIndex((q) => q.name === name);
    if (i < 0) this.issues.push(`no part named "${name}"`);
    return Math.max(0, i);
  }

  private base(name: string, prop: Prop): number {
    const part = this.parts[this.idx(name)];
    if (prop === "Opacity") return part.ghost ? 0 : 1;
    if (prop === "StrokeW") return part.w;
    if (prop === "Scale" || prop === "ScaleX" || prop === "ScaleY" || prop === "PathLen") return 1;
    return 0;
  }

  /** A distance or angle, scaled by the Feel's travel. */
  k(v: number): number {
    return v * this.f.travel;
  }

  /** One property's whole run: the only way a segment is ever added. */
  raw(
    name: string,
    prop: Prop,
    at: number,
    dur: number,
    keys: number[],
    times: number[] = [],
    eases: EaseName | EaseName[] = "lin",
  ) {
    const part = this.idx(name);
    const key = `${part}:${prop}`;
    if (this.owned.has(key)) this.issues.push(`${name}.${prop} has two segments`);
    this.owned.add(key);
    const gaps = Math.max(1, keys.length - 1);
    const list = Array.isArray(eases) ? eases : Array<EaseName>(gaps).fill(eases);
    const tempo = Math.max(0.2, this.f.tempo);
    this.segs.push({
      part,
      prop,
      t0: at / 1000 / tempo,
      dur: dur / 1000 / tempo,
      keys,
      times,
      eases: list.map((e) => EASE[e]),
    });
  }

  /**
   * Cue · Act · Rest. The part winds up a touch the wrong way, flicks to its
   * mark, and is carried home by a spring. Every out-and-back move is this.
   */
  go(name: string, to: To, o: GoOpt = {}) {
    const { at = 0, cue = 1, act = 120, hold = 0, rest = 300, ease = "spring" } = o;
    const wind = cue * this.f.cue;
    const c = wind > 0.01 ? CUE_MS : 0;
    const total = c + act + hold + rest;
    const times = [0];
    const eases: EaseName[] = [];
    if (c) {
      times.push(c / total);
      eases.push("cue");
    }
    times.push((c + act) / total);
    eases.push("flick");
    if (hold) {
      times.push((c + act + hold) / total);
      eases.push("lin");
    }
    times.push(1);
    eases.push(ease);
    for (const k of Object.keys(to) as (keyof To)[]) {
      const prop = MAP[k];
      const base = this.base(name, prop);
      const v = to[k] as number;
      let target: number;
      if (k === "o") target = v;
      else if (k === "w") target = base + v * this.f.ink;
      else if (k === "s" || k === "sx" || k === "sy") target = 1 + (v - 1) * this.f.travel;
      else target = base + v * this.f.travel;
      const back = k === "o" || k === "w" ? base : base - (target - base) * 0.16 * wind;
      const keys = [base];
      if (c) keys.push(back);
      keys.push(target);
      if (hold) keys.push(target);
      keys.push(base);
      this.raw(name, prop, at, total, keys, times, eases);
    }
  }

  /**
   * A one-way move that lands on a pose identical to rest: a quarter turn of a
   * cross, one tooth of a cog, a full lap of a clock hand.
   */
  to(
    name: string,
    to: Partial<{ r: number }>,
    o: { at?: number; dur?: number; cue?: number; ease?: EaseName } = {},
  ) {
    const { at = 0, dur = 440, cue = 1, ease = "spring" } = o;
    const wind = cue * this.f.cue;
    const c = wind > 0.01 ? CUE_MS : 0;
    const target = to.r ?? 0;
    const keys = c ? [0, -target * 0.07 * wind, target] : [0, target];
    const times = c ? [0, c / dur, 1] : [];
    this.raw(name, "Rotate", at, dur, keys, times, c ? ["cue", ease] : [ease]);
  }

  /**
   * Re-ink. The stroke is pulled back to a nub of ink and laid down again
   * from `from` (0 = its start, 1 = its end, 0.5 = its middle). One continuous
   * segment, so the first and last samples are the whole stroke, and the nub
   * means a glyph made of a single stroke is never blank for a frame.
   */
  draw(
    name: string,
    o: { at?: number; back?: number; dur?: number; from?: number; ease?: EaseName } = {},
  ) {
    const { at = 0, back = 70, dur = 240, from = 0, ease = "flick" } = o;
    const total = back + dur;
    const times = [0, back / total, 1];
    this.raw(name, "PathLen", at, total, [1, NUB, 1], times, ["glide", ease]);
    if (from > 0) {
      this.raw(name, "PathOff", at, total, [0, from * (1 - NUB), 0], times, ["glide", ease]);
    }
  }

  /** Opacity through explicit keys; a ghost's keys start and end at 0. */
  fade(
    name: string,
    keys: number[],
    o: { at?: number; dur?: number; times?: number[]; ease?: EaseName | EaseName[] } = {},
  ) {
    const { at = 0, dur = 300, times = [], ease = "soft" } = o;
    this.raw(name, "Opacity", at, dur, keys, times, ease);
  }

  /** Pen pressure: the stroke swells as it lands and thins back on a spring. */
  ink(name: string, o: { at?: number; amt?: number; act?: number; rest?: number } = {}) {
    const { at = 0, amt = 0.5, act = 110, rest = 260 } = o;
    const w = this.base(name, "StrokeW");
    const total = act + rest;
    this.raw(name, "StrokeW", at, total, [w, w + amt * this.f.ink, w], [0, act / total, 1], [
      "flick",
      "spring",
    ]);
  }
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-4;

/** Builds a glyph under a Feel and holds it to the family's invariants. */
export function build(def: IconDef, feel: Feel): Pack {
  pen.lift = feel.lift;
  const specs = def.parts();
  const issues: string[] = [];
  const parts: Part[] = specs.map((s) => ({
    name: s.name,
    ox: s.ox,
    oy: s.oy,
    w: feel.weight,
    shapes: s.shapes.map((sh) => (typeof sh === "string" ? { d: sh } : sh)),
    parent: s.in ? specs.findIndex((q) => q.name === s.in) : -1,
    ghost: !!s.ghost,
    sym: s.sym ?? 0,
  }));
  const m = new Motion(parts, feel);
  def.move(m);
  issues.push(...m.issues);
  const segs = m.segs;

  // A ghost nobody fades still has to be invisible at the first sample.
  parts.forEach((part, i) => {
    if (part.ghost && !segs.some((s) => s.part === i && s.prop === "Opacity")) {
      segs.push({ part: i, prop: "Opacity", t0: 0, dur: 0, keys: [0, 0], times: [], eases: [0] });
    }
  });

  const end = segs.reduce((a, s) => Math.max(a, s.t0 + s.dur), 0);
  const dur = Math.max(1, Math.ceil(end * FRAME_RATE - 1e-6)) / FRAME_RATE;

  for (const s of segs) {
    const part = parts[s.part];
    const rest =
      s.prop === "Opacity"
        ? part.ghost
          ? 0
          : 1
        : s.prop === "StrokeW"
          ? part.w
          : s.prop === "Scale" || s.prop === "ScaleX" || s.prop === "ScaleY" || s.prop === "PathLen"
            ? 1
            : 0;
    const first = s.keys[0];
    const last = s.keys[s.keys.length - 1];
    // A ghost is invisible at both ends; only its opacity has to come home.
    if (part.ghost && s.prop !== "Opacity") continue;
    if (!near(first, rest)) issues.push(`${part.name}.${s.prop} does not start at rest`);
    const lands =
      near(last, rest) ||
      (s.prop === "Rotate" && part.sym > 0 && near(Math.abs(last) % part.sym, 0));
    if (!lands) issues.push(`${part.name}.${s.prop} does not land on rest`);
    if (s.prop === "PathLen" && part.shapes.filter((sh) => !sh.fill).length !== 1) {
      issues.push(`${part.name} is drawn but is not exactly one stroke`);
    }
    if (s.eases.length !== Math.max(1, s.keys.length - 1)) {
      issues.push(`${part.name}.${s.prop} has ${s.eases.length} eases for ${s.keys.length} keys`);
    }
    if (s.times.length && s.times.length !== s.keys.length) {
      issues.push(`${part.name}.${s.prop} has mismatched key times`);
    }
  }
  if (dur > 0.9) issues.push(`runs ${dur.toFixed(2)} s; the family stays under 0.9 s`);
  if (!segs.length) issues.push("does not move");
  return { id: def.id, dur, parts, segs, issues };
}
