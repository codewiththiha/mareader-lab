import { LIFT, dot, pen, poly, ring, rr, type Lift } from "../engine/geo";
import { P, type IconDef } from "../engine/motion";

const TR: Lift = ["t", 0.78];
const win = () => rr(3, 3, 18, 18, 4.5, TR);

/** The folder body: its pen-lift sits on the left edge, under the tab. */
function folder(): string {
  const g = LIFT * pen.lift;
  const body =
    "V17a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9.8a3 3 0 0 0-3-3h-5.3a2 2 0 0 1-1.6-.8l-.9-1.2A2 2 0 0 0 8.6 4H6a3 3 0 0 0-3 3";
  if (g < 0.05) return `M3 10.6${body}z`;
  const top = Math.round((10.6 - g / 2 - 7) * 1000) / 1000;
  return `M3 ${Math.round((10.6 + g / 2) * 1000) / 1000}${body}v${top}`;
}

export const library: IconDef[] = [
  {
    id: "library-big",
    cat: "Library",
    say: "The leaning book is knocked upright and falls back; its neighbours hop.",
    parts: () => [
      P("b1", rr(3, 4, 4.5, 16, 1.6), 5.25, 20),
      P("b2", rr(9.5, 4, 4.5, 16, 1.6), 11.75, 20),
      P(
        "lean",
        poly(
          [
            [18.9, 20.3],
            [16.3, 8.1],
            [19.5, 7.4],
            [22, 19.7],
          ],
          1.3,
        ),
        20.4,
        20,
      ),
    ],
    move: (m) => {
      m.go("lean", { r: 11 });
      m.go("b2", { y: -1.3 }, { at: 70 });
      m.go("b1", { y: -1.3 }, { at: 125 });
    },
  },
  {
    id: "square-library",
    cat: "Library",
    say: "Spines hop along the shelf in turn; the slanted one tips as it lands.",
    parts: () => [
      P("frame", win()),
      P("s1", "M8 8v8", 8, 16),
      P("s2", "M12 8v8", 12, 16),
      P("s3", "M15.2 8.5l1.6 7.5", 16.8, 16),
    ],
    move: (m) => {
      m.go("s1", { y: -1.3 });
      m.go("s2", { y: -1.3 }, { at: 55 });
      m.go("s3", { r: -13 }, { at: 110 });
    },
  },
  {
    id: "folder",
    cat: "Library",
    say: "A tap: the folder squashes on its base and springs back.",
    parts: () => [P("body", folder(), 12, 20)],
    move: (m) => m.go("body", { sy: 0.86, sx: 1.04 }),
  },
  {
    id: "folder-open",
    cat: "Library",
    say: "The front flap shears open from its hinge and swings shut again.",
    parts: () => [
      P(
        "back",
        "M4 17.5V7a3 3 0 0 1 3-3h1.9a2 2 0 0 1 1.6.8l.9 1.2a2 2 0 0 0 1.6.8h5a2.5 2.5 0 0 1 2.5 2",
      ),
      P(
        "flap",
        poly(
          [
            [5.8, 20],
            [8.2, 11.5],
            [22, 11.5],
            [19.6, 20],
          ],
          1.8,
        ),
        12.7,
        20,
      ),
    ],
    move: (m) => {
      m.go("flap", { kx: -13, sy: 0.9 });
      m.go("back", { y: -0.5 }, { at: 50, cue: 0, ease: "heavy" });
    },
  },
  {
    id: "folder-plus",
    cat: "Library",
    say: "The plus drops in with a quarter twist and the folder bounces under it.",
    parts: () => [
      P("body", folder(), 12, 20),
      P("plus", ["M12 10.5v6", "M9 13.5h6"], 12, 13.5, { sym: 90 }),
    ],
    move: (m) => {
      m.go("plus", { y: -3.2 });
      m.to("plus", { r: 90 }, { dur: 420 });
      m.go("body", { sy: 0.92 }, { at: 165, cue: 0 });
    },
  },
  {
    id: "folder-search",
    cat: "Library",
    say: "The lens scans sideways across the folder, tilting with the motion.",
    parts: () => [
      P("body", folder()),
      P("glass", [ring(11.3, 13, 2.6), "M13.4 15.1l1.8 1.8"], 11.3, 13),
    ],
    move: (m) => m.go("glass", { x: 2.6, r: 10 }, { hold: 40 }),
  },
  {
    id: "folders",
    cat: "Library",
    say: "The front folder lifts while the one behind dips and dims.",
    parts: () => [
      P("back", "M3 8v10.5a3 3 0 0 0 3 3h11", 9, 15),
      P(
        "front",
        "M7 10.5V9a2.5 2.5 0 0 1 2.5-2.5h1.6a2 2 0 0 1 1.6.8l.6.9a2 2 0 0 0 1.6.8H19a2.5 2.5 0 0 1 2.5 2.5V16a2.5 2.5 0 0 1-2.5 2.5H9.5A2.5 2.5 0 0 1 7 16z",
        14.25,
        18.5,
      ),
    ],
    move: (m) => {
      m.go("front", { y: -1.5, x: 0.5 });
      m.go("back", { y: 1.1, x: -0.5, o: 0.5 }, { at: 40 });
    },
  },
  {
    id: "file-search",
    cat: "Library",
    say: "The lens runs up the page, swells where it finds the line, and returns.",
    parts: () => [
      P("page", "M10 21H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h5.5L19 8.5v2"),
      P("glass", [ring(15.5, 16.5, 3), "M17.9 18.9l2.1 2.1"], 15.5, 16.5),
    ],
    move: (m) => m.go("glass", { y: -3.2, x: -1.6, s: 1.1 }, { hold: 50 }),
  },
  {
    id: "hard-drive",
    cat: "Library",
    say: "The activity lights blink out in turn and the drive settles.",
    parts: () => [
      P("body", [rr(3, 5, 18, 14, 4, TR), "M7.5 12h9"]),
      P("led1", dot(8, 15.8, 1.1), 8, 15.8, { in: "body" }),
      P("led2", dot(11.4, 15.8, 1.1), 11.4, 15.8, { in: "body" }),
    ],
    move: (m) => {
      m.go("body", { y: 0.8 }, { at: 30, cue: 0, ease: "heavy" });
      m.fade("led1", [1, 0.1, 1], { dur: 260 });
      m.fade("led2", [1, 0.1, 1], { at: 110, dur: 260 });
    },
  },
  {
    id: "download",
    cat: "Library",
    say: "The head drops, the shaft stretches after it, and the tray bounces on impact.",
    parts: () => [
      P("tray", "M4.5 15.5V17a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-1.5", 12, 20),
      P("shaft", "M12 3.5v6", 12, 3.5),
      P("head", "M7.5 9.5l4.5 4.5 4.5-4.5", 12, 12),
    ],
    move: (m) => {
      m.go("head", { y: 2.6, w: 0.5 });
      m.go("shaft", { y: 1.6, sy: 1.2 }, { at: 35, cue: 0 });
      m.go("tray", { y: 1, sy: 0.86 }, { at: 140, cue: 0 });
    },
  },
  {
    id: "trash-2",
    cat: "Library",
    say: "The lid lifts from its hinge; the can shudders and the ribs drop.",
    parts: () => [
      P(
        "lid",
        ["M4 6.5h16", "M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v1.5"],
        20,
        6.5,
      ),
      P("can", "M6 10v7.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V10", 12, 20.5),
      P("ribs", ["M10 12v5", "M14 12v5"], 12, 14.5, { in: "can" }),
    ],
    move: (m) => {
      m.go("lid", { r: 17, y: -0.8 });
      m.raw(
        "can",
        "Rotate",
        110,
        340,
        [0, m.k(3), m.k(-2.2), m.k(1), 0],
        [0, 0.2, 0.5, 0.78, 1],
        "glide",
      );
      m.go("ribs", { y: 0.7 }, { at: 150, cue: 0 });
    },
  },
  {
    id: "server",
    cat: "Library",
    say: "The units un-stack a touch and re-seat; their lights blink in turn.",
    parts: () => [
      P("u1", [rr(3, 3.5, 18, 7, 2.8), "M11.5 7H17"], 12, 7),
      P("led1", dot(7, 7, 1.15), 7, 7, { in: "u1" }),
      P("u2", [rr(3, 13.5, 18, 7, 2.8), "M11.5 17H17"], 12, 17),
      P("led2", dot(7, 17, 1.15), 7, 17, { in: "u2" }),
    ],
    move: (m) => {
      m.go("u1", { y: -0.9 });
      m.go("u2", { y: 0.9 }, { at: 40 });
      m.fade("led1", [1, 0.1, 1], { at: 60, dur: 240 });
      m.fade("led2", [1, 0.1, 1], { at: 170, dur: 240 });
    },
  },
  {
    id: "cpu",
    cat: "Library",
    say: "The core pulses while the pins fire clockwise around the die.",
    parts: () => [
      P("die", rr(6.5, 6.5, 11, 11, 3)),
      P("core", dot(12, 12, 2)),
      P("top", ["M9.5 2v1.6", "M14.5 2v1.6"]),
      P("right", ["M22 9.5h-1.6", "M22 14.5h-1.6"]),
      P("bottom", ["M9.5 22v-1.6", "M14.5 22v-1.6"]),
      P("left", ["M2 9.5h1.6", "M2 14.5h1.6"]),
    ],
    move: (m) => {
      m.go("core", { s: 1.4 });
      const fire = { cue: 0, act: 70, rest: 220 };
      m.go("top", { y: -1.1 }, { ...fire, at: 0 });
      m.go("right", { x: 1.1 }, { ...fire, at: 50 });
      m.go("bottom", { y: 1.1 }, { ...fire, at: 100 });
      m.go("left", { x: -1.1 }, { ...fire, at: 150 });
    },
  },
  {
    id: "key-round",
    cat: "Library",
    say: "The key winds back, turns about its bow and clicks home.",
    parts: () => [
      P(
        "key",
        [ring(7.5, 16.5, 4.5), "M10.7 13.3L20 4", "M15.6 8.4l2.6 2.6", "M18.6 5.4l1.9 1.9"],
        7.5,
        16.5,
      ),
    ],
    move: (m) => {
      m.go("key", { r: 26 });
      m.ink("key", { at: 60 });
    },
  },
  {
    id: "ai-mark",
    cat: "Library",
    say: "The letters take a breath and a spark escapes through the frame's pen-lift.",
    parts: () => [
      P("frame", rr(2.5, 4.5, 19, 15, 4.5, ["t", 0.8])),
      P("a", ["M6.7 15.5l2.8-7 2.8 7", "M7.9 12.8h3.2"], 9.5, 15.5),
      P("i", "M16.3 8.5v7", 16.3, 15.5),
      P("spark", ["M19.6 .8v3.4", "M17.9 2.5h3.4"], 19.6, 2.5, { ghost: true }),
    ],
    move: (m) => {
      m.go("a", { y: -1, s: 1.1 });
      m.go("i", { sy: 1.18 }, { at: 55 });
      m.fade("spark", [0, 1, 0], { at: 120, dur: 320, times: [0, 0.3, 1] });
      m.raw("spark", "Scale", 120, 320, [0.3, 1.15], [], "flick");
      m.raw("spark", "Rotate", 120, 320, [0, 90], [], "flick");
    },
  },
  {
    id: "languages",
    cat: "Library",
    say: "A back-and-forth: the source glyph speaks, then the target letter answers.",
    parts: () => [
      P(
        "src",
        [
          "M3.5 6.5h8",
          "M7.5 4v2.5",
          "M9.8 6.5c-.6 3.4-2.6 5.8-6 7.5",
          "M5.2 9.8c1 1.9 2.5 3.2 4.6 4",
        ],
        7.5,
        9,
      ),
      P("dst", ["M13 20l4-9 4 9", "M14.4 17h5.2"], 17, 16),
    ],
    move: (m) => {
      m.go("src", { y: -1.3, s: 1.08 });
      m.go("dst", { y: -1.3, s: 1.08 }, { at: 150 });
    },
  },
  {
    id: "feather",
    cat: "Library",
    say: "The feather lifts and sways from its quill: weightless.",
    parts: () => [
      P("feather", ["M8.5 16.5V14c0-6 5-10 11-9.5.5 6.5-4 12-11 12z", "M4 21l9-9"], 4, 21),
    ],
    move: (m) => m.go("feather", { r: -11, y: -1.4 }, { act: 180, rest: 380 }),
  },
  {
    id: "scroll-text",
    cat: "Library",
    say: "Three lines fold up into the first, then open out again: a summary.",
    parts: () => [
      P("page", rr(5, 3, 14, 18, 3.8, ["r", 0.25])),
      P("l1", "M9 8h6"),
      P("l2", "M9 12h6"),
      P("l3", "M9 16h3.5"),
    ],
    move: (m) => {
      m.go("l2", { y: -2.2, o: 0.25 }, { hold: 60 });
      m.go("l3", { y: -4.4, o: 0.1 }, { at: 30, hold: 60 });
      m.ink("l1", { at: 150 });
      m.go("page", { sy: 0.95 }, { at: 40, cue: 0, ease: "heavy" });
    },
  },
];
