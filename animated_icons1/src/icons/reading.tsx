import { stagger } from "motion/react";
import { P, defineIcon, draw, ease, erase, outBack, pivot, set } from "../motion/dsl";

const CAT = "Reading" as const;
const OUT_BACK = outBack();

/* The right-hand page turns across the spine: a leaf (hidden at rest) is
   mirrored through scaleX 1 → -1, so at the midpoint it is the spine itself
   and at the end it coincides with the left page – nothing ever crosses. */
export const bookOpen = defineIcon({
  id: "book-open",
  name: "Book open",
  lucide: "BookOpen",
  uses: ["Book", "Spread"],
  category: CAT,
  intent: "A page turns over the spine, left to right, and the book lifts to meet it.",
  glyph: (
    <g data-p="book">
      <path data-p="spine" d="M12 5v16" />
      <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
      <path data-p="leaf" d="M12 5a5 5 0 0 1 4-2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4a5 5 0 0 0-4 2" opacity="0" />
    </g>
  ),
  timeline: [
    pivot(P("leaf"), "0%", "50%"),
    set(P("leaf"), { opacity: 1 }),
    [P("leaf"), { scaleX: [1, -1] }, { duration: 0.5, ease: ease.glide, at: 0 }],
    [P("leaf"), { opacity: [1, 1, 0] }, { duration: 0.5, times: [0, 0.78, 1], at: 0 }],
    [P("book"), { y: [0, -1, 0] }, { duration: 0.5, ease: [ease.snap, ease.swing], times: [0, 0.5, 1], at: 0 }],
  ],
});

/* Follow: the text lines are read in order – each is redrawn left to right
   as the voice reaches it. */
export const bookOpenText = defineIcon({
  id: "book-open-text",
  name: "Book open text",
  lucide: "BookOpenText",
  uses: ["Follow"],
  category: CAT,
  intent: "Lines light up in reading order, as a voice moves through the text.",
  glyph: (
    <>
      <path d="M12 5v16" />
      <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
      <path data-p="t1" d="M6 9h2" />
      <path data-p="t2" d="M6 13h2" />
      <path data-p="t3" d="M16 9h2" />
      <path data-p="t4" d="M16 13h2" />
    </>
  ),
  timeline: [
    ...(["t1", "t2", "t3", "t4"] as const).flatMap((t, i) => [
      erase(P(t), "start", i * 0.09),
      ...draw(P(t), { duration: 0.18, at: i * 0.09 + 0.02 }),
    ]),
    [P("t1"), { scaleX: [1, 1.5, 1] }, { duration: 0.3, ...OUT_BACK, at: 0.02 }],
    [P("t2"), { scaleX: [1, 1.5, 1] }, { duration: 0.3, ...OUT_BACK, at: 0.11 }],
    [P("t3"), { scaleX: [1, 1.5, 1] }, { duration: 0.3, ...OUT_BACK, at: 0.2 }],
    [P("t4"), { scaleX: [1, 1.5, 1] }, { duration: 0.3, ...OUT_BACK, at: 0.29 }],
  ],
});

/* Dictionary: the headword springs up off the page; the crossbar lags a
   beat like a lighter stroke would. */
export const bookA = defineIcon({
  id: "book-a",
  name: "Book A",
  lucide: "BookA",
  uses: ["Dictionary"],
  category: CAT,
  intent: "The letter springs up from the page, its crossbar lagging a beat.",
  glyph: (
    <>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
      <path data-p="legs" d="m8 13 4-7 4 7" />
      <path data-p="bar" d="M9.1 11h5.7" />
    </>
  ),
  timeline: [
    pivot(P("legs"), "50%", "100%"),
    [P("legs"), { scale: [1, 1.22, 1], y: [0, -1, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("bar"), { y: [0, -1.6, 0], scaleX: [1, 1.2, 1] }, { duration: 0.5, ...OUT_BACK, at: 0.07 }],
  ],
});

/* LookUp: the lens is lifted over the page in an arc, magnifying as it
   peaks, and set back down at the corner. */
export const bookSearch = defineIcon({
  id: "book-search",
  name: "Book search",
  lucide: "BookSearch",
  uses: ["LookUp"],
  category: CAT,
  intent: "The lens arcs up over the page, magnifies, and settles back at the corner.",
  glyph: (
    <>
      <path d="M11 22H5.5a1 1 0 0 1 0-5h4.501" />
      <path d="M3 19.5v-15A2.5 2.5 0 0 1 5.5 2H18a1 1 0 0 1 1 1v8" />
      <g data-p="lens">
        <path d="m21 22-1.879-1.878" />
        <circle cx="17" cy="18" r="3" />
      </g>
    </>
  ),
  timeline: [
    [P("lens"), { x: [0, -4.5, 0], y: [0, -6.5, 0], scale: [1, 1.2, 1] }, { duration: 0.6, ease: [ease.snap, ease.swing], times: [0, 0.45, 1], at: 0 }],
  ],
});

/* Import: the plus is stamped into the book – it twists a quarter turn
   while squeezing in, and the book takes the impact. */
export const bookPlus = defineIcon({
  id: "book-plus",
  name: "Book plus",
  lucide: "BookPlus",
  uses: ["Import"],
  category: CAT,
  intent: "The plus is stamped in with a quarter twist; the book takes the hit.",
  glyph: (
    <>
      <path data-p="book" d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
      <g data-p="plus">
        <path d="M12 7v6" />
        <path d="M9 10h6" />
      </g>
    </>
  ),
  timeline: [
    [P("plus"), { scale: [1, 0.45, 1.15, 1], rotate: [0, 90, 90, 90] }, { duration: 0.48, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.4, 0.75, 1], at: 0 }],
    [P("book"), { y: [0, 0.9, 0] }, { duration: 0.3, ...OUT_BACK, at: 0.19 }],
  ],
});

/* Bookmark: dropped into place from above; it lands with a squash and a
   brief flash of fill, like a ribbon tucked into the page. */
export const bookmark = defineIcon({
  id: "bookmark",
  name: "Bookmark",
  lucide: "Bookmark",
  uses: ["Bookmark"],
  category: CAT,
  intent: "Dropped in from above, landing with a squash and a flash of fill.",
  glyph: (
    <g data-p="mark">
      <path data-p="fill" d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" fill="currentColor" stroke="none" opacity="0" />
      <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
    </g>
  ),
  timeline: [
    pivot(P("mark"), "50%", "100%"),
    [P("mark"), { y: [0, -4] }, { duration: 0.16, ease: ease.snap, at: 0 }],
    [P("mark"), { y: [-4, 0], scaleY: [1, 1, 0.88, 1] }, { duration: 0.36, ease: ease.drop, times: [0, 0.5, 0.7, 1], at: 0.16 }],
    [P("fill"), { opacity: [0, 0.28, 0] }, { duration: 0.36, times: [0, 0.3, 1], at: 0.3 }],
  ],
});

/* Zoom in: the plus pops first, then the lens swells to follow it. */
export const zoomIn = defineIcon({
  id: "zoom-in",
  name: "Zoom in",
  lucide: "ZoomIn",
  uses: ["ZoomIn"],
  category: CAT,
  intent: "The plus pops, then the lens swells after it.",
  glyph: (
    <g data-p="lens">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <g data-p="sign">
        <line x1="11" x2="11" y1="8" y2="14" />
        <line x1="8" x2="14" y1="11" y2="11" />
      </g>
    </g>
  ),
  timeline: [
    pivot(P("lens"), "44.4%", "44.4%"),
    [P("sign"), { scale: [1, 1.45, 1] }, { duration: 0.4, ...OUT_BACK, at: 0 }],
    [P("lens"), { scale: [1, 1.14, 1] }, { duration: 0.45, ...OUT_BACK, at: 0.08 }],
  ],
});

/* Zoom out: the inverse – the minus tucks in and the lens shrinks after it. */
export const zoomOut = defineIcon({
  id: "zoom-out",
  name: "Zoom out",
  lucide: "ZoomOut",
  uses: ["ZoomOut"],
  category: CAT,
  intent: "The minus tucks in and the lens shrinks after it – the inverse of zoom in.",
  glyph: (
    <g data-p="lens">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line data-p="sign" x1="8" x2="14" y1="11" y2="11" />
    </g>
  ),
  timeline: [
    pivot(P("lens"), "44.4%", "44.4%"),
    [P("sign"), { scaleX: [1, 0.5, 1] }, { duration: 0.4, ...OUT_BACK, at: 0 }],
    [P("lens"), { scale: [1, 0.85, 1] }, { duration: 0.45, ...OUT_BACK, at: 0.08 }],
  ],
});

/* Search: the magnifier is held by its handle and swept over the page. */
export const search = defineIcon({
  id: "search",
  name: "Search",
  lucide: "Search",
  uses: ["Search"],
  category: CAT,
  intent: "Held by the handle, the magnifier sweeps a small arc over the page.",
  glyph: (
    <g data-p="glass">
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </g>
  ),
  timeline: [
    pivot(P("glass"), "100%", "100%"),
    [P("glass"), { rotate: [0, -14, 9, 0], x: [0, 1.5, -1, 0] }, { duration: 0.6, ease: [ease.snap, ease.swing, ease.settle], times: [0, 0.35, 0.7, 1], at: 0 }],
  ],
});

/* FitWidth: the arrow heads push out to the edges and the bar stretches
   between them. */
export const moveHorizontal = defineIcon({
  id: "move-horizontal",
  name: "Move horizontal",
  lucide: "MoveHorizontal",
  uses: ["FitWidth"],
  category: CAT,
  intent: "Heads push to the edges while the bar stretches to fit between them.",
  glyph: (
    <>
      <path data-p="right" d="m18 8 4 4-4 4" />
      <path data-p="bar" d="M2 12h20" />
      <path data-p="left" d="m6 8-4 4 4 4" />
    </>
  ),
  timeline: [
    [P("right"), { x: [0, 2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("left"), { x: [0, -2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("bar"), { scaleX: [1, 1.2, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
  ],
});

/* FitPage: all four arrows dive toward the centre, heads first. */
export const shrink = defineIcon({
  id: "shrink",
  name: "Shrink",
  lucide: "Shrink",
  uses: ["FitPage"],
  category: CAT,
  intent: "Four arrows dive to the centre, heads leading, and ease back out.",
  glyph: (
    <>
      <path data-p="br" d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
      <path data-p="bl" d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
      <path data-p="tr" d="M15 4.2V9m0 0h4.8M15 9l6-6" />
      <path data-p="tl" d="M9 4.2V9m0 0H4.2M9 9 3 3" />
    </>
  ),
  timeline: [
    [P("tl"), { x: [0, 2.2, 0], y: [0, 2.2, 0], scale: [1, 0.85, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("tr"), { x: [0, -2.2, 0], y: [0, 2.2, 0], scale: [1, 0.85, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("bl"), { x: [0, 2.2, 0], y: [0, -2.2, 0], scale: [1, 0.85, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("br"), { x: [0, -2.2, 0], y: [0, -2.2, 0], scale: [1, 0.85, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
  ],
});

/* SinglePage: the next page comes up from beneath and takes the place of
   the current one, which lifts away – a seamless hand-over. */
export const rectangleVertical = defineIcon({
  id: "rectangle-vertical",
  name: "Rectangle vertical",
  lucide: "RectangleVertical",
  uses: ["SinglePage"],
  category: CAT,
  intent: "The next page rises from beneath as the current one lifts away.",
  glyph: (
    <>
      <rect data-p="next" width="12" height="20" x="6" y="2" rx="2" opacity="0" />
      <rect data-p="page" width="12" height="20" x="6" y="2" rx="2" />
    </>
  ),
  timeline: [
    set(P("next"), { y: 4, scale: 0.86, opacity: 0 }),
    [P("page"), { y: [0, -4], opacity: [1, 0] }, { duration: 0.3, ease: ease.snap, at: 0 }],
    [P("next"), { y: [4, 0], scale: [0.86, 1], opacity: [0, 1] }, { duration: 0.42, ease: ease.settle, at: 0.06 }],
    set(P("page"), { y: 0, opacity: 1 }, 0.48),
    set(P("next"), { opacity: 0 }, 0.48),
  ],
});

/* Type: the glyph grows from its baseline – a font-size change – and
   settles; the baseline mark holds still. */
export const type = defineIcon({
  id: "type",
  name: "Type",
  lucide: "Type",
  uses: ["Type"],
  category: CAT,
  intent: "The letterform grows from its baseline like a size change, then settles.",
  glyph: (
    <>
      <g data-p="t">
        <path d="M12 4v16" />
        <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
      </g>
      <path data-p="base" d="M9 20h6" />
    </>
  ),
  timeline: [
    pivot(P("t"), "50%", "100%"),
    [P("t"), { scale: [1, 1.14, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("base"), { scaleX: [1, 1.25, 1] }, { duration: 0.4, ...OUT_BACK, at: 0.08 }],
  ],
});

/* Figure: the sun rises a little and the horizon is redrawn beneath it. */
export const image = defineIcon({
  id: "image",
  name: "Image",
  lucide: "Image",
  uses: ["Figure"],
  category: CAT,
  intent: "The sun lifts and the mountain is redrawn beneath it.",
  glyph: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle data-p="sun" cx="9" cy="9" r="2" />
      <path data-p="hill" d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </>
  ),
  timeline: [
    erase(P("hill"), "end"),
    ...draw(P("hill"), { duration: 0.34, at: 0.04 }),
    [P("sun"), { y: [0, -1.8, 0], scale: [1, 1.2, 1] }, { duration: 0.55, ease: [ease.snap, ease.swing], times: [0, 0.45, 1], at: 0 }],
  ],
});

/* Table: the grid is ruled in – column first, then rows top to bottom. */
export const table = defineIcon({
  id: "table",
  name: "Table",
  lucide: "Table",
  uses: ["Table"],
  category: CAT,
  intent: "The grid is ruled in: the column line first, then the rows.",
  glyph: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path data-p="col" d="M12 3v18" />
      <path data-p="r1" d="M3 9h18" />
      <path data-p="r2" d="M3 15h18" />
    </>
  ),
  timeline: [
    erase(P("col"), "start"),
    erase(P("r1"), "start"),
    erase(P("r2"), "start"),
    ...draw(P("col"), { duration: 0.26, at: 0.02 }),
    ...draw(P("r1"), { duration: 0.22, at: 0.14 }),
    ...draw(P("r2"), { duration: 0.22, at: 0.24 }),
  ],
});

/* Levels: bars rise from the baseline in turn and overshoot a touch. */
export const chartColumns = defineIcon({
  id: "chart-column-increasing",
  name: "Chart column increasing",
  lucide: "ChartNoAxesColumnIncreasing",
  uses: ["Levels"],
  category: CAT,
  intent: "Bars rise from the baseline one after another, overshooting slightly.",
  glyph: (
    <>
      <path data-p="bar" d="M5 21v-6" />
      <path data-p="bar" d="M12 21V9" />
      <path data-p="bar" d="M19 21V3" />
    </>
  ),
  timeline: [
    pivot(P("bar"), "50%", "100%"),
    [P("bar"), { scaleY: [1, 0.1, 1.12, 1] }, { duration: 0.5, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.2, 0.7, 1], delay: stagger(0.07), at: 0 }],
  ],
});

export const readingIcons = [
  bookOpen, bookOpenText, bookA, bookSearch, bookPlus, bookmark, zoomIn, zoomOut, search,
  moveHorizontal, shrink, rectangleVertical, type, image, table, chartColumns,
];
