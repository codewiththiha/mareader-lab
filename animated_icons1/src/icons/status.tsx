import { P, defineIcon, draw, ease, erase, outBack, pivot, wipe } from "../motion/dsl";

const CAT = "Status & controls" as const;
const OUT_BACK = outBack();

/* Alert: a shake of the whole sign while the exclamation point stamps –
   the dot pops as the bar lands. */
export const circleAlert = defineIcon({
  id: "circle-alert",
  name: "Circle alert",
  lucide: "CircleAlert",
  uses: ["Alert"],
  category: CAT,
  intent: "The sign shakes while the exclamation stamps – the dot pops as the bar lands.",
  glyph: (
    <g data-p="sign">
      <circle cx="12" cy="12" r="10" />
      <line data-p="bar" x1="12" x2="12" y1="8" y2="12" />
      <line data-p="dot" x1="12" x2="12.01" y1="16" y2="16" />
    </g>
  ),
  timeline: [
    pivot(P("bar"), "50%", "100%"),
    [P("sign"), { x: [0, -1.5, 1.5, -1, 0.6, 0] }, { duration: 0.4, ease: ease.glide, times: [0, 0.2, 0.4, 0.6, 0.8, 1], at: 0 }],
    [P("bar"), { scaleY: [1, 1.35, 1] }, { duration: 0.34, ...OUT_BACK, at: 0.04 }],
    [P("dot"), { scale: [1, 2, 1] }, { duration: 0.3, ...OUT_BACK, at: 0.16 }],
  ],
});

/* Done: the ring pulses once and the tick is drawn into it. */
export const circleCheck = defineIcon({
  id: "circle-check",
  name: "Circle check",
  lucide: "CircleCheck",
  uses: ["Done"],
  category: CAT,
  intent: "The ring pulses once and the tick is drawn into it, settling with a bounce.",
  glyph: (
    <>
      <circle data-p="ring" cx="12" cy="12" r="10" />
      <path data-p="tick" d="m16 9-5.5 5.5L8 12" />
    </>
  ),
  timeline: [
    erase(P("tick"), "end"),
    [P("ring"), { scale: [1, 0.9, 1.05, 1] }, { duration: 0.5, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.3, 0.7, 1], at: 0 }],
    ...draw(P("tick"), { duration: 0.26, at: 0.14 }),
    [P("tick"), { scale: [1, 1.18, 1] }, { duration: 0.26, ...OUT_BACK, at: 0.38 }],
  ],
});

/* Check: a single confident stroke – short leg first, then the long one –
   with a flick of overshoot at the end. */
export const check = defineIcon({
  id: "check",
  name: "Check",
  lucide: "Check",
  uses: ["Check"],
  category: CAT,
  intent: "One confident stroke – short leg, then long – with a flick at the end.",
  glyph: <path data-p="tick" d="M20 6 9 17l-5-5" />,
  timeline: [
    wipe(P("tick"), { duration: 0.1, toward: "end" }),
    ...draw(P("tick"), { duration: 0.28, at: 0.1 }),
    [P("tick"), { scale: [1, 1.2, 1], rotate: [0, -4, 0] }, { duration: 0.3, ...OUT_BACK, at: 0.34 }],
  ],
});

/* Clock: the hands are wound forward one full turn, the dial swelling
   slightly as time passes. */
export const clock = defineIcon({
  id: "clock",
  name: "Clock",
  lucide: "Clock",
  uses: ["Clock"],
  category: CAT,
  intent: "The hands are wound forward a full turn; the dial swells a touch with them.",
  glyph: (
    <>
      <circle data-p="dial" cx="12" cy="12" r="10" />
      <g data-p="hands">
        <circle cx="12" cy="12" r="10" stroke="none" />
        <path d="M12 6v6l4 2" />
      </g>
    </>
  ),
  timeline: [
    [P("hands"), { rotate: [0, 360] }, { duration: 0.7, ease: ease.glide, at: 0 }],
    [P("dial"), { scale: [1, 1.06, 1] }, { duration: 0.7, ease: ease.glide, times: [0, 0.5, 1], at: 0 }],
  ],
});

export const statusIcons = [check, circleCheck, circleAlert, clock];
