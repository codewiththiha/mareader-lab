import { useState } from "react";
import { Bookmark, BookmarkCheck, FileText, LayoutGrid, ListTree, Library, PanelLeftClose, Pin, Search, Settings } from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { IconButton, Range, Ring, Tip } from "../ui/kit";
import { cn } from "../utils/cn";

const TOTAL = 234;
const CHAPTERS = [
  { at: 1, name: "Title page" },
  { at: 4, name: "Chapter 1" },
  { at: 14, name: "Chapter 6" },
  { at: 40, name: "Chapter 17" },
  { at: 90, name: "Chapter 36" },
  { at: 150, name: "Chapter 47" },
  { at: 210, name: "Chapter 58" },
];
const chapter = (p: number) => [...CHAPTERS].reverse().find((c) => c.at <= p)?.name ?? "";

function Pane({ children, hint }: { children: React.ReactNode; hint: string }) {
  return (
    <div className="group/pane relative h-[230px] overflow-hidden bg-paper px-8 pt-6 font-serif text-[12.5px] leading-relaxed text-ink/70 select-none">
      <p className="mb-3 indent-4">"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"</p>
      <p className="mb-3 indent-4">Mr. Bennet replied that he had not.</p>
      <p className="indent-4">"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."</p>
      <div className="absolute inset-x-0 bottom-0 z-10 h-2" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-sans text-[11px] text-muted opacity-70 group-hover/pane:opacity-0">{hint}</div>
      {children}
    </div>
  );
}

/** Today: pane.rs `counter` chip + page_bar.rs (BAR_H 40, EDGE 8): slider, page entry, bookmark. */
function TodayCounter() {
  const [p, setP] = useState(2);
  const [mark, setMark] = useState(false);
  return (
    <Pane hint="hover the bottom edge">
      <div className="absolute right-3 bottom-2 rounded-full bg-surface px-2.5 py-[3px] font-sans text-[12px] tabular-nums text-muted transition-opacity group-hover/pane:opacity-0">{p} / {TOTAL}</div>
      <div className="absolute inset-x-0 bottom-0 flex h-10 translate-y-full items-center gap-3 border-t border-line bg-surface px-3 font-sans transition-transform duration-200 group-hover/pane:translate-y-0">
        <div className="flex-1"><Range label="Page" value={p} min={1} max={TOTAL} onChange={setP} /></div>
        <div className="flex items-center gap-1 text-[13px] tabular-nums"><span className="w-10 rounded-md border border-line px-1.5 py-0.5 text-center">{p}</span><span className="text-muted">/ {TOTAL}</span></div>
        <IconButton icon={mark ? BookmarkCheck : Bookmark} label="Bookmark this page" keys="Ctrl+D" size="sm" active={mark} onClick={() => setMark((m) => !m)} />
      </div>
    </Pane>
  );
}

/** Proposed: the chip carries a progress ring and the chapter; the bar gets chapter ticks and names what you're hovering. */
function ProposedCounter() {
  const [p, setP] = useState(2);
  const [mark, setMark] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Pane hint="hover the bottom edge">
      <div className="absolute right-3 bottom-2 flex items-center gap-1.5 rounded-full bg-surface py-[3px] pr-2.5 pl-1.5 font-sans text-[12px] tabular-nums text-muted transition-opacity group-hover/pane:opacity-0">
        <Ring value={p / TOTAL} size={16} stroke={2} />
        {p} / {TOTAL}
        <span className="hidden text-muted/70 sm:inline">· {chapter(p)}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-11 translate-y-full items-center gap-3 border-t border-line bg-surface px-3 font-sans transition-transform duration-200 group-hover/pane:translate-y-0">
        <div className="relative flex-1">
          <div className="relative h-5">
            <input aria-label="Page" type="range" min={1} max={TOTAL} value={p} onChange={(e) => setP(+e.target.value)} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover(Math.round(1 + ((e.clientX - r.left) / r.width) * (TOTAL - 1))); }} onMouseLeave={() => setHover(null)} className="lab-range absolute inset-0" style={{ ["--p" as string]: `${((p - 1) / (TOTAL - 1)) * 100}%` }} />
            {CHAPTERS.slice(1).map((c) => (<span key={c.at} className="pointer-events-none absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-surface" style={{ left: `${((c.at - 1) / (TOTAL - 1)) * 100}%` }} />))}
            {hover !== null && <span className="pointer-events-none absolute -top-7 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] shadow-[0_2px_8px_var(--shadow-soft)]" style={{ left: `${((hover - 1) / (TOTAL - 1)) * 100}%` }}>p. {hover} <span className="text-muted">· {chapter(hover)}</span></span>}
          </div>
        </div>
        <div className="flex flex-col items-end leading-tight"><span className="text-[13px] tabular-nums">{p} <span className="text-muted">/ {TOTAL}</span></span><span className="text-[11px] text-muted">{chapter(p)}</span></div>
        <IconButton icon={mark ? BookmarkCheck : Bookmark} label="Bookmark this page" keys="Ctrl+D" size="sm" active={mark} onClick={() => setMark((m) => !m)} />
      </div>
    </Pane>
  );
}

/** Today's sidebar rail, rebuilt from sidebar.rs + the notes screenshot. Verdict: keep. */
function SidebarRail() {
  const [tab, setTab] = useState("notes");
  const tabs = [{ id: "thumbs", label: "Thumbnails", icon: LayoutGrid }, { id: "outline", label: "Outline", icon: ListTree }, { id: "notes", label: "Notes", icon: FileText }, { id: "library", label: "Library", icon: Library }];
  const [f, setF] = useState<"all" | "notes">("all");
  return (
    <div className="flex h-[400px] w-[300px] flex-col border-r border-line bg-surface">
      <div className="flex h-12 items-center gap-0.5 px-2">
        <IconButton icon={PanelLeftClose} label="Hide sidebar" /><IconButton icon={Search} label="Search" /><IconButton icon={Settings} label="Settings" /><span className="flex-1" /><IconButton icon={Pin} label="Dock sidebar" active />
      </div>
      <div className="flex-1 overflow-hidden px-3 pt-1">
        {tab === "notes" ? (
          <>
            <div className="flex gap-1.5 pb-2.5">
              {([["all", "All · 3"], ["notes", "Notes · 3"]] as const).map(([k, n]) => (<button key={k} onClick={() => setF(k)} className={cn("h-8 rounded-full px-3 text-[14px]", f === k ? "bg-accent-soft font-medium" : "text-ink hover:bg-hover")}>{n}</button>))}
            </div>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-line px-2.5 text-[14px] text-muted"><Search size={14} />Search highlights and notes</div>
            <ul className="mt-3 space-y-3.5">
              {[["universally acknowledged", "The opening claim is ironic; track who gets to choose"], ["good fortune", "Wealth works like social currency; compare Darcy and Bingley"], ["a wife", "This joke sets up the novel's focus on marriage and independence"]].map(([a, b]) => (
                <li key={a} className="relative pl-3">
                  <span className="absolute top-1.5 left-0 h-4 w-[3px] rounded-sm bg-[#facc15]" />
                  <div className="text-[13px] text-muted">Page 2</div>
                  <div className="text-[16px] leading-tight">{a}</div>
                  <div className="mt-1 flex gap-1.5 text-[15px] leading-snug text-ink/80"><FileText size={14} className="mt-1 shrink-0 text-muted" />{b}</div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-muted">{tabs.find((t) => t.id === tab)?.label}</div>
        )}
      </div>
      <div className="flex h-14 border-t border-line">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex flex-1 flex-col items-center justify-center gap-0.5 text-[12px] transition-colors", tab === t.id ? "bg-hover/50 font-medium text-accent" : "text-muted hover:text-ink")}>
            <t.icon size={17} strokeWidth={1.6} />{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChromeSection() {
  return (
    <Block
      id="chrome"
      n="09"
      title="Page counter, page bar & sidebar"
      verdict="tweak"
      source="page_bar.rs · sidebar.rs · notes_panel.rs · thumbnails.rs"
      lead="The reader chrome mostly lives up to “the page is the app”: the title bar auto-hides, the sidebar slides, the counter is a quiet chip. The only part that under-delivers is the page bar — a bare slider and a number box, in a book with 61 chapters. And the sidebar rail is already good; it's here so you can see it's been looked at."
      notes={[
        { kind: "idea", text: "The counter chip gets a 16 pt ring (progress without reading the number) and the chapter name. The bar gets chapter ticks and a hover label — the same “page · chapter” hint the player's seek track already computes." },
        { kind: "ok", text: "Sidebar: keep. Bottom tabs with labels are right for a four-item rail, the pinned/overlay modes are well thought-out, and the notes list's yellow tick + muted page label is clean." },
        { kind: "warn", text: "The 8 pt bottom strip that reveals the bar is thin on trackpads and impossible on touch. Consider a larger invisible hit area (24 pt) while keeping the 8 pt visual affordance — and don't let it fight the player, which also lives at the bottom." },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="today" title="Counter + page bar" caption="hover the bottom edge" bodyClassName="">
          <TodayCounter />
        </Specimen>
        <Specimen kind="proposed" title="Counter + page bar" caption="ring · chapter · ticks · hover label" bodyClassName="">
          <ProposedCounter />
        </Specimen>
      </div>
      <Specimen kind="today" title="Sidebar rail" caption="verdict: keep — rebuilt from sidebar.rs and notes-panel.jpg" bodyClassName="flex">
        <SidebarRail />
        <div className="hidden flex-1 place-items-center p-6 text-[13px] text-muted sm:grid"><Tip label="The page continues here">Pages continue here →</Tip></div>
      </Specimen>
    </Block>
  );
}
