import { arc, dot, poly, ring, rr, solid, type Lift } from "../engine/geo";
import { P, type IconDef } from "../engine/motion";

const TR: Lift = ["t", 0.78];
const win = () => rr(3, 3, 18, 18, 4.5, TR);

/** An open book: one outline with a notch at the gutter. */
const OPEN_BOOK =
  "M12 6.5c2-1.4 4.5-2 7.5-2A1.5 1.5 0 0 1 21 6v10.5a1.5 1.5 0 0 1-1.5 1.5c-3 0-5.5.6-7.5 2-2-1.4-4.5-2-7.5-2A1.5 1.5 0 0 1 3 16.5V6a1.5 1.5 0 0 1 1.5-1.5c3 0 5.5.6 7.5 2z";
const SPINE = "M12 6.5V20";
/** A closed book: cover and page block, open where the pages show. */
const BOOK = [
  "M19 17H7.5a2.5 2.5 0 0 0 0 5H19",
  "M19 17V5a2 2 0 0 0-2-2H7.5A2.5 2.5 0 0 0 5 5.5v14",
];
const LENS = ring(10.5, 10.5, 6.5);
const HANDLE = "M17.6 17.6l2.9 2.9";
const BOOKMARK = "M6.5 6A2.5 2.5 0 0 1 9 3.5h6A2.5 2.5 0 0 1 17.5 6v14.5l-5.5-4-5.5 4z";

export const reading: IconDef[] = [
  {
    id: "book-open",
    cat: "Reading",
    say: "A leaf turns over the gutter as the book lifts a hair off the desk.",
    parts: () => [
      P("book", [OPEN_BOOK, SPINE], 12, 20),
      P("leaf", "M12 6.5c2-1.4 4.5-2 7.5-2V18c-3 0-5.5.6-7.5 2", 12, 12, { ghost: true }),
    ],
    move: (m) => {
      m.go("book", { y: -0.9, sy: 1.04 }, { ease: "heavy" });
      m.raw("leaf", "ScaleX", 30, 400, [1, -1], [], "glide");
      m.fade("leaf", [0, 0.8, 0.8, 0], { at: 30, dur: 400, times: [0, 0.15, 0.8, 1] });
    },
  },
  {
    id: "book-open-text",
    cat: "Reading",
    say: "Lines are inked in reading order, the way a voice moves through the page.",
    parts: () => [
      P("book", [OPEN_BOOK, SPINE]),
      P("t1", "M6.5 9.5H9"),
      P("t2", "M6.5 13H9"),
      P("t3", "M15 9.5h2.5"),
      P("t4", "M15 13h2.5"),
    ],
    move: (m) => {
      ["t1", "t2", "t3", "t4"].forEach((t, i) =>
        m.draw(t, { at: i * 65, back: 50, dur: 200 }),
      );
    },
  },
  {
    id: "book-a",
    cat: "Reading",
    say: "The letter springs off the cover; its crossbar is inked a beat behind.",
    parts: () => [
      P("book", BOOK, 12, 22),
      P("a", "M9.2 14l2.8-7 2.8 7", 12, 14),
      P("bar", "M10.3 11.6h3.4", 12, 11.6, { in: "a" }),
    ],
    move: (m) => {
      m.go("a", { y: -1.5, s: 1.14 });
      m.draw("bar", { at: 90, from: 0.5 });
      m.go("book", { y: 0.6 }, { at: 70, cue: 0, ease: "heavy" });
    },
  },
  {
    id: "book-search",
    cat: "Reading",
    say: "The lens arcs up over the cover, magnifies, and drops back to its corner.",
    parts: () => [
      P("book", BOOK),
      P("glass", [ring(11.4, 9.4, 2.7), "M13.6 11.6l2 2"], 11.4, 9.4),
    ],
    move: (m) => m.go("glass", { x: 1.6, y: -1.3, s: 1.16, r: -14 }, { hold: 40 }),
  },
  {
    id: "book-plus",
    cat: "Reading",
    say: "The plus is stamped in with a quarter twist; the book takes the hit.",
    parts: () => [
      P("book", BOOK, 12, 22),
      P("plus", ["M12 7v6", "M9 10h6"], 12, 10, { sym: 90 }),
    ],
    move: (m) => {
      m.to("plus", { r: 90 }, { dur: 420 });
      m.go("plus", { s: 1.3 }, { cue: 0 });
      m.go("book", { y: 0.8 }, { at: 90, cue: 0, ease: "heavy" });
    },
  },
  {
    id: "bookmark",
    cat: "Reading",
    say: "Lifted and dropped: it lands with a stretch and a flash of ink.",
    parts: () => [
      P("mark", BOOKMARK, 12, 20.5),
      P("flash", solid(BOOKMARK), 12, 20.5, { in: "mark", ghost: true }),
    ],
    move: (m) => {
      m.go("mark", { y: -3, sy: 1.07 });
      m.fade("flash", [0, 0.24, 0], { at: 165, dur: 300, times: [0, 0.2, 1] });
    },
  },
  {
    id: "zoom-in",
    cat: "Reading",
    say: "The plus twists and pops; the lens swells after it and the handle kicks out.",
    parts: () => [
      P("lens", LENS, 10.5, 10.5),
      P("handle", HANDLE, 19, 19),
      P("plus", ["M10.5 7.8v5.4", "M7.8 10.5h5.4"], 10.5, 10.5, { sym: 90 }),
    ],
    move: (m) => {
      m.to("plus", { r: 90 }, { dur: 400 });
      m.go("plus", { s: 1.35 }, { cue: 0 });
      m.go("lens", { s: 1.1 }, { at: 70, cue: 0 });
      m.go("handle", { x: 0.9, y: 0.9 }, { at: 70, cue: 0 });
    },
  },
  {
    id: "zoom-out",
    cat: "Reading",
    say: "The minus tucks in; the lens shrinks after it and the handle draws close.",
    parts: () => [
      P("lens", LENS, 10.5, 10.5),
      P("handle", HANDLE, 19, 19),
      P("minus", "M7.8 10.5h5.4", 10.5, 10.5),
    ],
    move: (m) => {
      m.go("minus", { sx: 0.4, w: 0.5 });
      m.go("lens", { s: 0.9 }, { at: 70, cue: 0 });
      m.go("handle", { x: -0.9, y: -0.9 }, { at: 70, cue: 0 });
    },
  },
  {
    id: "search",
    cat: "Reading",
    say: "Held by the handle, the glass sweeps a small arc and catches the light.",
    parts: () => [
      P("glass", [LENS, HANDLE], 20.5, 20.5),
      P("glint", arc(10.5, 10.5, 3.6, 195, 265), 10.5, 10.5, { in: "glass", ghost: true }),
    ],
    move: (m) => {
      m.go("glass", { r: -15, x: -0.5, y: -0.5 });
      m.fade("glint", [0, 0.9, 0], { at: 110, dur: 300, times: [0, 0.3, 1] });
    },
  },
  {
    id: "move-horizontal",
    cat: "Reading",
    say: "Heads push to the edges while the bar stretches to fill the width.",
    parts: () => [
      P("l", "M6.5 8.5L3 12l3.5 3.5", 4.5, 12),
      P("r", "M17.5 8.5L21 12l-3.5 3.5", 19.5, 12),
      P("bar", "M8 12h8"),
    ],
    move: (m) => {
      m.go("l", { x: -1.7, w: 0.4 });
      m.go("r", { x: 1.7, w: 0.4 });
      m.go("bar", { sx: 1.28 }, { at: 40, cue: 0 });
    },
  },
  {
    id: "shrink",
    cat: "Reading",
    say: "Four ticks dive at the page, which swells to meet them: fit.",
    parts: () => [
      P("page", rr(8.5, 7, 7, 10, 2)),
      P("tl", "M3.5 3.5L6 6", 4.75, 4.75),
      P("tr", "M20.5 3.5L18 6", 19.25, 4.75),
      P("br", "M20.5 20.5L18 18", 19.25, 19.25),
      P("bl", "M3.5 20.5L6 18", 4.75, 19.25),
    ],
    move: (m) => {
      m.go("tl", { x: 1.4, y: 1.4 });
      m.go("br", { x: -1.4, y: -1.4 });
      m.go("tr", { x: -1.4, y: 1.4 }, { at: 45 });
      m.go("bl", { x: 1.4, y: -1.4 }, { at: 45 });
      m.go("page", { s: 1.13 }, { at: 80, cue: 0 });
    },
  },
  {
    id: "rectangle-vertical",
    cat: "Reading",
    say: "The page lifts away and the next one rises from beneath it.",
    parts: () => [
      P("next", rr(6, 3, 12, 18, 3.8), 12, 12, { ghost: true }),
      P("page", rr(6, 3, 12, 18, 3.8, ["r", 0.3])),
    ],
    move: (m) => {
      m.go("page", { y: -1.5, sy: 0.97 });
      m.raw("next", "Y", 40, 380, [m.k(4), 0], [], "flick");
      m.fade("next", [0, 0.5, 0], { at: 40, dur: 380, times: [0, 0.3, 1] });
    },
  },
  {
    id: "type",
    cat: "Reading",
    say: "The letter ducks, then grows from its baseline like a size change.",
    parts: () => [P("t", ["M5.5 6.5h13", "M12 6.5V18", "M9.5 18h5"], 12, 18)],
    move: (m) => {
      m.go("t", { s: 1.18 });
      m.ink("t", { at: 60 });
    },
  },
  {
    id: "image",
    cat: "Reading",
    say: "The sun lifts and the ridge is redrawn beneath it.",
    parts: () => [
      P("frame", win()),
      P("sun", dot(8.7, 8.7, 1.7), 8.7, 8.7),
      P("hill", "M6.8 16.2l3.7-4 2.6 2.6 1.9-1.9 2.4 2.6"),
    ],
    move: (m) => {
      m.go("sun", { y: -1.5, s: 1.3 });
      m.draw("hill", { at: 50, dur: 280 });
    },
  },
  {
    id: "table",
    cat: "Reading",
    say: "The grid is ruled in: the column first, then each row.",
    parts: () => [
      P("frame", win()),
      P("col", "M11 7v10"),
      P("r1", "M7 10.2h10"),
      P("r2", "M7 14.4h10"),
    ],
    move: (m) => {
      m.draw("col");
      m.draw("r1", { at: 55 });
      m.draw("r2", { at: 110 });
    },
  },
  {
    id: "chart-column-increasing",
    cat: "Reading",
    say: "Bars duck and shoot up from the baseline one after another.",
    parts: () => [
      P("b1", "M6.5 20v-4.5", 6.5, 20),
      P("b2", "M12 20v-9.5", 12, 20),
      P("b3", "M17.5 20V4.5", 17.5, 20),
    ],
    move: (m) => {
      m.go("b1", { sy: 0.4 });
      m.go("b2", { sy: 0.4 }, { at: 60 });
      m.go("b3", { sy: 0.4 }, { at: 120 });
      m.ink("b3", { at: 230 });
    },
  },
  {
    id: "highlighter",
    cat: "Reading",
    say: "The marker swipes and a heavy band of ink is laid under its nib.",
    parts: () => [
      P(
        "marker",
        poly(
          [
            [15, 4.5],
            [19.5, 9],
            [12.5, 16],
            [8, 16],
            [8, 11.5],
          ],
          1.4,
        ),
        8,
        16,
      ),
      P("band", "M4 20.5h10", 9, 20.5),
    ],
    move: (m) => {
      m.go("marker", { x: 3.2, r: -4 });
      m.draw("band", { at: 30, dur: 280 });
      m.ink("band", { at: 110, amt: 0.9 });
    },
  },
  {
    id: "baseline",
    cat: "Reading",
    say: "The letter hops and the bar is swept in beneath it.",
    parts: () => [
      P("a", "M7.5 15.5L12 5l4.5 10.5", 12, 15.5),
      P("cross", "M9.4 11.5h5.2", 12, 11.5, { in: "a" }),
      P("bar", "M5 20h14", 12, 20),
    ],
    move: (m) => {
      m.go("a", { y: -1.6 });
      m.draw("bar", { at: 60 });
      m.ink("bar", { at: 140, amt: 0.7 });
    },
  },
  {
    id: "underline",
    cat: "Reading",
    say: "The rule is drawn with pressure; the letter bobs when it lands.",
    parts: () => [
      P("u", "M7.5 4.5v6a4.5 4.5 0 0 0 9 0v-6", 12, 15),
      P("rule", "M5 20h14", 12, 20),
    ],
    move: (m) => {
      m.draw("rule");
      m.ink("rule", { at: 90, amt: 0.7 });
      m.go("u", { y: 0.9, sy: 0.93 }, { at: 150, cue: 0 });
    },
  },
  {
    id: "pencil",
    cat: "Reading",
    say: "The pencil rocks on its point and leaves a scribble that fades.",
    parts: () => [
      P(
        "pencil",
        [
          poly(
            [
              [15.5, 4],
              [20, 8.5],
              [8.5, 20],
              [3.5, 20.5],
              [4, 15.5],
            ],
            1.2,
          ),
          "M13 6.5l4.5 4.5",
        ],
        3.5,
        20.5,
      ),
      P("ink", "M9 22c1.6-1.6 3 1.2 4.6 0s3-1.2 4.4 0", 12, 22, { ghost: true }),
    ],
    move: (m) => {
      m.go("pencil", { r: -9, x: 1.4, y: -0.6 });
      m.raw("ink", "PathLen", 60, 300, [0, 1], [], "flick");
      m.fade("ink", [0, 0.8, 0.8, 0], { at: 60, dur: 440, times: [0, 0.2, 0.6, 1] });
    },
  },
  {
    id: "sticky-note",
    cat: "Reading",
    say: "Pressed on, the note swings from its pinned corner and the fold lifts.",
    parts: () => [
      P(
        "note",
        [
          "M3.5 7A3.5 3.5 0 0 1 7 3.5h10A3.5 3.5 0 0 1 20.5 7v7.5l-6 6H7A3.5 3.5 0 0 1 3.5 17z",
          "M7.5 8.5h6",
        ],
        3.5,
        3.5,
      ),
      P("fold", "M14.5 20.5V17a2.5 2.5 0 0 1 2.5-2.5h3.5", 17.5, 17.5, { in: "note" }),
    ],
    move: (m) => {
      m.go("note", { r: -5 });
      m.go("fold", { s: 0.72 }, { at: 60, cue: 0 });
    },
  },
  {
    id: "hash",
    cat: "Reading",
    say: "The lattice slips apart, uprights one way and rails the other, and re-forms.",
    parts: () => [
      P("v", ["M9.5 4L7.5 20", "M16.5 4l-2 16"]),
      P("h", ["M4.5 9H20", "M3.5 15H19"]),
    ],
    move: (m) => {
      m.go("v", { y: -1.5 });
      m.go("h", { x: 1.5 }, { at: 45 });
    },
  },
];
