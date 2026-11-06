import type { ReactNode } from "react";
import type { AnimationSequence } from "motion/react";

/**
 * Where an icon lives in mareader's UI. Used only for grouping the gallery
 * and the Animation tab – the engine itself is category-agnostic.
 */
export type IconCategory =
  | "Chrome & panels"
  | "Reading"
  | "Navigation"
  | "Library"
  | "Playback & voice"
  | "Appearance"
  | "Editing & notes"
  | "AI & models"
  | "Status & controls";

/**
 * One animated icon. The glyph is authored once as static SVG (Lucide geometry
 * at rest) with parts tagged `data-p="name"`; the timeline is a Motion
 * sequence that targets those parts and ALWAYS returns to rest, so an icon can
 * be re-triggered or interrupted at any time without leaving a dirty state.
 */
export interface IconDefinition {
  /** Stable id, kebab-case. Used for the per-icon toggle and critique routes. */
  id: string;
  /** Human title. */
  name: string;
  /** Lucide glyph name this is drawn from (or "custom"). */
  lucide: string;
  /** `ui::icons::Icon` variants in mareader2 that map to this glyph. */
  uses: string[];
  category: IconCategory;
  /** Animator's note: what the motion is saying, in one line. */
  intent: string;
  /** SVG children (no <svg> wrapper). Must render the resting Lucide glyph. */
  glyph: ReactNode;
  /** The choreography. Must begin and end at rest. */
  timeline: AnimationSequence;
}

export type Trigger = "hover" | "click" | "both";
