import type { CSSProperties } from "react";

/**
 * Tokens mirror mareader2's `crates/appearance/src/tokens.rs` (Light / Dark / Dim / Black).
 * "Parchment" is the preset used in the project's README screenshots; its values were
 * sampled from those screenshots (the real preset is Light + hue 40 + strength 28 + paper texture + grain).
 */
export type Tok = {
  paper: string;
  ink: string;
  muted: string;
  surface: string;
  line: string;
  accent: string;
  accentSoft: string;
  card: string;
  danger: string;
  dark: boolean;
};

export type LookId = "parchment" | "light" | "dark" | "dim" | "black";

export const LOOKS: Record<LookId, { label: string; tok: Tok }> = {
  parchment: {
    label: "Parchment",
    tok: {
      paper: "#ece0cc",
      ink: "#2b2114",
      muted: "#6b5a46",
      surface: "#ebd6bb",
      line: "#dcc3a4",
      accent: "#764e00",
      accentSoft: "#efc78c",
      card: "#f4e3cb",
      danger: "#b3261e",
      dark: false,
    },
  },
  light: {
    label: "Light",
    tok: {
      paper: "#ffffff",
      ink: "#1f2937",
      muted: "#6b7280",
      surface: "#ebedef",
      line: "#dadce1",
      accent: "#2563eb",
      accentSoft: "#dbeafe",
      card: "#f3f7fe",
      danger: "#c0291f",
      dark: false,
    },
  },
  dark: {
    label: "Dark",
    tok: {
      paper: "#131316",
      ink: "#e5e7eb",
      muted: "#9ca3af",
      surface: "#16161a",
      line: "#2b2b31",
      accent: "#60a5fa",
      accentSoft: "#1d2b3a",
      card: "#1f2127",
      danger: "#f27368",
      dark: true,
    },
  },
  dim: {
    label: "Dim",
    tok: {
      paper: "#1a1c1f",
      ink: "#c3c6cb",
      muted: "#8b8f96",
      surface: "#202328",
      line: "#2e3238",
      accent: "#7a9bd4",
      accentSoft: "#232b36",
      card: "#272b31",
      danger: "#e0786f",
      dark: true,
    },
  },
  black: {
    label: "Black",
    tok: {
      paper: "#000000",
      ink: "#d4d4d8",
      muted: "#8a8a93",
      surface: "#000000",
      line: "#27272a",
      accent: "#60a5fa",
      accentSoft: "#0c1e33",
      card: "#0b0b0d",
      danger: "#f27368",
      dark: true,
    },
  },
};

const mix = (a: string, b: string, pct: number) =>
  `color-mix(in oklab, ${a} ${100 - pct}%, ${b} ${pct}%)`;

/** CSS custom properties for a token set (design.md: hover = line, selected = accent-soft, track = line→ink). */
export function tokenVars(t: Tok): CSSProperties {
  const vars: Record<string, string> = {
    "--paper": t.paper,
    "--ink": t.ink,
    "--muted": t.muted,
    "--surface": t.surface,
    "--line": t.line,
    "--accent": t.accent,
    "--accent-soft": t.accentSoft,
    "--card": t.card,
    "--danger": t.danger,
    "--hover": t.line,
    "--pressed": mix(t.line, t.ink, 12),
    "--track": mix(t.line, t.ink, t.dark ? 18 : 22),
    "--on-accent": t.dark ? "#0a0a0a" : "#ffffff",
    "--shadow": t.dark ? "rgba(0,0,0,.47)" : "rgba(0,0,0,.24)",
    "--shadow-soft": t.dark ? "rgba(0,0,0,.35)" : "rgba(60,40,10,.16)",
    colorScheme: t.dark ? "dark" : "light",
  };
  return vars as CSSProperties;
}

/* ---------- Tint (Appearance popover) ---------- */

export type Base = "light" | "dark" | "dim" | "black";

/** The app's hue is an sRGB-wheel angle; its UI tokens rotate on the OKLCH circle. */
const HUE_MAP: [number, number][] = [
  [0, 29],
  [34, 66],
  [60, 110],
  [104, 128],
  [160, 165],
  [200, 215],
  [240, 264],
  [290, 305],
  [360, 389],
];
export function oklchHue(h: number) {
  const x = ((h % 360) + 360) % 360;
  for (let i = 1; i < HUE_MAP.length; i++) {
    const [a, oa] = HUE_MAP[i - 1];
    const [b, ob] = HUE_MAP[i];
    if (x <= b) return (oa + ((ob - oa) * (x - a)) / (b - a)) % 360;
  }
  return 29;
}

/** Each token takes the tint's hue outright, keeps lightness and gains chroma toward a ceiling (tokens.rs `tinted`). */
export function tintedTok(base: Base, hue: number, strengthPct: number): Tok {
  const b = LOOKS[base].tok;
  const t = Math.max(0, Math.min(1, strengthPct / 100));
  const h = oklchHue(hue);
  const tint = (hex: string, maxC: number, darken = 0) =>
    `oklch(from ${hex} calc(l - ${darken * t}) calc(c + (${maxC} - c) * ${t}) ${h})`;
  if (base === "black") {
    return { ...b, ink: tint(b.ink, 0.07), muted: tint(b.muted, 0.05), accent: tint(b.accent, 0.14) };
  }
  const light = base === "light";
  return {
    ...b,
    paper: tint(b.paper, light ? 0.05 : 0.03, light ? 0.04 : 0),
    surface: tint(b.surface, light ? 0.07 : 0.03, light ? 0.04 : 0),
    line: tint(b.line, light ? 0.07 : 0.03, light ? 0.03 : 0),
    card: tint(b.card, light ? 0.06 : 0.03, light ? 0.04 : 0),
    ink: tint(b.ink, 0.03),
    muted: tint(b.muted, 0.05),
    accent: tint(b.accent, light ? 0.11 : 0.12),
    accentSoft: tint(b.accentSoft, light ? 0.09 : 0.04, light ? 0.03 : 0),
  };
}
