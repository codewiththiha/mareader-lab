import { P, defineIcon, draw, ease, erase, outBack, pivot, set } from "../motion/dsl";
import type { IconDefinition } from "../motion/types";

const CAT = "Navigation" as const;
const OUT_BACK = outBack();

/* Chevrons: a nudge in their direction with a faint echo trailing behind –
   the glyph points, and the echo says "and keep going". */
const chevron = (id: string, lucide: string, use: string, d: string, dx: number, dy: number): IconDefinition =>
  defineIcon({
    id,
    name: lucide.replace(/([A-Z])/g, " $1").trim(),
    lucide,
    uses: [use],
    category: CAT,
    intent: "A nudge in its direction, with a faint echo trailing one step behind.",
    glyph: (
      <>
        <path data-p="echo" d={d} opacity="0" />
        <path data-p="chev" d={d} />
      </>
    ),
    timeline: (() => {
      const axis = dx !== 0 ? "x" : "y";
      const d = dx !== 0 ? dx : dy;
      return [
        [P("chev"), { [axis]: [0, d * 2.4, 0] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
        set(P("echo"), { [axis]: -d * 2.5, opacity: 0 }),
        [P("echo"), { [axis]: [-d * 2.5, d * 1.2], opacity: [0, 0.45, 0] }, { duration: 0.4, ease: ease.snap, times: [0, 0.3, 1], at: 0.06 }],
      ];
    })(),
  });

export const chevronDown = chevron("chevron-down", "ChevronDown", "ChevronDown", "m6 9 6 6 6-6", 0, 1);
export const chevronUp = chevron("chevron-up", "ChevronUp", "ChevronUp", "m18 15-6-6-6 6", 0, -1);
export const chevronLeft = chevron("chevron-left", "ChevronLeft", "ChevronLeft", "m15 18-6-6 6-6", -1, 0);
export const chevronRight = chevron("chevron-right", "ChevronRight", "ChevronRight", "m9 18 6-6-6-6", 1, 0);

/* Arrows that pass through: the arrow leaves one side and re-enters from
   the other, so a continuous motion (auto-scroll, move) reads as endless. */
const passThrough = (id: string, lucide: string, uses: string[], glyph: IconDefinition["glyph"], dy: number): IconDefinition =>
  defineIcon({
    id,
    name: lucide.replace(/([A-Z])/g, " $1").trim(),
    lucide,
    uses,
    category: CAT,
    intent: "The arrow leaves on one side and re-enters from the other – an endless move.",
    glyph,
    timeline: [
      [P("arrow"), { y: [0, dy * 5], opacity: [1, 0] }, { duration: 0.2, ease: ease.drop, at: 0 }],
      set(P("arrow"), { y: -dy * 5, opacity: 0 }, 0.2),
      [P("arrow"), { y: [-dy * 5, 0], opacity: [0, 1] }, { duration: 0.36, ease: ease.settle, at: 0.2 }],
    ],
  });

export const arrowDown = passThrough(
  "arrow-down",
  "ArrowDown",
  ["AutoScroll", "MoveDown"],
  <g data-p="arrow">
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </g>,
  1,
);
export const arrowUp = passThrough(
  "arrow-up",
  "ArrowUp",
  ["MoveUp"],
  <g data-p="arrow">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </g>,
  -1,
);

/* Sort: the two arrows tug apart – the down arrow's head leads downward,
   the up arrow's head leads upward, shafts stretching after them. */
export const arrowDownUp = defineIcon({
  id: "arrow-down-up",
  name: "Arrow down up",
  lucide: "ArrowDownUp",
  uses: ["Sort"],
  category: CAT,
  intent: "Each head tugs its own way and the shaft stretches after it, then both relax.",
  glyph: (
    <>
      <path data-p="dh" d="m3 16 4 4 4-4" />
      <path data-p="ds" d="M7 20V4" />
      <path data-p="uh" d="m21 8-4-4-4 4" />
      <path data-p="us" d="M17 4v16" />
    </>
  ),
  timeline: [
    pivot(P("ds"), "50%", "0%"),
    pivot(P("us"), "50%", "100%"),
    [P("dh"), { y: [0, 2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("ds"), { scaleY: [1, 1.125, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("uh"), { y: [0, -2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0.08 }],
    [P("us"), { scaleY: [1, 1.125, 1] }, { duration: 0.5, ...OUT_BACK, at: 0.08 }],
  ],
});

/* Swap: the two lanes slide past each other in opposite directions. */
export const arrowRightLeft = defineIcon({
  id: "arrow-right-left",
  name: "Arrow right left",
  lucide: "ArrowRightLeft",
  uses: ["Swap"],
  category: CAT,
  intent: "Two lanes slide past each other, each in its own direction.",
  glyph: (
    <>
      <g data-p="top">
        <path d="m16 3 4 4-4 4" />
        <path d="M20 7H4" />
      </g>
      <g data-p="bottom">
        <path d="m8 21-4-4 4-4" />
        <path d="M4 17h16" />
      </g>
    </>
  ),
  timeline: [
    [P("top"), { x: [0, 3, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("bottom"), { x: [0, -3, 0] }, { duration: 0.5, ...OUT_BACK, at: 0.05 }],
  ],
});

/* LeaveTable: the arrow departs from the line, which flexes as it pushes
   off; it re-enters from behind the line. */
export const arrowRightFromLine = defineIcon({
  id: "arrow-right-from-line",
  name: "Arrow right from line",
  lucide: "ArrowRightFromLine",
  uses: ["LeaveTable"],
  category: CAT,
  intent: "The arrow pushes off from the line, which flexes, and comes round again.",
  glyph: (
    <>
      <path data-p="line" d="M3 5v14" />
      <g data-p="arrow">
        <path d="M21 12H7" />
        <path d="m15 18 6-6-6-6" />
      </g>
    </>
  ),
  timeline: [
    [P("line"), { scaleY: [1, 1.15, 1], x: [0, -0.8, 0] }, { duration: 0.35, ...OUT_BACK, at: 0 }],
    [P("arrow"), { x: [0, 5], opacity: [1, 0] }, { duration: 0.2, ease: ease.drop, at: 0.02 }],
    set(P("arrow"), { x: -4, opacity: 0 }, 0.22),
    [P("arrow"), { x: [-4, 0], opacity: [0, 1] }, { duration: 0.36, ease: ease.settle, at: 0.22 }],
  ],
});

/* Restore: the curve is redrawn backwards – from its tail to the head –
   and the head nudges as the stroke arrives. */
export const undo2 = defineIcon({
  id: "undo-2",
  name: "Undo",
  lucide: "Undo2",
  uses: ["Restore"],
  category: CAT,
  intent: "The curve is traced backwards to the head, which nudges as it arrives.",
  glyph: (
    <>
      <path data-p="head" d="M9 14 4 9l5-5" />
      <path data-p="curve" d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
    </>
  ),
  timeline: [
    erase(P("curve"), "end"),
    ...draw(P("curve"), { duration: 0.36, at: 0.02 }),
    [P("head"), { x: [0, -1.8, 0] }, { duration: 0.34, ...OUT_BACK, at: 0.3 }],
  ],
});

/* Rescan: a half turn – the glyph is 2-fold symmetric, so 180° lands on
   itself; the settle ease makes it a deliberate sweep, not a spinner. */
export const refreshCw = defineIcon({
  id: "refresh-cw",
  name: "Refresh",
  lucide: "RefreshCw",
  uses: ["Rescan"],
  category: CAT,
  intent: "One deliberate half-turn that lands exactly on itself.",
  glyph: (
    <g data-p="spin">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </g>
  ),
  timeline: [[P("spin"), { rotate: [0, 180] }, { duration: 0.6, ease: ease.settle, at: 0 }]],
});

/* Repeat: the loop runs – the top lane travels right and wraps, the bottom
   lane travels left and wraps, in step. */
export const repeat = defineIcon({
  id: "repeat",
  name: "Repeat",
  lucide: "Repeat",
  uses: ["Repeat"],
  category: CAT,
  intent: "The loop runs one cycle: both lanes travel and wrap around in step.",
  glyph: (
    <>
      <g data-p="top">
        <path d="m17 2 4 4-4 4" />
        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      </g>
      <g data-p="bottom">
        <path d="m7 22-4-4 4-4" />
        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
      </g>
    </>
  ),
  timeline: [
    [P("top"), { x: [0, 4], opacity: [1, 0] }, { duration: 0.2, ease: ease.drop, at: 0 }],
    [P("bottom"), { x: [0, -4], opacity: [1, 0] }, { duration: 0.2, ease: ease.drop, at: 0 }],
    set(P("top"), { x: -4, opacity: 0 }, 0.2),
    set(P("bottom"), { x: 4, opacity: 0 }, 0.2),
    [P("top"), { x: [-4, 0], opacity: [0, 1] }, { duration: 0.36, ease: ease.settle, at: 0.2 }],
    [P("bottom"), { x: [4, 0], opacity: [0, 1] }, { duration: 0.36, ease: ease.settle, at: 0.2 }],
  ],
});

/* Link: the two halves part along the diagonal and click back together. */
export const link = defineIcon({
  id: "link",
  name: "Link",
  lucide: "Link",
  uses: ["Link"],
  category: CAT,
  intent: "The halves part along the diagonal and click back together.",
  glyph: (
    <g data-p="chain">
      <path data-p="a" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path data-p="b" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </g>
  ),
  timeline: [
    [P("a"), { x: [0, 1.6, 0], y: [0, -1.6, 0] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("b"), { x: [0, -1.6, 0], y: [0, 1.6, 0] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("chain"), { scale: [1, 1.08, 1] }, { duration: 0.24, ...OUT_BACK, at: 0.3 }],
  ],
});

/* List: rows type themselves out – each line wipes in from its bullet. */
export const list = defineIcon({
  id: "list",
  name: "List",
  lucide: "List",
  uses: ["List"],
  category: CAT,
  intent: "Rows type themselves out, each line wiping in from its bullet.",
  glyph: (
    <>
      <path data-p="d1" d="M3 5h.01" />
      <path data-p="d2" d="M3 12h.01" />
      <path data-p="d3" d="M3 19h.01" />
      <path data-p="l1" d="M8 5h13" />
      <path data-p="l2" d="M8 12h13" />
      <path data-p="l3" d="M8 19h13" />
    </>
  ),
  timeline: [
    erase(P("l1")), erase(P("l2")), erase(P("l3")),
    [P("d1"), { scale: [1, 1.8, 1] }, { duration: 0.2, ...OUT_BACK, at: 0 }],
    ...draw(P("l1"), { duration: 0.2, at: 0.02 }),
    [P("d2"), { scale: [1, 1.8, 1] }, { duration: 0.2, ...OUT_BACK, at: 0.12 }],
    ...draw(P("l2"), { duration: 0.2, at: 0.14 }),
    [P("d3"), { scale: [1, 1.8, 1] }, { duration: 0.2, ...OUT_BACK, at: 0.24 }],
    ...draw(P("l3"), { duration: 0.2, at: 0.26 }),
  ],
});

/* Outline: the tree unfolds – the trunk is drawn down, then the children
   slide out of it one after another. */
export const listTree = defineIcon({
  id: "list-tree",
  name: "List tree",
  lucide: "ListTree",
  uses: ["Outline"],
  category: CAT,
  intent: "The tree unfolds: the trunk draws down, then children slide out of it.",
  glyph: (
    <>
      <path d="M8 5h13" />
      <path data-p="trunk" d="M3 5v12a2 2 0 0 0 2 2h3" />
      <path data-p="branch" d="M3 10a2 2 0 0 0 2 2h3" />
      <path data-p="c1" d="M13 12h8" />
      <path data-p="c2" d="M13 19h8" />
    </>
  ),
  timeline: [
    erase(P("trunk")), erase(P("branch")),
    set(P("c1"), { x: -3, opacity: 0 }), set(P("c2"), { x: -3, opacity: 0 }),
    ...draw(P("trunk"), { duration: 0.28, at: 0.02 }),
    ...draw(P("branch"), { duration: 0.16, at: 0.1 }),
    [P("c1"), { x: [-3, 0], opacity: [0, 1] }, { duration: 0.3, ease: ease.settle, at: 0.2 }],
    [P("c2"), { x: [-3, 0], opacity: [0, 1] }, { duration: 0.3, ease: ease.settle, at: 0.3 }],
  ],
});

/* SelectSeveral: the two ticks are drawn in turn; each row nudges as it is
   ticked off. */
export const listChecks = defineIcon({
  id: "list-checks",
  name: "List checks",
  lucide: "ListChecks",
  uses: ["SelectSeveral"],
  category: CAT,
  intent: "Ticks are drawn one after another; each row nudges as it is checked.",
  glyph: (
    <>
      <path data-p="r1" d="M13 5h8" />
      <path data-p="r2" d="M13 12h8" />
      <path data-p="r3" d="M13 19h8" />
      <path data-p="k2" d="m3 17 2 2 4-4" />
      <path data-p="k1" d="m3 7 2 2 4-4" />
    </>
  ),
  timeline: [
    erase(P("k1")), erase(P("k2")),
    ...draw(P("k1"), { duration: 0.22, at: 0.02 }),
    [P("r1"), { x: [0, 1.5, 0] }, { duration: 0.3, ...OUT_BACK, at: 0.12 }],
    ...draw(P("k2"), { duration: 0.22, at: 0.2 }),
    [P("r3"), { x: [0, 1.5, 0] }, { duration: 0.3, ...OUT_BACK, at: 0.3 }],
  ],
});

/* More: the three dots bounce in turn – the universal "thinking" cadence. */
export const ellipsis = defineIcon({
  id: "ellipsis",
  name: "Ellipsis",
  lucide: "Ellipsis",
  uses: ["More"],
  category: CAT,
  intent: "Three dots bounce in turn – the familiar 'more to come' cadence.",
  glyph: (
    <>
      <circle data-p="d1" cx="5" cy="12" r="1" />
      <circle data-p="d2" cx="12" cy="12" r="1" />
      <circle data-p="d3" cx="19" cy="12" r="1" />
    </>
  ),
  timeline: [
    [P("d1"), { y: [0, -3, 0], scale: [1, 1.3, 1] }, { duration: 0.34, ...OUT_BACK, at: 0 }],
    [P("d2"), { y: [0, -3, 0], scale: [1, 1.3, 1] }, { duration: 0.34, ...OUT_BACK, at: 0.08 }],
    [P("d3"), { y: [0, -3, 0], scale: [1, 1.3, 1] }, { duration: 0.34, ...OUT_BACK, at: 0.16 }],
  ],
});

export const navigationIcons = [
  chevronLeft, chevronRight, chevronUp, chevronDown, arrowDown, arrowUp, arrowDownUp, arrowRightLeft,
  arrowRightFromLine, undo2, refreshCw, repeat, link, list, listTree, listChecks, ellipsis,
];
