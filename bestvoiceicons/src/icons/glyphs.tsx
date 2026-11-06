import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Every mark below is drawn on Lucide's 24-unit grid: stroke 2,      */
/*  round caps, round joins — so the new glyphs sit seamlessly beside  */
/*  the ones Mareader already ships.                                   */
/* ------------------------------------------------------------------ */

export interface GlyphProps {
  size?: number | string;
  strokeWidth?: number;
  strokeLinecap?: "round" | "square" | "butt";
  viewBox?: string;
  className?: string;
}

function G({
  size = 24,
  strokeWidth = 2,
  strokeLinecap = "round",
  viewBox = "0 0 24 24",
  className,
  children,
}: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinecap === "round" ? "round" : "miter"}
      className={className}
    >
      {children}
    </svg>
  );
}

export type IconComp = (p: GlyphProps) => ReactNode;

/* ============================ VOICE ENGINES ======================== */

/** Kokoro — 心, "heart". A spoken pulse crossing the heart's outline. */
export const KokoroMark: IconComp = (p) => (
  <G {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M6.5 10.5h2.4l1.2-2.3 2 4.6 1.4-2.3h4" />
  </G>
);

/** Piper — three stopped panpipes bound by one cord; level bars upright. */
export const PiperMark: IconComp = (p) => (
  <G {...p}>
    <rect x="4.2" y="6" width="3.6" height="14" rx="1.8" />
    <rect x="10.2" y="3.5" width="3.6" height="16.5" rx="1.8" />
    <rect x="16.2" y="9" width="3.6" height="11" rx="1.8" />
    <path d="M2.5 15h1.7M7.8 15h2.4M13.8 15h2.4M19.8 15h1.7" />
  </G>
);

/** Kitten — the lightest possible cat, a waveform where the purr should be. */
export const KittenMark: IconComp = (p) => (
  <G {...p}>
    <path d="M4.2 4.5 8 6.8a8.8 8.8 0 0 1 8 0l3.8-2.3-.6 5.4c.5 1 .8 2 .8 3.1 0 4.4-3.6 7.5-8 7.5s-8-3.1-8-7.5c0-1.1.3-2.1.8-3.1Z" />
    <circle cx="9" cy="11.8" r="1.05" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11.8" r="1.05" fill="currentColor" stroke="none" />
    <path d="M8.8 15.9h1.4l.8-1.4 1.6 2.8.9-1.4h1.7" />
  </G>
);

/** Phonon — a quantum of vibration passing through five lattice sites. */
export const PhononMark: IconComp = (p) => (
  <G {...p}>
    <path d="M2.4 12c1.6-5.2 3.2-5.2 4.8 0s3.2 5.2 4.8 0 3.2-5.2 4.8 0 3.2 5.2 4.8 0" />
    <circle cx="2.4" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="7.2" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="16.8" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="21.6" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </G>
);

/** System — the voice the computer already owns: a display that speaks. */
export const SystemMark: IconComp = (p) => (
  <G {...p}>
    <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
    <path d="M12 17v3.5M8 20.5h8" />
    <path d="M6.3 10.5h2l1.4-2.7 2.4 5.4 1.5-2.7h3.1" />
  </G>
);

/** Silent — one blip, a flat line, a full stop. Speech that ends at once. */
export const SilentMark: IconComp = (p) => (
  <G {...p}>
    <path d="M2.5 12h2.6l1.4-3.2 2.2 6.4 1.6-3.2h6.2" />
    <circle cx="19.9" cy="12" r="1.6" />
  </G>
);

/* ============================ REDRAWS ============================== */

/** Motion — an ease curve pinned between two keyframes. */
export const MotionNew: IconComp = (p) => (
  <G {...p}>
    <path d="M6.5 18.5c6 0 5-13 11-13" />
    <rect x="2.75" y="16.75" width="3.5" height="3.5" rx="0.9" />
    <rect x="17.75" y="3.75" width="3.5" height="3.5" rx="0.9" />
  </G>
);

/** Levels — a staircase with a climber: A1 → C2 as steps, not bars. */
export const LevelsNew: IconComp = (p) => (
  <G {...p}>
    <path d="M2.5 20.5h5V15h5V9.5h5V4h4" />
    <circle cx="10" cy="12.2" r="1.4" fill="currentColor" stroke="none" />
  </G>
);

/** HalfHighlight — a letter over a marker bar filled only halfway. */
export const HalfHighlightNew: IconComp = (p) => (
  <G {...p}>
    <path d="m7.2 13.5 4.8-10 4.8 10M9.1 9.7h5.8" />
    <path
      d="M5 16.5h7v4H5a2 2 0 0 1-2-2 2 2 0 0 1 2-2Z"
      fill="currentColor"
      stroke="none"
    />
    <rect x="3" y="16.5" width="18" height="4" rx="2" />
  </G>
);

/** AutoScroll — chevrons descending inside a page: it feeds itself. */
export const AutoScrollNew: IconComp = (p) => (
  <G {...p}>
    <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
    <path d="m9 7.5 3 3 3-3" />
    <path d="m9 13 3 3 3-3" />
  </G>
);

/** PageNumber — the numero sign, drawn the way a book prints its folio. */
export const PageNumberNew: IconComp = (p) => (
  <G {...p}>
    <path d="M4.5 17.5v-11l7 11v-11" />
    <circle cx="16.9" cy="13.2" r="2.6" />
    <path d="M14.3 19.5h5.2" />
  </G>
);

/** Chromeless — the frame goes ghost while the text stays solid. */
export const ChromelessNew: IconComp = (p) => (
  <G {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" strokeDasharray="2.6 3.2" />
    <path d="M7 10h10M7 14h6.5" />
  </G>
);

/** Simplify — three full lines funnel down into one short line. */
export const SimplifyNew: IconComp = (p) => (
  <G {...p}>
    <path d="M3.5 4h17M3.5 8h17M3.5 12h17" />
    <path d="m9.5 14.5 2.5 2.5 2.5-2.5" />
    <path d="M8.5 20.5h7" />
  </G>
);

/** FitPage — crop brackets around a seated page. */
export const FitPageNew: IconComp = (p) => (
  <G {...p}>
    <path d="M3 7.5v-3A1.5 1.5 0 0 1 4.5 3h3M16.5 3h3A1.5 1.5 0 0 1 21 4.5v3M21 16.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M7.5 21h-3A1.5 1.5 0 0 1 3 19.5v-3" />
    <rect x="7.5" y="6.75" width="9" height="10.5" rx="1.25" />
  </G>
);

/** Spread — two faced pages with a spine; SinglePage's rectangle, doubled. */
export const SpreadNew: IconComp = (p) => (
  <G {...p}>
    <rect x="2.75" y="4.75" width="8.5" height="14.5" rx="1.5" />
    <rect x="12.75" y="4.75" width="8.5" height="14.5" rx="1.5" />
    <path d="M12 3.25v17.5" />
  </G>
);

/* ============================ ALREADY BESPOKE ====================== */

/** The app's own AI mark, rebuilt verbatim from crates/ui/src/icons.rs. */
export const AiMark: IconComp = (p) => (
  <G {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="4" />
    <path d="M6.5 16 9.25 8 12 16" />
    <path d="M7.6 13.2h3.3" />
    <path d="M16.5 8v8" />
    <path d="M15 8h3" />
    <path d="M15 16h3" />
  </G>
);

/* ============================ SITE BRAND =========================== */

/** Mareader ledger brand: an open book carrying a spoken line. */
export const LogoMark: IconComp = (p) => (
  <G {...p}>
    <path d="M12 6c-2.8-1.6-5.7-1.9-9-1v14c3.3-.9 6.2-.6 9 1 2.8-1.6 5.7-1.9 9-1V5c-3.3-.9-6.2-.6-9 1Z" />
    <path d="M12 6v14" />
    <path d="M15.2 10.4h.9l.7-1.3 1.1 2.6.8-1.3h1" strokeWidth={1.6} />
  </G>
);
