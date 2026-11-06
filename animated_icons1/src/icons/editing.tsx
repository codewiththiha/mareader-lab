import { P, defineIcon, draw, ease, erase, outBack, pivot, set } from "../motion/dsl";

const CAT = "Editing & notes" as const;
const OUT_BACK = outBack();

/* Highlight: the marker swipes right and leaves a translucent band that
   grows under its tip, then lifts away. */
export const highlighter = defineIcon({
  id: "highlighter",
  name: "Highlighter",
  lucide: "Highlighter",
  uses: ["Highlight"],
  category: CAT,
  intent: "The marker swipes and a translucent band grows under its tip.",
  glyph: (
    <>
      <path data-p="band" d="M3.5 22.5h8" strokeWidth="3" opacity="0" />
      <g data-p="pen">
        <path d="m9 11-6 6v3h9l3-3" />
        <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
      </g>
    </>
  ),
  timeline: [
    pivot(P("pen"), "0%", "100%"),
    erase(P("band")),
    [P("pen"), { x: [0, -2.5] }, { duration: 0.12, ease: ease.snap, at: 0 }],
    [P("pen"), { x: [-2.5, 4, 0], rotate: [0, -6, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.55, 1], at: 0.12 }],
    set(P("band"), { opacity: 0.35 }, 0.14),
    [P("band"), { pathLength: 1, pathOffset: 0 }, { duration: 0.28, ease: ease.snap, at: 0.14 }],
    [P("band"), { opacity: 0 }, { duration: 0.2, ease: ease.glide, at: 0.5 }],
  ],
});

/* HalfHighlight: the bar is swept beneath the letter, thickening as it
   passes, and the letter hops as the sweep reaches it. */
export const baseline = defineIcon({
  id: "baseline",
  name: "Baseline",
  lucide: "Baseline",
  uses: ["HalfHighlight"],
  category: CAT,
  intent: "A thick sweep runs along the bar beneath the letter, which hops as it passes.",
  glyph: (
    <>
      <path data-p="bar" d="M4 20h16" />
      <g data-p="a">
        <path d="m6 16 6-12 6 12" />
        <path d="M8 12h8" />
      </g>
    </>
  ),
  timeline: [
    pivot(P("a"), "50%", "100%"),
    erase(P("bar")),
    [P("bar"), { strokeWidth: 3.4, opacity: 1 }, { duration: 0, at: 0.02 }],
    [P("bar"), { pathLength: 1, pathOffset: 0 }, { duration: 0.3, ease: ease.snap, at: 0.02 }],
    [P("bar"), { strokeWidth: 2 }, { duration: 0.25, ease: ease.glide, at: 0.32 }],
    [P("a"), { y: [0, -1.5, 0], scaleY: [1, 1.08, 1] }, { duration: 0.34, ...OUT_BACK, at: 0.12 }],
  ],
});

/* Underline: the line is ruled under the U with a pen – drawn left to
   right with a tiny overshoot – and the U bobs in response. */
export const underline = defineIcon({
  id: "underline",
  name: "Underline",
  lucide: "Underline",
  uses: ["Underline"],
  category: CAT,
  intent: "The rule is drawn under the letter with a pen; the letter bobs in response.",
  glyph: (
    <>
      <path data-p="u" d="M6 4v6a6 6 0 0 0 12 0V4" />
      <line data-p="rule" x1="4" x2="20" y1="20" y2="20" />
    </>
  ),
  timeline: [
    erase(P("rule")),
    ...draw(P("rule"), { duration: 0.3, at: 0.02 }),
    [P("rule"), { scaleX: [1, 1.08, 1] }, { duration: 0.26, ...OUT_BACK, at: 0.28 }],
    [P("u"), { y: [0, -1.2, 0] }, { duration: 0.36, ...OUT_BACK, at: 0.18 }],
  ],
});

/* Rename: the pencil writes – it rocks from its tip and a short scribble
   appears beneath, then fades as the pencil lifts. */
export const pencil = defineIcon({
  id: "pencil",
  name: "Pencil",
  lucide: "Pencil",
  uses: ["Rename"],
  category: CAT,
  intent: "The pencil rocks on its tip and leaves a short scribble that fades as it lifts.",
  glyph: (
    <>
      <path data-p="ink" d="M2.5 22.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0" strokeWidth="1.5" opacity="0" />
      <g data-p="pen">
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        <path d="m15 5 4 4" />
      </g>
    </>
  ),
  timeline: [
    pivot(P("pen"), "0%", "100%"),
    erase(P("ink")),
    [P("pen"), { rotate: [0, -9, 4, -6, 0], x: [0, 1.5, 3.5, 5.5, 0] }, { duration: 0.6, ease: ease.glide, times: [0, 0.25, 0.5, 0.7, 1], at: 0 }],
    set(P("ink"), { opacity: 0.6 }, 0.05),
    [P("ink"), { pathLength: 1, pathOffset: 0 }, { duration: 0.34, ease: ease.linear, at: 0.05 }],
    [P("ink"), { opacity: 0 }, { duration: 0.18, ease: ease.glide, at: 0.44 }],
  ],
});

/* Note: a sticky note pinned by its top-left corner wobbles when pressed,
   and its folded corner lifts a little. */
export const stickyNote = defineIcon({
  id: "sticky-note",
  name: "Sticky note",
  lucide: "StickyNote",
  uses: ["Note"],
  category: CAT,
  intent: "Pressed on, the note wobbles from its pinned corner and the fold lifts.",
  glyph: (
    <g data-p="note">
      <path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
      <path data-p="fold" d="M15 3v5a1 1 0 0 0 1 1h5" />
    </g>
  ),
  timeline: [
    pivot(P("note"), "0%", "0%"),
    pivot(P("fold"), "0%", "100%"),
    [P("note"), { rotate: [0, -5, 3, 0] }, { duration: 0.6, ease: [ease.snap, ease.swing, ease.settle], times: [0, 0.3, 0.65, 1], at: 0 }],
    [P("fold"), { scale: [1, 1.2, 1] }, { duration: 0.4, ...OUT_BACK, at: 0.08 }],
  ],
});

export const editingIcons = [highlighter, baseline, underline, pencil, stickyNote];
