// Writes a pack the way crates/animated-icons/src/source.rs declares one:
// parts, segs, holes and hole-marked markup. Data only.

import type { Ease } from "./core";
import { EASE_NAMES, easingsFor, type Feel, type Pack } from "./motion";
import { tree } from "./svg";

const f = (v: number) => {
  const r = Math.round(v * 10000) / 10000;
  return Number.isInteger(r) ? r.toFixed(1) : String(r);
};

/** Each part's measured stroke length, which `Part::len` carries. */
export function measure(pack: Pack): number[] {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  const path = document.createElementNS(ns, "path");
  svg.appendChild(path);
  document.body.appendChild(svg);
  const lens = pack.parts.map((part) => {
    const stroke = part.shapes.find((s) => !s.fill);
    if (!stroke) return 0;
    path.setAttribute("d", stroke.d);
    try {
      return path.getTotalLength();
    } catch {
      return 0;
    }
  });
  svg.remove();
  return lens;
}

export const constName = (id: string) => id.toUpperCase().replace(/-/g, "_");

/** One `static NAME: Pack = Pack { … };` declaration. */
export function rustPack(pack: Pack, say: string, lens: number[]): string {
  const widthParts = new Set(pack.segs.filter((s) => s.prop === "StrokeW").map((s) => s.part));
  const holes: string[] = [];
  const { roots, kids } = tree(pack);
  const draw = (i: number): string => {
    const part = pack.parts[i];
    holes.push(`        Hole { part: ${i}, width: false },`);
    const wide = widthParts.has(i);
    if (wide) holes.push(`        Hole { part: ${i}, width: true },`);
    const shapes = part.shapes
      .map((s) =>
        s.fill
          ? `<path d=\\"${s.d}\\" fill=\\"white\\" stroke=\\"none\\"/>`
          : `<path d=\\"${s.d}\\"/>`,
      )
      .join("");
    const inner = shapes + kids[i].map(draw).join("");
    return `<g\\u{1}>${wide ? `<g\\u{2}>${inner}</g>` : inner}</g>`;
  };
  const svg = roots.map(draw).join("");
  const parts = pack.parts
    .map(
      (q, i) =>
        `        Part { name: "${q.name}", ox: ${f(q.ox)}, oy: ${f(q.oy)}, len: ${f(
          lens[i] ?? 0,
        )}, w: ${f(q.w)} },`,
    )
    .join("\n");
  const segs = pack.segs
    .map(
      (s) =>
        `        Seg { part: ${s.part}, prop: Prop::${s.prop}, t0: ${f(s.t0)}, dur: ${f(
          s.dur,
        )}, keys: &[${s.keys.map(f).join(", ")}], times: &[${s.times
          .map(f)
          .join(", ")}], eases: &[${s.eases.join(", ")}] },`,
    )
    .join("\n");
  return `/// ${say}
static ${constName(pack.id)}: Pack = Pack {
    id: "${pack.id}",
    dur: ${f(pack.dur)},
    parts: &[
${parts}
    ],
    segs: &[
${segs}
    ],
    holes: &[
${holes.join("\n")}
    ],
    svg: "${svg}",
};`;
}

const easeLine = (e: Ease) => {
  if (!e) return "Ease::Linear,";
  if ("b" in e) return `Ease::Bezier([${e.b.map(f).join(", ")}]),`;
  return `Ease::Spring(${f(e.z)}),`;
};

/** The easing table a Feel bakes to, and the one function Rust has to learn. */
export function rustEasings(feel: Feel): string {
  const table = easingsFor(feel);
  const rows = table
    .map((e, i) => `    ${easeLine(e).padEnd(38)}// ${i} ${EASE_NAMES[i]}`)
    .join("\n");
  return `/// A segment names its curve by index, as before.
#[derive(Clone, Copy)]
pub(crate) enum Ease {
    Linear,
    Bezier([f32; 4]),
    /// A damped spring; the value is its damping ratio.
    Spring(f32),
}

pub(crate) const EASINGS: [Ease; ${table.length}] = [
${rows}
];

/// A damped spring as an easing. The stiffness is chosen so the envelope
/// has decayed to 0.2 % at x = 1, so the curve depends on zeta alone.
fn spring(zeta: f32, x: f32) -> f32 {
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }
    let z = zeta.clamp(0.05, 0.999);
    let w = 6.2 / z;
    let wd = w * (1.0 - z * z).sqrt();
    let raw = |t: f32| {
        1.0 - (-z * w * t).exp() * ((wd * t).cos() + (z * w / wd) * (wd * t).sin())
    };
    raw(x) + (1.0 - raw(1.0)) * x
}

// In \`at\`, the one changed match:
//     let eased = match EASINGS.get(easing as usize).copied() {
//         Some(Ease::Bezier(points)) => curve(points, fraction),
//         Some(Ease::Spring(zeta)) => spring(zeta, fraction),
//         _ => fraction,
//     };`;
}
