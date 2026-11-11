// Writes a pack's pose as plain SVG: for copying, for export, and for
// rendering a glyph without React.

import { transformOf, values, type Ease, type Vals } from "./core";
import type { Pack } from "./motion";

const num = (v: number) => String(Math.round(v * 10000) / 10000);

/** Attributes a part's group carries for one sample. */
export function groupAttrs(ox: number, oy: number, v: Vals, restW: number, ghost: boolean) {
  const attrs: Record<string, string> = {};
  const t = transformOf(ox, oy, v);
  if (t) attrs.transform = t;
  const op = Math.min(1, Math.max(0, v.Opacity));
  if (ghost || Math.abs(op - 1) > 1e-4) attrs.opacity = num(op);
  if (Math.abs(v.StrokeW - restW) > 1e-4) attrs["stroke-width"] = num(Math.max(0, v.StrokeW));
  if (Math.abs(v.PathLen - 1) > 1e-4 || v.PathOff !== 0) {
    const len = Math.min(1, Math.max(0, v.PathLen));
    if (len <= 0.0005) {
      // lib.rs skips a stroke with nothing visible; so does this.
      attrs["stroke-opacity"] = "0";
    } else {
      attrs["stroke-dasharray"] = `${num(len)} ${num(1 - len)}`;
      attrs["stroke-dashoffset"] = num(-Math.min(1, Math.max(0, v.PathOff)));
    }
  }
  return attrs;
}

/** Child indices for each part, and the roots, in declared order. */
export function tree(pack: Pack): { roots: number[]; kids: number[][] } {
  const kids: number[][] = pack.parts.map(() => []);
  const roots: number[] = [];
  pack.parts.forEach((part, i) => {
    if (part.parent >= 0) kids[part.parent].push(i);
    else roots.push(i);
  });
  return { roots, kids };
}

/** The inner markup of a glyph at one sample; `vals` null draws it at rest. */
export function markup(pack: Pack, vals: Vals[] | null): string {
  const { roots, kids } = tree(pack);
  const draw = (i: number): string => {
    const part = pack.parts[i];
    let attrs = "";
    if (vals) {
      const a = groupAttrs(part.ox, part.oy, vals[i], part.w, part.ghost);
      attrs = Object.entries(a)
        .map(([k, v]) => ` ${k}="${v}"`)
        .join("");
    } else if (part.ghost) {
      attrs = ' opacity="0"';
    }
    const shapes = part.shapes
      .map((s) =>
        s.fill
          ? `<path d="${s.d}" fill="currentColor" stroke="none"/>`
          : `<path d="${s.d}" pathLength="1"/>`,
      )
      .join("");
    return `<g${attrs}>${shapes}${kids[i].map(draw).join("")}</g>`;
  };
  return roots.map(draw).join("");
}

/** A complete SVG document of the glyph at `time` (or at rest). */
export function svgDoc(
  pack: Pack,
  easings: Ease[],
  time: number | null,
  size = 24,
  color = "currentColor",
): string {
  const vals =
    time === null
      ? null
      : values(
          pack.parts.map((q) => q.w),
          pack.segs,
          time,
          easings,
        );
  const w = pack.parts[0]?.w ?? 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" color="${color}" stroke-width="${num(
    w,
  )}" stroke-linecap="round" stroke-linejoin="round">${markup(pack, vals)}</svg>`;
}
