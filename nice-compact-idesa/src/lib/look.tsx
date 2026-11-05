import { createContext, useCallback, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react";

export type Base = "light" | "dim" | "dark" | "black";

/** The reading look. One object drives every component in the kit. */
export interface Look {
  /** Name of the preset it came from, or null once a knob has moved it. */
  preset: string | null;
  base: Base;
  /** Hue in degrees, or null for no tint. */
  tint: number | null;
  /** Tint strength, 0–100 (a share of the full tint). */
  strength: number;
  /** Reading size in px. */
  size: number;
  /** Line height, as a multiplier. */
  lines: number;
  /** Gap between paragraphs, in em. */
  gaps: number;
  /** Film grain, 0–100. Zero is off. */
  grain: number;
  grainMotion: boolean;
}

interface BaseColours {
  label: string;
  paper: string;
  ink: string;
  muted: string;
  surface: string;
  line: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
}

/** The four base modes, from mareader's tokens (docs/design.md). */
export const BASES: Record<Base, BaseColours> = {
  light: { label: "Light", paper: "#ffffff", ink: "#1f2937", muted: "#6b7280", surface: "#ebedef", line: "#dadce1", accent: "#2563eb", accentSoft: "#dbeafe", onAccent: "#ffffff" },
  dim: { label: "Dim", paper: "#1a1c1f", ink: "#c3c6cb", muted: "#8b8f96", surface: "#202328", line: "#2e3238", accent: "#7a9bd4", accentSoft: "#232b36", onAccent: "#0b1220" },
  dark: { label: "Dark", paper: "#131316", ink: "#e5e7eb", muted: "#9ca3af", surface: "#1b1b20", line: "#2b2b31", accent: "#60a5fa", accentSoft: "#1d2b3a", onAccent: "#0b1220" },
  black: { label: "Black", paper: "#000000", ink: "#d4d4d8", muted: "#8a8a93", surface: "#0b0b0d", line: "#27272a", accent: "#60a5fa", accentSoft: "#0c1e33", onAccent: "#0b1220" },
};

/** mareader's named hue landmarks, in degrees. */
export const HUE_MARKS: { h: number; name: string }[] = [
  { h: 14, name: "Rose" },
  { h: 34, name: "Sepia" },
  { h: 104, name: "Green" },
  { h: 160, name: "Mint" },
  { h: 200, name: "Sky" },
  { h: 240, name: "Blue" },
  { h: 290, name: "Violet" },
];

export const PRESETS: { name: string; note: string; look: Partial<Look> }[] = [
  { name: "Classic", note: "White page, blue accent", look: { base: "light", tint: null, strength: 0 } },
  { name: "Sepia", note: "Warm paper", look: { base: "light", tint: 38, strength: 60 } },
  { name: "Green", note: "Easy on the eyes", look: { base: "light", tint: 104, strength: 34 } },
  { name: "Parchment", note: "Aged cream", look: { base: "light", tint: 64, strength: 42 } },
  { name: "Night", note: "Dark page", look: { base: "dark", tint: null, strength: 0 } },
  { name: "Cinema", note: "Dimmed, violet", look: { base: "dim", tint: 262, strength: 30 } },
];

export const DEFAULT_LOOK: Look = {
  preset: "Sepia",
  base: "light",
  tint: 38,
  strength: 60,
  size: 17,
  lines: 1.6,
  gaps: 0.6,
  grain: 0,
  grainMotion: false,
};

/** The nearest named landmark within 12°, else the degrees. */
export function hueName(h: number): string {
  let best = HUE_MARKS[0];
  let gap = Infinity;
  for (const m of HUE_MARKS) {
    const d = Math.min(Math.abs(m.h - h), 360 - Math.abs(m.h - h));
    if (d < gap) {
      gap = d;
      best = m;
    }
  }
  return gap <= 12 ? best.name : `${Math.round(h)}°`;
}

/** The CSS variables a look sets. Apply to any element; children inherit them. */
export function lookStyle(look: Look): CSSProperties {
  const b = BASES[look.base];
  const mix = look.tint === null || look.base === "black" ? 0 : Math.round(look.strength * 0.2);
  const tint = look.tint === null ? b.accent : `hsl(${look.tint} 62% 52%)`;
  const paper = mix === 0 ? b.paper : `color-mix(in oklch, ${b.paper} ${100 - mix}%, ${tint})`;
  const surface = mix === 0 ? b.surface : `color-mix(in oklch, ${b.surface} ${100 - Math.round(mix * 0.6)}%, ${tint})`;
  return {
    "--paper": paper,
    "--paper-base": b.paper,
    "--ink": b.ink,
    "--muted": b.muted,
    "--surface": surface,
    "--line": b.line,
    "--accent": b.accent,
    "--accent-soft": b.accentSoft,
    "--on-accent": b.onAccent,
    "--grain": String((look.grain / 100) * 0.22),
    "--read-size": `${look.size}px`,
    "--read-lh": String(look.lines),
    "--read-gap": `${look.gaps}em`,
  } as CSSProperties;
}

interface LookApi {
  look: Look;
  patch: (p: Partial<Look>) => void;
  preset: (name: string) => void;
  reset: () => void;
}

const LookContext = createContext<LookApi | null>(null);

export function LookProvider({ children }: { children: ReactNode }) {
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);

  /** Any manual change drops the preset name, as mareader's "Unsaved look" does. */
  const patch = useCallback((p: Partial<Look>) => {
    setLook((l) => ({ ...l, preset: null, ...p }));
  }, []);

  const preset = useCallback((name: string) => {
    const found = PRESETS.find((p) => p.name === name);
    if (found) setLook((l) => ({ ...l, ...found.look, preset: name }));
  }, []);

  const reset = useCallback(() => setLook(DEFAULT_LOOK), []);

  const api = useMemo(() => ({ look, patch, preset, reset }), [look, patch, preset, reset]);
  return <LookContext.Provider value={api}>{children}</LookContext.Provider>;
}

export function useLook(): LookApi {
  const v = useContext(LookContext);
  if (!v) throw new Error("useLook must be used inside LookProvider");
  return v;
}
