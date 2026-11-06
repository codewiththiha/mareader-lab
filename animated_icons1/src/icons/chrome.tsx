import { stagger } from "motion/react";
import { P, defineIcon, draw, ease, erase, pivot } from "../motion/dsl";

const CAT = "Chrome & panels" as const;

/* Sidebar: the pane collapses to the frame edge and springs back open,
   a wash of the pane colour following the divider so the area reads as a
   panel, not a line. */
export const panelLeft = defineIcon({
  id: "panel-left",
  name: "Panel left",
  lucide: "PanelLeft",
  uses: ["Sidebar"],
  category: CAT,
  intent: "The sidebar collapses to the edge and re-opens with a soft overshoot.",
  glyph: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <rect data-p="wash" x="3" y="3" width="6" height="18" rx="2" fill="currentColor" stroke="none" opacity="0" />
      <path data-p="divider" d="M9 3v18" />
    </>
  ),
  timeline: [
    pivot(P("wash"), "0%", "50%"),
    [P("divider"), { x: [0, -6] }, { duration: 0.14, ease: ease.drop, at: 0 }],
    [P("wash"), { scaleX: [1, 0], opacity: [0, 0.14] }, { duration: 0.14, ease: ease.drop, at: 0 }],
    [P("divider"), { x: [-6, 0.7, 0] }, { duration: 0.42, ease: [ease.snap, ease.settle], times: [0, 0.6, 1], at: 0.14 }],
    [P("wash"), { scaleX: [0, 1] }, { duration: 0.3, ease: ease.snap, at: 0.14 }],
    [P("wash"), { opacity: 0 }, { duration: 0.22, ease: ease.glide, at: 0.34 }],
  ],
});

/* SidebarClose: the chevron shoves the divider; the divider gives, then
   springs back – a push with contact, not two things wiggling. */
export const panelLeftClose = defineIcon({
  id: "panel-left-close",
  name: "Panel left close",
  lucide: "PanelLeftClose",
  uses: ["SidebarClose"],
  category: CAT,
  intent: "The chevron pushes the divider shut; the divider gives and springs back.",
  glyph: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path data-p="divider" d="M9 3v18" />
      <path data-p="chev" d="m16 15-3-3 3-3" />
    </>
  ),
  timeline: [
    [P("chev"), { x: [0, -2.8, 0], scaleX: [1, 0.78, 1] }, { duration: 0.46, ease: [ease.snap, ease.settle], times: [0, 0.38, 1], at: 0 }],
    [P("divider"), { x: [0, -1.6, 0] }, { duration: 0.4, ease: [ease.snap, ease.settle], times: [0, 0.35, 1], at: 0.12 }],
  ],
});

/* Aside: a drag-resize – the pane widens, then settles to its width. */
export const panelRight = defineIcon({
  id: "panel-right",
  name: "Panel right",
  lucide: "PanelRight",
  uses: ["Aside"],
  category: CAT,
  intent: "The aside is dragged wider and settles back, like a resize handle.",
  glyph: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <rect data-p="wash" x="15" y="3" width="6" height="18" rx="2" fill="currentColor" stroke="none" opacity="0" />
      <path data-p="divider" d="M15 3v18" />
    </>
  ),
  timeline: [
    pivot(P("wash"), "100%", "50%"),
    [P("divider"), { x: [0, -3.5, 0.4, 0] }, { duration: 0.55, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.4, 0.8, 1], at: 0 }],
    [P("wash"), { scaleX: [1, 1.58, 0.93, 1] }, { duration: 0.55, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.4, 0.8, 1], at: 0 }],
    [P("wash"), { opacity: [0, 0.14, 0.14, 0] }, { duration: 0.55, times: [0, 0.25, 0.7, 1], at: 0 }],
  ],
});

/* SplitRight: the divider grows from the middle outward while the frame
   breathes wider – the window is being split. */
export const columns2 = defineIcon({
  id: "columns-2",
  name: "Columns",
  lucide: "Columns2",
  uses: ["SplitRight"],
  category: CAT,
  intent: "A divider grows from the centre outward as the frame breathes wider.",
  glyph: (
    <>
      <rect data-p="frame" width="18" height="18" x="3" y="3" rx="2" />
      <path data-p="divider" d="M12 3v18" />
    </>
  ),
  timeline: [
    erase(P("divider"), "center"),
    [P("frame"), { scaleX: [1, 1.07, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    ...draw(P("divider"), { duration: 0.32, at: 0.06 }),
  ],
});

/* Thumbnails / Grid: four pages are dealt in reading order with a quick
   pop – each tile lands a beat after the last. */
export const layoutGrid = defineIcon({
  id: "layout-grid",
  name: "Layout grid",
  lucide: "LayoutGrid",
  uses: ["Thumbnails", "Grid"],
  category: CAT,
  intent: "Tiles are dealt in reading order, each landing with a small pop.",
  glyph: (
    <>
      <rect data-p="tile" width="7" height="7" x="3" y="3" rx="1" />
      <rect data-p="tile" width="7" height="7" x="14" y="3" rx="1" />
      <rect data-p="tile" width="7" height="7" x="3" y="14" rx="1" />
      <rect data-p="tile" width="7" height="7" x="14" y="14" rx="1" />
    </>
  ),
  timeline: [
    [P("tile"), { scale: [1, 0.6, 1.1, 1], opacity: [1, 0.4, 1, 1] }, { duration: 0.42, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.3, 0.7, 1], delay: stagger(0.055), at: 0 }],
  ],
});

/* Layout: the three regions breathe apart and snap back into one layout. */
export const layoutTemplate = defineIcon({
  id: "layout-template",
  name: "Layout template",
  lucide: "LayoutTemplate",
  uses: ["Layout"],
  category: CAT,
  intent: "Header, main and side regions breathe apart, then snap back together.",
  glyph: (
    <>
      <rect data-p="head" width="18" height="7" x="3" y="3" rx="1" />
      <rect data-p="main" width="9" height="7" x="3" y="14" rx="1" />
      <rect data-p="side" width="5" height="7" x="16" y="14" rx="1" />
    </>
  ),
  timeline: [
    [P("head"), { y: [0, -2.2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("main"), { x: [0, -2.2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.05 }],
    [P("side"), { x: [0, 2.2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.1 }],
  ],
});

/* ScrollVertical: a wheel-scroll with parallax – lower pages travel further
   and the top edge thins as it leaves. */
export const galleryVertical = defineIcon({
  id: "gallery-vertical",
  name: "Gallery vertical",
  lucide: "GalleryVertical",
  uses: ["ScrollVertical"],
  category: CAT,
  intent: "A flick of the wheel: pages scroll up with parallax and ease back.",
  glyph: (
    <>
      <path data-p="top" d="M3 2h18" />
      <rect data-p="page" width="18" height="12" x="3" y="6" rx="2" />
      <path data-p="bottom" d="M3 22h18" />
    </>
  ),
  timeline: [
    [P("bottom"), { y: [0, -3.5, 0] }, { duration: 0.6, ease: [ease.snap, ease.swing], times: [0, 0.4, 1], at: 0 }],
    [P("page"), { y: [0, -2.6, 0] }, { duration: 0.6, ease: [ease.snap, ease.swing], times: [0, 0.4, 1], at: 0.04 }],
    [P("top"), { y: [0, -1.6, 0], opacity: [1, 0.35, 1] }, { duration: 0.6, ease: [ease.snap, ease.swing], times: [0, 0.4, 1], at: 0.08 }],
  ],
});

/* ScrollHorizontal: a swipe – the page squashes with momentum as it moves. */
export const galleryHorizontal = defineIcon({
  id: "gallery-horizontal",
  name: "Gallery horizontal",
  lucide: "GalleryHorizontal",
  uses: ["ScrollHorizontal"],
  category: CAT,
  intent: "A swipe: the page squashes with momentum and the neighbours follow.",
  glyph: (
    <>
      <path data-p="left" d="M2 3v18" />
      <rect data-p="page" width="12" height="18" x="6" y="3" rx="2" />
      <path data-p="right" d="M22 3v18" />
    </>
  ),
  timeline: [
    pivot(P("page"), "100%", "50%"),
    [P("page"), { x: [0, -3, 0], scaleX: [1, 0.86, 1] }, { duration: 0.55, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("right"), { x: [0, -4, 0] }, { duration: 0.55, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.03 }],
    [P("left"), { x: [0, -1.5, 0], opacity: [1, 0.35, 1] }, { duration: 0.55, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.06 }],
  ],
});

/* Menu: a shimmy – alternate lines slide opposite ways, like a drawer
   being tugged. */
export const menu = defineIcon({
  id: "menu",
  name: "Menu",
  lucide: "Menu",
  uses: ["Menu"],
  category: CAT,
  intent: "Lines shimmy in alternating directions, a drawer being tugged.",
  glyph: (
    <>
      <path data-p="l1" d="M4 5h16" />
      <path data-p="l2" d="M4 12h16" />
      <path data-p="l3" d="M4 19h16" />
    </>
  ),
  timeline: [
    [P("l1"), { x: [0, -3.2, 0], scaleX: [1, 0.8, 1] }, { duration: 0.45, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("l2"), { x: [0, 3.2, 0], scaleX: [1, 0.8, 1] }, { duration: 0.45, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.05 }],
    [P("l3"), { x: [0, -3.2, 0], scaleX: [1, 0.8, 1] }, { duration: 0.45, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.1 }],
  ],
});

/* Close: a quarter-turn snip. The X is 4-fold symmetric, so a 90° spin
   lands exactly at rest; the dip in scale makes it a cut, not a spin. */
export const close = defineIcon({
  id: "x",
  name: "Close",
  lucide: "X",
  uses: ["Close"],
  category: CAT,
  intent: "A quarter-turn snip that lands exactly on itself.",
  glyph: (
    <g data-p="x">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </g>
  ),
  timeline: [
    [P("x"), { rotate: [0, 90], scale: [1, 0.68, 1] }, { duration: 0.42, ease: ease.settle, times: [0, 0.45, 1], at: 0 }],
  ],
});

/* Minimize / Minus: the bar dips and squeezes, something being tucked away. */
export const minus = defineIcon({
  id: "minus",
  name: "Minus",
  lucide: "Minus",
  uses: ["WindowMinimize", "Minus"],
  category: CAT,
  intent: "The bar squeezes and dips, something being tucked away.",
  glyph: <path data-p="bar" d="M5 12h14" />,
  timeline: [
    [P("bar"), { scaleX: [1, 0.4, 1.06, 1], y: [0, 2, 0, 0] }, { duration: 0.48, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.35, 0.75, 1], at: 0 }],
  ],
});

/* Plus: both bars grow from the centre at once – an addition appearing. */
export const plus = defineIcon({
  id: "plus",
  name: "Plus",
  lucide: "Plus",
  uses: ["Plus"],
  category: CAT,
  intent: "Both bars grow outward from the centre, then relax.",
  glyph: (
    <g data-p="plus">
      <path data-p="h" d="M5 12h14" />
      <path data-p="v" d="M12 5v14" />
    </g>
  ),
  timeline: [
    erase(P("h"), "center"),
    erase(P("v"), "center"),
    ...draw(P("h"), { duration: 0.26, at: 0.02 }),
    ...draw(P("v"), { duration: 0.26, at: 0.08 }),
    [P("plus"), { scale: [1, 1.14, 1] }, { duration: 0.34, ease: [ease.snap, ease.settle], times: [0, 0.5, 1], at: 0.2 }],
  ],
});

/* Maximize window: a ghost of the window grows out of the frame. */
export const square = defineIcon({
  id: "square",
  name: "Square",
  lucide: "Square",
  uses: ["WindowMaximize"],
  category: CAT,
  intent: "The frame flexes and a ghost window expands out of it.",
  glyph: (
    <>
      <rect data-p="ghost" width="18" height="18" x="3" y="3" rx="2" opacity="0" />
      <rect data-p="frame" width="18" height="18" x="3" y="3" rx="2" />
    </>
  ),
  timeline: [
    [P("frame"), { scale: [1, 0.88, 1.03, 1] }, { duration: 0.5, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.35, 0.75, 1], at: 0 }],
    [P("ghost"), { scale: [0.35, 1.4], opacity: [0, 0.4, 0] }, { duration: 0.5, ease: ease.snap, times: [0, 0.35, 1], at: 0.1 }],
  ],
});

/* Restore / Copy: the two sheets un-stack diagonally and re-stack. */
export const copy = defineIcon({
  id: "copy",
  name: "Copy",
  lucide: "Copy",
  uses: ["WindowRestore", "Copy"],
  category: CAT,
  intent: "Two sheets fan apart along the diagonal and settle back as a stack.",
  glyph: (
    <>
      <rect data-p="front" width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path data-p="back" d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>
  ),
  timeline: [
    [P("front"), { x: [0, 1.6, 0], y: [0, 1.6, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("back"), { x: [0, -1.6, 0], y: [0, -1.6, 0], opacity: [1, 0.55, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.04 }],
  ],
});

/* Fullscreen: corners fly outward while a ghost window swells to fill. */
export const maximize = defineIcon({
  id: "maximize",
  name: "Maximize",
  lucide: "Maximize",
  uses: ["Fullscreen"],
  category: CAT,
  intent: "Corners fly outward as a ghost window swells to fill the screen.",
  glyph: (
    <>
      <rect data-p="ghost" x="7" y="7" width="10" height="10" rx="1.5" opacity="0" />
      <path data-p="tl" d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path data-p="tr" d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path data-p="bl" d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path data-p="br" d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </>
  ),
  timeline: [
    [P("tl"), { x: [0, -2, 0], y: [0, -2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("tr"), { x: [0, 2, 0], y: [0, -2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("bl"), { x: [0, -2, 0], y: [0, 2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("br"), { x: [0, 2, 0], y: [0, 2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("ghost"), { scale: [0.6, 1.25], opacity: [0, 0.45, 0] }, { duration: 0.45, ease: ease.snap, times: [0, 0.4, 1], at: 0.05 }],
  ],
});

/* Exit fullscreen: corners draw in and the ghost window shrinks to a pane. */
export const minimize = defineIcon({
  id: "minimize",
  name: "Minimize",
  lucide: "Minimize",
  uses: ["ExitFullscreen"],
  category: CAT,
  intent: "Corners draw inward as the ghost window shrinks back to a pane.",
  glyph: (
    <>
      <rect data-p="ghost" x="7" y="7" width="10" height="10" rx="1.5" opacity="0" />
      <path data-p="tl" d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path data-p="tr" d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path data-p="bl" d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path data-p="br" d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </>
  ),
  timeline: [
    [P("tl"), { x: [0, 1.8, 0], y: [0, 1.8, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("tr"), { x: [0, -1.8, 0], y: [0, 1.8, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("bl"), { x: [0, 1.8, 0], y: [0, -1.8, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("br"), { x: [0, -1.8, 0], y: [0, -1.8, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0 }],
    [P("ghost"), { scale: [1.3, 0.6], opacity: [0, 0.45, 0] }, { duration: 0.45, ease: ease.snap, times: [0, 0.4, 1], at: 0.05 }],
  ],
});

/* Chromeless: the eye dims and the strike-through is drawn across it. */
export const eyeOff = defineIcon({
  id: "eye-off",
  name: "Eye off",
  lucide: "EyeOff",
  uses: ["Chromeless"],
  category: CAT,
  intent: "The eye dims while the strike is drawn across it, then recovers.",
  glyph: (
    <>
      <g data-p="eye">
        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      </g>
      <path data-p="slash" d="m2 2 20 20" />
    </>
  ),
  timeline: [
    erase(P("slash"), "start"),
    [P("eye"), { opacity: [1, 0.4] }, { duration: 0.16, ease: ease.snap, at: 0 }],
    ...draw(P("slash"), { duration: 0.26, at: 0.04 }),
    [P("eye"), { opacity: 1 }, { duration: 0.28, ease: ease.glide, at: 0.3 }],
  ],
});

/* Keyboard: a burst of typing – keys press in a human, non-linear order,
   then the space bar. */
export const keyboard = defineIcon({
  id: "keyboard",
  name: "Keyboard",
  lucide: "Keyboard",
  uses: ["Keyboard"],
  category: CAT,
  intent: "Keys press in a typed (not scanned) order; the space bar finishes.",
  glyph: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path data-p="k1" d="M6 8h.01" />
      <path data-p="k2" d="M10 8h.01" />
      <path data-p="k3" d="M14 8h.01" />
      <path data-p="k4" d="M18 8h.01" />
      <path data-p="k5" d="M8 12h.01" />
      <path data-p="k6" d="M12 12h.01" />
      <path data-p="k7" d="M16 12h.01" />
      <path data-p="space" d="M7 16h10" />
    </>
  ),
  timeline: [
    ...(["k2", "k6", "k1", "k7", "k3", "k5", "k4"] as const).map((k, i): [string, Record<string, unknown>, Record<string, unknown>] => [
      P(k),
      { y: [0, 1, 0], opacity: [1, 0.3, 1] },
      { duration: 0.16, ease: ease.snap, at: i * 0.05 },
    ]),
    [P("space"), { scaleX: [1, 0.82, 1] }, { duration: 0.22, ease: [ease.snap, ease.settle], at: 0.38 }],
  ],
});

/* ViewOptions: the three knobs slide to new positions and return; the rails
   open and close around them so nothing ever crosses. */
export const slidersHorizontal = defineIcon({
  id: "sliders-horizontal",
  name: "Sliders",
  lucide: "SlidersHorizontal",
  uses: ["ViewOptions"],
  category: CAT,
  intent: "Knobs slide along their rails, the rails opening around them.",
  glyph: (
    <>
      <path data-p="l1" d="M10 5H3" />
      <path data-p="k1" d="M14 3v4" />
      <path data-p="r1" d="M21 5h-7" />
      <path data-p="l2" d="M8 12H3" />
      <path data-p="k2" d="M8 10v4" />
      <path data-p="r2" d="M21 12h-9" />
      <path data-p="l3" d="M12 19H3" />
      <path data-p="k3" d="M16 17v4" />
      <path data-p="r3" d="M21 19h-5" />
    </>
  ),
  timeline: [
    pivot(P("l1"), "0%", "50%"), pivot(P("l2"), "0%", "50%"), pivot(P("l3"), "0%", "50%"),
    pivot(P("r1"), "100%", "50%"), pivot(P("r2"), "100%", "50%"), pivot(P("r3"), "100%", "50%"),
    [P("k1"), { x: [0, -3, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0 }],
    [P("l1"), { scaleX: [1, 0.571, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0 }],
    [P("r1"), { scaleX: [1, 1.429, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0 }],
    [P("k2"), { x: [0, 3, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0.07 }],
    [P("l2"), { scaleX: [1, 1.6, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0.07 }],
    [P("r2"), { scaleX: [1, 0.667, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0.07 }],
    [P("k3"), { x: [0, -2, 0] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0.14 }],
    [P("l3"), { scaleX: [1, 0.778, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0.14 }],
    [P("r3"), { scaleX: [1, 1.4, 1] }, { duration: 0.5, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0.14 }],
  ],
});

/* Pin: lifted, then jabbed in – the needle shortens on contact. */
export const pin = defineIcon({
  id: "pin",
  name: "Pin",
  lucide: "Pin",
  uses: ["Pin"],
  category: CAT,
  intent: "Lifted and jabbed in: the needle sinks on contact, then the pin rests.",
  glyph: (
    <g data-p="pin">
      <path data-p="needle" d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </g>
  ),
  timeline: [
    pivot(P("needle"), "50%", "0%"),
    [P("pin"), { y: [0, -3.2] }, { duration: 0.18, ease: ease.snap, at: 0 }],
    [P("pin"), { y: [-3.2, 0.8, 0] }, { duration: 0.3, ease: [ease.drop, ease.settle], times: [0, 0.5, 1], at: 0.18 }],
    [P("needle"), { scaleY: [1, 0.45, 1] }, { duration: 0.32, ease: [ease.snap, ease.settle], times: [0, 0.3, 1], at: 0.3 }],
  ],
});

/* Settings: the gear advances one tooth (60°) and the hub pulses – a
   single notch, not an idle spin. */
export const settings = defineIcon({
  id: "settings",
  name: "Settings",
  lucide: "Settings",
  uses: ["Settings"],
  category: CAT,
  intent: "The gear clicks forward exactly one tooth; the hub pulses with it.",
  glyph: (
    <>
      <path data-p="gear" d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      <circle data-p="hub" cx="12" cy="12" r="3" />
    </>
  ),
  timeline: [
    [P("gear"), { rotate: [0, 60] }, { duration: 0.55, ease: ease.settle, at: 0 }],
    [P("hub"), { scale: [1, 0.6, 1] }, { duration: 0.4, ease: [ease.snap, ease.settle], times: [0, 0.4, 1], at: 0.05 }],
  ],
});

export const chromeIcons = [
  panelLeft, panelLeftClose, panelRight, columns2, layoutGrid, layoutTemplate,
  galleryVertical, galleryHorizontal, menu, close, minus, plus, square, copy,
  maximize, minimize, eyeOff, keyboard, slidersHorizontal, pin, settings,
];
