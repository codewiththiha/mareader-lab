import { arc, at, dot, poly, ring, rr, type Lift } from "../engine/geo";
import { P, type IconDef } from "../engine/motion";

const TR: Lift = ["t", 0.78];

/** Radial ticks around the centre, for suns. */
function rays(angles: number[], r0 = 7.6, r1 = 9.8): string[] {
  return angles.map((a) => {
    const [x1, y1] = at(12, 12, r0, a);
    const [x2, y2] = at(12, 12, r1, a);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;
  });
}

const PULSE = "M7 10.4h2l1.3-2.4 2.2 4.8 1.4-2.4H17";

export const media: IconDef[] = [
  {
    id: "play",
    cat: "Sound & light",
    say: "A press: the head pulls back, compresses and lunges forward.",
    parts: () => [
      P(
        "tri",
        poly(
          [
            [8, 5],
            [19, 12],
            [8, 19],
          ],
          2.2,
        ),
      ),
    ],
    move: (m) => m.go("tri", { x: 2, sx: 0.88, w: 0.4 }),
  },
  {
    id: "pause",
    cat: "Sound & light",
    say: "The bars squeeze toward each other and part again: a held breath.",
    parts: () => [P("b1", rr(6, 5, 4, 14, 2), 8, 12), P("b2", rr(14, 5, 4, 14, 2), 16, 12)],
    move: (m) => {
      m.go("b1", { x: 1.3, sy: 0.88 });
      m.go("b2", { x: -1.3, sy: 0.88 });
    },
  },
  {
    id: "skip-back",
    cat: "Sound & light",
    say: "The head lunges back into the bar, which recoils and springs back.",
    parts: () => [
      P(
        "tri",
        poly(
          [
            [19, 5.5],
            [9, 12],
            [19, 18.5],
          ],
          2,
        ),
        14,
        12,
      ),
      P("bar", "M5 6v12", 5, 12),
    ],
    move: (m) => {
      m.go("tri", { x: -2.2 });
      m.go("bar", { x: -1.2, sy: 0.84 }, { at: 75, cue: 0 });
    },
  },
  {
    id: "skip-forward",
    cat: "Sound & light",
    say: "The head lunges into the bar, which recoils and springs back.",
    parts: () => [
      P(
        "tri",
        poly(
          [
            [5, 5.5],
            [15, 12],
            [5, 18.5],
          ],
          2,
        ),
        10,
        12,
      ),
      P("bar", "M19 6v12", 19, 12),
    ],
    move: (m) => {
      m.go("tri", { x: 2.2 });
      m.go("bar", { x: 1.2, sy: 0.84 }, { at: 75, cue: 0 });
    },
  },
  {
    id: "circle-stop",
    cat: "Sound & light",
    say: "The square is pressed in while the ring's pen-lift is swept once around.",
    parts: () => [
      P("ring", ring(12, 12, 9, -45), 12, 12, { sym: 360 }),
      P("sq", rr(9, 9, 6, 6, 1.6)),
    ],
    move: (m) => {
      m.to("ring", { r: 360 }, { dur: 560, ease: "heavy" });
      m.go("sq", { s: 0.7 });
    },
  },
  {
    id: "headphones",
    cat: "Sound & light",
    say: "The headphones bob to a beat while a small equaliser plays between the cups.",
    parts: () => [
      P("phones", [
        "M4.5 12.5V12a7.5 7.5 0 0 1 15 0v.5",
        rr(3, 15.5, 4.5, 5.5, 2),
        rr(16.5, 15.5, 4.5, 5.5, 2),
      ]),
      P("beat", ["M10 19.5v-2", "M12 19.5v-4", "M14 19.5v-2.6"], 12, 19.5, { ghost: true }),
    ],
    move: (m) => {
      m.go("phones", { y: 0.9 });
      m.fade("beat", [0, 0.85, 0.85, 0], { dur: 460, times: [0, 0.15, 0.75, 1] });
      m.raw("beat", "ScaleY", 0, 460, [0.4, 1.15, 0.55, 1, 0.5], [], "glide");
    },
  },
  {
    id: "audio-waveform",
    cat: "Sound & light",
    say: "The waveform is traced left to right, then rings out vertically.",
    parts: () => [P("wave", "M2.5 12h2l2-6 3.5 12 3-9 2 5 1.5-2h5")],
    move: (m) => {
      m.draw("wave", { dur: 320 });
      m.go("wave", { sy: 1.22 }, { at: 250, cue: 0 });
    },
  },
  {
    id: "volume-2",
    cat: "Sound & light",
    say: "The cone swells and two waves are thrown outward, one after the other.",
    parts: () => [
      P(
        "cone",
        poly(
          [
            [3.5, 9.5],
            [6.8, 9.5],
            [11, 5.5],
            [11, 18.5],
            [6.8, 14.5],
            [3.5, 14.5],
          ],
          1.4,
        ),
        7,
        12,
      ),
      P("w1", arc(11, 12, 4.2, -45, 45)),
      P("w2", arc(11, 12, 8.2, -45, 45)),
    ],
    move: (m) => {
      m.go("cone", { s: 1.1 });
      m.draw("w1", { at: 40, from: 0.5 });
      m.draw("w2", { at: 110, from: 0.5 });
      m.ink("w2", { at: 200 });
    },
  },
  {
    id: "sun",
    cat: "Sound & light",
    say: "Rays advance one notch and flare while the core tightens.",
    parts: () => [
      P("core", ring(12, 12, 4)),
      P("rays", rays([0, 45, 90, 135, 180, 225, 270, 315]), 12, 12, { sym: 45 }),
    ],
    move: (m) => {
      m.to("rays", { r: 45 });
      m.go("rays", { s: 1.14 }, { cue: 0 });
      m.go("core", { s: 0.84 }, { at: 30, cue: 0 });
    },
  },
  {
    id: "moon",
    cat: "Sound & light",
    say: "The moon tips back and two stars twinkle in the hollow of its crescent.",
    parts: () => [
      P("moon", "M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a7.5 7.5 0 0 0 10 10z"),
      P("s1", ["M16.8 4.6v3", "M15.3 6.1h3"], 16.8, 6.1, { ghost: true }),
      P("s2", ["M20 8.7v2", "M19 9.7h2"], 20, 9.7, { ghost: true }),
    ],
    move: (m) => {
      m.go("moon", { r: -14 });
      m.fade("s1", [0, 1, 0], { at: 90, dur: 300, times: [0, 0.3, 1] });
      m.raw("s1", "Scale", 90, 300, [0.3, 1.1], [], "flick");
      m.fade("s2", [0, 1, 0], { at: 170, dur: 300, times: [0, 0.3, 1] });
      m.raw("s2", "Scale", 170, 300, [0.3, 1.1], [], "flick");
    },
  },
  {
    id: "sun-moon",
    cat: "Sound & light",
    say: "Dusk: the rays draw in and dim while the night's edge swings round.",
    parts: () => [
      P("core", ring(12, 12, 4)),
      P("rays", rays([90, 135, 180, 225, 270])),
      P("edge", arc(12, 12, 8.7, -52, 52)),
    ],
    move: (m) => {
      m.go("rays", { s: 0.82, o: 0.3 }, { hold: 60 });
      m.go("edge", { r: 28 }, { at: 40 });
    },
  },
  {
    id: "eclipse",
    cat: "Sound & light",
    say: "The shadow swings a full turn around the disc, which dims as it is covered.",
    parts: () => [
      P("disc", ring(12, 12, 9, -45)),
      P("shadow", arc(16.5, 12, 7.2, 128, 232), 12, 12, { sym: 360 }),
    ],
    move: (m) => {
      m.to("shadow", { r: 360 }, { dur: 580, ease: "heavy" });
      m.go("disc", { o: 0.5 }, { cue: 0, act: 160, hold: 100, rest: 260, ease: "soft" });
    },
  },
  {
    id: "palette",
    cat: "Sound & light",
    say: "The palette tilts and its wells fill with ink in turn.",
    parts: () => [
      P(
        "blob",
        "M12 3a9 9 0 0 0 0 18 2.3 2.3 0 0 0 1.8-3.8 2.3 2.3 0 0 1 1.7-3.8H17a4 4 0 0 0 4-4c0-3.6-4-6.4-9-6.4z",
      ),
      P("w1", dot(7.4, 12.2, 1.2), 7.4, 12.2, { in: "blob" }),
      P("w2", dot(9.2, 8, 1.2), 9.2, 8, { in: "blob" }),
      P("w3", dot(13.4, 6.8, 1.2), 13.4, 6.8, { in: "blob" }),
      P("w4", dot(17, 9.4, 1.2), 17, 9.4, { in: "blob" }),
    ],
    move: (m) => {
      m.go("blob", { r: -10 });
      ["w1", "w2", "w3", "w4"].forEach((w, i) =>
        m.go(w, { s: 1.6 }, { at: 40 + i * 50, cue: 0, act: 70, rest: 220 }),
      );
    },
  },
  {
    id: "wind",
    cat: "Sound & light",
    say: "Three gusts blow through left to right, each inked in from its tail.",
    parts: () => [
      P("g1", "M3 8h10.5a2.5 2.5 0 1 0-2.5-2.5"),
      P("g2", "M3 12h15.5a2.5 2.5 0 1 1-2.5 2.5"),
      P("g3", "M3 16h7.5a2.5 2.5 0 1 1-2.5 2.5"),
    ],
    move: (m) => {
      m.draw("g1", { back: 60, dur: 260 });
      m.draw("g2", { at: 70, back: 60, dur: 260 });
      m.draw("g3", { at: 140, back: 60, dur: 260 });
    },
  },

  // The voices' own marks: static SVGs in the app today.
  {
    id: "kokoro",
    cat: "Voices",
    say: "A heartbeat: lub-dub, with the pulse inked across it.",
    parts: () => [
      P(
        "heart",
        "M12 20l-7.2-7.2a4.9 4.9 0 0 1 7-6.9l.2.2.2-.2a4.9 4.9 0 0 1 7 6.9z",
        12,
        13,
      ),
      P("pulse", "M7.6 11.6h2l1.2-2.2 2 4.4 1.3-2.2h2.4", 12, 13, { in: "heart" }),
    ],
    move: (m) => {
      m.raw(
        "heart",
        "Scale",
        0,
        520,
        [1, 1 + m.k(0.13), 1, 1 + m.k(0.08), 1],
        [0, 0.16, 0.4, 0.56, 1],
        ["flick", "glide", "flick", "spring"],
      );
      m.draw("pulse", { at: 60 });
    },
  },
  {
    id: "piper",
    cat: "Voices",
    say: "Three pipes sound in turn, the tallest first.",
    parts: () => [
      P("p1", rr(4.5, 7, 3.5, 13, 1.75), 6.25, 20),
      P("p2", rr(10.25, 4, 3.5, 16, 1.75), 12, 20),
      P("p3", rr(16, 10, 3.5, 10, 1.75), 17.75, 20),
    ],
    move: (m) => {
      m.go("p2", { y: -1.5 });
      m.go("p1", { y: -1.5 }, { at: 60 });
      m.go("p3", { y: -1.5 }, { at: 120 });
    },
  },
  {
    id: "kitten",
    cat: "Voices",
    say: "The head tilts, curious, and the eyes blink.",
    parts: () => [
      P(
        "face",
        [
          "M4.5 5l3.8 2.3a8.6 8.6 0 0 1 7.4 0L19.5 5l-.6 5.2c.5 1 .7 2 .7 3 0 4.2-3.4 7.3-7.6 7.3s-7.6-3.1-7.6-7.3c0-1 .2-2 .7-3z",
          "M10.8 16.2l1.2.9 1.2-.9",
        ],
        12,
        20.5,
      ),
      P("eyes", [dot(9.2, 12.4, 1.15), dot(14.8, 12.4, 1.15)], 12, 12.4, { in: "face" }),
    ],
    move: (m) => {
      m.go("face", { r: 7 });
      m.go("eyes", { sy: 0.1 }, { at: 120, cue: 0, act: 60, rest: 200 });
    },
  },
  {
    id: "phonon",
    cat: "Voices",
    say: "The wave is traced through and its nodes ring one after another.",
    parts: () => [
      P("wave", "M2.5 12c1.6-5 3.2-5 4.75 0s3.2 5 4.75 0 3.2-5 4.75 0 3.2 5 4.75 0"),
      P("n1", dot(7.25, 12, 1.4), 7.25, 12),
      P("n2", dot(12, 12, 1.4), 12, 12),
      P("n3", dot(16.75, 12, 1.4), 16.75, 12),
    ],
    move: (m) => {
      m.draw("wave", { dur: 300 });
      ["n1", "n2", "n3"].forEach((n, i) =>
        m.go(n, { s: 1.6 }, { at: 90 + i * 70, cue: 0, act: 70, rest: 220 }),
      );
    },
  },
  {
    id: "system",
    cat: "Voices",
    say: "A pulse is traced across the screen and the stand widens under it.",
    parts: () => [
      P("screen", rr(3, 4, 18, 12.5, 3.2, TR)),
      P("pulse", PULSE),
      P("base", "M8.5 20.5h7", 12, 20.5),
    ],
    move: (m) => {
      m.draw("pulse");
      m.go("base", { sx: 1.25 }, { at: 80, cue: 0 });
    },
  },
  {
    id: "silent",
    cat: "Voices",
    say: "The pulse is traced and runs out into a small, closed ring.",
    parts: () => [P("line", "M3 12h3l1.5-3 2.2 6 1.6-3H15"), P("o", ring(19.2, 12, 2.3), 19.2, 12)],
    move: (m) => {
      m.draw("line");
      m.go("o", { s: 1.3 }, { at: 200, cue: 0 });
    },
  },
];
