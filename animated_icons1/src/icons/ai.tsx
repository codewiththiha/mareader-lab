import { P, defineIcon, draw, ease, erase, outBack, pivot, set } from "../motion/dsl";

const CAT = "AI & models" as const;
const OUT_BACK = outBack();

/* The AI mark (mareader's own, not Lucide): the letters take a breath –
   A lifts, I stretches – and a spark flicks off the frame's corner. */
export const aiMark = defineIcon({
  id: "ai-mark",
  name: "AI mark",
  lucide: "custom (AI_MARK)",
  uses: ["Ai"],
  category: CAT,
  intent: "The letters take a breath and a spark flicks off the frame's corner.",
  glyph: (
    <>
      <rect data-p="frame" x="2.5" y="4.5" width="19" height="15" rx="4" />
      <g data-p="a">
        <path d="M6.5 16 9.25 8 12 16" />
        <path d="M7.6 13.2h3.3" />
      </g>
      <g data-p="i">
        <path d="M16.5 8v8" />
        <path d="M15 8h3" />
        <path d="M15 16h3" />
      </g>
      <g data-p="spark" opacity="0">
        <path d="M21.5 1.5v3" />
        <path d="M20 3h3" />
      </g>
    </>
  ),
  timeline: [
    pivot(P("a"), "50%", "100%"),
    [P("a"), { y: [0, -1.4, 0], scaleY: [1, 1.08, 1] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("i"), { scaleY: [1, 1.18, 1] }, { duration: 0.46, ...OUT_BACK, at: 0.08 }],
    [P("frame"), { scale: [1, 1.04, 1] }, { duration: 0.5, ...OUT_BACK, at: 0.04 }],
    set(P("spark"), { scale: 0, opacity: 0 }),
    [P("spark"), { scale: [0, 1.1, 0], opacity: [0, 1, 0], rotate: [0, 45, 90] }, { duration: 0.4, ease: ease.snap, times: [0, 0.4, 1], at: 0.16 }],
  ],
});

/* Chip: a cycle of work – the die pulses and current runs around the pins
   clockwise. */
export const cpu = defineIcon({
  id: "cpu",
  name: "CPU",
  lucide: "Cpu",
  uses: ["Chip"],
  category: CAT,
  intent: "The die pulses while a pulse of current runs clockwise around the pins.",
  glyph: (
    <>
      <path data-p="p1" d="M7 2v2" />
      <path data-p="p2" d="M12 2v2" />
      <path data-p="p3" d="M17 2v2" />
      <path data-p="p4" d="M20 7h2" />
      <path data-p="p5" d="M20 12h2" />
      <path data-p="p6" d="M20 17h2" />
      <path data-p="p7" d="M17 20v2" />
      <path data-p="p8" d="M12 20v2" />
      <path data-p="p9" d="M7 20v2" />
      <path data-p="p10" d="M2 17h2" />
      <path data-p="p11" d="M2 12h2" />
      <path data-p="p12" d="M2 7h2" />
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect data-p="die" x="8" y="8" width="8" height="8" rx="1" />
    </>
  ),
  timeline: [
    ...Array.from({ length: 12 }, (_, i): [string, Record<string, unknown>, Record<string, unknown>] => [
      P(`p${i + 1}`),
      { opacity: [1, 0.2, 1], scale: [1, 1.5, 1] },
      { duration: 0.18, ease: ease.snap, at: i * 0.035 },
    ]),
    [P("die"), { scale: [1, 0.72, 1.06, 1] }, { duration: 0.5, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.35, 0.75, 1], at: 0.05 }],
  ],
});

/* Server: the two units are stacked – the top one lifts, the bottom one
   dips – and the LEDs blink in turn. */
export const server = defineIcon({
  id: "server",
  name: "Server",
  lucide: "Server",
  uses: ["Server"],
  category: CAT,
  intent: "The units un-stack a touch and re-seat; the LEDs blink in turn.",
  glyph: (
    <>
      <rect data-p="top" width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect data-p="bottom" width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line data-p="led1" x1="6" x2="6.01" y1="6" y2="6" />
      <line data-p="led2" x1="6" x2="6.01" y1="18" y2="18" />
    </>
  ),
  timeline: [
    [P("top"), { y: [0, -1.4, 0] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("led1"), { y: [0, -1.4, 0], opacity: [1, 0.2, 1] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("bottom"), { y: [0, 1.4, 0] }, { duration: 0.46, ...OUT_BACK, at: 0.06 }],
    [P("led2"), { y: [0, 1.4, 0], opacity: [1, 0.2, 1] }, { duration: 0.46, ...OUT_BACK, at: 0.06 }],
    [P("led1"), { opacity: [1, 0.2, 1] }, { duration: 0.2, at: 0.5 }],
    [P("led2"), { opacity: [1, 0.2, 1] }, { duration: 0.2, at: 0.58 }],
  ],
});

/* Key: turned in the lock – it rotates about its bow and back – and the
   notch clicks. */
export const keyRound = defineIcon({
  id: "key-round",
  name: "Key",
  lucide: "KeyRound",
  uses: ["Key"],
  category: CAT,
  intent: "Turned in the lock about its bow, with a click of the notch on the way back.",
  glyph: (
    <g data-p="key">
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle data-p="notch" cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </g>
  ),
  timeline: [
    pivot(P("key"), "69%", "31%"),
    [P("key"), { rotate: [0, 32, 0] }, { duration: 0.6, ease: [ease.snap, ease.settle], times: [0, 0.45, 1], at: 0 }],
    [P("notch"), { scale: [1, 1.6, 1] }, { duration: 0.3, ...OUT_BACK, at: 0.36 }],
  ],
});

/* Ban: the strike is slashed across, and the whole sign recoils – denied. */
export const ban = defineIcon({
  id: "ban",
  name: "Ban",
  lucide: "Ban",
  uses: ["Ban"],
  category: CAT,
  intent: "The strike is slashed across and the sign recoils – denied.",
  glyph: (
    <g data-p="sign">
      <circle cx="12" cy="12" r="10" />
      <path data-p="slash" d="M4.929 4.929 19.07 19.071" />
    </g>
  ),
  timeline: [
    erase(P("slash")),
    ...draw(P("slash"), { duration: 0.2, at: 0.02 }),
    [P("sign"), { x: [0, -1.4, 1.2, -0.6, 0] }, { duration: 0.36, ease: ease.glide, times: [0, 0.25, 0.5, 0.75, 1], at: 0.2 }],
  ],
});

/* Translate: a back-and-forth – the source glyph speaks (lifts), then the
   target letter answers. */
export const languages = defineIcon({
  id: "languages",
  name: "Languages",
  lucide: "Languages",
  uses: ["Translate"],
  category: CAT,
  intent: "A back-and-forth: the source glyph speaks, then the target letter answers.",
  glyph: (
    <>
      <g data-p="src">
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
      </g>
      <g data-p="dst">
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </g>
    </>
  ),
  timeline: [
    pivot(P("src"), "50%", "100%"),
    pivot(P("dst"), "50%", "100%"),
    [P("src"), { y: [0, -1.8, 0], scale: [1, 1.1, 1] }, { duration: 0.4, ...OUT_BACK, at: 0 }],
    [P("dst"), { y: [0, -1.8, 0], scale: [1, 1.1, 1] }, { duration: 0.4, ...OUT_BACK, at: 0.2 }],
  ],
});

/* Simplify: the feather drifts – it lifts and sways from its quill, light
   as the text it leaves behind. */
export const feather = defineIcon({
  id: "feather",
  name: "Feather",
  lucide: "Feather",
  uses: ["Simplify"],
  category: CAT,
  intent: "The feather lifts and sways from its quill – weightless.",
  glyph: (
    <g data-p="feather">
      <path d="M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z" />
      <path d="M16 8 2 22" />
      <path d="M17.488 15H9" />
    </g>
  ),
  timeline: [
    pivot(P("feather"), "0%", "100%"),
    [P("feather"), { rotate: [0, -9, 4, 0], y: [0, -2, -0.6, 0] }, { duration: 0.8, ease: [ease.swing, ease.swing, ease.settle], times: [0, 0.4, 0.75, 1], at: 0 }],
  ],
});

/* Summarize: the two text lines merge into one, the scroll's curl relaxes,
   and the lines separate again. */
export const scrollText = defineIcon({
  id: "scroll-text",
  name: "Scroll text",
  lucide: "ScrollText",
  uses: ["Summarize"],
  category: CAT,
  intent: "Two lines of text fold into one as the scroll curls, then open out again.",
  glyph: (
    <>
      <path data-p="t1" d="M15 8h-5" />
      <path data-p="t2" d="M15 12h-5" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path data-p="scroll" d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
    </>
  ),
  timeline: [
    [P("t1"), { y: [0, 2, 0], scaleX: [1, 0.6, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("t2"), { y: [0, -2, 0], scaleX: [1, 0.6, 1], opacity: [1, 0, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("scroll"), { y: [0, -0.8, 0] }, { duration: 0.5, ...OUT_BACK, at: 0.05 }],
  ],
});

export const aiIcons = [aiMark, cpu, server, keyRound, ban, languages, feather, scrollText];
