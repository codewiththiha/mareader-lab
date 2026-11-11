import { arc, dot, ring } from "../engine/geo";
import { P, type IconDef } from "../engine/motion";

/** A chevron nudges its own way; a faint echo catches up from behind. */
function chevron(id: string, d: string, dx: number, dy: number): IconDef {
  return {
    id,
    cat: "Navigate",
    say: "A nudge in its own direction, with a faint echo catching up from behind.",
    parts: () => [P("echo", d, 12, 12, { ghost: true }), P("chev", d)],
    move: (m) => {
      m.go("chev", dx ? { x: dx * 2.4, w: 0.5 } : { y: dy * 2.4, w: 0.5 });
      if (dx) m.raw("echo", "X", 40, 340, [-dx * m.k(3.2), 0], [], "flick");
      if (dy) m.raw("echo", "Y", 40, 340, [-dy * m.k(3.2), 0], [], "flick");
      m.fade("echo", [0, 0.45, 0], { at: 40, dur: 340, times: [0, 0.3, 1] });
    },
  };
}

export const navigate: IconDef[] = [
  chevron("chevron-left", "M14.5 6.5L9 12l5.5 5.5", -1, 0),
  chevron("chevron-right", "M9.5 6.5L15 12l-5.5 5.5", 1, 0),
  chevron("chevron-up", "M6.5 14.5L12 9l5.5 5.5", 0, -1),
  chevron("chevron-down", "M6.5 9.5L12 15l5.5-5.5", 0, 1),
  {
    id: "arrow-down",
    cat: "Navigate",
    say: "The head jabs first; the shaft stretches after it and both snap home.",
    parts: () => [
      P("shaft", "M12 4v9.5", 12, 4),
      P("head", "M6.5 13L12 18.5 17.5 13", 12, 16),
    ],
    move: (m) => {
      m.go("head", { y: 2.2, w: 0.5 });
      m.go("shaft", { y: 1.2, sy: 1.16 }, { at: 35, cue: 0 });
    },
  },
  {
    id: "arrow-up",
    cat: "Navigate",
    say: "The head jabs first; the shaft stretches after it and both snap home.",
    parts: () => [
      P("shaft", "M12 20v-9.5", 12, 20),
      P("head", "M6.5 11L12 5.5 17.5 11", 12, 8),
    ],
    move: (m) => {
      m.go("head", { y: -2.2, w: 0.5 });
      m.go("shaft", { y: -1.2, sy: 1.16 }, { at: 35, cue: 0 });
    },
  },
  {
    id: "arrow-down-up",
    cat: "Navigate",
    say: "Two arrows pull in opposite directions, one a beat behind the other.",
    parts: () => [
      P("down", ["M7.5 4.5v15", "M4 16l3.5 3.5L11 16"], 7.5, 12),
      P("up", ["M16.5 19.5v-15", "M13 8l3.5-3.5L20 8"], 16.5, 12),
    ],
    move: (m) => {
      m.go("down", { y: 1.8, sy: 1.06 });
      m.go("up", { y: -1.8, sy: 1.06 }, { at: 55 });
    },
  },
  {
    id: "arrow-right-left",
    cat: "Navigate",
    say: "Two lanes slide past each other, each in its own direction.",
    parts: () => [
      P("top", ["M4 8h16", "M16.5 4.5L20 8l-3.5 3.5"], 12, 8),
      P("bottom", ["M20 16H4", "M7.5 12.5L4 16l3.5 3.5"], 12, 16),
    ],
    move: (m) => {
      m.go("top", { x: 2, sx: 1.05 });
      m.go("bottom", { x: -2, sx: 1.05 }, { at: 55 });
    },
  },
  {
    id: "arrow-right-from-line",
    cat: "Navigate",
    say: "The arrow pushes off from the line, which recoils and springs back.",
    parts: () => [
      P("line", "M4 5v14", 4, 12),
      P("arrow", ["M8.5 12H20", "M15.5 7.5L20 12l-4.5 4.5"], 14, 12),
    ],
    move: (m) => {
      m.go("arrow", { x: 2.4 });
      m.go("line", { x: -1, sy: 0.82 }, { at: 45, cue: 0 });
    },
  },
  {
    id: "undo-2",
    cat: "Navigate",
    say: "The curve is re-inked backwards to the head, which kicks as it arrives.",
    parts: () => [
      P("curve", "M8.5 9h6a5 5 0 0 1 0 10H11"),
      P("head", "M8 5L4 9l4 4", 6, 9),
    ],
    move: (m) => {
      m.draw("curve", { from: 1, dur: 280 });
      m.go("head", { x: -1.8, w: 0.5 }, { at: 180, cue: 0 });
    },
  },
  {
    id: "refresh-cw",
    cat: "Navigate",
    say: "One deliberate lap that winds back first and lands exactly on itself.",
    parts: () => [
      P("spin", [arc(12, 12, 8, -38, 270), "M9.6 1.3L12.8 4 9.6 6.8"], 12, 12, { sym: 360 }),
    ],
    move: (m) => {
      m.to("spin", { r: 360 }, { dur: 560, ease: "heavy" });
      m.ink("spin", { at: 60 });
    },
  },
  {
    id: "repeat",
    cat: "Navigate",
    say: "The loop swaps its two lanes: half a turn that lands on itself.",
    parts: () => [
      P(
        "loop",
        [
          "M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19",
          "M16 3l3 3-3 3",
          "M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5",
          "M8 15l-3 3 3 3",
        ],
        12,
        12,
        { sym: 180 },
      ),
    ],
    move: (m) => {
      m.to("loop", { r: 180 }, { dur: 520, ease: "heavy" });
      m.go("loop", { s: 0.9 }, { cue: 0 });
    },
  },
  {
    id: "link",
    cat: "Navigate",
    say: "The halves part, the bar between them thins, and they click back together.",
    parts: () => [
      P("l", "M9.5 16.5H8a4.5 4.5 0 0 1 0-9h1.5", 6, 12),
      P("r", "M14.5 7.5H16a4.5 4.5 0 0 1 0 9h-1.5", 18, 12),
      P("bar", "M9 12h6"),
    ],
    move: (m) => {
      m.go("l", { x: -1.5 });
      m.go("r", { x: 1.5 });
      m.go("bar", { sx: 0.6, w: 0.5 }, { at: 40, cue: 0 });
    },
  },
  {
    id: "list",
    cat: "Navigate",
    say: "Rows type themselves out: each bullet pops and its line wipes in.",
    parts: () => [
      P("d1", dot(4.5, 6, 1.3), 4.5, 6),
      P("l1", "M9 6h11"),
      P("d2", dot(4.5, 12, 1.3), 4.5, 12),
      P("l2", "M9 12h11"),
      P("d3", dot(4.5, 18, 1.3), 4.5, 18),
      P("l3", "M9 18h7"),
    ],
    move: (m) => {
      [1, 2, 3].forEach((n, i) => {
        m.go(`d${n}`, { s: 1.5 }, { at: i * 65, cue: 0, act: 70, rest: 220 });
        m.draw(`l${n}`, { at: i * 65, back: 50, dur: 210 });
      });
    },
  },
  {
    id: "list-tree",
    cat: "Navigate",
    say: "The tree unfolds: the trunk is drawn down, then each child grows out of it.",
    parts: () => [
      P("root", "M4 5.5h9", 8.5, 5.5),
      P("trunk", "M6 10v5a2.5 2.5 0 0 0 2.5 2.5H10"),
      P("c1", "M10 11.5h10"),
      P("c2", "M13.5 17.5H20"),
    ],
    move: (m) => {
      m.ink("root");
      m.draw("trunk", { dur: 260 });
      m.draw("c1", { at: 80 });
      m.draw("c2", { at: 150 });
    },
  },
  {
    id: "list-checks",
    cat: "Navigate",
    say: "Ticks are struck one after the other; each row nudges as it is checked.",
    parts: () => [
      P("k1", "M3.5 6.5l2 2 3.5-4"),
      P("l1", "M12.5 6.5H20", 16, 6.5),
      P("k2", "M3.5 16.5l2 2 3.5-4"),
      P("l2", "M12.5 16.5H20", 16, 16.5),
    ],
    move: (m) => {
      m.draw("k1", { back: 50, dur: 200 });
      m.go("l1", { x: 1.3 }, { at: 90, cue: 0 });
      m.draw("k2", { at: 130, back: 50, dur: 200 });
      m.go("l2", { x: 1.3 }, { at: 220, cue: 0 });
    },
  },
  {
    id: "ellipsis",
    cat: "Navigate",
    say: "Three drops bounce in turn: the familiar ‘more to come’.",
    parts: () => [
      P("d1", dot(5, 12, 1.7), 5, 12),
      P("d2", dot(12, 12, 1.7), 12, 12),
      P("d3", dot(19, 12, 1.7), 19, 12),
    ],
    move: (m) => {
      ["d1", "d2", "d3"].forEach((d, i) =>
        m.go(d, { y: -3, s: 1.12 }, { at: i * 70, act: 100, rest: 280 }),
      );
    },
  },
  {
    id: "check",
    cat: "Navigate",
    say: "One confident stroke, short leg then long, pressed home at the end.",
    parts: () => [P("tick", "M4.5 12.5l5 5L19.5 7")],
    move: (m) => {
      m.draw("tick", { dur: 260 });
      m.go("tick", { s: 1.12 }, { at: 190, cue: 0 });
      m.ink("tick", { at: 190, amt: 0.6 });
    },
  },
  {
    id: "circle-check",
    cat: "Navigate",
    say: "The ring swells and the tick is struck through its pen-lift.",
    parts: () => [P("ring", ring(12, 12, 9, -38, 6.4)), P("tick", "M8 12.3l3 3 7-7.6")],
    move: (m) => {
      m.go("ring", { s: 1.06 }, { ease: "heavy" });
      m.draw("tick", { at: 40 });
      m.ink("tick", { at: 180, amt: 0.6 });
    },
  },
  {
    id: "circle-alert",
    cat: "Navigate",
    say: "The stem lifts and stamps, the drop pops, and the sign shivers.",
    parts: () => [
      P("ring", ring(12, 12, 9, -45)),
      P("stem", "M12 7.5v5", 12, 12.5),
      P("drop", dot(12, 16.3, 1.3), 12, 16.3),
    ],
    move: (m) => {
      m.go("stem", { y: -1.6, sy: 1.12 });
      m.go("drop", { s: 1.7 }, { at: 170, cue: 0 });
      m.raw(
        "ring",
        "Rotate",
        150,
        330,
        [0, m.k(8), m.k(-5), m.k(2.5), 0],
        [0, 0.2, 0.5, 0.78, 1],
        "glide",
      );
    },
  },
  {
    id: "clock",
    cat: "Navigate",
    say: "The hands are wound forward one full lap; the dial swells with them.",
    parts: () => [
      P("dial", ring(12, 12, 9, -45)),
      P("hands", "M12 7v5l3.2 1.8", 12, 12, { sym: 360 }),
    ],
    move: (m) => {
      m.to("hands", { r: 360 }, { dur: 580, ease: "heavy" });
      m.go("dial", { s: 1.05 }, { at: 40, cue: 0, ease: "heavy" });
    },
  },
  {
    id: "ban",
    cat: "Navigate",
    say: "The strike is slashed across and the sign recoils: denied.",
    parts: () => [P("ring", ring(12, 12, 9, -45)), P("slash", "M8 8l8 8")],
    move: (m) => {
      m.draw("slash", { dur: 220 });
      m.ink("slash", { at: 90, amt: 0.6 });
      m.go("ring", { r: 16, s: 0.94 }, { at: 80, cue: 0 });
    },
  },
];
