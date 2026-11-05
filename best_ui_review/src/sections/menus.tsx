import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Scan, EyeOff, Pin, Settings, Keyboard, ChartNoAxesColumnIncreasing, ChevronRight, Copy, Feather, Languages, ListChecks, NotebookText, SlidersHorizontal, X, FolderPlus, Sparkles, CheckSquare, Check, ScrollText } from "lucide-react";
import { Grid, Notes, Section, Specimen } from "../kit/frame";
import { Kbd, Switch } from "../kit/primitives";
import { cn } from "../kit/cn";

/* ----------- CURRENT: widgets::menu_row — 32 pt rows, 16 pt icon, keys right in muted ----------- */
function MenuFrame({ children, w = 240 }: { children: ReactNode; w?: number }) {
  return <div className="rounded-[12px] border border-line bg-surface p-[6px] pop" style={{ width: w }}>{children}</div>;
}
function RowCur({ icon: I, label, keys }: { icon: LucideIcon; label: string; keys?: string }) {
  return (
    <button className="flex h-[32px] w-full items-center gap-2 rounded-[8px] px-[8px] text-left text-[14px] text-ink hover:bg-line">
      <I size={16} strokeWidth={1.75} /><span className="flex-1 truncate">{label}</span>{keys && <span className="text-[12px] text-muted">{keys}</span>}
    </button>
  );
}
const Sep = () => <div className="my-[4px] h-px bg-line" />;

export function PicksMenuCurrent() {
  return (
    <MenuFrame w={250}>
      <div className="px-[8px] pb-1 text-[12px] text-muted">3 pages</div>
      <RowCur icon={Copy} label="Copy text" />
      <RowCur icon={ChartNoAxesColumnIncreasing} label="Copy word list" keys="B2+" />
      <RowCur icon={SlidersHorizontal} label="Word list…" />
      <Sep />
      <RowCur icon={NotebookText} label="Summarize" />
      <RowCur icon={Languages} label="Translate to French" />
      <RowCur icon={ChevronRight} label="Other language…" />
      <RowCur icon={Feather} label="Simplify" />
      <Sep />
      <RowCur icon={X} label="Clear selection" keys="Esc" />
    </MenuFrame>
  );
}
/** library/menus.rs::page_menu uses bare ui.button(), no icons, no menu_row. */
export function LibraryMenuCurrent() {
  return (
    <div className="w-[190px] rounded-[12px] border border-line bg-surface p-[6px] pop">
      {["New shelf", "Organize with AI", "Select all"].map((l) => <button key={l} className="block w-full rounded-[8px] px-[8px] py-[3px] text-left text-[14px] text-ink hover:bg-line">{l}</button>)}
    </div>
  );
}

/** view_menu.rs, as rendered by the shot tool (open=menu): heading, rows with keys as text, version footer. */
export function ViewMenuCurrent() {
  return (
    <MenuFrame w={286}>
      <div className="px-[8px] pb-1 pt-1 text-[12px] text-muted">Reading</div>
      <RowCur icon={Scan} label="Full screen" keys="F11" />
      <RowCur icon={EyeOff} label="Distraction-free" keys="Ctrl+Shift+F" />
      <RowCur icon={Pin} label="Keep title bar shown" />
      <Sep />
      <RowCur icon={Settings} label="Settings" keys="Ctrl+," />
      <RowCur icon={Keyboard} label="Keyboard shortcuts" keys="Ctrl+/" />
      <Sep />
      <div className="px-[8px] py-1 text-[12px] text-muted">Mareader 0.0.5</div>
    </MenuFrame>
  );
}
export function ViewMenuProposed() {
  const [pin, setPin] = useState(false);
  const [df, setDf] = useState(false);
  const Toggle = ({ icon: I, label, on, set, keys }: { icon: LucideIcon; label: string; on: boolean; set: (v: boolean) => void; keys?: string[] }) => (
    <button onClick={() => set(!on)} className="flex h-[30px] w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13.5px] text-ink hover:bg-line">
      <I size={15} strokeWidth={1.75} className="text-muted" /><span className="flex-1">{label}</span>
      {keys && <span className="mr-1 flex gap-0.5">{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>}
      <span onClick={(e) => e.stopPropagation()}><Switch on={on} onChange={set} label={label} /></span>
    </button>
  );
  return (
    <div className="w-[272px] rounded-[14px] border border-line bg-surface p-[6px] pop">
      <Group title="Reading">
        <RowNew it={{ icon: Scan, label: "Full screen", keys: ["F11"] }} active={false} onEnter={() => {}} />
        <Toggle icon={EyeOff} label="Distraction-free" on={df} set={setDf} keys={["⌃", "⇧", "F"]} />
        <Toggle icon={Pin} label="Keep title bar" on={pin} set={setPin} />
      </Group>
      <div className="my-1 h-px bg-line" />
      <div className="grid grid-cols-2 gap-1">
        {([[Settings, "Settings", "⌃ ,"], [Keyboard, "Shortcuts", "⌃ /"]] as const).map(([I, l, k]) => (
          <button key={l} className="flex items-center gap-2 rounded-[10px] bg-paper/60 px-2.5 py-2 text-left text-[12.5px] text-ink hover:bg-line"><I size={15} strokeWidth={1.75} /><span className="flex-1">{l}</span><span className="text-[10.5px] text-muted">{k}</span></button>
        ))}
      </div>
      <div className="flex items-center justify-between px-2 pb-0.5 pt-2 text-[11px] text-muted"><span>Mareader 0.0.5</span><span>Up to date</span></div>
    </div>
  );
}

/* ------------------------------ PROPOSED ------------------------------ */
type Item = { icon: LucideIcon; label: string; keys?: string[]; hint?: string; sub?: string[]; danger?: boolean; tag?: string };
function RowNew({ it, active, onEnter }: { it: Item; active: boolean; onEnter: () => void }) {
  const [sub, setSub] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => { onEnter(); it.sub && setSub(true); }} onMouseLeave={() => setSub(false)}>
      <button className={cn("flex h-[30px] w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13.5px] transition-colors", active ? "bg-line" : "", it.danger ? "text-danger" : "text-ink")}>
        <it.icon size={15} strokeWidth={1.75} className={it.danger ? "" : "text-muted"} />
        <span className="flex-1 truncate">{it.label}</span>
        {it.tag && <span className="rounded-full bg-accent-soft px-1.5 text-[10.5px] font-semibold text-accent">{it.tag}</span>}
        {it.keys && <span className="flex gap-0.5">{it.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>}
        {it.sub && <ChevronRight size={14} className="text-muted" />}
      </button>
      {it.sub && sub && (
        <div className="absolute left-full top-[-6px] z-10 pl-1">
          <div className="anim-rise w-[180px] rounded-[12px] border border-line bg-surface p-[5px] pop">
            <div className="px-2 pb-1 pt-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">Recent</div>
            {it.sub.map((s, i) => <button key={s} className="flex h-[28px] w-full items-center gap-2 rounded-[7px] px-2 text-[13px] text-ink hover:bg-line">{i === 0 ? <Check size={13} className="text-accent" /> : <span className="w-[13px]" />}{s}</button>)}
            <div className="my-1 h-px bg-line" />
            <button className="flex h-[28px] w-full items-center rounded-[7px] px-2 text-[13px] text-muted hover:bg-line">More languages…</button>
          </div>
        </div>
      )}
    </div>
  );
}
function Group({ title, icon: I, children }: { title: string; icon?: LucideIcon; children: ReactNode }) {
  return <div><div className="flex items-center gap-1.5 px-2 pb-0.5 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">{I && <I size={11} />}{title}</div>{children}</div>;
}

export function PicksMenuProposed() {
  const [act, setAct] = useState(-1);
  const ai: Item[] = [
    { icon: NotebookText, label: "Summarize" },
    { icon: Languages, label: "Translate", sub: ["French", "Burmese", "Japanese"] },
    { icon: Feather, label: "Simplify", hint: "Plain English" },
  ];
  const words: Item[] = [{ icon: ChartNoAxesColumnIncreasing, label: "Copy word list", tag: "B2+" }, { icon: SlidersHorizontal, label: "Word list…" }];
  let i = 0;
  return (
    <div className="w-[248px] rounded-[14px] border border-line bg-surface p-[6px] pop" onMouseLeave={() => setAct(-1)}>
      <div className="mb-1 flex items-center gap-2 px-2 pt-0.5"><span className="text-[13px] font-medium text-ink">3 pages</span><span className="text-[12px] text-muted">pp. 12–14</span>
        <button className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] text-muted hover:bg-line hover:text-ink">Clear <Kbd>Esc</Kbd></button></div>
      <div className="mb-1 grid grid-cols-3 gap-1">
        {[[Copy, "Copy text"], [ScrollText, "Word list"], [CheckSquare, "Select all"]].map(([I, l]) => { const Ic = I as LucideIcon; return (
          <button key={l as string} className="flex flex-col items-center gap-1 rounded-[10px] bg-paper/60 py-2 text-[11.5px] text-ink hover:bg-line"><Ic size={16} strokeWidth={1.75} />{l as string}</button>
        ); })}
      </div>
      <Group title="Vocabulary">{words.map((it) => { const k = i++; return <RowNew key={it.label} it={it} active={act === k} onEnter={() => setAct(k)} />; })}</Group>
      <Group title="Ask AI" icon={Sparkles}>{ai.map((it) => { const k = i++; return <RowNew key={it.label} it={it} active={act === k} onEnter={() => setAct(k)} />; })}</Group>
    </div>
  );
}
export function LibraryMenuProposed() {
  const [act, setAct] = useState(-1);
  const items: Item[] = [{ icon: FolderPlus, label: "New shelf", keys: ["⌘", "⇧", "N"] }, { icon: Sparkles, label: "Organize with AI" }, { icon: ListChecks, label: "Select all", keys: ["⌘", "A"] }];
  return <div className="w-[230px] rounded-[14px] border border-line bg-surface p-[6px] pop">{items.map((it, k) => <RowNew key={it.label} it={it} active={act === k} onEnter={() => setAct(k)} />)}</div>;
}

/** Right-click anywhere in the stage to open the proposed menu at the pointer. */
function ContextStage() {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const c = () => setAt(null); window.addEventListener("click", c); return () => window.removeEventListener("click", c); }, []);
  return (
    <div ref={ref} className="relative h-[380px] w-full rounded-xl border border-dashed border-track/70" onContextMenu={(e) => { e.preventDefault(); const b = ref.current!.getBoundingClientRect(); setAt({ x: Math.min(e.clientX - b.left, b.width - 260), y: Math.min(e.clientY - b.top, b.height - 330) }); }}>
      <div className="absolute inset-0 grid place-items-center text-[13px] text-muted">Right-click anywhere here</div>
      {at && <div className="anim-rise absolute z-10" style={{ left: at.x, top: at.y }} onClick={(e) => e.stopPropagation()}><PicksMenuProposed /></div>}
    </div>
  );
}

export function MenuSection() {
  return (
    <Section id="menus" kicker="widgets::menu_row · thumbnails/picks.rs · library/menus.rs" title="Context menus"
      intro={<>Rows are consistent where they use <code>menu_row</code> (32 pt, 16 pt icon, keys right). Three things undercut it. The <b>library page menu</b> skips <code>menu_row</code> entirely (bare <code>ui.button</code>: no icons, a different height). <b>“Other language…”</b> uses a chevron as its leading icon to open a second menu. And the word-list <b>preset (“B2+”) sits in the shortcut column</b>, where a key belongs.</>}>
      <Grid>
        <Specimen tag="current" title="Thumbnail selection menu" src="thumbnails/picks.rs:225" stageClass="gap-6 flex-wrap items-start py-10">
          <PicksMenuCurrent /><LibraryMenuCurrent />
        </Specimen>
        <Specimen tag="proposed" title="Grouped, quick tiles, real submenu" stageClass="gap-6 flex-wrap items-start py-10" note="The three frequent verbs become tiles (one-click, larger targets). Groups get tiny headings instead of bare separators. Translate becomes a true submenu with recent languages, so 'Other language…' and its leading chevron go away. Levels move to a badge. Shortcuts render as key caps. Clear sits in the header beside the count it clears.">
          <PicksMenuProposed /><LibraryMenuProposed />
        </Specimen>
      </Grid>
      <Grid>
        <Specimen tag="current" title="View & tools menu (shot tool, open=menu)" src="view_menu.rs" stageClass="items-start py-10"><ViewMenuCurrent /></Specimen>
        <Specimen tag="proposed" title="View menu: toggles show their state" stageClass="items-start py-10" note="'Keep title bar shown' is a setting but draws as a plain row; its state appears only as a selected fill when it's on (menu_row(.., pinned)), so 'off' looks the same as an action. Real switches make both settings readable at a glance. Settings and Shortcuts become a two-up footer, and the version line has room for an update status."><ViewMenuProposed /></Specimen>
      </Grid>
      <Grid>
        <Specimen tag="variant" title="Live: right-click to open at pointer" grain={false} stageClass="bg-paper p-4"><ContextStage /></Specimen>
        <Notes title="Review" items={[
          ["issue", "library/menus.rs::page_menu uses ui.button(\"New shelf\") while library_panel.rs uses menu_row(Icon::FolderPlus, \"New shelf\"). The same command looks different on two surfaces."],
          ["issue", "A ChevronRight in the icon slot reads as 'go into', not as a language action, and nothing on the right says a submenu is coming."],
          ["issue", "'3 pages' is a 12 pt muted label above the first row, and 'Clear selection · Esc' is the last row: the scope and its reset sit at opposite ends of the menu."],
          ["keep", "The accessible name excludes the shortcut (widget_info(label)). Keep this when moving keys into caps."],
          ["warn", "Tiles only for verbs used in most sessions. More than three turns the header into a toolbar and slows scanning."],
        ]} />
      </Grid>
    </Section>
  );
}
