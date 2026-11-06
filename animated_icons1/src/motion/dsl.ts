import type { AnimationSequence, Easing } from "motion/react";
import type { IconDefinition } from "./types";

/* ------------------------------------------------------------------------- */
/* Easing vocabulary – a small, named set so every icon speaks the same way. */
/* ------------------------------------------------------------------------- */

export const ease = {
  /** Fast attack, long soft release. The default for anything that "moves". */
  snap: [0.2, 0.9, 0.2, 1] as Easing,
  /** Overshoots and settles – for landings, pops and springs. */
  settle: [0.34, 1.56, 0.64, 1] as Easing,
  /** Gentle pendulum, for sways and tilts. */
  swing: [0.45, 0, 0.2, 1] as Easing,
  /** Accelerating – gravity, something leaving. */
  drop: [0.5, 0, 0.9, 0.5] as Easing,
  /** Symmetric, for spins and loops. */
  glide: [0.65, 0, 0.35, 1] as Easing,
  linear: "linear" as Easing,
};

/* ------------------------------------------------------------------------- */
/* Part selectors                                                            */
/* ------------------------------------------------------------------------- */

/** Selector for a part tagged `data-p="name"` inside the icon's <svg>. */
export const P = (name: string) => `[data-p="${name}"]`;

/* ------------------------------------------------------------------------- */
/* Sequence helpers                                                          */
/* ------------------------------------------------------------------------- */

type Seg = AnimationSequence[number];

/**
 * Motion forces `transform-origin: 50% 50%` (fill-box) on SVG parts the moment
 * they get a transform. A pivot segment sets the origin instantly at t=0 so
 * hinges, lids and levers rotate around the right point. Percentages are
 * relative to the part's own bounding box.
 */
export const pivot = (part: string, originX: string, originY: string): Seg => [
  part,
  { originX, originY },
  { duration: 0, at: 0 },
];

/**
 * Hide the stroke instantly so it can be drawn in. Pair with `draw()`.
 * `from` = "start" draws from the path's first point, "end" from its last,
 * "center" grows outward from the middle.
 */
export const erase = (
  part: string,
  from: "start" | "end" | "center" = "start",
  at: number | string = 0,
): Seg => {
  // Opacity 0 too: a zero-length dash with round caps still shows a dot.
  const pathOffset = from === "center" ? 0.5 : from === "end" ? 1 : 0;
  return [part, { pathLength: [1, 0], pathOffset: [pathOffset, pathOffset], opacity: [1, 0] }, { duration: 0, at }];
};

/**
 * Draw a previously erased stroke (spread it: `...draw(P("x"))`). Reveals the
 * stroke instantly then grows it; `from` semantics as in `erase()`.
 */
export const draw = (
  part: string,
  opts: { duration?: number; at?: number | string; ease?: Easing; delay?: number } = {},
): Seg[] => {
  const { duration = 0.3, at, ease: e = ease.snap, delay } = opts;
  return [
    [part, { opacity: 1 }, { duration: 0, at, delay }],
    [part, { pathLength: 1, pathOffset: 0 }, { duration, at, ease: e, delay }],
  ];
};

/** Instantly set values (a keyframe hold), e.g. to park a ghost part. */
export const set = (part: string, values: Record<string, unknown>, at: number | string = 0): Seg => [
  part,
  values,
  { duration: 0, at },
];

/* ------------------------------------------------------------------------- */
/* Definition helper                                                         */
/* ------------------------------------------------------------------------- */

export const defineIcon = (def: IconDefinition): IconDefinition => def;

/** The house move: out fast, back with a settle. Spread into segment options. */
export const outBack = (): { ease: Easing[]; times: number[] } => ({ ease: [ease.snap, ease.settle], times: [0, 0.4, 1] });

/**
 * Retract a stroke toward its start over `duration` (instead of an instant
 * erase), so a full-glyph redraw reads as a retrace rather than a blink.
 * Follow with `...draw(part, { at })`.
 */
export const wipe = (part: string, opts: { duration?: number; at?: number | string; toward?: "start" | "end" } = {}): Seg => [
  part,
  { pathLength: [1, 0], pathOffset: opts.toward === "end" ? [0, 1] : 0, opacity: [1, 0] },
  { duration: opts.duration ?? 0.12, at: opts.at ?? 0, ease: ease.snap },
];
