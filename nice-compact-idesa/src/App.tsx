import { useState, type ReactNode } from "react";
import { BookOpen, Headphones, Minus, Palette, Plus, RotateCw, Search } from "lucide-react";
import { DICT } from "./data/sample";
import { BASES, LookProvider, lookStyle, useLook, type Base } from "./lib/look";
import { AppearanceFull, AppearanceKnobs, AppearanceStrip, ReadingPreview } from "./components/Appearance";
import { DictionaryLab, LookupCard } from "./components/Dictionary";
import { Knob } from "./components/Knob";
import { ContextLab, VIEW_START, ViewMenu, type ViewState } from "./components/Menu";
import { CardPlayer, CompactPlayer, ParkedPlayer, PlayerBar, usePlayback } from "./components/Player";
import { LiveReader } from "./components/Reader";
import { ToastFace, ToastProvider, useToast, type Placement } from "./components/Toast";
import {
  Button,
  IconButton,
  Kbd,
  Level,
  Note,
  Segmented,
  Slider,
  Stage,
  Switch,
  VerdictPill,
  cx,
  type SegOption,
  type Verdict,
} from "./components/ui";

export default function App() {
  return (
    <LookProvider>
      <ToastProvider>
        <Kit />
      </ToastProvider>
    </LookProvider>
  );
}

const NAV = [
  { id: "live", label: "Live reader" },
  { id: "review", label: "Review" },
  { id: "foundations", label: "Foundations" },
  { id: "controls", label: "Controls" },
  { id: "menus", label: "Menus" },
  { id: "appearance", label: "Appearance" },
  { id: "toasts", label: "Toasts" },
  { id: "player", label: "Read-aloud player" },
  { id: "dictionary", label: "Dictionary card" },
];

const BASE_OPTIONS: SegOption<Base>[] = [
  { value: "light", label: "Light" },
  { value: "dim", label: "Dim" },
  { value: "dark", label: "Dark" },
  { value: "black", label: "Black" },
];

function Kit() {
  const { look, patch, reset } = useLook();
  return (
    <div
      style={lookStyle(look)}
      className={cx(
        "grain relative min-h-screen bg-paper font-ui text-ink antialiased",
        look.grain > 0 && look.grainMotion && "grain-motion",
      )}
    >
      <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-6 py-3">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-on-accent shadow-md">
            <BookOpen size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-tight">Mareader UI kit</p>
            <p className="truncate text-[12px] text-muted">Review and redesign of the reader's components, with variants</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Segmented size="sm" label="Base mode" value={look.base} onChange={(base) => patch({ base })} options={BASE_OPTIONS} />
            <Button size="sm" variant="ghost" icon={RotateCw} onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 pb-28 pt-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <ul className="sticky top-24 space-y-0.5">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className="block rounded-lg px-3 py-1.5 text-[13px] text-muted transition hover:bg-ink/8 hover:text-ink"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 space-y-16">
          <LiveSection />
          <ReviewSection />
          <FoundationsSection />
          <ControlsSection />
          <MenusSection />
          <AppearanceSection />
          <ToastsSection />
          <PlayerSection />
          <DictionarySection />
        </main>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  verdict,
  mareader,
  here,
  children,
}: {
  id: string;
  title: string;
  verdict?: Verdict;
  mareader?: string;
  here?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <div className="space-y-2 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-[26px] font-semibold tracking-tight">{title}</h2>
          {verdict && <VerdictPill kind={verdict} />}
        </div>
        {mareader && (
          <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
            <span className="font-medium text-ink/80">In mareader. </span>
            {mareader}
          </p>
        )}
        {here && (
          <p className="max-w-3xl text-[14px] leading-relaxed text-muted">
            <span className="font-medium text-ink/80">Here. </span>
            {here}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ---------- Live reader ---------- */

function LiveSection() {
  return (
    <Section
      id="live"
      title="Live reader"
      mareader="One window: a title bar, the page, the read-aloud player, the dictionary card, the appearance and View menus, and toasts."
      here="The same parts wired together. The player reserves room at the foot, so it never covers the last line. Tap a shaded word, select text, right-click the page, or open the toolbar popovers."
    >
      <LiveReader />
      <p className="text-[12.5px] text-muted">Toasts from the actions appear in the corner of the viewport.</p>
    </Section>
  );
}

/* ---------- Review ---------- */

const REVIEW: { name: string; file: string; verdict: Verdict; why: string }[] = [
  {
    name: "Toasts",
    file: "toast.rs · toast/card.rs · toast/stack.rs",
    verdict: "refine",
    why: "The logic is strong: repeats collapse into ×N, a countdown line runs down, a swipe throws one away, and the stack steps aside for a page drag. What's missing is a progress tone, so a long job can only report when it ends.",
  },
  {
    name: "View & tools menu",
    file: "view_menu.rs",
    verdict: "rebuild",
    why: "Nine rows under three headings. The layout modes are icon cells whose names are only for screen readers. Full screen and distraction-free are two rows that could share one control.",
  },
  {
    name: "Appearance popover",
    file: "appearance_menu.rs · 948 lines",
    verdict: "rebuild",
    why: "Thorough, and honest about what it changes, but up to seven sliders, a hue strip and four switches across six groups. A knob board and a hue ring cover the core settings on one screen.",
  },
  {
    name: "Read-aloud player",
    file: "read_aloud/card.rs · control.rs · edges.rs",
    verdict: "refine",
    why: "Keep the streaming lyric card and its three sizes. In the Bar size, the pill sits over the last lines of the page in the repo's own shot, and its seek track is a short stub. Narrow panes drop speed and time first.",
  },
  {
    name: "Dictionary lookup card",
    file: "dict/card.rs · look.rs · bubble.rs",
    verdict: "keep",
    why: "The caret sits on the word, the card takes the side that has room, it never covers the word, and wheel flicks turn senses. Only the three icon-only header buttons need visible labels.",
  },
  {
    name: "Edge behaviour",
    file: "dict/window.rs · park.rs · reach.rs",
    verdict: "keep",
    why: "Folding the dictionary to a pill on the stage edge, and stepping aside for toasts and the player, is the best edge pattern in the app. The 20 pt peek is a small target, so give it a visible grip.",
  },
  {
    name: "Context menus",
    file: "library/menus.rs · page_ai/menu.rs",
    verdict: "rebuild",
    why: "Library menus are plain buttons with no icons or key hints. The AI menu is rich but long: a language submenu, result actions and a remember-my-choice row, all in one list.",
  },
  {
    name: "Controls and tokens",
    file: "widgets.rs · theme.rs · appearance/tokens.rs",
    verdict: "keep",
    why: "One helper per control and tokens that carry shape as well as colour. The kit below keeps that structure: one component per control, one look that drives them all.",
  },
];

function ReviewSection() {
  return (
    <Section
      id="review"
      title="Review"
      here="Verdicts come from reading the source and the repo's own screenshots. Keep: already works. Refine: the idea holds, a detail doesn't. Rebuild: the control has the wrong shape for the job."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {REVIEW.map((r) => (
          <div key={r.name} className="rounded-2xl border border-line bg-surface/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{r.name}</p>
                <p className="truncate text-[11.5px] text-muted">{r.file}</p>
              </div>
              <VerdictPill kind={r.verdict} />
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink/85">{r.why}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-2.5 md:grid-cols-2">
        <Note>
          The read-aloud Bar sits over the last lines of the page. Reserve a bottom inset for the player, as the live reader does.
        </Note>
        <Note>
          The main gap is icon-only controls: the view modes, the lookup header, and the player's More and Stop. Give each a caption or a visible label.
        </Note>
        <Note>
          Touch targets are small. The resize grips take the pointer 5 pt either side (edges.rs), and the parked peek is 20 pt. Both need larger hit areas for touch.
        </Note>
        <Note>
          The toast tones have no progress state, so a long job can only report when it ends. This kit adds a progress tone and a placement choice.
        </Note>
      </div>
      <Note tone="info">
        Not screenshotted from the Rust app: the shot tool needs a Rust toolchain this sandbox doesn't have. Every view here is rebuilt from the source, and the screenshots used for review are the repo's own.
      </Note>
    </Section>
  );
}

/* ---------- Foundations ---------- */

function FoundationsSection() {
  const { look } = useLook();
  const bases = Object.keys(BASES) as Base[];
  return (
    <Section
      id="foundations"
      title="Foundations"
      mareader="Four base modes and a tint, all from one token source (appearance/tokens.rs). Shape is a token too: radius, control size and shadow change with the theme."
      here="Every colour in this page is a live variable, so changing the look retints the whole kit. Radii step 8, 12, 16 and 24 px. Two shadows only: a pop for menus and a float for windows."
    >
      <div className="grid gap-3 md:grid-cols-4">
        {bases.map((b) => (
          <div key={b} className="overflow-hidden rounded-2xl border border-line">
            <div className="grid h-16 grid-cols-4">
              {[BASES[b].paper, BASES[b].surface, BASES[b].ink, BASES[b].accent].map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[13px] font-medium">{BASES[b].label}</span>
              <span className="text-[11px] tabular-nums text-muted">{BASES[b].paper}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Stage label="Type" meta={`Reading ${look.size} pt`}>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Interface · Inter</p>
          <p className="mt-1 text-[20px] font-semibold tracking-tight">Lookup, Read aloud, Keep</p>
          <p className="mt-1 text-[13px] text-muted">Labels 13 pt medium, captions 12 pt, key hints 10.5 pt.</p>
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Reading · Literata</p>
          <p className="reading mt-1">The answer reads a step larger than the interface, as on a page.</p>
        </Stage>
        <Stage label="Shape and elevation" meta="Radii 8 · 12 · 16 · 24">
          <div className="flex items-end gap-3">
            {[
              { r: "rounded-lg", s: "" },
              { r: "rounded-xl", s: "" },
              { r: "rounded-2xl", s: "shadow-pop" },
              { r: "rounded-3xl", s: "shadow-float" },
            ].map((x) => (
              <div key={x.r} className="flex flex-col items-center gap-1.5">
                <div className={cx("size-12 border border-line bg-paper-base", x.r, x.s)} />
                <span className="text-[10.5px] text-muted">{x.r.replace("rounded-", "")}</span>
              </div>
            ))}
          </div>
        </Stage>
      </div>
    </Section>
  );
}

/* ---------- Controls ---------- */

function ControlsSection() {
  const [dial, setDial] = useState(40);
  const [hue, setHue] = useState(200);
  const [seg, setSeg] = useState<"list" | "grid" | "tiles">("list");
  const [icon, setIcon] = useState<"book" | "search" | "palette">("book");
  const [strength, setStrength] = useState(55);
  const [keepBar, setKeepBar] = useState(true);
  return (
    <Section
      id="controls"
      title="Controls"
      verdict="keep"
      mareader="widgets.rs gives one helper per control: segments, switches, steppers, combos and icon buttons. The helpers are right, so the kit keeps their rules."
      here="Knobs join the set for tight spaces. Each one works by drag, scroll, arrow keys, Home and End, and double-click to reset. Captions can be hidden without losing the value."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Stage label="Knob" meta="Three sizes, one behaviour">
          <div className="flex items-end justify-around gap-3 py-2">
            <Knob size="sm" label="Small" value={dial} min={0} max={100} defaultValue={40} format={(v) => `${v}`} onChange={setDial} />
            <Knob size="md" label="Medium" value={dial} min={0} max={100} defaultValue={40} format={(v) => `${v}`} onChange={setDial} />
            <Knob size="lg" label="Large" value={dial} min={0} max={100} defaultValue={40} format={(v) => `${v}`} onChange={setDial} />
          </div>
        </Stage>
        <Stage label="Hue knob" meta="Turn the ring through the wheel">
          <div className="flex items-center justify-around gap-3 py-2">
            <Knob hue size="lg" label="Hue" value={hue} min={0} max={360} step={2} format={(v) => `${Math.round(v)}°`} onChange={setHue} />
            <Knob hue size="md" bare label="Hue" value={hue} min={0} max={360} step={2} onChange={setHue} />
            <Knob size="md" bare label="Strength" value={strength} min={0} max={100} format={(v) => `${v}%`} onChange={setStrength} />
          </div>
        </Stage>
        <Stage label="Segmented" meta="Labelled, icon-only, small">
          <div className="space-y-3">
            <Segmented
              full
              label="List style"
              value={seg}
              onChange={setSeg}
              options={[
                { value: "list", label: "List" },
                { value: "grid", label: "Grid" },
                { value: "tiles", label: "Tiles" },
              ]}
            />
            <div className="flex items-center gap-3">
              <Segmented
                iconOnly
                size="sm"
                label="Icon choice"
                value={icon}
                onChange={setIcon}
                options={[
                  { value: "book", label: "Book", icon: BookOpen },
                  { value: "search", label: "Search", icon: Search },
                  { value: "palette", label: "Look", icon: Palette },
                ]}
              />
              <span className="text-[12px] text-muted">Icon-only segments keep their label as a tooltip.</span>
            </div>
          </div>
        </Stage>
        <Stage label="Slider and switch" meta="Native inputs, drawn to the kit">
          <div className="space-y-4">
            <Slider label="Strength" min={0} max={100} value={strength} format={(v) => `${v}%`} onChange={setStrength} />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink">Keep title bar shown</span>
              <Switch label="Keep title bar shown" checked={keepBar} onChange={setKeepBar} />
            </div>
          </div>
        </Stage>
        <Stage label="Buttons and icons" meta="Four variants, two sizes">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Remove</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary" icon={Plus}>
                Add
              </Button>
              <Button size="sm" variant="soft" icon={Minus}>
                Less
              </Button>
              <IconButton label="Search" icon={Search} />
              <IconButton label="Appearance" icon={Palette} active />
              <IconButton label="Listen" icon={Headphones} size={28} />
            </div>
          </div>
        </Stage>
        <Stage label="Labels" meta="CEFR level, key hints, verdicts">
          <div className="flex flex-wrap items-center gap-2">
            <Level>B1</Level>
            <Level>C1</Level>
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>F11</Kbd>
            <VerdictPill kind="keep" />
            <VerdictPill kind="refine" />
            <VerdictPill kind="rebuild" />
          </div>
        </Stage>
      </div>
    </Section>
  );
}

/* ---------- Menus ---------- */

function MenusSection() {
  const [view, setView] = useState<ViewState>(VIEW_START);
  const set = (p: Partial<ViewState>) => setView((v) => ({ ...v, ...p }));
  const frame = "w-full max-w-[300px] rounded-2xl border border-line bg-surface p-2.5 shadow-pop";
  return (
    <Section
      id="menus"
      title="Menus"
      verdict="rebuild"
      mareader="View & tools is a 272 pt popover of nine rows and three headings. Its layout modes are icon cells. Context menus (library, AI, selection) are plain buttons."
      here="The same menu three ways, sharing one state. Grouped is the proposal: a segmented layout, a zoom stepper, toggle tiles, and a short footer. List is the dense version. Tiles is the icon-led one. Below, the context menus, which open at the pointer and flip at the edges."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Stage label="Grouped" meta="Proposed" padded={false}>
          <div className="p-4">
            <div className={frame}>
              <ViewMenu variant="grouped" value={view} onChange={set} />
            </div>
          </div>
        </Stage>
        <Stage label="List" meta="Dense" padded={false}>
          <div className="p-4">
            <div className={frame}>
              <ViewMenu variant="list" value={view} onChange={set} />
            </div>
          </div>
        </Stage>
        <Stage label="Tiles" meta="Icon-led" padded={false}>
          <div className="p-4">
            <div className={frame}>
              <ViewMenu variant="tiles" value={view} onChange={set} />
            </div>
          </div>
        </Stage>
      </div>
      <Stage label="Context menus" meta="Right-click, or Shift+F10 on a focused item">
        <ContextLab />
      </Stage>
    </Section>
  );
}

/* ---------- Appearance ---------- */

function AppearanceSection() {
  return (
    <Section
      id="appearance"
      title="Appearance"
      verdict="rebuild"
      mareader="The popover groups every setting into folds of sliders: text, presets, mode and colour, texture, grain, and split view. It is thorough, and long."
      here="Three ways to set the same look. Full keeps mareader's folds with the same controls. Knobs fit the core settings on one screen, with a hue ring. The strip is a single toolbar row. Every version drives the same look, so the page below changes as you turn them."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Stage label="Full" meta="Folds and sliders">
          <div className="flex justify-center">
            <AppearanceFull />
          </div>
        </Stage>
        <div className="space-y-4">
          <Stage label="Knobs" meta="One screen">
            <div className="flex justify-center">
              <AppearanceKnobs />
            </div>
          </Stage>
          <Stage label="Strip" meta="A toolbar row">
            <AppearanceStrip />
          </Stage>
        </div>
      </div>
      <Stage label="What it does to the page" meta="Live">
        <ReadingPreview />
      </Stage>
    </Section>
  );
}

/* ---------- Toasts ---------- */

const PLACEMENTS: SegOption<Placement>[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-center", label: "Bottom centre" },
  { value: "top-right", label: "Top right" },
];

function ToastsSection() {
  const toast = useToast();

  const importBooks = () => {
    const id = "import";
    toast.notify({ id, tone: "progress", title: "Importing 12 books", progress: 0 });
    let p = 0;
    const timer = window.setInterval(() => {
      p = Math.min(1, p + 0.1);
      if (p >= 1) {
        window.clearInterval(timer);
        toast.update(id, { tone: "success", title: "12 books imported", progress: undefined });
      } else {
        toast.update(id, { progress: p });
      }
    }, 420);
  };

  const fire: { label: string; run: () => void; variant: "soft" | "primary" | "ghost" }[] = [
    { label: "Info", variant: "soft", run: () => toast.notify({ title: "3 pages copied", body: "Pages 12–14 are on your clipboard" }) },
    {
      label: "Saved, with undo",
      variant: "soft",
      run: () =>
        toast.notify({
          tone: "success",
          title: "Highlight saved",
          action: { label: "Undo", run: () => toast.notify({ title: "Highlight removed" }) },
        }),
    },
    {
      label: "AI busy, retry",
      variant: "soft",
      run: () =>
        toast.notify({
          tone: "warning",
          title: "AI model is busy",
          body: "Using the local fallback for now",
          action: { label: "Retry" },
        }),
    },
    {
      label: "Couldn't open",
      variant: "soft",
      run: () =>
        toast.notify({ tone: "error", title: "“Pride and Prejudice.epub” isn’t where it was", action: { label: "Locate…" } }),
    },
    { label: "Import (progress)", variant: "primary", run: importBooks },
    {
      label: "Same error ×3",
      variant: "ghost",
      run: () => {
        for (let i = 0; i < 3; i++) toast.notify({ tone: "error", title: "Couldn't copy", body: "The clipboard is busy" });
      },
    },
  ];

  return (
    <Section
      id="toasts"
      title="Toasts"
      verdict="refine"
      mareader="A stack in the bottom-right corner, 360 pt wide. The newest is in front with two peeking behind. Repeats count up as ×N, a countdown line runs down, a swipe throws one away, and the stack steps aside during a page drag. The logic is good; there's no progress tone."
      here="The same stack, plus progress, placement, and a list that opens from the pile. Fire these to see it: repeats pile into ×N, the import shows a bar and then becomes a success, and Show all opens the list."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Stage label="Fire one" meta="Live, in the corner">
          <div className="space-y-4">
            <Segmented size="sm" full label="Placement" value={toast.placement} onChange={toast.setPlacement} options={PLACEMENTS} />
            <div className="grid grid-cols-2 gap-2">
              {fire.map((f) => (
                <Button key={f.label} variant={f.variant} size="sm" onClick={f.run} className="justify-start">
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </Stage>
        <Stage label="Anatomy" meta="Static, one per tone">
          <div className="mx-auto flex w-full max-w-[340px] flex-col gap-2.5">
            <ToastFace tone="info" title="3 pages copied" body="Pages 12–14 are on your clipboard" pct={70} />
            <ToastFace tone="success" title="Highlight saved" action={{ label: "Undo" }} pct={45} />
            <ToastFace tone="warning" title="AI model is busy" body="Using the local fallback" action={{ label: "Retry" }} />
            <ToastFace tone="error" title="Couldn't open the book" body="It was moved or deleted" action={{ label: "Locate…" }} />
            <ToastFace tone="progress" title="Importing 12 books" progress={0.42} />
            <ToastFace tone="info" title="Couldn't copy" body="The clipboard is busy" count={3} />
          </div>
        </Stage>
      </div>
    </Section>
  );
}

/* ---------- Read-aloud player ---------- */

const EDGES: SegOption<"bottom" | "right" | "left">[] = [
  { value: "bottom", label: "Bottom" },
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
];

function PlayerSection() {
  const bar = usePlayback(0.12);
  const compact = usePlayback(0.45);
  const card = usePlayback(0.3);
  const parked = usePlayback(0.2);
  const [edge, setEdge] = useState<"bottom" | "right" | "left">("bottom");
  return (
    <Section
      id="player"
      title="Read-aloud player"
      verdict="refine"
      mareader="Three sizes: a bar, a compact bar with a streaming line, and a full card with cover and lyrics. A narrow pane drops speed, then time, then shortens the seek track. Panels can rest partly beyond a stage edge (park.rs)."
      here="The same three sizes, live, with the mareader options as controls. The bar keeps its time and speed. The card turns the options into a highlight segment and a speed knob. The parked player rests on an edge with a 20 pt peek and a grip. A 36-second clip stands in for a chapter."
    >
      <Stage label="Bar" meta="Transport, seek, time left, speed">
        <div className="flex justify-center py-3">
          <PlayerBar pb={bar} />
        </div>
      </Stage>
      <Stage label="Compact" meta="The bar, with a streaming line">
        <div className="flex justify-center py-2">
          <CompactPlayer pb={compact} />
        </div>
      </Stage>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Stage label="Card" meta="Cover, lyrics and options">
          <div className="flex justify-center py-2">
            <CardPlayer pb={card} />
          </div>
        </Stage>
        <Stage label="Parked at an edge" meta="Hover to slide it in">
          <div className="mb-3">
            <Segmented size="sm" label="Edge" value={edge} onChange={setEdge} options={EDGES} />
          </div>
          <div className="relative h-[230px] overflow-hidden rounded-xl bg-surface/60">
            <ParkedPlayer pb={parked} edge={edge} />
          </div>
        </Stage>
      </div>
      <Note>
        The Bar sits over the page, so the page keeps its last line under it. Reserve a bottom inset while the player is open, as the live reader does, or dock it into its own row.
      </Note>
    </Section>
  );
}

/* ---------- Dictionary card ---------- */

function DictionarySection() {
  return (
    <Section
      id="dictionary"
      title="Dictionary card"
      verdict="keep"
      mareader="The lookup card is anchored: its caret sits on the word, it takes the side with room, it never covers the word, and wheel flicks turn senses. The dictionary window can fold to a pill at the edge."
      here="The lab keeps all of that, and adds one thing: a narrow stage turns the card into a sheet. Card and Compact are shown below, with working pagers."
    >
      <Stage label="Lab" meta="Tap a shaded word" padded={false}>
        <div className="p-5">
          <DictionaryLab />
        </div>
      </Stage>
      <div className="grid gap-4 md:grid-cols-2">
        <Stage label="Card" meta="Header, answer, pager">
          <div className="flex justify-center">
            <div className="w-[320px]">
              <LookupCard entry={DICT.acknowledged} variant="card" />
            </div>
          </div>
        </Stage>
        <Stage label="Compact" meta="One line of answer for quick checks">
          <div className="flex justify-center">
            <div className="w-[252px]">
              <LookupCard entry={DICT.fortune} variant="compact" />
            </div>
          </div>
        </Stage>
      </div>
      <Note>
        The three header buttons (speak, open in the dictionary, close) are icons with tooltips only. Tooltips don't show on touch, so give Speak and Open a text label in the footer.
      </Note>
    </Section>
  );
}

export { cx };
