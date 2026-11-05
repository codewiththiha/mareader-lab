// A port of crates/appearance/src/tokens.rs + the derived values in
// crates/ui/src/theme.rs, so every component here is drawn in the exact
// palette mareader2 draws. Numbers come from the source, not from eyeballing.

export type Mode = "light" | "dark" | "dim" | "black";
export type Rgb = [number, number, number];

export interface Appearance {
  base: Mode;
  tintHue: number; // sRGB degrees, as mareader stores it
  tintStrength: number; // 0..50, FULL_TINT = 50
}

export const FULL_TINT = 50;

// base_tokens()
const BASES: Record<Mode, Record<string, Rgb>> = {
  light: { paper: [0xff, 0xff, 0xff], ink: [0x1f, 0x29, 0x37], muted: [0x6b, 0x72, 0x80], surface: [0xeb, 0xed, 0xef], line: [0xda, 0xdc, 0xe1], accent: [0x25, 0x63, 0xeb], accentSoft: [0xdb, 0xea, 0xfe] },
  dark: { paper: [0x13, 0x13, 0x16], ink: [0xe5, 0xe7, 0xeb], muted: [0x9c, 0xa3, 0xaf], surface: [0x16, 0x16, 0x1a], line: [0x2b, 0x2b, 0x31], accent: [0x60, 0xa5, 0xfa], accentSoft: [0x1d, 0x2b, 0x3a] },
  dim: { paper: [0x1a, 0x1c, 0x1f], ink: [0xc3, 0xc6, 0xcb], muted: [0x8b, 0x8f, 0x96], surface: [0x20, 0x23, 0x28], line: [0x2e, 0x32, 0x38], accent: [0x7a, 0x9b, 0xd4], accentSoft: [0x23, 0x2b, 0x36] },
  black: { paper: [0, 0, 0], ink: [0xd4, 0xd4, 0xd8], muted: [0x8a, 0x8a, 0x93], surface: [0, 0, 0], line: [0x27, 0x27, 0x2a], accent: [0x60, 0xa5, 0xfa], accentSoft: [0x0c, 0x1e, 0x33] },
};

// ---- colour maths (sRGB <-> OKLCH) ----
const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const gam = (c: number) => { const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; return v; };
interface Lch { l: number; c: number; h: number }
function toOklab(rgb: Rgb) {
  const [r, g, b] = rgb.map(lin);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}
export function toOklch(rgb: Rgb): Lch {
  const { L, a, b } = toOklab(rgb);
  let h = (Math.atan2(b, a) * 180) / Math.PI; if (h < 0) h += 360;
  return { l: L, c: Math.hypot(a, b), h };
}
function oklchToLinear({ l, c, h }: Lch) {
  const a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}
function inGamut(c: Lch) { return oklchToLinear(c).every((v) => v >= -0.0005 && v <= 1.0005); }
function toRgb(c: Lch): Rgb {
  return oklchToLinear(c).map((v) => Math.round(Math.min(1, Math.max(0, gam(Math.min(1, Math.max(0, v))))) * 255)) as Rgb;
}
function toRgbInGamut(c: Lch): Rgb {
  let lo = 0, hi = c.c;
  if (inGamut(c)) return toRgb(c);
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (inGamut({ ...c, c: mid })) lo = mid; else hi = mid; }
  return toRgb({ ...c, c: lo });
}
export function maxChroma(l: number, h: number) {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (inGamut({ l, c: mid, h })) lo = mid; else hi = mid; }
  return lo;
}

// ui_hue_oklch(): an sRGB hue angle becomes the OKLCH hue of that pure colour.
export function uiHueOklch(srgbHue: number) {
  const h = (((srgbHue % 360) + 360) % 360) / 60; const f = h - Math.floor(h);
  const t: Record<number, [number, number, number]> = { 0: [1, f, 0], 1: [1 - f, 1, 0], 2: [0, 1, f], 3: [0, 1 - f, 1], 4: [f, 0, 1], 5: [1, 0, 1 - f] };
  const [r, g, b] = t[Math.floor(h) % 6];
  return toOklch([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]).h;
}

const MAX_DARKEN = 0.06;
function dimmed(want: Lch): Rgb {
  if (inGamut(want)) return toRgb(want);
  for (let i = 1; i <= 12; i++) { const c = { ...want, l: want.l - (MAX_DARKEN * i) / 12 }; if (inGamut(c)) return toRgbInGamut(c); }
  return toRgbInGamut({ ...want, l: want.l - MAX_DARKEN });
}
function tinted(token: Rgb, h: number, t: number, maxC: number): Rgb {
  const { l, c } = toOklch(token);
  return dimmed({ l, c: c + (maxC - c) * t, h });
}
const SURFACE_GAP = 0.035, LINE_GAP = 0.05;
function apart(token: Rgb, from: Rgb, gap: number): Rgb {
  const a = toOklch(token), b = toOklch(from);
  if (Math.abs(a.l - b.l) >= gap) return token;
  const l = a.l >= b.l ? Math.min(1, b.l + gap) : Math.max(0, b.l - gap);
  return toRgbInGamut({ ...a, l });
}
function below(token: Rgb, from: Rgb, gap: number): Rgb {
  const a = toOklch(token); const target = toOklch(from).l - gap;
  if (a.l <= target) return token;
  return toRgbInGamut({ ...a, l: Math.max(0, target) });
}
function mix(a: Rgb, b: Rgb, k: number): Rgb { return a.map((v, i) => Math.round(v + (b[i] - v) * k)) as Rgb; }
export const hex = (c: Rgb) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
export const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export interface Tokens {
  mode: Mode; dark: boolean;
  paper: Rgb; ink: Rgb; muted: Rgb; surface: Rgb; line: Rgb; accent: Rgb; accentSoft: Rgb;
  hover: Rgb; pressed: Rgb; selected: Rgb; card: Rgb; track: Rgb; danger: Rgb; caution: Rgb;
  bookPaper: Rgb; bookInk: Rgb;
}

export function textPalette(a: Appearance) {
  const t = Math.min(1, a.tintStrength / FULL_TINT); const h = uiHueOklch(a.tintHue);
  const table: Record<Mode, [[number, number], [number, number]]> = {
    light: [[0.98, 0.08], [0.15, 0.03]], dark: [[0.24, 0.1], [0.92, 0.04]], dim: [[0.22, 0.08], [0.12, 0.03]], black: [[0, 0], [0.86, 0.07]],
  };
  const [[pl, pc], [il, ic]] = table[a.base];
  const room = (l: number) => maxChroma(l, h);
  const cap = Math.min(pc, Math.max(room(pl), room(Math.max(0, pl - MAX_DARKEN))));
  return { paper: dimmed({ l: pl, c: cap * t, h }), ink: toRgbInGamut({ l: il, c: ic * t, h }) };
}

export function tokens(a: Appearance): Tokens {
  const base = BASES[a.base]; const dark = a.base !== "light"; const black = a.base === "black";
  const t = Math.min(1, a.tintStrength / FULL_TINT); const h = uiHueOklch(a.tintHue);
  const book = textPalette(a);
  let raw = { paper: base.paper, ink: base.ink, muted: base.muted, surface: base.surface, line: base.line, accent: base.accent, accentSoft: base.accentSoft };
  if (a.tintStrength > 0) {
    const ground = (tok: Rgb, maxC: number) => (black ? tok : tinted(tok, h, t, maxC));
    const surface = black ? base.surface : apart(ground(base.surface, 0.07), book.paper, SURFACE_GAP);
    let line = tinted(base.line, h, t, 0.09);
    line = dark ? apart(line, surface, LINE_GAP) : below(line, surface, LINE_GAP);
    raw = { paper: ground(base.paper, 0.055), ink: tinted(base.ink, h, t, 0.02), muted: tinted(base.muted, h, t, 0.045), surface, line, accent: tinted(base.accent, h, t, 0.15), accentSoft: tinted(base.accentSoft, h, t, 0.11) };
  }
  // marks()
  let card: Rgb, hover: Rgb, selected: Rgb;
  if (dark) {
    card = mix(mix(raw.surface, raw.line, 0.5), raw.accentSoft, 0.25);
    hover = raw.line; selected = mix(raw.accentSoft, raw.accent, 0.3);
  } else {
    card = mix(raw.paper, raw.accentSoft, 0.18);
    hover = mix(raw.surface, raw.line, 0.55);
    selected = mix(raw.accentSoft, raw.accent, 0.12);
  }
  return {
    mode: a.base, dark, ...raw, card, hover, selected,
    pressed: mix(raw.line, raw.ink, 0.12),
    track: mix(raw.line, raw.ink, dark ? 0.18 : 0.22),
    danger: dark ? [0xf8, 0x71, 0x71] : [0xdc, 0x26, 0x26],
    caution: dark ? [0xfb, 0xbf, 0x24] : [0xb4, 0x53, 0x09],
    bookPaper: book.paper, bookInk: book.ink,
  };
}

// theme::ink_on — black or white, whichever reads better on the fill.
export function inkOn(fill: Rgb): string {
  const L = 0.2126 * lin(fill[0]) + 0.7152 * lin(fill[1]) + 0.0722 * lin(fill[2]);
  return (1.05) / (L + 0.05) >= (L + 0.05) / 0.05 ? "#ffffff" : "#000000";
}

export function cssVars(t: Tokens): Record<string, string> {
  const v: Record<string, string> = {};
  const put = (k: string, c: Rgb) => { v[`--${k}`] = hex(c); v[`--${k}-rgb`] = c.join(" "); };
  put("paper", t.paper); put("ink", t.ink); put("muted", t.muted); put("surface", t.surface); put("line", t.line);
  put("accent", t.accent); put("accent-soft", t.accentSoft); put("hover", t.hover); put("pressed", t.pressed);
  put("selected", t.selected); put("card", t.card); put("track", t.track); put("danger", t.danger); put("caution", t.caution);
  put("book-paper", t.bookPaper); put("book-ink", t.bookInk);
  v["--ink-on-accent"] = inkOn(t.accent);
  v["--glass"] = rgba(t.surface, 245 / 255);
  v["--frost"] = rgba(t.surface, 150 / 255);
  v["--shadow"] = t.dark ? "0 8px 24px rgba(0,0,0,.47)" : "0 8px 24px rgba(0,0,0,.24)";
  return v;
}

// presets.rs: the classics
export const PRESETS: { name: string; a: Appearance }[] = [
  { name: "Light", a: { base: "light", tintHue: 0, tintStrength: 0 } },
  { name: "Sepia", a: { base: "light", tintHue: 34, tintStrength: 23 } },
  { name: "Green", a: { base: "light", tintHue: 120, tintStrength: 12 } },
  { name: "Night", a: { base: "dark", tintHue: 0, tintStrength: 0 } },
  { name: "Parchment", a: { base: "light", tintHue: 40, tintStrength: 40 } },
  { name: "Cinema", a: { base: "black", tintHue: 0, tintStrength: 0 } },
];

// appearance_menu.rs HUES landmarks and hue_colour (HSL 60 %, 55 %)
export const HUES: [number, string][] = [[0, "Rose"], [34, "Sepia"], [60, "Amber"], [120, "Green"], [200, "Sky"], [260, "Violet"], [320, "Pink"]];
export const hueColour = (h: number) => `hsl(${h} 60% 55%)`;
