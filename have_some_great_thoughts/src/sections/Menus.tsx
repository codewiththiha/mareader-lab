import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  FileText,
  FolderPlus,
  Fullscreen,
  Headphones,
  Highlighter,
  Keyboard,
  Maximize,
  MoreHorizontal,
  MousePointer2,
  PenTool,
  Pin,
  Pencil,
  Settings,
  Sparkles,
  StickyNote,
  TextSearch,
  Trash2,
  Underline,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  Square,
  Columns2,
  ScrollText,
  GalleryHorizontal,
  EyeOff,
  ArrowDownToLine,
  Files,
  Undo2,
} from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { IconButton, Kbd, MenuNote, MenuRow, Rule, Segmented, Surface, Tip } from "../ui/kit";
import { cn } from "../utils/cn";

/* ═════════ TODAY — view_menu.rs (WIDTH 272, rows 32, view cells 46) ═════════ */
const MODES = [
  { id: "single", short: "Single", icon: Square, label: "Single page" },
  { id: "spread", short: "Two pages", icon: Columns2, label: "Two-page spread" },
  { id: "vertical", short: "Vertical", icon: ScrollText, label: "Vertical scroll" },
  { id: "horizontal", short: "Horizontal", icon: GalleryHorizontal, label: "Horizontal scroll" },
] as const;
type Mode = (typeof MODES)[number]["id"];

export function TodayViewMenu() {
  const [mode, setMode] = useState<Mode>("spread");
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState<"page" | "width" | null>("page");
  const [auto, setAuto] = useState(false);
  const [aloud, setAloud] = useState(true);
  const [pin, setPin] = useState(false);
  return (
    <Surface className="w-[272px] p-1.5">
      <div className="flex flex-col gap-0.5">
        <MenuNote>Layout</MenuNote>
        <div className="flex px-1">
          {MODES.map((m) => {
            const on = m.id === mode;
            return (
              <Tip key={m.id} label={m.label} className="flex-1 [&>button]:w-full">
                <button onClick={() => setMode(m.id)} aria-pressed={on} className={cn("m-px flex h-11 flex-col items-center justify-center gap-0.5 rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50", on ? "bg-accent-soft text-accent" : "hover:bg-hover")}>
                  <m.icon size={16} strokeWidth={1.75} />
                  <span className="text-[11px] leading-none">{m.short}</span>
                </button>
              </Tip>
            );
          })}
        </div>
        <MenuNote>Zoom</MenuNote>
        <div className="flex items-center px-1">
          <IconButton icon={ZoomOut} label="Zoom out" keys="Ctrl+−" size="md" onClick={() => { setZoom((z) => Math.max(25, z - 25)); setFit(null); }} />
          <span className="w-[52px] text-center text-[12px]">{zoom}%</span>
          <IconButton icon={ZoomIn} label="Zoom in" keys="Ctrl++" size="md" onClick={() => { setZoom((z) => Math.min(400, z + 25)); setFit(null); }} />
          <span className="flex-1" />
          <IconButton icon={MoveHorizontal} label="Fit width" size="md" active={fit === "width"} onClick={() => setFit("width")} />
          <IconButton icon={Fullscreen} label="Fit page" size="md" active={fit === "page"} onClick={() => setFit("page")} />
        </div>
        <MenuNote>Reading</MenuNote>
        <MenuRow icon={ArrowDownToLine} label="Auto-scroll" keys="Shift+A" on={auto} onClick={() => setAuto((a) => !a)} />
        <MenuRow icon={Headphones} label={aloud ? "Stop reading aloud" : "Read aloud"} keys="Ctrl+Shift+U" on={aloud} onClick={() => setAloud((a) => !a)} />
        <MenuRow icon={Maximize} label="Full screen" keys="F11" />
        <MenuRow icon={EyeOff} label="Distraction-free" keys="Ctrl+Shift+F" />
        <MenuRow icon={Pin} label="Keep title bar shown" on={pin} onClick={() => setPin((p) => !p)} />
        <Rule />
        <MenuRow icon={Settings} label="Settings" keys="Ctrl+," />
        <MenuRow icon={Keyboard} label="Keyboard shortcuts" keys="Ctrl+/" />
        <Rule />
        <div className="pt-0.5"><MenuNote>Mareader 0.4.0</MenuNote></div>
      </div>
    </Surface>
  );
}

/* ═════════ PROPOSED — Control centre ═════════ */
function Tile({ icon: Icon, label, keys, on, onClick }: { icon: typeof Pin; label: string; keys?: string; on?: boolean; onClick?: () => void }) {
  return (
    <Tip label={label} keys={keys} className="[&>button]:w-full">
      <button
        onClick={onClick}
        aria-pressed={on === undefined ? undefined : on}
        className={cn("group relative flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2 text-left text-[12.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50", on ? "border-accent/40 bg-accent-soft font-medium text-accent" : "border-line hover:bg-hover")}
      >
        <Icon size={16} strokeWidth={1.75} className="shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        {on !== undefined && <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{on ? "On" : ""}</span>}
      </button>
    </Tip>
  );
}

export function ControlCentre() {
  const [mode, setMode] = useState<Mode>("spread");
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState<"page" | "width" | null>("page");
  const [auto, setAuto] = useState(false);
  const [aloud, setAloud] = useState(true);
  const [pin, setPin] = useState(false);
  const current = MODES.find((m) => m.id === mode)!;
  return (
    <Surface className="w-[288px] p-2.5">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between px-0.5"><span className="text-[12px] text-muted">Layout</span><span className="text-[12px]">{current.label}</span></div>
          <Segmented<Mode> height={34} iconOnly items={MODES.map((m) => ({ value: m.id, icon: m.icon, label: m.label, tip: m.label }))} value={mode} onChange={setMode} ariaLabel="Layout" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex h-9 flex-1 items-center rounded-lg border border-line">
            <IconButton icon={ZoomOut} label="Zoom out" keys="Ctrl+−" size="md" onClick={() => { setZoom((z) => Math.max(25, z - 25)); setFit(null); }} />
            <Tip label="Reset to 100%" className="flex-1 [&>button]:w-full">
              <button onClick={() => { setZoom(100); setFit(null); }} className="h-8 text-[13px] font-medium tabular-nums outline-none hover:text-accent">{zoom}%</button>
            </Tip>
            <IconButton icon={ZoomIn} label="Zoom in" keys="Ctrl++" size="md" onClick={() => { setZoom((z) => Math.min(400, z + 25)); setFit(null); }} />
          </div>
          <Segmented<"width" | "page"> height={36} iconOnly className="w-[84px]" items={[{ value: "width", icon: MoveHorizontal, tip: "Fit width" }, { value: "page", icon: Fullscreen, tip: "Fit page" }]} value={fit ?? ("none" as "page")} onChange={(v) => setFit(v)} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Tile icon={ArrowDownToLine} label="Auto-scroll" keys="Shift+A" on={auto} onClick={() => setAuto((a) => !a)} />
          <Tile icon={Headphones} label="Read aloud" keys="Ctrl+Shift+U" on={aloud} onClick={() => setAloud((a) => !a)} />
          <Tile icon={Maximize} label="Full screen" keys="F11" />
          <Tile icon={EyeOff} label="Focus mode" keys="Ctrl+Shift+F — Distraction-free" />
          <Tile icon={Pin} label="Pin title bar" on={pin} onClick={() => setPin((p) => !p)} />
          <Tile icon={Settings} label="Settings" keys="Ctrl+," />
        </div>
        <div className="-mx-0.5 flex items-center justify-between border-t border-line pt-2 text-[12px] text-muted">
          <button className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-hover hover:text-ink"><Keyboard size={13} />Shortcuts <Kbd>Ctrl /</Kbd></button>
          <span>0.4.0</span>
        </div>
      </div>
    </Surface>
  );
}

/* ═════════ Context menu — library/menus.rs uses plain `ui.button`; View menu uses `menu_row` ═════════ */
function PlainButton({ children, danger, dim }: { children: ReactNode; danger?: boolean; dim?: boolean }) {
  return (
    <button className={cn("block w-full rounded-lg px-2.5 py-[5px] text-left text-[14px] hover:bg-hover", danger ? "text-danger" : "text-ink", dim && "opacity-40")}>{children}</button>
  );
}
export function TodayContextMenu() {
  return (
    <Surface className="w-[168px] p-1.5">
      <PlainButton>Open</PlainButton>
      <PlainButton>Select</PlainButton>
      <PlainButton>Rename…</PlainButton>
      <PlainButton>Duplicate</PlainButton>
      <PlainButton>Read separately</PlainButton>
      <PlainButton>Show in folder</PlainButton>
      <Rule />
      <PlainButton danger>Remove from library</PlainButton>
    </Surface>
  );
}

export function ProposedContextMenu() {
  const [confirm, setConfirm] = useState(false);
  const [removed, setRemoved] = useState(false);
  if (removed)
    return (
      <Surface className="flex w-[236px] items-center gap-2 p-2.5 text-[13px]">
        <Check size={15} className="text-accent" />
        <span className="flex-1">Removed from library</span>
        <button onClick={() => { setRemoved(false); setConfirm(false); }} className="flex items-center gap-1 rounded-md px-2 py-1 font-medium text-accent hover:bg-accent-soft"><Undo2 size={13} />Undo</button>
      </Surface>
    );
  return (
    <Surface className="w-[236px] p-1.5">
      <div className="mb-1 flex items-center gap-2.5 rounded-lg bg-card/70 p-2">
        <span className="grid h-10 w-7 shrink-0 place-items-center rounded-[3px] bg-white text-[5px] font-bold leading-none text-black/70 shadow">PP</span>
        <div className="min-w-0 leading-tight"><div className="truncate text-[13px] font-medium">Pride and Prejudice</div><div className="text-[11.5px] text-muted">PDF · 234 pages · 6 %</div></div>
      </div>
      <MenuRow icon={BookOpen} label="Open" keys="↵" />
      <MenuRow icon={MousePointer2} label="Select" />
      <MenuRow icon={Pencil} label="Rename…" keys="F2" />
      <MenuRow icon={Files} label="Duplicate" />
      <MenuRow icon={FolderPlus} label="Add to shelf" trailing={<ChevronRight size={14} className="text-muted" />} />
      <MenuRow icon={FileText} label="Read separately" />
      <Rule />
      {confirm ? (
        <div className="pop-in flex items-center gap-1 rounded-lg bg-danger/10 p-1 pl-2.5 text-[13px] text-danger">
          <span className="flex-1">Remove this book?</span>
          <button onClick={() => setConfirm(false)} className="rounded-md px-2 py-1 text-ink hover:bg-hover">Cancel</button>
          <button onClick={() => setRemoved(true)} className="rounded-md bg-danger px-2 py-1 font-medium text-white">Remove</button>
        </div>
      ) : (
        <MenuRow icon={Trash2} label="Remove from library" danger keys="⌫" onClick={() => setConfirm(true)} />
      )}
    </Surface>
  );
}

/* ═════════ Selection bar — study/bar.rs ═════════ */
const COLOURS = ["#fde047", "#86efac", "#7dd3fc", "#f9a8d4", "#fdba74"];
function SelLine({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 pt-10 pb-6 text-center font-serif text-[17px] text-ink">
      It is a truth <mark className="rounded-[2px] bg-accent-soft px-0.5 text-inherit">universally acknowledged</mark>, that a single man in possession of a good fortune
      <div className="relative mt-3 flex justify-center">{children}</div>
    </div>
  );
}
export function TodayBar() {
  const [open, setOpen] = useState<string | null>(null);
  const pens = [
    { id: "full", icon: Highlighter, label: "Highlight", c: COLOURS[0] },
    { id: "half", icon: PenTool, label: "Half highlight", c: COLOURS[1] },
    { id: "under", icon: Underline, label: "Underline", c: COLOURS[2] },
  ];
  return (
    <div className="relative flex flex-col items-start rounded-xl border border-line bg-surface p-1 shadow-[0_8px_24px_var(--shadow)]">
      <span aria-hidden className="absolute -top-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 border-t border-l border-line bg-surface" />
      <div className="flex gap-0.5">
        <IconButton icon={Copy} label="Copy" />
        <IconButton icon={Sparkles} label="AI Dictionary" />
        <IconButton icon={TextSearch} label="Look up" />
        <IconButton icon={StickyNote} label="Note" />
        <IconButton icon={Headphones} label="Read aloud" />
        <div className="mx-1 my-2 w-px bg-line" />
        {pens.map((p) => (
          <div key={p.id} className="relative">
            <IconButton icon={p.icon} label={p.label} active={open === p.id} onClick={() => setOpen(open === p.id ? null : p.id)} />
            <span aria-hidden className="pointer-events-none absolute bottom-[5px] left-1/2 h-[2.5px] w-3.5 -translate-x-1/2 rounded-sm" style={{ background: p.c }} />
          </div>
        ))}
      </div>
      {open && (
        <div className="pop-in flex gap-1 px-2 pt-1 pb-1.5">
          {COLOURS.map((c) => (<button key={c} aria-label={c} className="size-5 rounded-full border border-line hover:border-ink" style={{ background: c }} />))}
        </div>
      )}
    </div>
  );
}

export function ProposedBar() {
  const [pen, setPen] = useState<"full" | "half" | "under">("full");
  const [more, setMore] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  return (
    <div className="relative">
      <div className="relative flex items-center gap-1 rounded-xl border border-line bg-surface p-1 shadow-[0_8px_24px_var(--shadow)]">
        <span aria-hidden className="absolute -top-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 border-t border-l border-line bg-surface" />
        {/* colour first: one tap highlights in that colour with the pen on the right */}
        <div className="flex items-center gap-[3px] px-1" role="group" aria-label="Highlight colour">
          {COLOURS.map((c) => (
            <Tip key={c} label={`Highlight ${pen === "full" ? "" : pen === "half" ? "lower half " : "underline "}`.trim()}>
              <button
                aria-label={`Highlight ${c}`}
                onClick={() => { setFlash(c); setTimeout(() => setFlash(null), 500); }}
                className={cn("size-5 rounded-full border border-black/10 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-accent", flash === c && "scale-125 ring-2 ring-accent")}
                style={{ background: c }}
              />
            </Tip>
          ))}
        </div>
        <Segmented<"full" | "half" | "under"> height={30} iconOnly className="w-[92px]" items={[{ value: "full", icon: Highlighter, tip: "Full line" }, { value: "half", icon: PenTool, tip: "Lower half" }, { value: "under", icon: Underline, tip: "Underline" }]} value={pen} onChange={setPen} />
        <div className="mx-0.5 h-5 w-px bg-line" />
        {[[TextSearch, "Look up"], [Sparkles, "Ask AI"], [StickyNote, "Note"]].map(([I, n]) => {
          const Icon = I as typeof Copy;
          return (
            <button key={n as string} className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[13px] outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/50">
              <Icon size={15} strokeWidth={1.75} />{n as string}
            </button>
          );
        })}
        <div className="relative">
          <IconButton icon={MoreHorizontal} label="More" size="md" active={more} onClick={() => setMore((m) => !m)} />
          {more && (
            <Surface className="pop-in absolute top-full right-0 z-20 mt-2 w-40 p-1">
              <MenuRow icon={Copy} label="Copy" keys="Ctrl+C" />
              <MenuRow icon={Headphones} label="Read aloud" />
            </Surface>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenusSection() {
  return (
    <Block
      id="menus"
      n="06"
      title="Menus: view, context, selection"
      verdict="redesign"
      source="view_menu.rs · library/menus.rs · study/bar.rs · widgets.rs (menu_row, menu_note)"
      lead="Three menus, three dialects. The View menu is a 410 pt stack of 13 rows. Library context menus are plain text (`ui.button`) while the View menu has icons and shortcuts from `menu_row`. And the selection bar is eight icon-only buttons that rely on tooltips to explain themselves."
      notes={[
        { kind: "idea", text: "Toggles that are switches in spirit (auto-scroll, read aloud, distraction-free, pin) become two-column tiles that fill and say “On” when active — 3 rows instead of 5 full-width ones, and the state is readable at a glance. (“Distraction-free” is shortened to “Focus mode” to fit; the tooltip keeps the real name.)" },
        { kind: "idea", text: "Context menus should speak the same dialect as the View menu: icon, label, shortcut, and one danger group. Drop the “Select” ambiguity by showing the book's cover and progress at the top." },
        { kind: "warn", text: <>Removing a book also removes its highlights and notes (Duplicate's tooltip says as much). The inline confirm here is the safe default; an undo toast is only OK if undo restores <i>everything</i>. The existing modal alert (<code className="font-mono text-[12px]">remove_alert.rs</code>) is also fine.</> },
        { kind: "idea", text: "Selection bar: highlighting is the most common action, so colours come first and work in one tap (today a second row appears when “pick colour” is on). Look up / Ask AI / Note get words; Copy and Read aloud move to “…”." },
        { kind: "warn", text: "Shortcut hints in the library menu are placeholders (↵, F2, ⌫) — I didn't find library keybindings in keymap.rs. Verify before shipping, or drop them." },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="today" title="View menu" caption="272 × ~410 pt · 13 rows" bodyClassName="flex justify-center p-6">
          <TodayViewMenu />
        </Specimen>
        <Specimen kind="proposed" title="Control centre" caption="288 × ~290 pt · same 13 actions" bodyClassName="flex justify-center p-6">
          <ControlCentre />
        </Specimen>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="today" title="Library context menu" caption="plain text rows" bodyClassName="flex justify-center p-6">
          <TodayContextMenu />
        </Specimen>
        <Specimen kind="proposed" title="Context menu" caption="icons · cover header · inline confirm · try “Remove”" bodyClassName="flex justify-center p-6">
          <ProposedContextMenu />
        </Specimen>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Specimen kind="today" title="Selection bar" caption="icon-only; tap a pen to reveal colours" bodyClassName="pb-2">
          <SelLine><TodayBar /></SelLine>
        </Specimen>
        <Specimen kind="proposed" title="Selection bar" caption="colour-first, labelled actions" bodyClassName="pb-14">
          <SelLine><ProposedBar /></SelLine>
        </Specimen>
      </div>
    </Block>
  );
}

