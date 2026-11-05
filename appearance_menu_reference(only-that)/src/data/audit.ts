// Every claim in this lab traces back to a real file + symbol in mareader2.
// Reviewed at: github.com/codewiththiha/mareader2, crates/ui/src/*

export type Cite = {
  file: string;
  what: string;
  consts: string[];
};

export type Verdict = {
  keep: string[];
  fix: string[];
};

export const SOURCES: Record<string, Cite> = {
  toast: {
    file: "crates/ui/src/toast.rs",
    what: "bottom-right stack, newest in front",
    consts: ["WIDTH 360", "INSET 16", "SHOW_FOR 3.5s", "ERROR_FOR 6.0s", "HOVER_GRACE 1.5s", "KEEP 12"],
  },
  toastCard: {
    file: "crates/ui/src/toast/card.rs",
    what: "measured-first card, feathered countdown wash",
    consts: ["MARK 26", "PAD 12×10", "FEATHER 64", "COLUMN 3", "wash α 0.13–0.16"],
  },
  toastStack: {
    file: "crates/ui/src/toast/stack.rs",
    what: "front/behind/list stacking + swipe-to-dismiss",
    consts: ["Behind peek", "drag → Swipe", "keep_clear()"],
  },
  playerCard: {
    file: "crates/ui/src/read_aloud/card.rs",
    what: "cover + lyrics-stream card",
    consts: ["HEIGHT 224", "FULL_LEAST 380", "COMPACT 94", "COVER 70×105", "EYE 0.4", "GLIDE 10"],
  },
  playerControl: {
    file: "crates/ui/src/read_aloud/control.rs",
    what: "pill: steps, play, seek track, speed, stop",
    consts: ["HEIGHT 44", "PLAY 36", "TRACK 56–168", "TIME_W 66", "SPEED_W 54"],
  },
  park: {
    file: "crates/ui/src/park.rs",
    what: "floating panels resting beyond a stage edge",
    consts: ["PEEK 20", "MAGNET 8", "HIDE 0.26s", "REVEAL 0.34s", "ease-out cubic"],
  },
  bubble: {
    file: "crates/ui/src/bubble.rs",
    what: "anchored card with caret on the words",
    consts: ["GAP 11", "CARET 8", "CORNER 16", "ROOM_FIRST 240", "ENTER 0.16s + 4pt"],
  },
  dictCard: {
    file: "crates/ui/src/dict/card.rs",
    what: "one entry at a time, footer pager",
    consts: ["WIDTH 320", "ENTRY_MIN 96", "FOOT 36", "DOTS_MAX 7", "STEP 24 wheel"],
  },
  appearance: {
    file: "crates/ui/src/appearance_menu.rs",
    what: "presets, mode & colour, text, texture, grain",
    consts: ["WIDTH 300", "MAX_H 512", "NAME_W 64", "VALUE_W 52", "HEADER 24"],
  },
  viewMenu: {
    file: "crates/ui/src/view_menu.rs",
    what: "layout cells, zoom row, reading rows",
    consts: ["WIDTH 272", "view cell 46h", "− 52% +", "fits right"],
  },
  uxAudit: {
    file: "docs/ux-audit.md",
    what: "the repo's own audit — §1–§10 mostly fixed",
    consts: ["§2 selection bar", "§3 title bar", "§6 appearance", "§10 toasts"],
  },
};

export const VERDICTS: Record<string, Verdict> = {
  toast: {
    keep: [
      "Measured-first layout (no jitter), swipe-to-dismiss, hover grace.",
      "keep_clear() contract — toasts yield to summoned menus/cards.",
      "Duplicate collapsing with ×n count instead of spam.",
    ],
    fix: [
      "Fixed 360px eats narrow windows; needs compact + fluid widths.",
      "Bottom-right collides with page pill & player dock — needs a lane system.",
      "Countdown wash (α 0.13 feather) is unreadable as time; add a legible meter.",
    ],
  },
  player: {
    keep: [
      "Lyrics-stream with EYE 0.4 anchor + GLIDE scroll is genuinely lovely.",
      "Fit cascade (speed → time → track) is the right instinct.",
      "Dance bars + cover-reveal affordance carry brand warmth.",
    ],
    fix: [
      "The Fit cascade drops speed/time with no trace — collapse into an overflow, not the void.",
      "224px card covers the page it narrates; needs mini + edge-rail forms.",
      "Stop / card-toggle / more cluster at the pill's tail with equal weight.",
    ],
  },
  park: {
    keep: [
      "Edge docking itself: Left/Right/Bottom with preserved size.",
      "Magnet hover pull (8px) + cubic ease timings feel physical.",
      "Click-only reveal hit-area over the exposed surface.",
    ],
    fix: [
      "A 20px anonymous sliver says nothing — no icon, no label, no state.",
      "Users can't tell player-peek from dict-peek; both look like a scrollbar bug.",
      "No keyboard path to reveal; Esc/peek order is undefined.",
    ],
  },
  dict: {
    keep: [
      "Anchored bubble: caret on word midline, side-flip, never covers the word.",
      "Paged entries with dots ≤7 then count; wheel-step paging.",
      "Answer set 15% larger than UI labels — content, not chrome.",
    ],
    fix: [
      "Header crowds word + 3 buttons in 320px; CEFR + route fight for one quiet line.",
      "Dots and counts are two paging languages; wheel paging is undiscoverable.",
      "No park affordance visible on the card itself — edging is a secret.",
    ],
  },
  appearance: {
    keep: [
      "Fold groups with summaries (\"Sepia · 34°\") preserve context when collapsed.",
      "Hue landmarks (Sepia/Rose/Green…) beat a naked 0–360 number.",
      "Per-pane switches pinned in a footer survive scrolling.",
    ],
    fix: [
      "Five fold groups × dial rows = a 512px scrolling tower for 6 numbers.",
      "Each slider burns a full 20px row: label 64 + track + value 52.",
      "Strength/Hue/Opacity/Intensity are siblings but live in different groups.",
    ],
  },
  menus: {
    keep: [
      "View menu groups: Layout / Zoom / Reading with sticky rows (menu stays open).",
      "View-mode captions under icons; zoom % centered between steppers.",
      "Folded title-bar tools spill into the menu in bar order.",
    ],
    fix: [
      "Long single column; zoom mixes steps + fits in one row of 4 icon buttons.",
      "Context actions for a selection live only in the floating bar — right-click is bare.",
      "No entry-point preview: menus never show what they will act on.",
    ],
  },
};

export const FILES_READ = [
  "toast.rs · toast/card.rs · toast/stack.rs",
  "read_aloud/card.rs · read_aloud/control.rs",
  "park.rs · bubble.rs",
  "dict/card.rs · dict/look.rs",
  "appearance_menu.rs · view_menu.rs",
  "selection.rs · titlebar.rs · docs/ux-audit.md",
];

export const NAV = [
  { id: "toasts", label: "Toasts" },
  { id: "player", label: "Player" },
  { id: "edge", label: "Edge park" },
  { id: "dict", label: "Dictionary" },
  { id: "appearance", label: "Appearance" },
  { id: "menus", label: "Menus" },
  { id: "tokens", label: "Tokens" },
  { id: "verdict", label: "Verdict" },
];
