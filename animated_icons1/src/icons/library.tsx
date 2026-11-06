import { P, defineIcon, ease, outBack, pivot, set } from "../motion/dsl";

const CAT = "Library" as const;
const OUT_BACK = outBack();

/* Library: the leaning book is pushed upright and leans back; the shelved
   books hop as it knocks them. */
export const libraryBig = defineIcon({
  id: "library-big",
  name: "Library",
  lucide: "LibraryBig",
  uses: ["Library"],
  category: CAT,
  intent: "The leaning book is nudged upright and falls back; its neighbours hop.",
  glyph: (
    <>
      <rect data-p="b1" width="8" height="18" x="3" y="3" rx="1" />
      <path data-p="b2" d="M7 3v18" />
      <path data-p="lean" d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
    </>
  ),
  timeline: [
    pivot(P("lean"), "100%", "100%"),
    [P("lean"), { rotate: [0, 7, -1.5, 0] }, { duration: 0.6, ease: [ease.snap, ease.swing, ease.settle], times: [0, 0.4, 0.75, 1], at: 0 }],
    [P("b2"), { y: [0, -1.4, 0] }, { duration: 0.36, ...OUT_BACK, at: 0.1 }],
    [P("b1"), { y: [0, -1.4, 0] }, { duration: 0.36, ...OUT_BACK, at: 0.16 }],
  ],
});

/* Shelf: the books hop in turn, left to right, the slanted one wobbling. */
export const squareLibrary = defineIcon({
  id: "square-library",
  name: "Square library",
  lucide: "SquareLibrary",
  uses: ["Shelf"],
  category: CAT,
  intent: "Books on the shelf hop in turn; the slanted one wobbles as it lands.",
  glyph: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path data-p="b1" d="M7 7v10" />
      <path data-p="b2" d="M11 7v10" />
      <path data-p="b3" d="m15 7 2 10" />
    </>
  ),
  timeline: [
    pivot(P("b3"), "100%", "100%"),
    [P("b1"), { y: [0, -2, 0] }, { duration: 0.34, ...OUT_BACK, at: 0 }],
    [P("b2"), { y: [0, -2, 0] }, { duration: 0.34, ...OUT_BACK, at: 0.07 }],
    [P("b3"), { y: [0, -2, 0], rotate: [0, -6, 0] }, { duration: 0.4, ...OUT_BACK, at: 0.14 }],
  ],
});

/* Folder: a tap – the folder squashes on its base and springs back up. */
export const folder = defineIcon({
  id: "folder",
  name: "Folder",
  lucide: "Folder",
  uses: ["Folder"],
  category: CAT,
  intent: "A tap: the folder squashes on its base and springs back.",
  glyph: <path data-p="f" d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />,
  timeline: [
    pivot(P("f"), "50%", "100%"),
    [P("f"), { scaleY: [1, 0.84, 1.04, 1], scaleX: [1, 1.06, 0.99, 1] }, { duration: 0.5, ease: [ease.snap, ease.snap, ease.settle], times: [0, 0.3, 0.7, 1], at: 0 }],
  ],
});

/* Open: the front flap tips open (foreshortened from its hinge) and closes. */
export const folderOpen = defineIcon({
  id: "folder-open",
  name: "Folder open",
  lucide: "FolderOpen",
  uses: ["Open"],
  category: CAT,
  intent: "The front flap tips open from its hinge and swings shut again.",
  glyph: (
    <>
      <path data-p="back" d="M4 20a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
      <path data-p="flap" d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4" />
    </>
  ),
  timeline: [
    pivot(P("flap"), "0%", "100%"),
    [P("flap"), { scaleY: [1, 0.72, 1], skewX: [0, -10, 0] }, { duration: 0.55, ease: [ease.snap, ease.swing], times: [0, 0.4, 1], at: 0 }],
    [P("back"), { y: [0, -0.6, 0] }, { duration: 0.5, ...OUT_BACK, at: 0.05 }],
  ],
});

/* FolderPlus: the plus drops in from above; the folder bounces on impact. */
export const folderPlus = defineIcon({
  id: "folder-plus",
  name: "Folder plus",
  lucide: "FolderPlus",
  uses: ["FolderPlus"],
  category: CAT,
  intent: "The plus drops in from above and the folder bounces on impact.",
  glyph: (
    <>
      <path data-p="f" d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <g data-p="plus">
        <path d="M12 10v6" />
        <path d="M9 13h6" />
      </g>
    </>
  ),
  timeline: [
    pivot(P("f"), "50%", "100%"),
    [P("plus"), { y: [0, -3.5], opacity: [1, 0] }, { duration: 0.12, ease: ease.snap, at: 0 }],
    set(P("plus"), { y: -5, opacity: 0, scale: 0.6 }, 0.12),
    [P("plus"), { y: [-5, 0], opacity: [0, 1], scale: [0.6, 1] }, { duration: 0.26, ease: ease.drop, at: 0.14 }],
    [P("f"), { scaleY: [1, 0.9, 1] }, { duration: 0.32, ...OUT_BACK, at: 0.36 }],
  ],
});

/* SearchFolder: the lens scans across the folder, tilting as it goes. */
export const folderSearch = defineIcon({
  id: "folder-search",
  name: "Folder search",
  lucide: "FolderSearch",
  uses: ["SearchFolder"],
  category: CAT,
  intent: "The lens scans sideways across the folder, tilting with the motion.",
  glyph: (
    <>
      <path d="M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1" />
      <g data-p="lens">
        <path d="m21 21-1.9-1.9" />
        <circle cx="17" cy="17" r="3" />
      </g>
    </>
  ),
  timeline: [
    [P("lens"), { x: [0, -7, 0], rotate: [0, -18, 0] }, { duration: 0.6, ease: [ease.snap, ease.swing], times: [0, 0.45, 1], at: 0 }],
  ],
});

/* Folders: the stack is flicked through – the front folder lifts and tilts,
   the one behind dips. */
export const folders = defineIcon({
  id: "folders",
  name: "Folders",
  lucide: "Folders",
  uses: ["Folders"],
  category: CAT,
  intent: "Flicking through a stack: the front folder lifts and tilts, the back one dips.",
  glyph: (
    <>
      <path data-p="front" d="M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z" />
      <path data-p="back" d="M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1" />
    </>
  ),
  timeline: [
    pivot(P("front"), "100%", "100%"),
    [P("front"), { rotate: [0, -5, 0], y: [0, -1.5, 0], x: [0, 1, 0] }, { duration: 0.5, ...OUT_BACK, at: 0 }],
    [P("back"), { y: [0, 1, 0], x: [0, -0.8, 0] }, { duration: 0.5, ...OUT_BACK, at: 0.05 }],
  ],
});

/* ChooseFile: the lens runs down the page and pulses when it finds the line. */
export const fileSearch = defineIcon({
  id: "file-search",
  name: "File search",
  lucide: "FileSearch",
  uses: ["ChooseFile"],
  category: CAT,
  intent: "The lens runs down the page and pulses when it finds the line.",
  glyph: (
    <>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <g data-p="lens">
        <circle cx="11.5" cy="14.5" r="2.5" />
        <path d="M13.3 16.3 15 18" />
      </g>
    </>
  ),
  timeline: [
    [P("lens"), { y: [0, -3.5, 0] }, { duration: 0.55, ease: [ease.snap, ease.swing], times: [0, 0.4, 1], at: 0 }],
    [P("lens"), { scale: [1, 1.25, 1] }, { duration: 0.3, ...OUT_BACK, at: 0.28 }],
  ],
});

/* Offline: the drive's lights blink out one by one, then come back –
   the device is still here, just not on the network. */
export const hardDrive = defineIcon({
  id: "hard-drive",
  name: "Hard drive",
  lucide: "HardDrive",
  uses: ["Offline"],
  category: CAT,
  intent: "The activity lights blink out and come back; the drive itself settles.",
  glyph: (
    <>
      <path data-p="body" d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <path data-p="shelf" d="M21.946 12.013H2.054" />
      <path data-p="led1" d="M6 16h.01" />
      <path data-p="led2" d="M10 16h.01" />
    </>
  ),
  timeline: [
    [P("led2"), { opacity: [1, 0.15, 0.15, 1] }, { duration: 0.5, times: [0, 0.2, 0.7, 1], at: 0 }],
    [P("led1"), { opacity: [1, 0.15, 0.15, 1] }, { duration: 0.5, times: [0, 0.2, 0.7, 1], at: 0.08 }],
    [P("shelf"), { scaleX: [1, 0.9, 1] }, { duration: 0.5, ...OUT_BACK, at: 0.05 }],
    [P("body"), { y: [0, 0.8, 0] }, { duration: 0.45, ...OUT_BACK, at: 0.1 }],
  ],
});

/* Download: the arrow drops into the tray, which dips and bounces on
   impact; the arrow comes round from above to rest. */
export const download = defineIcon({
  id: "download",
  name: "Download",
  lucide: "Download",
  uses: ["Download"],
  category: CAT,
  intent: "The arrow drops into the tray, which bounces; the arrow returns from above.",
  glyph: (
    <>
      <g data-p="arrow">
        <path d="M12 15V3" />
        <path d="m7 10 5 5 5-5" />
      </g>
      <path data-p="tray" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </>
  ),
  timeline: [
    pivot(P("tray"), "50%", "100%"),
    [P("arrow"), { y: [0, 4], opacity: [1, 0] }, { duration: 0.18, ease: ease.drop, at: 0 }],
    [P("tray"), { y: [0, 1.6, 0], scaleX: [1, 1.08, 1] }, { duration: 0.36, ...OUT_BACK, at: 0.14 }],
    set(P("arrow"), { y: -5, opacity: 0 }, 0.18),
    [P("arrow"), { y: [-5, 0], opacity: [0, 1] }, { duration: 0.34, ease: ease.settle, at: 0.26 }],
  ],
});

/* Remove: the lid lifts from its hinge, the can shudders and the contents
   settle; the lid comes back down. */
export const trash2 = defineIcon({
  id: "trash-2",
  name: "Trash",
  lucide: "Trash2",
  uses: ["Remove"],
  category: CAT,
  intent: "The lid lifts from its hinge; the can shudders and the contents settle.",
  glyph: (
    <>
      <g data-p="can">
        <path data-p="c1" d="M10 11v6" />
        <path data-p="c2" d="M14 11v6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      </g>
      <g data-p="lid">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </g>
    </>
  ),
  timeline: [
    pivot(P("lid"), "100%", "100%"),
    [P("lid"), { rotate: [0, -14, 0], y: [0, -1, 0] }, { duration: 0.55, ease: [ease.snap, ease.swing], times: [0, 0.4, 1], at: 0 }],
    [P("can"), { x: [0, -0.8, 0.8, 0] }, { duration: 0.3, ease: ease.glide, times: [0, 0.33, 0.66, 1], at: 0.1 }],
    [P("c1"), { y: [0, 1.4, 0] }, { duration: 0.34, ...OUT_BACK, at: 0.16 }],
    [P("c2"), { y: [0, 1.4, 0] }, { duration: 0.34, ...OUT_BACK, at: 0.22 }],
  ],
});

export const libraryIcons = [
  libraryBig, squareLibrary, folder, folderOpen, folderPlus, folderSearch, folders, fileSearch, hardDrive, download, trash2,
];
