// The stroke half of the formula. Every container in the set comes out of
// these few functions, which is what keeps a hundred glyphs in one hand.

export interface Shape {
  d: string;
  /** A solid ink drop instead of a stroke. */
  fill?: boolean;
}

export type Side = "t" | "r" | "b" | "l";
/** Where a container's pen-lift sits: side, position along it (0–1), length. */
export type Lift = [Side, number, number?];

/** The pen the glyphs are being drawn with right now; `build` sets it. */
export const pen = { lift: 1 };

/** The default pen-lift: end point to end point, in grid units. */
export const LIFT = 3.7;

const f = (v: number) => String(Math.round(v * 1000) / 1000);
const p = (q: number[]) => `${f(q[0])} ${f(q[1])}`;

/**
 * A soft rectangle drawn clockwise as one open stroke. It starts just after
 * its pen-lift and ends just before it, so it can be re-inked from the gap.
 */
export function rr(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  lift: Lift | null = null,
): string {
  const rad = Math.min(r, w / 2, h / 2);
  const A = `A${f(rad)} ${f(rad)} 0 0 1 `;
  const sides: Record<Side, { a: number[]; b: number[]; c: number[] }> = {
    t: { a: [x + rad, y], b: [x + w - rad, y], c: [x + w, y + rad] },
    r: { a: [x + w, y + rad], b: [x + w, y + h - rad], c: [x + w - rad, y + h] },
    b: { a: [x + w - rad, y + h], b: [x + rad, y + h], c: [x, y + h - rad] },
    l: { a: [x, y + h - rad], b: [x, y + rad], c: [x + rad, y] },
  };
  const order: Side[] = ["t", "r", "b", "l"];
  const gap = lift ? (lift[2] ?? LIFT) * pen.lift : 0;
  if (!lift || gap < 0.05) {
    let d = `M${p(sides.t.a)}`;
    for (const s of order) d += `L${p(sides[s].b)}${A}${p(sides[s].c)}`;
    return `${d}Z`;
  }
  const [side, pos] = lift;
  const S = sides[side];
  const len = Math.hypot(S.b[0] - S.a[0], S.b[1] - S.a[1]) || 1;
  const ux = (S.b[0] - S.a[0]) / len;
  const uy = (S.b[1] - S.a[1]) / len;
  const half = Math.min(gap / 2, len / 2);
  const c = Math.min(len - half, Math.max(half, len * pos));
  const ga = [S.a[0] + ux * (c - half), S.a[1] + uy * (c - half)];
  const gb = [S.a[0] + ux * (c + half), S.a[1] + uy * (c + half)];
  let d = `M${p(gb)}L${p(S.b)}${A}${p(S.c)}`;
  const i0 = order.indexOf(side);
  for (let k = 1; k < 4; k++) {
    const s = sides[order[(i0 + k) % 4]];
    d += `L${p(s.b)}${A}${p(s.c)}`;
  }
  return `${d}L${p(ga)}`;
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** A clockwise arc. Angles are in degrees: 0 is east, 90 is south. */
export function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const sweep = (((a1 - a0) % 360) + 360) % 360 || 360;
  return `M${p(polar(cx, cy, r, a0))}A${f(r)} ${f(r)} 0 ${sweep > 180 ? 1 : 0} 1 ${p(
    polar(cx, cy, r, a1),
  )}`;
}

/** A ring with its pen-lift centred on `at` degrees; closed when `at` is null. */
export function ring(
  cx: number,
  cy: number,
  r: number,
  at: number | null = null,
  gap: number = LIFT,
): string {
  const g = at === null ? 0 : gap * pen.lift;
  if (at === null || g < 0.05) {
    return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(
      r,
    )} 0 1 1 ${f(cx - r)} ${f(cy)}Z`;
  }
  const half = ((g / r) * 90) / Math.PI;
  return arc(cx, cy, r, at + half, at - half + 360);
}

/** An ink drop: the one solid element a glyph may carry. */
export function dot(cx: number, cy: number, r = 1.25): Shape {
  return {
    d: `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(
      -2 * r,
    )} 0Z`,
    fill: true,
  };
}

/** Any closed path, filled. */
export const solid = (d: string): Shape => ({ d, fill: true });

/** A cog outline: `n` teeth, each a flat plateau between two radii. */
export function cog(cx: number, cy: number, outer: number, inner: number, n: number): string {
  const step = 360 / n;
  const top = step * 0.16;
  const foot = step * 0.34;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = i * step - 90;
    const pts = [
      polar(cx, cy, outer, a - top),
      polar(cx, cy, outer, a + top),
      polar(cx, cy, inner, a + foot),
      polar(cx, cy, inner, a + step - foot),
    ];
    for (const q of pts) d += `${d ? "L" : "M"}${p(q)}`;
  }
  return `${d}Z`;
}

/** A point on a circle, for the few glyphs that place things radially. */
export const at = polar;

/**
 * A polygon with every corner rounded to the same radius, so angular objects
 * (a play head, a pencil, a leaning book) share the family's softness.
 */
export function poly(pts: number[][], r: number, closed = true): string {
  const n = pts.length;
  const corner = (i: number) => {
    const v = pts[i];
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    const la = Math.hypot(a[0] - v[0], a[1] - v[1]) || 1;
    const lb = Math.hypot(b[0] - v[0], b[1] - v[1]) || 1;
    const rad = Math.min(r, la / 2, lb / 2);
    const p1 = [v[0] + ((a[0] - v[0]) / la) * rad, v[1] + ((a[1] - v[1]) / la) * rad];
    const p2 = [v[0] + ((b[0] - v[0]) / lb) * rad, v[1] + ((b[1] - v[1]) / lb) * rad];
    return `${p(p1)}Q${p(v)} ${p(p2)}`;
  };
  if (closed) {
    let d = "";
    for (let i = 0; i < n; i++) d += `${i === 0 ? "M" : "L"}${corner(i)}`;
    return `${d}Z`;
  }
  let d = `M${p(pts[0])}`;
  for (let i = 1; i < n - 1; i++) d += `L${corner(i)}`;
  return `${d}L${p(pts[n - 1])}`;
}
