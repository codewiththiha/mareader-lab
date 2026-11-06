import {
  PanelLeft, PanelLeftClose, LayoutGrid, ListTree, BookA, LibraryBig,
  LayoutTemplate, Wind, Type, ChartNoAxesColumnIncreasing, Clock, Search,
  Palette, Settings, Pin, Columns2, X, Minus, Square, Copy, BookOpen,
  FolderOpen, Sun, Moon, SunMoon, Eclipse, Menu, Maximize, ZoomIn, ZoomOut,
  MoveHorizontal, Shrink, RectangleVertical, GalleryVertical,
  GalleryHorizontal, Minimize, EyeOff, Keyboard, CircleAlert, CircleCheck,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, List,
  ArrowDownUp, SlidersHorizontal, Folders, Folder, FolderPlus, RefreshCw,
  FolderSearch, FileSearch, HardDrive, Trash2, SquareLibrary, Pencil, Check,
  BookPlus, Link, Undo2, Ellipsis, Cpu, Server, Play, Volume2, Highlighter,
  Baseline, Underline, ArrowUp, ArrowDown, KeyRound, Ban, ArrowRightLeft,
  Download, Pause, BookSearch, ListChecks, StickyNote, Bookmark, ScrollText,
  Languages, Feather, CircleStop, Eye, Repeat, Headphones, AudioWaveform,
  SkipBack, SkipForward, Hash, BookOpenText, ArrowRightFromLine, Table,
  Image as ImageIcon, PanelRight,
} from "lucide-react";

import {
  AiMark, KokoroMark, PiperMark, KittenMark, PhononMark, SystemMark,
  SilentMark, MotionNew, LevelsNew, HalfHighlightNew, AutoScrollNew,
  PageNumberNew, ChromelessNew, SimplifyNew, FitPageNew, SpreadNew,
  type IconComp,
} from "../icons/glyphs";

import appleRaw from "../assets/logos/apple.svg?raw";
import geminiRaw from "../assets/logos/gemini.svg?raw";
import lmstudioRaw from "../assets/logos/lm-studio.svg?raw";
import ollamaRaw from "../assets/logos/ollama.svg?raw";
import openaiRaw from "../assets/logos/openai.svg?raw";
import openrouterRaw from "../assets/logos/openrouter.svg?raw";

export type Verdict = "keep" | "redraw" | "bespoke" | "engine";
export type Cat =
  | "panels" | "reading" | "voice" | "library" | "ai"
  | "marks" | "window" | "actions" | "engines" | "providers";

export interface Entry {
  id: string;
  label: string;
  glyph: string;          // what ships today
  where: string;          // where it lives in Mareader
  cat: Cat;
  verdict: Verdict;
  Icon?: IconComp;        // canonical mark (the new one, when redrawn)
  Old?: IconComp;         // the shipped mark, kept for comparison
  raw?: string;           // fill-based provider SVG, verbatim from the repo
  note?: string;          // why it stays
  critique?: string;      // why it was redrawn
  fix?: string;           // what the new mark says instead
}

export const CAT_LABEL: Record<Cat, string> = {
  panels: "Panels & navigation",
  reading: "Reading & layout",
  voice: "Read aloud",
  library: "Library & files",
  ai: "AI tools",
  marks: "Ink & vocabulary",
  window: "Window & appearance",
  actions: "Common actions",
  engines: "Voice engines — new",
  providers: "Providers — already bespoke",
};

const K = (
  id: string, glyph: string, Icon: IconComp, cat: Cat, where: string, note: string,
): Entry => ({ id, label: id, glyph: `Lucide ${glyph}`, Icon, cat, where, note, verdict: "keep" });

const R = (
  id: string, glyph: string, Old: IconComp, Icon: IconComp, cat: Cat,
  where: string, critique: string, fix: string,
): Entry => ({
  id, label: id, glyph: `Lucide ${glyph}`, Old, Icon, cat, where, critique, fix, verdict: "redraw",
});

/* ------------------------------------------------------------------ */
/*  The ledger — every variant of `Icon` in crates/ui/src/icons.rs     */
/* ------------------------------------------------------------------ */

export const LEDGER: Entry[] = [
  /* Panels & navigation */
  K("Sidebar", "PanelLeft", PanelLeft, "panels", "Toolbar · toggle the sidebar", "A frame with its left rail — exactly the thing it toggles."),
  K("SidebarClose", "PanelLeftClose", PanelLeftClose, "panels", "Sidebar header · collapse", "The same panel with a chevron leaving it. Direction is explicit."),
  K("Thumbnails", "LayoutGrid", LayoutGrid, "panels", "Sidebar · page thumbnails tab", "A grid of cells reads as a grid of pages."),
  K("Outline", "ListTree", ListTree, "panels", "Sidebar · table of contents", "Indented branches: a tree of headings, which is what an outline is."),
  K("Dictionary", "BookA", BookA, "panels", "Sidebar & lookups · dictionary", "A book lettered A — the universal dictionary mark."),
  K("Aside", "PanelRight", PanelRight, "panels", "Reader · sidebars & boxed asides", "Mirrors Sidebar on the right; the pairing is the meaning."),
  K("Pin", "Pin", Pin, "panels", "Panels · keep open", "A pin holds a thing in place. Nothing to fix."),
  K("SplitRight", "Columns2", Columns2, "panels", "Workspace · split a pane rightward", "Two columns — the four-pane desk starts here."),

  /* Reading & layout */
  K("Layout", "LayoutTemplate", LayoutTemplate, "reading", "View menu · pane layouts", "A template of regions: layout in one glyph."),
  K("Type", "Type", Type, "reading", "Appearance · typeface & text", "The letterform tool. Correct and conventional."),
  K("Clock", "Clock", Clock, "reading", "Library & stats · reading time", "Time, plainly."),
  K("Book", "BookOpen", BookOpen, "reading", "Everywhere · an open book", "The app's own noun. Right at home."),
  K("ZoomIn", "ZoomIn", ZoomIn, "reading", "Page bar · zoom in", "Lens with a plus — no ambiguity."),
  K("ZoomOut", "ZoomOut", ZoomOut, "reading", "Page bar · zoom out", "Lens with a minus."),
  K("FitWidth", "MoveHorizontal", MoveHorizontal, "reading", "Page bar · fit width", "Arrows pushing to both edges say width, and it sits beside Fit Page."),
  K("SinglePage", "RectangleVertical", RectangleVertical, "reading", "Page bar · one page", "One portrait rectangle: one page."),
  K("ScrollVertical", "GalleryVertical", GalleryVertical, "reading", "View menu · continuous scroll", "Stacked frames flowing down — the filmstrip of pages."),
  K("ScrollHorizontal", "GalleryHorizontal", GalleryHorizontal, "reading", "View menu · horizontal scroll", "The same strip, laid sideways. The pair is coherent."),
  K("Table", "Table", Table, "reading", "Read aloud · table handling", "Rows and columns; it names the thing itself."),
  K("Figure", "Image", ImageIcon, "reading", "Read aloud · figures & images", "The picture-frame glyph for figures in the text."),
  K("LeaveTable", "ArrowRightFromLine", ArrowRightFromLine, "reading", "Read aloud · step out of a table", "An arrow leaving a boundary line — escaping the structure."),

  /* Read aloud */
  K("ReadAloud", "Headphones", Headphones, "voice", "Toolbar · read-aloud bar", "Listening, which is the reader's half of read-aloud."),
  K("VoiceModel", "AudioWaveform", AudioWaveform, "voice", "Settings · a voice model's tab", "A waveform: the model's output, and its fingerprint."),
  K("Try", "Play", Play, "voice", "Voice lists · preview a voice", "Play is preview. Shared with Resume, which is fine — both start sound."),
  K("Speak", "Volume2", Volume2, "voice", "Dictionary · say a word", "A speaker mid-utterance."),
  K("Pause", "Pause", Pause, "voice", "Playback · pause", "Two bars, universal."),
  K("Resume", "Play", Play, "voice", "Playback · resume", "The triangle everyone already knows."),
  K("Stop", "CircleStop", CircleStop, "voice", "Playback · stop", "Stop inside a circle reads as a transport control, not a warning."),
  K("SkipBack", "SkipBack", SkipBack, "voice", "Playback · previous sentence", "Transport-standard."),
  K("SkipForward", "SkipForward", SkipForward, "voice", "Playback · next sentence", "Transport-standard."),
  K("Repeat", "Repeat", Repeat, "voice", "Read aloud · continuous mode", "Looping arrows for reading that keeps going."),
  K("Follow", "BookOpenText", BookOpenText, "voice", "Read aloud · follow the text", "An open book with lines — the page being read to you."),

  /* Library & files */
  K("Library", "LibraryBig", LibraryBig, "library", "Window · the library", "Books on a shelf, spines out."),
  K("Shelf", "SquareLibrary", SquareLibrary, "library", "Library · a single shelf", "The framed variant pairs with LibraryBig — a shelf within the library."),
  K("Open", "FolderOpen", FolderOpen, "library", "Everywhere · open a file", "The opening folder, mid-action."),
  K("Folders", "Folders", Folders, "library", "Library · watched folders", "Plural folders for plural roots."),
  K("Folder", "Folder", Folder, "library", "Library · one folder", "Singular of the above; the family is consistent."),
  K("FolderPlus", "FolderPlus", FolderPlus, "library", "Library · watch a new folder", "Folder plus plus: add."),
  K("Rescan", "RefreshCw", RefreshCw, "library", "Library · rescan shelves", "Circling arrows — do it again."),
  K("SearchFolder", "FolderSearch", FolderSearch, "library", "Library · search within a folder", "Folder and lens, composed honestly."),
  K("ChooseFile", "FileSearch", FileSearch, "library", "Dialogs · pick a file", "A file under the lens."),
  K("Offline", "HardDrive", HardDrive, "library", "Models · stored on this machine", "Local means on the drive. The disk is the point."),
  K("Remove", "Trash2", Trash2, "library", "Everywhere · delete", "The bin. Leave it alone."),
  K("Rename", "Pencil", Pencil, "library", "Library · rename", "The pencil edits the name in place."),
  K("Import", "BookPlus", BookPlus, "library", "Library · bring a book in", "A book with a plus — into the shelf."),
  K("Grid", "LayoutGrid", LayoutGrid, "library", "Library · cover grid", "Same glyph as Thumbnails, same meaning: a grid of covers."),
  K("List", "List", List, "library", "Library · list view", "Lines in a row."),
  K("Sort", "ArrowDownUp", ArrowDownUp, "library", "Library · sort order", "Up and down: ordering, not movement."),
  K("ViewOptions", "SlidersHorizontal", SlidersHorizontal, "library", "Library · view options", "Sliders say adjustable settings."),
  K("SelectSeveral", "ListChecks", ListChecks, "library", "Library · multi-select", "A checklist is selection."),

  /* AI tools */
  K("Chip", "Cpu", Cpu, "ai", "AI settings · models", "The processor is where the model runs; pairs with the AI mark."),
  K("Server", "Server", Server, "ai", "AI settings · custom endpoint", "A rack for the server that has no logo of its own."),
  K("Summarize", "ScrollText", ScrollText, "ai", "Page AI · summarize", "A written scroll: the gist, set down."),
  K("Translate", "Languages", Languages, "ai", "Page AI · translate", "Two scripts, one glyph — the standard and the right one."),
  K("LookUp", "BookSearch", BookSearch, "ai", "Dictionary · AI lookup in context", "Search inside the book: lookup with context."),
  K("Key", "KeyRound", KeyRound, "ai", "AI settings · API key", "A key for a key."),
  K("Ban", "Ban", Ban, "ai", "AI settings · set a key aside", "The slash-circle refuses it."),

  /* Ink & vocabulary */
  K("Highlight", "Highlighter", Highlighter, "marks", "Selection · full highlighter", "The marker itself, ink side down."),
  K("Underline", "Underline", Underline, "marks", "Selection · underline", "The typographic U with its rule."),
  K("Note", "StickyNote", StickyNote, "marks", "Highlights · notes panel", "A sticky note with its folded corner."),
  K("Bookmark", "Bookmark", Bookmark, "marks", "Reader · bookmarks", "The ribbon in the page."),

  /* Window & appearance */
  K("Close", "X", X, "window", "Everywhere · close", "Nothing to say. It's an X."),
  K("WindowMinimize", "Minus", Minus, "window", "Title bar · minimize", "Platform convention."),
  K("WindowMaximize", "Square", Square, "window", "Title bar · maximize", "Platform convention."),
  K("WindowRestore", "Copy", Copy, "window", "Title bar · restore", "Two overlapped squares is the OS restore glyph — borrowed deliberately."),
  K("Menu", "Menu", Menu, "window", "Title bar · menu", "Three lines."),
  K("Fullscreen", "Maximize", Maximize, "window", "View · enter fullscreen", "Corners pushing outward."),
  K("ExitFullscreen", "Minimize", Minimize, "window", "View · leave fullscreen", "The same corners, pulling home."),
  K("Keyboard", "Keyboard", Keyboard, "window", "Help · shortcuts", "Keys, drawn."),
  K("Light", "Sun", Sun, "window", "Appearance · light mode", "Day."),
  K("Dark", "Moon", Moon, "window", "Appearance · dark mode", "Night."),
  K("Dim", "SunMoon", SunMoon, "window", "Appearance · dim mode", "Half day, half night — the mode between."),
  K("Black", "Eclipse", Eclipse, "window", "Appearance · pure black", "Full occlusion: darker than Dark. The four-mode family sings."),
  K("Appearance", "Palette", Palette, "window", "Settings · appearance", "The painter's palette for tints and textures."),
  K("Settings", "Settings", Settings, "window", "Everywhere · settings", "The gear stays."),

  /* Common actions */
  K("Search", "Search", Search, "actions", "Everywhere · find", "The lens."),
  K("Alert", "CircleAlert", CircleAlert, "actions", "Toasts · something went wrong", "Bang in a circle."),
  K("Done", "CircleCheck", CircleCheck, "actions", "Toasts · finished", "Tick in a circle."),
  K("Check", "Check", Check, "actions", "Menus · the chosen one", "A bare tick for the current choice."),
  K("ChevronDown", "ChevronDown", ChevronDown, "actions", "Menus · opens downward", "Direction, honestly."),
  K("ChevronUp", "ChevronUp", ChevronUp, "actions", "Menus · folds upward", "Direction, honestly."),
  K("ChevronLeft", "ChevronLeft", ChevronLeft, "actions", "Everywhere · back", "Direction, honestly."),
  K("ChevronRight", "ChevronRight", ChevronRight, "actions", "Everywhere · onward", "Direction, honestly."),
  K("Minus", "Minus", Minus, "actions", "Steppers · less", "Arithmetic."),
  K("Plus", "Plus", Plus, "actions", "Steppers · more", "Arithmetic."),
  K("MoveUp", "ArrowUp", ArrowUp, "actions", "Lists · move up", "It moves the thing up. Correct here — unlike its AutoScroll twin."),
  K("MoveDown", "ArrowDown", ArrowDown, "actions", "Lists · move down", "Same story, downward."),
  K("Swap", "ArrowRightLeft", ArrowRightLeft, "actions", "AI settings · swap models", "Two-way arrows: exchange."),
  K("Download", "Download", Download, "actions", "Models · fetch", "Down into the tray."),
  K("Restore", "Undo2", Undo2, "actions", "Everywhere · undo", "The curling arrow back."),
  K("More", "Ellipsis", Ellipsis, "actions", "Everywhere · overflow menu", "Three dots, more to say."),
  K("Copy", "Copy", Copy, "actions", "Everywhere · copy", "One sheet behind another."),
  K("Link", "Link", Link, "actions", "Reader · follow links", "Chain links."),
  K("Show", "Eye", Eye, "actions", "Panels · reveal", "The open eye."),

  /* ---- The nine redraws ---- */
  R("Motion", "Wind", Wind, MotionNew, "window",
    "Settings · Motion tab (animation & easing)",
    "Wind reads as weather or air quality. This tab bends animation speed and easing — nothing here is air.",
    "An ease curve pinned between two keyframes: the literal thing the setting shapes."),
  R("Levels", "ChartNoAxesColumnIncreasing", ChartNoAxesColumnIncreasing, LevelsNew, "marks",
    "Settings · Vocabulary; thumbnails · CEFR shading",
    "Rising bars read as statistics or a signal meter. This opens CEFR vocabulary levels — a ladder of proficiency, not a chart of data.",
    "A staircase with a climber: A1 to C2 as steps to take, not bars to measure."),
  R("HalfHighlight", "Baseline", Baseline, HalfHighlightNew, "marks",
    "Study bar · the half highlighter",
    "Baseline is a typesetting tool — an A over a rule. Beside the full Highlighter it reads as font settings, not a half-swipe of ink.",
    "The same letter, but the bar beneath is a marker stroke filled only halfway: the pen's half state, literally."),
  R("AutoScroll", "ArrowDown", ArrowDown, AutoScrollNew, "reading",
    "View menu · auto-scroll",
    "A bare down-arrow is pixel-identical to Move Down. Auto-scroll is continuous and hands-free; one arrow can't say “keeps going”.",
    "Chevrons descending inside a page: the page feeds itself."),
  R("PageNumber", "Hash", Hash, PageNumberNew, "voice",
    "Read-aloud menu · skip page numbers",
    "A hash says “number” — or hashtag. The toggle skips printed folios while reading aloud; the mark should say page №, not count.",
    "The numero sign, drawn the way a book prints its folio."),
  R("Chromeless", "EyeOff", EyeOff, ChromelessNew, "window",
    "View menu · chromeless reading",
    "Eye-off universally means hidden content — a masked password. Here the text stays; only the window's chrome disappears.",
    "The frame goes ghost — dashed — while the text inside stays solid. Chrome off, reading on."),
  R("Simplify", "Feather", Feather, SimplifyNew, "ai",
    "Page AI · simplify the passage",
    "A feather is a quill: it says “write”, or “light as air”. The task rewrites hard text into plain text.",
    "Three full lines funnel down into one short line: many words become few."),
  R("FitPage", "Shrink", Shrink, FitPageNew, "reading",
    "Page bar · fit the whole page",
    "Inward arrows say “collapse”. Fit Page doesn't shrink the window — it seats the entire page inside the viewport.",
    "Crop brackets around a seated page: fitted, corner to corner."),
  R("Spread", "BookOpen", BookOpen, SpreadNew, "reading",
    "Page bar · two-page spread",
    "It borrows Book's exact glyph, so “open a book” and “two-page spread” look identical in a menu. Single Page has its own rectangle; Spread deserves its pair.",
    "Two faced pages with a spine — Single Page's rectangle, doubled."),

  /* ---- Already bespoke in the repo ---- */
  { id: "Ai", label: "Ai", glyph: "Custom · AI_MARK", Icon: AiMark, cat: "ai", verdict: "bespoke",
    where: "Every AI touchpoint",
    note: "“AI” drawn in strokes inside a rounded frame, on the same 24-unit grid. Already custom, already right — left untouched." },
  { id: "OpenAi", label: "OpenAi", glyph: "Simple Icons · CC0", raw: openaiRaw, cat: "providers", verdict: "bespoke",
    where: "AI settings · provider badge",
    note: "The provider's own knot, from the repo's assets/logos. Shipped white so the app can tint it." },
  { id: "Gemini", label: "Gemini", glyph: "Simple Icons · CC0", raw: geminiRaw, cat: "providers", verdict: "bespoke",
    where: "AI settings · provider badge",
    note: "The four-point spark, verbatim from the repo." },
  { id: "OpenRouter", label: "OpenRouter", glyph: "Simple Icons · CC0", raw: openrouterRaw, cat: "providers", verdict: "bespoke",
    where: "AI settings · provider badge",
    note: "The router's arrow-chevron, verbatim from the repo." },
  { id: "Ollama", label: "Ollama", glyph: "Simple Icons · CC0", raw: ollamaRaw, cat: "providers", verdict: "bespoke",
    where: "AI settings · local provider badge",
    note: "The llama herself, verbatim from the repo." },
  { id: "LmStudio", label: "LmStudio", glyph: "Simple Icons · CC0", raw: lmstudioRaw, cat: "providers", verdict: "bespoke",
    where: "AI settings · local provider badge",
    note: "The stacked bars in their squircle, verbatim from the repo." },
  { id: "Apple", label: "Apple", glyph: "Simple Icons · CC0", raw: appleRaw, cat: "providers", verdict: "bespoke",
    where: "AI settings · Apple Intelligence badge",
    note: "The apple, verbatim from the repo. Also the face of the System voice on macOS." },
];



/* ------------------------------------------------------------------ */
/*  The six voice engines — crates/speech                              */
/* ------------------------------------------------------------------ */

export interface Engine {
  entry: Entry;
  tagline: string;
  params: string;
  license: string;
  langs: string;
  builds: string;
  story: string;
  hue: string; // css color for its plate
}

const E = (
  id: string, label: string, Icon: IconComp, where: string, fix: string,
): Entry => ({
  id, label, glyph: "New · drawn for this audit", Icon, cat: "engines",
  where, verdict: "engine", fix,
  note: "No icon existed — engine rows in Settings were text-only.",
});

export const ENGINES: Engine[] = [
  {
    entry: E("engine-kokoro", "Kokoro", KokoroMark, "Settings · Read aloud · engine row",
      "A heart with a spoken pulse."),
    tagline: "Natural voices from a small model",
    params: "82 M parameters",
    license: "Apache 2.0",
    langs: "EN · ES · IT · PT · FR · HI · ZH",
    builds: "Full · Half · Small · Tiny",
    story: "Kokoro is 心 — “heart”. The heart keeps its outline; a single spoken pulse crosses it. A voice with a heartbeat, and the pulse is the same line the app already uses for waveforms.",
    hue: "var(--teal)",
  },
  {
    entry: E("engine-piper", "Piper", PiperMark, "Settings · Read aloud · engine row",
      "Panpipes that double as level bars."),
    tagline: "Quick, clear English voices; each a small model of its own",
    params: "One model per voice",
    license: "MIT · voices public domain",
    langs: "English",
    builds: "Expression & rhythm knobs",
    story: "A piper plays stopped pipes, so: three pipes of different lengths bound by one cord. Read them upright and they double as level bars — quick, clear, measured speech.",
    hue: "var(--amber)",
  },
  {
    entry: E("engine-kitten", "Kitten", KittenMark, "Settings · Read aloud · engine row",
      "The lightest possible cat, purring in a waveform."),
    tagline: "Light English voices from tiny models",
    params: "15–80 M parameters",
    license: "Apache 2.0",
    langs: "American English",
    builds: "Mini · Micro · Nano · Nano 8-bit",
    story: "The smallest voices on the shelf get the lightest possible cat: two ears, two dots for eyes, and a waveform where the purr should be. At 16 px it's still unmistakably a kitten.",
    hue: "var(--ember)",
  },
  {
    entry: E("engine-phonon", "Phonon", PhononMark, "Settings · Read aloud · engine row",
      "A quantum of vibration crossing a lattice."),
    tagline: "Natural English voices from a 31 M model — Gradium's Phonon on candle",
    params: "31 M parameters · 24 kHz",
    license: "Apache 2.0",
    langs: "English",
    builds: "8-bit · Default",
    story: "A phonon is a quantum of vibration travelling through a lattice — the physics diagram is the logo. Five lattice sites sit on the baseline; one wave passes through them. No other TTS mark looks like its own namesake.",
    hue: "var(--iris)",
  },
  {
    entry: E("engine-system", "System", SystemMark, "Settings · Read aloud · engine row",
      "The machine itself, speaking."),
    tagline: "The engine the system provides — nothing to download",
    params: "Built into the OS",
    license: "System voices",
    langs: "Whatever the OS ships",
    builds: "Apple voices on macOS",
    story: "The voice your computer already owns: a display that speaks. No model card, no download bar — the machine itself. On macOS these are the Apple voices the repo already badges with the apple.",
    hue: "var(--moss)",
  },
  {
    entry: E("engine-silent", "Silent", SilentMark, "Tests & screenshots · silent engine",
      "One blip, then a full stop."),
    tagline: "Says nothing, ending each sentence at once — for tests and shots",
    params: "0 parameters, honestly",
    license: "In-tree",
    langs: "Silence, universal",
    builds: "Instant",
    story: "Every engine family needs its rest note. One blip, a flat line, and an open stop: speech that ends the moment it begins. It marks the test engine without pretending to be a mute button.",
    hue: "var(--rose)",
  },
];

export const ALL: Entry[] = [...ENGINES.map((e) => e.entry), ...LEDGER];

export const STATS = {
  audited: LEDGER.length,
  kept: LEDGER.filter((e) => e.verdict === "keep").length,
  redrawn: LEDGER.filter((e) => e.verdict === "redraw").length,
  bespoke: LEDGER.filter((e) => e.verdict === "bespoke").length,
  engines: ENGINES.length,
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  keep: "Kept",
  redraw: "Redrawn",
  bespoke: "Already bespoke",
  engine: "New engine mark",
};
