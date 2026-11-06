import { P, defineIcon, draw, ease, outBack, pivot, wipe } from "../motion/dsl";

const CAT = "Playback & voice" as const;
const OUT_BACK = outBack();

/* Resume / Try: a press – the triangle compresses and lunges forward. */
export const play = defineIcon({
  id: "play",
  name: "Play",
  lucide: "Play",
  uses: ["Resume", "Try"],
  category: CAT,
  intent: "A button press: the triangle compresses, then lunges forward.",
  glyph: <path data-p="tri" d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />,
  timeline: [
    pivot(P("tri"), "0%", "50%"),
    [P("tri"), { scale: [1, 0.86, 1.06, 1], x: [0, 0, 1.6, 0] }, { duration: 0.46, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.3, 0.6, 1], at: 0 }],
  ],
});

/* Pause: the bars squeeze toward each other and part again – a held breath. */
export const pause = defineIcon({
  id: "pause",
  name: "Pause",
  lucide: "Pause",
  uses: ["Pause"],
  category: CAT,
  intent: "The bars squeeze toward each other and part again – a held breath.",
  glyph: (
    <>
      <rect data-p="l" x="5" y="3" width="5" height="18" rx="1" />
      <rect data-p="r" x="14" y="3" width="5" height="18" rx="1" />
    </>
  ),
  timeline: [
    [P("l"), { x: [0, 1.2, 0], scaleY: [1, 0.86, 1] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("r"), { x: [0, -1.2, 0], scaleY: [1, 0.86, 1] }, { duration: 0.46, ...OUT_BACK, at: 0.04 }],
  ],
});

/* SkipForward: the triangle lunges into the stop bar, which recoils. */
export const skipForward = defineIcon({
  id: "skip-forward",
  name: "Skip forward",
  lucide: "SkipForward",
  uses: ["SkipForward"],
  category: CAT,
  intent: "The triangle lunges into the bar, which recoils and springs back.",
  glyph: (
    <>
      <path data-p="bar" d="M21 4v16" />
      <path data-p="tri" d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" />
    </>
  ),
  timeline: [
    [P("tri"), { x: [0, 3, 0] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("bar"), { x: [0, 1.4, 0], scaleY: [1, 0.9, 1] }, { duration: 0.4, ...OUT_BACK, at: 0.12 }],
  ],
});

/* SkipBack: the mirror – the triangle lunges back into its bar. */
export const skipBack = defineIcon({
  id: "skip-back",
  name: "Skip back",
  lucide: "SkipBack",
  uses: ["SkipBack"],
  category: CAT,
  intent: "The triangle lunges back into the bar, which recoils and springs back.",
  glyph: (
    <>
      <path data-p="tri" d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" />
      <path data-p="bar" d="M3 20V4" />
    </>
  ),
  timeline: [
    [P("tri"), { x: [0, -3, 0] }, { duration: 0.46, ...OUT_BACK, at: 0 }],
    [P("bar"), { x: [0, -1.4, 0], scaleY: [1, 0.9, 1] }, { duration: 0.4, ...OUT_BACK, at: 0.12 }],
  ],
});

/* ReadAloud: the headphones bob to a beat while a tiny equaliser plays
   between the cups – added between frames, gone at rest. */
export const headphones = defineIcon({
  id: "headphones",
  name: "Headphones",
  lucide: "Headphones",
  uses: ["ReadAloud"],
  category: CAT,
  intent: "The headphones bob to a beat while an equaliser plays between the cups.",
  glyph: (
    <>
      <path data-p="band" d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
      <path data-p="e1" d="M10 21v-3" opacity="0" />
      <path data-p="e2" d="M12 21v-5" opacity="0" />
      <path data-p="e3" d="M14 21v-2.5" opacity="0" />
    </>
  ),
  timeline: [
    pivot(P("e1"), "50%", "100%"), pivot(P("e2"), "50%", "100%"), pivot(P("e3"), "50%", "100%"),
    [P("band"), { y: [0, -1.4, 0, -0.8, 0] }, { duration: 0.6, ease: ease.glide, times: [0, 0.2, 0.45, 0.65, 1], at: 0 }],
    [P("e1"), { opacity: [0, 1, 1, 0], scaleY: [0.3, 1, 0.5, 1.2] }, { duration: 0.6, times: [0, 0.2, 0.55, 1], at: 0 }],
    [P("e2"), { opacity: [0, 1, 1, 0], scaleY: [0.3, 0.6, 1.2, 0.5] }, { duration: 0.6, times: [0, 0.2, 0.55, 1], at: 0.04 }],
    [P("e3"), { opacity: [0, 1, 1, 0], scaleY: [0.3, 1.2, 0.5, 1] }, { duration: 0.6, times: [0, 0.2, 0.55, 1], at: 0.08 }],
  ],
});

/* VoiceModel: the waveform is traced left to right, then rings – a
   voice speaking once. */
export const audioWaveform = defineIcon({
  id: "audio-waveform",
  name: "Audio waveform",
  lucide: "AudioWaveform",
  uses: ["VoiceModel"],
  category: CAT,
  intent: "The waveform is traced left to right, then rings out vertically.",
  glyph: <path data-p="wave" d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2" />,
  timeline: [
    wipe(P("wave"), { duration: 0.14 }),
    ...draw(P("wave"), { duration: 0.36, at: 0.14, ease: ease.glide }),
    [P("wave"), { scaleY: [1, 1.25, 0.92, 1] }, { duration: 0.4, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.35, 0.7, 1], at: 0.44 }],
  ],
});

/* Speak: sound ripples out – the speaker swells, then each wave in turn. */
export const volume2 = defineIcon({
  id: "volume-2",
  name: "Volume",
  lucide: "Volume2",
  uses: ["Speak"],
  category: CAT,
  intent: "The speaker swells and the sound waves ripple outward in turn.",
  glyph: (
    <>
      <path data-p="cone" d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <path data-p="w1" d="M16 9a5 5 0 0 1 0 6" />
      <path data-p="w2" d="M19.364 18.364a9 9 0 0 0 0-12.728" />
    </>
  ),
  timeline: [
    pivot(P("cone"), "0%", "50%"),
    [P("cone"), { scale: [1, 1.1, 1] }, { duration: 0.36, ...OUT_BACK, at: 0 }],
    [P("w1"), { x: [0, 1.2, 0], opacity: [1, 0.3, 1], scale: [1, 1.15, 1] }, { duration: 0.4, ...OUT_BACK, at: 0.08 }],
    [P("w2"), { x: [0, 1.6, 0], opacity: [1, 0.3, 1], scale: [1, 1.1, 1] }, { duration: 0.4, ...OUT_BACK, at: 0.18 }],
  ],
});

/* PageNumber: the lattice shuffles – horizontals slide opposite ways,
   verticals the same, and it re-forms. */
export const hash = defineIcon({
  id: "hash",
  name: "Hash",
  lucide: "Hash",
  uses: ["PageNumber"],
  category: CAT,
  intent: "The lattice shuffles: horizontals slide apart, verticals too, then it re-forms.",
  glyph: (
    <>
      <line data-p="h1" x1="4" x2="20" y1="9" y2="9" />
      <line data-p="h2" x1="4" x2="20" y1="15" y2="15" />
      <line data-p="v1" x1="10" x2="8" y1="3" y2="21" />
      <line data-p="v2" x1="16" x2="14" y1="3" y2="21" />
    </>
  ),
  timeline: [
    [P("h1"), { x: [0, -2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("h2"), { x: [0, 2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("v1"), { y: [0, 2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0.06 }],
    [P("v2"), { y: [0, -2, 0] }, { duration: 0.5, ...OUT_BACK, at: 0.06 }],
  ],
});

/* Stop: the square is pressed and the ring is swept once around it. */
export const circleStop = defineIcon({
  id: "circle-stop",
  name: "Stop",
  lucide: "CircleStop",
  uses: ["Stop"],
  category: CAT,
  intent: "The square is pressed in while the ring is swept once around it.",
  glyph: (
    <>
      <circle data-p="ring" cx="12" cy="12" r="10" />
      <rect data-p="sq" x="9" y="9" width="6" height="6" rx="1" />
    </>
  ),
  timeline: [
    [P("sq"), { scale: [1, 0.6, 1.08, 1] }, { duration: 0.46, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.3, 0.7, 1], at: 0 }],
    wipe(P("ring"), { duration: 0.1 }),
    ...draw(P("ring"), { duration: 0.4, at: 0.1, ease: ease.glide }),
  ],
});

export const playbackIcons = [play, pause, skipBack, skipForward, circleStop, headphones, audioWaveform, volume2, hash];
