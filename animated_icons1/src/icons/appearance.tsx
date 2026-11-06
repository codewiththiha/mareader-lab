import { P, defineIcon, ease, outBack, pivot, set } from "../motion/dsl";

const CAT = "Appearance" as const;
const OUT_BACK = outBack();

/* Light: sunrise – the rays advance one notch (45°, so they land on
   themselves) and flare out while the core pulses. */
export const sun = defineIcon({
  id: "sun",
  name: "Sun",
  lucide: "Sun",
  uses: ["Light"],
  category: CAT,
  intent: "Rays advance one notch and flare outward while the core pulses.",
  glyph: (
    <>
      <circle data-p="core" cx="12" cy="12" r="4" />
      <g data-p="rays">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </g>
    </>
  ),
  timeline: [
    [P("rays"), { rotate: [0, 45], scale: [1, 1.14, 1] }, { duration: 0.6, ease: ease.settle, times: [0, 0.5, 1], at: 0 }],
    [P("core"), { scale: [1, 0.78, 1.08, 1] }, { duration: 0.5, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.3, 0.7, 1], at: 0.05 }],
  ],
});

/* Dark: the moon tips back as if settling in, and two stars twinkle
   in the space its crescent leaves. */
export const moon = defineIcon({
  id: "moon",
  name: "Moon",
  lucide: "Moon",
  uses: ["Dark"],
  category: CAT,
  intent: "The moon tips back and two stars twinkle in the gap of its crescent.",
  glyph: (
    <>
      <path data-p="moon" d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      <g data-p="s1" opacity="0">
        <path d="M19 3v3" />
        <path d="M17.5 4.5h3" />
      </g>
      <g data-p="s2" opacity="0">
        <path d="M22 8v2" />
        <path d="M21 9h2" />
      </g>
    </>
  ),
  timeline: [
    [P("moon"), { rotate: [0, -18, 0], scale: [1, 0.94, 1] }, { duration: 0.6, ease: [ease.snap, ease.swing], times: [0, 0.4, 1], at: 0 }],
    set(P("s1"), { scale: 0, opacity: 0 }),
    set(P("s2"), { scale: 0, opacity: 0 }),
    [P("s1"), { scale: [0, 1.1, 0], opacity: [0, 1, 0] }, { duration: 0.4, ease: ease.snap, times: [0, 0.45, 1], at: 0.1 }],
    [P("s2"), { scale: [0, 1, 0], opacity: [0, 1, 0] }, { duration: 0.36, ease: ease.snap, times: [0, 0.45, 1], at: 0.24 }],
  ],
});

/* Dim: dusk – the rays retreat and fade one after another while the inner
   arc swings round the body like a shadow crossing it. */
export const sunMoon = defineIcon({
  id: "sun-moon",
  name: "Sun moon",
  lucide: "SunMoon",
  uses: ["Dim"],
  category: CAT,
  intent: "Dusk: rays retreat in turn while the inner arc swings round like a shadow.",
  glyph: (
    <>
      <path data-p="r1" d="M12 2v2" />
      <path data-p="body" d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715" />
      <g data-p="arc">
        <circle cx="12" cy="12" r="4" stroke="none" />
        <path d="M16 12a4 4 0 0 0-4-4" />
      </g>
      <path data-p="r2" d="m19 5-1.256 1.256" />
      <path data-p="r3" d="M20 12h2" />
    </>
  ),
  timeline: [
    pivot(P("r1"), "50%", "100%"),
    pivot(P("r2"), "0%", "100%"),
    pivot(P("r3"), "0%", "50%"),
    [P("r1"), { scale: [1, 0.3, 1], opacity: [1, 0.25, 1] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("r2"), { scale: [1, 0.3, 1], opacity: [1, 0.25, 1] }, { duration: 0.5, ...OUT_BACK, at: 0.07 }],
    [P("r3"), { scale: [1, 0.3, 1], opacity: [1, 0.25, 1] }, { duration: 0.5, ...OUT_BACK, at: 0.14 }],
    [P("arc"), { rotate: [0, -90, 0] }, { duration: 0.6, ease: [ease.snap, ease.swing], times: [0, 0.45, 1], at: 0 }],
  ],
});

/* Black: the eclipse passes – the shadow arc swings a full turn around
   the disc, which dims as it is covered. */
export const eclipse = defineIcon({
  id: "eclipse",
  name: "Eclipse",
  lucide: "Eclipse",
  uses: ["Black"],
  category: CAT,
  intent: "The shadow swings a full turn around the disc, which dims as it is covered.",
  glyph: (
    <>
      <circle data-p="disc" cx="12" cy="12" r="10" />
      <g data-p="shadow">
        <circle cx="12" cy="12" r="10" stroke="none" />
        <path d="M12 2a7 7 0 1 0 10 10" />
      </g>
    </>
  ),
  timeline: [
    [P("shadow"), { rotate: [0, 360] }, { duration: 0.8, ease: ease.glide, at: 0 }],
    [P("disc"), { opacity: [1, 0.45, 1], scale: [1, 0.96, 1] }, { duration: 0.8, ease: ease.glide, times: [0, 0.5, 1], at: 0 }],
  ],
});

/* Appearance: paint is dabbed on – each well pops in turn as the palette
   tilts to meet the brush. */
export const palette = defineIcon({
  id: "palette",
  name: "Palette",
  lucide: "Palette",
  uses: ["Appearance"],
  category: CAT,
  intent: "Paint is dabbed into each well in turn as the palette tilts to meet the brush.",
  glyph: (
    <>
      <path data-p="board" d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <circle data-p="w1" cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle data-p="w2" cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle data-p="w3" cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle data-p="w4" cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    </>
  ),
  timeline: [
    [P("board"), { rotate: [0, -5, 0] }, { duration: 0.55, ...OUT_BACK, at: 0 }],
    [P("w1"), { scale: [1, 0, 1.9, 1] }, { duration: 0.34, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.2, 0.6, 1], at: 0 }],
    [P("w2"), { scale: [1, 0, 1.9, 1] }, { duration: 0.34, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.2, 0.6, 1], at: 0.07 }],
    [P("w3"), { scale: [1, 0, 1.9, 1] }, { duration: 0.34, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.2, 0.6, 1], at: 0.14 }],
    [P("w4"), { scale: [1, 0, 1.9, 1] }, { duration: 0.34, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.2, 0.6, 1], at: 0.21 }],
  ],
});

/* Motion: three gusts blow through from left to right, each drawn in
   from its tail with a little drift. */
export const wind = defineIcon({
  id: "wind",
  name: "Wind",
  lucide: "Wind",
  uses: ["Motion"],
  category: CAT,
  intent: "Three gusts blow through left to right, each drawn in from its tail.",
  glyph: (
    <>
      <path data-p="g1" d="M9.8 4.4A2 2 0 1 1 11 8H2" />
      <path data-p="g2" d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <path data-p="g3" d="M12.8 19.6A2 2 0 1 0 14 16H2" />
    </>
  ),
  timeline: [
    [P("g1"), { pathLength: 0, pathOffset: 1, opacity: 0 }, { duration: 0, at: 0 }],
    [P("g2"), { pathLength: 0, pathOffset: 1, opacity: 0 }, { duration: 0, at: 0 }],
    [P("g3"), { pathLength: 0, pathOffset: 1, opacity: 0 }, { duration: 0, at: 0 }],
    [P("g1"), { opacity: 1 }, { duration: 0, at: 0.02 }],
    [P("g1"), { pathLength: 1, pathOffset: 0, x: [-2, 0] }, { duration: 0.36, ease: ease.snap, at: 0.02 }],
    [P("g2"), { opacity: 1 }, { duration: 0, at: 0.1 }],
    [P("g2"), { pathLength: 1, pathOffset: 0, x: [-2, 0] }, { duration: 0.4, ease: ease.snap, at: 0.1 }],
    [P("g3"), { opacity: 1 }, { duration: 0, at: 0.18 }],
    [P("g3"), { pathLength: 1, pathOffset: 0, x: [-2, 0] }, { duration: 0.36, ease: ease.snap, at: 0.18 }],
  ],
});

/* Show: a blink, then the pupil glances aside and back – the eye is alive. */
export const eye = defineIcon({
  id: "eye",
  name: "Eye",
  lucide: "Eye",
  uses: ["Show"],
  category: CAT,
  intent: "A quick blink, then the pupil glances aside and back.",
  glyph: (
    <g data-p="eye">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle data-p="pupil" cx="12" cy="12" r="3" />
    </g>
  ),
  timeline: [
    [P("eye"), { scaleY: [1, 0.08, 1] }, { duration: 0.26, ease: ease.glide, times: [0, 0.45, 1], at: 0 }],
    [P("pupil"), { x: [0, 2.2, -1.2, 0] }, { duration: 0.46, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.35, 0.7, 1], at: 0.28 }],
  ],
});

export const appearanceIcons = [sun, moon, sunMoon, eclipse, palette, wind, eye];
