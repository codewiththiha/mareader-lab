import { cog, dot, ring, rr, type Lift } from "../engine/geo";
import { P, type IconDef } from "../engine/motion";

const TR: Lift = ["t", 0.78];
const TL: Lift = ["t", 0.22];
/** The window frame every chrome glyph shares. */
const win = (lift: Lift | null = TR) => rr(3, 3, 18, 18, 4.5, lift);
const EYE =
  "M2.5 12c2.2-4 5.5-6 9.5-6s7.3 2 9.5 6c-2.2 4-5.5 6-9.5 6s-7.3-2-9.5-6z";

export const chrome: IconDef[] = [
  {
    id: "panel-left",
    cat: "Chrome",
    say: "The rail flicks to the edge and springs home; the frame takes the tug.",
    parts: () => [P("frame", win()), P("rail", "M9 7.5v9", 9, 12)],
    move: (m) => {
      m.go("rail", { x: -3.2, sy: 0.72, w: 0.5 });
      m.go("frame", { x: -0.7 }, { at: 50, cue: 0, ease: "heavy" });
    },
  },
  {
    id: "panel-left-close",
    cat: "Chrome",
    say: "The chevron jabs; the rail is shoved a beat later and bounces back.",
    parts: () => [
      P("frame", win()),
      P("rail", "M9 7.5v9", 9, 12),
      P("chev", "M16.5 9l-3 3 3 3", 15, 12),
    ],
    move: (m) => {
      m.go("chev", { x: -2.4, w: 0.5 });
      m.go("rail", { x: -1.7, sy: 0.82 }, { at: 70, cue: 0 });
    },
  },
  {
    id: "panel-right",
    cat: "Chrome",
    say: "The rail is dragged inward like a resize handle, held, and let go.",
    parts: () => [P("frame", win(TL)), P("rail", "M15 7.5v9", 15, 12)],
    move: (m) => {
      m.go("rail", { x: -3, sy: 0.78, w: 0.5 }, { hold: 50 });
      m.go("frame", { sx: 1.035 }, { at: 40, cue: 0, ease: "heavy" });
    },
  },
  {
    id: "columns-2",
    cat: "Chrome",
    say: "The two halves part and the rail is inked from its middle outward.",
    parts: () => [
      P("left", "M10 3H7.5A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21H10", 6, 12),
      P("right", "M14 3h2.5A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5H14", 18, 12),
      P("rail", "M12 7.5v9"),
    ],
    move: (m) => {
      m.go("left", { x: -1.5 });
      m.go("right", { x: 1.5 });
      m.draw("rail", { at: 20, from: 0.5 });
      m.ink("rail", { at: 100 });
    },
  },
  {
    id: "layout-grid",
    cat: "Chrome",
    say: "Tiles are dealt in reading order, each one tipping as it lands.",
    parts: () => [
      P("t1", rr(3, 3, 7, 7, 2.2), 6.5, 6.5),
      P("t2", rr(14, 3, 7, 7, 2.2), 17.5, 6.5),
      P("t3", rr(3, 14, 7, 7, 2.2), 6.5, 17.5),
      P("t4", rr(14, 14, 7, 7, 2.2), 17.5, 17.5),
    ],
    move: (m) => {
      ["t1", "t2", "t3", "t4"].forEach((t, i) =>
        m.go(t, { s: 0.66, r: -10 }, { at: i * 45, act: 90, rest: 280 }),
      );
    },
  },
  {
    id: "layout-template",
    cat: "Chrome",
    say: "Header, main and side breathe apart in turn and click back together.",
    parts: () => [
      P("head", rr(3, 3, 18, 7, 2.5), 12, 6.5),
      P("main", rr(3, 14, 9, 7, 2.5), 7.5, 17.5),
      P("side", rr(16, 14, 5, 7, 2.5), 18.5, 17.5),
    ],
    move: (m) => {
      m.go("head", { y: -1.4 });
      m.go("main", { x: -1.4 }, { at: 45 });
      m.go("side", { x: 1.4, sy: 0.84 }, { at: 90 });
    },
  },
  {
    id: "gallery-vertical",
    cat: "Chrome",
    say: "A flick of the wheel: the far edge leads, the page follows, the near edge fades.",
    parts: () => [
      P("top", "M7.5 3h9", 12, 3),
      P("page", rr(4, 7, 16, 10, 3.2)),
      P("bottom", "M7.5 21h9", 12, 21),
    ],
    move: (m) => {
      m.go("bottom", { y: -2 });
      m.go("page", { y: -2, sy: 0.9 }, { at: 35 });
      m.go("top", { y: -1.4, o: 0.2 }, { at: 70 });
    },
  },
  {
    id: "gallery-horizontal",
    cat: "Chrome",
    say: "A swipe: the page squashes with its own momentum and the neighbours trail.",
    parts: () => [
      P("left", "M3 7.5v9", 3, 12),
      P("page", rr(7, 4, 10, 16, 3.2)),
      P("right", "M21 7.5v9", 21, 12),
    ],
    move: (m) => {
      m.go("right", { x: -2 });
      m.go("page", { x: -2, sx: 0.88 }, { at: 35 });
      m.go("left", { x: -1.4, o: 0.2 }, { at: 70 });
    },
  },
  {
    id: "menu",
    cat: "Chrome",
    say: "Three lines shimmy in alternate directions, a drawer being tugged.",
    parts: () => [
      P("l1", "M4 6h16", 12, 6),
      P("l2", "M4 12h16", 12, 12),
      P("l3", "M4 18h9", 8.5, 18),
    ],
    move: (m) => {
      m.go("l1", { x: 2.2, sx: 0.84 });
      m.go("l2", { x: -2.2, sx: 0.84 }, { at: 45 });
      m.go("l3", { x: 2.2, sx: 0.84 }, { at: 90 });
    },
  },
  {
    id: "x",
    cat: "Chrome",
    say: "Winds back, snips a quarter turn and lands exactly on itself.",
    parts: () => [P("x", ["M7 7l10 10", "M17 7 7 17"], 12, 12, { sym: 90 })],
    move: (m) => {
      m.to("x", { r: 90 });
      m.go("x", { s: 0.7 }, { cue: 0 });
      m.ink("x", { at: 40 });
    },
  },
  {
    id: "minus",
    cat: "Chrome",
    say: "The bar is squeezed and tucked down, then springs back to length.",
    parts: () => [P("bar", "M6 12h12")],
    move: (m) => m.go("bar", { sx: 0.42, y: 1.8, w: 0.6 }),
  },
  {
    id: "plus",
    cat: "Chrome",
    say: "Each bar is re-inked from the centre, then the whole mark pops.",
    parts: () => [
      P("plus", []),
      P("v", "M12 6v12", 12, 12, { in: "plus" }),
      P("h", "M6 12h12", 12, 12, { in: "plus" }),
    ],
    move: (m) => {
      m.draw("v", { from: 0.5 });
      m.draw("h", { at: 55, from: 0.5 });
      m.go("plus", { s: 1.16 }, { at: 130, cue: 0 });
    },
  },
  {
    id: "square",
    cat: "Chrome",
    say: "The frame flexes inward and an echo of it swells out to fill the screen.",
    parts: () => [
      P("echo", rr(4, 4, 16, 16, 4.5), 12, 12, { ghost: true }),
      P("frame", rr(4, 4, 16, 16, 4.5, TR)),
    ],
    move: (m) => {
      m.go("frame", { s: 0.86 });
      m.raw("echo", "Scale", 70, 380, [0.9, 1 + m.k(0.36)], [], "flick");
      m.fade("echo", [0, 0.45, 0], { at: 70, dur: 380, times: [0, 0.25, 1] });
    },
  },
  {
    id: "copy",
    cat: "Chrome",
    say: "Two sheets slide apart along the diagonal and restack.",
    parts: () => [
      P(
        "back",
        "M5.5 15A2.5 2.5 0 0 1 3 12.5v-6A3.5 3.5 0 0 1 6.5 3h6A2.5 2.5 0 0 1 15 5.5",
        9,
        9,
      ),
      P("front", rr(9, 9, 12, 12, 3.5), 15, 15),
    ],
    move: (m) => {
      m.go("front", { x: 1.4, y: 1.4 });
      m.go("back", { x: -1.4, y: -1.4, o: 0.5 }, { at: 40 });
    },
  },
  {
    id: "maximize",
    cat: "Chrome",
    say: "Corners fly outward in diagonal pairs, pressing harder as they go.",
    parts: () => [
      P("tl", "M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9", 6.5, 6.5),
      P("tr", "M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9", 17.5, 6.5),
      P("br", "M20 15v2.5a2.5 2.5 0 0 1-2.5 2.5H15", 17.5, 17.5),
      P("bl", "M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15", 6.5, 17.5),
    ],
    move: (m) => {
      m.go("tl", { x: -1.7, y: -1.7, w: 0.4 });
      m.go("br", { x: 1.7, y: 1.7, w: 0.4 });
      m.go("tr", { x: 1.7, y: -1.7, w: 0.4 }, { at: 45 });
      m.go("bl", { x: -1.7, y: 1.7, w: 0.4 }, { at: 45 });
    },
  },
  {
    id: "minimize",
    cat: "Chrome",
    say: "Corners pinch toward the centre in diagonal pairs and release.",
    parts: () => [
      P("tl", "M9 4v2.5A2.5 2.5 0 0 1 6.5 9H4", 6.5, 6.5),
      P("tr", "M15 4v2.5A2.5 2.5 0 0 0 17.5 9H20", 17.5, 6.5),
      P("br", "M20 15h-2.5a2.5 2.5 0 0 0-2.5 2.5V20", 17.5, 17.5),
      P("bl", "M4 15h2.5A2.5 2.5 0 0 1 9 17.5V20", 6.5, 17.5),
    ],
    move: (m) => {
      m.go("tl", { x: 1.6, y: 1.6, w: 0.4 });
      m.go("br", { x: -1.6, y: -1.6, w: 0.4 });
      m.go("tr", { x: -1.6, y: 1.6, w: 0.4 }, { at: 45 });
      m.go("bl", { x: 1.6, y: -1.6, w: 0.4 }, { at: 45 });
    },
  },
  {
    id: "eye-off",
    cat: "Chrome",
    say: "The eye squints and dims while the strike is re-inked across it.",
    parts: () => [P("eye", [EYE, dot(12, 12, 2.3)]), P("slash", "M4.5 4.5l15 15")],
    move: (m) => {
      m.go("eye", { sy: 0.55, o: 0.4 }, { cue: 0, hold: 60 });
      m.draw("slash", { at: 30 });
      m.ink("slash", { at: 110 });
    },
  },
  {
    id: "eye",
    cat: "Chrome",
    say: "A quick blink, then the pupil glances aside and settles.",
    parts: () => [P("lid", EYE), P("pupil", dot(12, 12, 2.3))],
    move: (m) => {
      m.go("lid", { sy: 0.1 }, { cue: 0, act: 70, rest: 230 });
      m.go("pupil", { sy: 0.1 }, { cue: 0, act: 70, rest: 230 });
      m.raw("pupil", "X", 150, 340, [0, m.k(1.9), 0], [0, 0.34, 1], ["flick", "spring"]);
    },
  },
  {
    id: "keyboard",
    cat: "Chrome",
    say: "Keys go down in a typed order, not a scanned one; the space bar finishes.",
    parts: () => [
      P("frame", rr(2.5, 5.5, 19, 13, 3.6, ["t", 0.8])),
      P("k1", dot(7.2, 10.2, 1.15), 7.2, 10.2),
      P("k2", dot(10.4, 10.2, 1.15), 10.4, 10.2),
      P("k3", dot(13.6, 10.2, 1.15), 13.6, 10.2),
      P("k4", dot(16.8, 10.2, 1.15), 16.8, 10.2),
      P("space", "M8.8 14.6h6.4", 12, 14.6),
    ],
    move: (m) => {
      ["k2", "k4", "k1", "k3"].forEach((k, i) =>
        m.go(k, { y: 0.8, s: 0.55 }, { at: i * 55, cue: 0, act: 60, rest: 200 }),
      );
      m.go("space", { y: 0.8, sx: 0.86 }, { at: 235, cue: 0, act: 70, rest: 240 });
    },
  },
  {
    id: "sliders-horizontal",
    cat: "Chrome",
    say: "Two ink knobs slide past each other along their rails and coast home.",
    parts: () => [
      P("r1", "M4 8h16", 12, 8),
      P("r2", "M4 16h16", 12, 16),
      P("k1", dot(9, 8, 2.5), 9, 8),
      P("k2", dot(15, 16, 2.5), 15, 16),
    ],
    move: (m) => {
      m.go("k1", { x: 5.2, sx: 1.22 });
      m.go("k2", { x: -5.2, sx: 1.22 }, { at: 60 });
    },
  },
  {
    id: "pin",
    cat: "Chrome",
    say: "Lifted, tilted and jabbed in: the needle sinks on contact.",
    parts: () => [
      P("pin", ["M8.5 4h7", "M10 4v5l-2.5 4.5h9L14 9V4"], 12, 20),
      P("needle", "M12 13.5V20", 12, 13.5, { in: "pin" }),
    ],
    move: (m) => {
      m.go("pin", { y: -2.6, r: -11 });
      m.raw("needle", "ScaleY", 165, 300, [1, 0.62, 1], [0, 0.3, 1], ["flick", "spring"]);
    },
  },
  {
    id: "settings",
    cat: "Chrome",
    say: "The cog winds back and clicks forward exactly one tooth; the hub pulses.",
    parts: () => [
      P("gear", cog(12, 12, 9.3, 6.7, 6), 12, 12, { sym: 60 }),
      P("hub", ring(12, 12, 2.6)),
    ],
    move: (m) => {
      m.to("gear", { r: 60 }, { dur: 460 });
      m.go("hub", { s: 1.3 }, { at: 60, cue: 0 });
    },
  },
];
