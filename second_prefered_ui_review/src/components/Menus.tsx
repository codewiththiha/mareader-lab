import { useState } from "react";
import { Square, Columns2, GalleryVertical, GalleryHorizontal, ZoomIn, ZoomOut, Maximize2, Minimize, Headphones, ArrowDownToLine, Pin, Settings, Keyboard, Copy, Sparkles, BookA, StickyNote, Highlighter, Underline, FolderPlus, Import, Pencil, Library, Trash2, Download, ChevronDown, Bookmark, MoveUp, Check, EyeOff } from "lucide-react";
import { clsx } from "clsx";
import { Compare, Finding, Findings, Kbd, PageText, Section, Stage } from "../lib/ui";

/** widgets::switch — 36×20, knob 8 r white, track `track` → accent. */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="relative h-[20px] w-[36px] shrink-0 rounded-full transition-colors" style={{ background: on ? "var(--accent)" : "var(--track)" }}>
      <span className="absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.11)] transition-[left]" style={{ left: on ? 18 : 2 }} />
    </button>
  );
}

const MenuRow = ({ icon, label, keys, on, danger, right }: { icon: React.ReactNode; label: string; keys?: string; on?: boolean; danger?: boolean; right?: React.ReactNode }) => (
  <button className={clsx("flex h-[32px] w-full items-center gap-2 rounded-[8px] px-[10px] text-left text-[14px] hover:bg-[var(--hover)]", on && "bg-[var(--selected)]")} style={{ color: danger ? "var(--danger)" : on ? "var(--accent)" : "var(--ink)" }}>
    <span className="grid w-4 place-items-center">{icon}</span>
    <span className="flex-1">{label}</span>
    {right ?? (keys && <span className="text-[12px] muted">{keys}</span>)}
  </button>
);
const Note = ({ children }: { children: React.ReactNode }) => <div className="px-[10px] py-[2px] text-[12px] muted">{children}</div>;
const Sep = () => <div className="hairline my-1" />;

const MODES = [{ i: <Square size={16} />, s: "Single" }, { i: <Columns2 size={16} />, s: "Spread" }, { i: <GalleryVertical size={16} />, s: "Scroll" }, { i: <GalleryHorizontal size={16} />, s: "Across" }];

function CurrentViewMenu() {
  const [mode, setMode] = useState(1);
  return (
    <div className="w-[272px] rounded-[12px] border border-line bg-surface p-1 shadow-pop">
      <Note>Layout</Note>
      <div className="flex h-[46px] px-1">{MODES.map((m, i) => <button key={m.s} onClick={() => setMode(i)} className={clsx("flex flex-1 flex-col items-center justify-center gap-[3px] rounded-[8px] text-[11px]", i === mode ? "bg-[var(--selected)]" : "hover:bg-[var(--hover)]")} style={{ color: i === mode ? "var(--accent)" : "var(--ink)" }}>{m.i}{m.s}</button>)}</div>
      <Note>Zoom</Note>
      <div className="flex items-center px-1"><button className="tb"><ZoomOut size={18} /></button><span className="w-[52px] text-center text-[12px] ink">100%</span><button className="tb"><ZoomIn size={18} /></button><span className="flex-1" /><button className="tb"><Maximize2 size={18} /></button><button className="tb on"><Minimize size={18} /></button></div>
      <Note>Reading</Note>
      <MenuRow icon={<ArrowDownToLine size={16} />} label="Auto-scroll" keys="⌘⇧S" />
      <MenuRow icon={<Headphones size={16} />} label="Read aloud" keys="⌘⇧R" />
      <MenuRow icon={<Maximize2 size={16} />} label="Full screen" keys="⌃⌘F" />
      <MenuRow icon={<EyeOff size={16} />} label="Distraction-free" keys="⌘." />
      <MenuRow icon={<Pin size={16} />} label="Keep title bar shown" on />
      <Sep />
      <MenuRow icon={<Settings size={16} />} label="Settings" keys="⌘," />
      <MenuRow icon={<Keyboard size={16} />} label="Keyboard shortcuts" keys="⌘/" />
      <Sep />
      <Note>Mareader 0.9.0</Note>
    </div>
  );
}

function ProposedViewMenu() {
  const [mode, setMode] = useState(1);
  const [auto, setAuto] = useState(false);
  const [pin, setPin] = useState(true);
  return (
    <div className="w-[272px] rounded-[12px] border border-line bg-surface p-1 shadow-pop">
      <div className="m-1 rounded-[8px] bg-[var(--card)] p-1">
        <div className="flex h-[44px]">{MODES.map((m, i) => <button key={m.s} onClick={() => setMode(i)} className={clsx("flex flex-1 flex-col items-center justify-center gap-[3px] rounded-[6px] text-[11px]", i === mode ? "bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,.1)]" : "hover:bg-[var(--hover)]")} style={{ color: i === mode ? "var(--accent)" : "var(--ink)" }}>{m.i}{m.s}</button>)}</div>
        <div className="mt-1 flex h-[30px] items-center gap-1 rounded-[6px] border border-line bg-[var(--surface)] px-1">
          <button className="sb"><ZoomOut size={14} /></button>
          <button className="flex-1 rounded-[5px] text-center text-[12.5px] font-medium tabular-nums ink hover:bg-[var(--hover)]" title="Reset to 100 %">100%</button>
          <button className="sb"><ZoomIn size={14} /></button>
          <span className="mx-1 h-4 w-px bg-[var(--line)]" />
          <button className="h-[22px] rounded-[5px] px-2 text-[12px] ink hover:bg-[var(--hover)]">Page</button>
          <button className="h-[22px] rounded-[5px] px-2 text-[12px] font-medium" style={{ background: "var(--selected)", color: "var(--accent)" }}>Width</button>
        </div>
      </div>
      <MenuRow icon={<ArrowDownToLine size={16} />} label="Auto-scroll" right={<span className="flex items-center gap-2"><Kbd>⌘⇧S</Kbd><Switch on={auto} onChange={setAuto} label="Auto-scroll" /></span>} />
      <MenuRow icon={<Headphones size={16} />} label="Read aloud" right={<Kbd>⌘⇧R</Kbd>} />
      <MenuRow icon={<Pin size={16} />} label="Keep title bar shown" right={<Switch on={pin} onChange={setPin} label="Keep title bar shown" />} />
      <Sep />
      <MenuRow icon={<Maximize2 size={16} />} label="Full screen" right={<Kbd>⌃⌘F</Kbd>} />
      <MenuRow icon={<EyeOff size={16} />} label="Distraction-free" right={<Kbd>⌘.</Kbd>} />
      <Sep />
      <MenuRow icon={<Settings size={16} />} label="Settings…" right={<Kbd>⌘,</Kbd>} />
      <MenuRow icon={<Keyboard size={16} />} label="Keyboard shortcuts" right={<Kbd>⌘/</Kbd>} />
      <div className="flex items-center justify-between px-[10px] pb-1 pt-2 text-[11px] muted"><span>Mareader 0.9.0</span><span className="text-[var(--accent)]">What's new</span></div>
    </div>
  );
}

/** study/bar.rs: icon-only 36 pt buttons, margin 4, item gap 2, vrule between actions and pens. */
function SelectionBar({ proposed }: { proposed?: boolean }) {
  const pens = [{ i: <Highlighter size={18} />, c: "#facc15" }, { i: <Highlighter size={18} className="opacity-60" />, c: "#86efac" }, { i: <Underline size={18} />, c: "#60a5fa" }];
  return (
    <div className="relative inline-flex items-center rounded-[12px] border border-line bg-surface p-1 shadow-pop" style={{ gap: 2 }}>
      <span className="absolute left-[40px] -bottom-[6px] h-[11px] w-[11px] rotate-45 border-b border-r border-line bg-surface" />
      {proposed ? (
        <>
          <button className="tb" aria-label="Copy"><Copy size={18} /></button>
          <button className="inline-flex h-[36px] items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium ink hover:bg-[var(--hover)]"><BookA size={16} />Look up</button>
          <button className="inline-flex h-[36px] items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium hover:bg-[var(--hover)]" style={{ color: "var(--accent)" }}><Sparkles size={16} />Explain</button>
          <span className="mx-1 h-5 w-px bg-[var(--line)]" />
          {pens.map((p, i) => <button key={i} className="relative grid h-[36px] w-[30px] place-items-center rounded-[8px] hover:bg-[var(--hover)]"><span className="h-[18px] w-[18px] rounded-full border-2 border-[var(--surface)] shadow-[0_0_0_1px_var(--line)]" style={{ background: p.c }} />{i === 2 && <span className="absolute inset-x-[7px] bottom-[6px] h-[2px] rounded" style={{ background: p.c }} />}</button>)}
          <span className="mx-1 h-5 w-px bg-[var(--line)]" />
          <button className="tb" aria-label="Note"><StickyNote size={18} /></button>
          <button className="tb" aria-label="Read aloud from here"><Headphones size={18} /></button>
        </>
      ) : (
        <>
          <button className="tb" aria-label="Copy"><Copy size={18} /></button>
          <button className="tb" aria-label="AI Dictionary"><Sparkles size={18} /></button>
          <button className="tb" aria-label="Look up"><BookA size={18} /></button>
          <button className="tb" aria-label="Note"><StickyNote size={18} /></button>
          <button className="tb" aria-label="Read aloud"><Headphones size={18} /></button>
          <span className="mx-1 h-5 w-px bg-[var(--line)]" />
          {pens.map((p, i) => <button key={i} className="tb relative">{p.i}<span className="absolute bottom-[5px] left-1/2 h-[2.5px] w-[14px] -translate-x-1/2 rounded-[1px]" style={{ background: p.c }} /></button>)}
        </>
      )}
    </div>
  );
}

function ContextMenu({ proposed }: { proposed?: boolean }) {
  return (
    <div className="w-[200px] rounded-[12px] border border-line bg-surface p-1 shadow-pop">
      {proposed && <div className="px-[10px] pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide muted">Classics · 8 books</div>}
      <MenuRow icon={<FolderPlus size={16} />} label="New shelf inside" />
      <MenuRow icon={<Import size={16} />} label="Import books here…" />
      <Sep />
      <MenuRow icon={<Pencil size={16} />} label="Rename" keys="F2" right={proposed ? <Kbd>F2</Kbd> : undefined} />
      <MenuRow icon={<MoveUp size={16} />} label="Move to Library" />
      <MenuRow icon={<Library size={16} />} label="Show in Library" />
      {proposed && <><Sep /><MenuRow icon={<Trash2 size={16} />} label="Delete shelf…" danger /></>}
    </div>
  );
}

function PagePill({ proposed }: { proposed?: boolean }) {
  const [hot, setHot] = useState(false);
  if (!proposed) return <div className="rounded-full px-[10px] py-[4px] text-[12px] tabular-nums ink" style={{ background: "var(--glass)", border: "1px solid var(--line)" }}>14 / 234</div>;
  return (
    <div onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)} className="flex items-center gap-2 rounded-full px-[8px] py-[3px] text-[12px] tabular-nums ink transition-all" style={{ background: "var(--glass)", border: "1px solid var(--line)" }}>
      <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--track)" strokeWidth="2" /><circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray={`${0.06 * 34.6} 40`} strokeLinecap="round" transform="rotate(-90 7 7)" /></svg>
      <span>14 <span className="muted">of</span> 234</span>
      {hot && <span className="muted">· Chapter 6 · 14h left</span>}
    </div>
  );
}

function EngineRows({ proposed }: { proposed?: boolean }) {
  const rows = [
    { n: "System voices", d: "Built into your system", on: true },
    { n: "Kokoro", d: "7 languages · 49 voices", build: "Full", size: "347.9 MB" },
    { n: "Piper", d: "English · 8 voices", size: "83.7 MB" },
    { n: "Kitten", d: "English · 8 voices", build: "Mini", size: "92.2 MB", progress: 0.42 },
  ];
  return (
    <div className="w-full max-w-[520px] rounded-[12px] border border-line bg-card">
      {rows.map((r, i) => (
        <div key={r.n} className={clsx("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line")}>
          <div className="min-w-0 flex-1"><div className="text-[15px] ink">{r.n}</div><div className="text-[13px] muted">{r.d}</div>
            {proposed && r.progress != null && <div className="mt-1.5 h-[3px] w-full max-w-[220px] rounded-full bg-[var(--track)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${r.progress * 100}%` }} /></div>}
          </div>
          {r.build && <button className="inline-flex items-center gap-1 text-[14px] ink">{r.build}<ChevronDown size={14} className="muted" /></button>}
          {proposed ? (
            r.on ? <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] font-semibold" style={{ background: "var(--selected)", color: "var(--accent)" }}><Check size={12} />In use</span>
              : r.progress != null ? <span className="text-[12.5px] tabular-nums muted">{Math.round(r.progress * 100)}% · 38 MB left</span>
                : <button className="inline-flex h-[28px] items-center gap-1.5 rounded-[8px] border border-line px-2.5 text-[13px] font-medium ink hover:bg-[var(--hover)]"><Download size={14} />Get <span className="muted">· {r.size}</span></button>
          ) : (
            <>{r.size && <span className="text-[14px] muted">{r.size}</span>}{r.on ? <span className="grid h-5 w-5 place-items-center rounded-full border-2" style={{ borderColor: "var(--accent)" }}><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} /></span> : <Download size={18} className="ink" />}</>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Menus() {
  const [sw, setSw] = useState([true, false, true]);
  return (
    <>
      <Section id="menus" title="View & tools menu" source="crates/ui/src/view_menu.rs · widgets.rs (menu_row, menu_switch, menu_note)" verdict="polish"
        summary="A 272 pt popup with three headed groups: a 46 pt view-mode band, a zoom row, and reading rows; then settings and shortcuts. It is tidy. The toggles are the inconsistency: `menu_switch` exists in widgets.rs, yet the menu marks Auto-scroll and Keep title bar shown with a selected fill on a plain row, which looks like a current-page highlight, not a state.">
        <Compare current={<div className="p-4"><CurrentViewMenu /></div>} proposed={<div className="p-4"><ProposedViewMenu /></div>}
          currentNote="Headings via `menu_note` (12 pt muted), rows 32 pt with 16 pt icons, shortcut hint in muted small on the right. Fit page/width are 36 pt icon buttons at the row's end — two unlabelled icons for the two things people hunt for."
          proposedNote="Layout and zoom share one card so the menu reads as controls-then-commands. Fit page / Fit width are words. Toggles use the switch the codebase already has; shortcuts become keycaps, which align without a column." />
        <Findings>
          <Finding kind="ok">Headings lined up with the rows' icons (design.md “menu notes indent by the button padding”), the view band staying open on click so modes can be compared, and folded title-bar tools appearing here when the bar is narrow are right.</Finding>
          <Finding kind="bug">`pin_row` and `auto_scroll_row` pass `on` to `menu_row`, which paints `selected` on the whole row. Rows elsewhere use the same fill for “the current item”. `widgets::menu_switch` already draws the row with a trailing switch; use it.</Finding>
          <Finding kind="idea">A version string as the last line of a menu is dead space; it is also where “What's new” belongs after an update.</Finding>
        </Findings>
      </Section>

      <Section id="selection" title="Selection bar" source="crates/ui/src/study/bar.rs · bubble.rs" verdict="redesign"
        summary="The bubble (caret, above by default, snug width) is right. The content is still five identical 36 pt icon buttons: Copy, AI, Look up, Note, Read aloud, then the pens. ux-audit.md §2.2 already decided “Make Look up and Explain text buttons, keep the pens as swatches” — bar.rs has not caught up: every item goes through `action()`, icon only.">
        <Compare current={<div className="p-6"><div className="max-w-[460px]"><PageText /></div><div className="absolute left-6 top-[14px]"><SelectionBar /></div></div>}
          proposed={<div className="p-6"><div className="max-w-[460px]"><PageText /></div><div className="absolute left-6 top-[14px]"><SelectionBar proposed /></div></div>}
          currentNote="Eight glyphs, one weight. The AI button's tooltip says “AI Dictionary” while the command is `Explain` — two names for one action. Pen colour is a 14 × 2.5 pt strip under a generic highlighter glyph."
          proposedNote="Copy stays a glyph (universal). Look up and Explain are words, Explain in accent since it is the AI action. Pens are the colour itself (a swatch is faster to pick than a glyph plus a strip; Underline keeps a bar under its swatch). Note and Read aloud, used least, go last." />
        <Findings>
          <Finding kind="bug">Icon-only Explain/Look up (NN/g rule the project itself cites). Fix is in the audit; the code is not there yet.</Finding>
          <Finding kind="idea">`PickColor::EveryTime` opens a second row of swatches under the bar. With swatches already in the bar, a long-press on a swatch can open its alternatives, and one tap applies the shown colour.</Finding>
        </Findings>
      </Section>

      <Section id="context" title="Context menus, switch, segments, page pill" source="library_panel.rs · widgets.rs · page_bar.rs" verdict="keep"
        summary="Stock egui menus restyled by one `apply`: 32 pt rows, 16 pt icons, radius 8 hover in `line`. The switch (36×20, white knob with a 28-alpha edge in light looks, track 22 % toward ink when off) and the segmented track with a sliding thumb are good as they are. Only small notes.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Stage label="Context menu · as shipped / with a scope line and the destructive row" tone="plain" className="!min-h-0">
            <div className="flex flex-wrap gap-8 p-5"><ContextMenu /><ContextMenu proposed /></div>
          </Stage>
          <Stage label="Switch, segments, page pill" tone="plain" className="!min-h-0">
            <div className="space-y-5 p-5">
              <div className="flex items-center gap-6">{["Theme per pane", "Texture per pane", "Progress bar"].map((l, i) => <label key={l} className="flex items-center gap-2 text-[13px] ink"><Switch on={sw[i]} onChange={(v) => setSw((s) => s.map((x, k) => (k === i ? v : x)))} label={l} />{l}</label>)}</div>
              <div className="flex items-center gap-4"><PagePill /><PagePill proposed /><span className="text-[12px] muted">← as shipped · proposed (hover it)</span></div>
              <div className="flex items-center gap-3 text-[12px] muted"><Bookmark size={14} />The page bar's bookmark, slider and entry field stay as they are; they already appear only on the pane's bottom 8 pt.</div>
            </div>
          </Stage>
        </div>
        <Findings>
          <Finding kind="ok">One menu row helper, one switch, one segments helper, with Clippy forbidding raw `egui::ComboBox` so the triangle never comes back. This is how a small team keeps a design system honest.</Finding>
          <Finding kind="idea">A shelf's context menu has no destructive row and no name; a “Classics · 8 books” scope line removes the “which shelf did I right-click?” doubt in a dense tree, and Delete belongs at the end in `danger`, after a separator.</Finding>
          <Finding kind="idea">The page pill “14 / 234” is a dark glass slab (ux-audit 5.3 noted it). A 14 pt progress ring and “of” instead of “/” make it read as progress rather than a fraction; on hover it can say the chapter and the time left that the player already computes.</Finding>
        </Findings>
      </Section>

      <Section id="settings" title="Settings window rows" source="settings_window.rs · settings_window/read_aloud.rs · settings_window/models.rs" verdict="polish"
        summary="The settings window follows the focused pane through one `Applies` rule, which is the right architecture. The voice-engine rows are where the “icons need labels” rule is broken by the project itself: a bare download glyph with a size beside it, and a radio on the right for the engine in use.">
        <Compare current={<div className="p-5"><EngineRows /></div>} proposed={<div className="p-5"><EngineRows proposed /></div>}
          currentNote="System voices chosen by a radio at the row's end; Kokoro and Kitten carry a build combo; the others a size and a download arrow. Nothing shows a download in progress except, presumably, a toast."
          proposedNote="“In use” as a chip in accent; “Get · 347.9 MB” as a bordered button so size and action are one target; a 3 pt progress line under the description while a model downloads, with “42 % · 38 MB left” where the button was." />
        <Findings>
          <Finding kind="ok">Group cards in `card` (paper washed 18 % to accent-soft), `Rows` drawing dividers only between rows actually drawn, and the model card with its left accent bar and task chips (“AI Dictionary”, “Library”, “+3”) are clear and economical. Keep.</Finding>
          <Finding kind="bug">A radio button at the right end of a row with a chevron combo at the right end of the next row puts two different control shapes in one column. The engine in use is a state, not a choice among radios: say it with words.</Finding>
          <Finding kind="idea">`Full ⌄ 347.9 MB` reads as three separate things; keep the build combo but move the size into the download button it changes.</Finding>
        </Findings>
      </Section>
    </>
  );
}
