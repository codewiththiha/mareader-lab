import { useState, type ReactNode } from "react";
import {
  BookA,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  RefreshCw,
  Sparkles,
  Volume2,
  X,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { IconButton, Tip } from "../ui/kit";
import { cn } from "../utils/cn";

/** Sample data. The first entry is the one in the README's own screenshot. */
const ENTRIES = [
  { gloss: "admit", tr: "reconnaître", def: "to admit the knowledge of" },
  { gloss: "accept", tr: "avouer", def: "to accept or admit the truth of" },
  { gloss: "receipt", tr: "accuser réception de", def: "to report that something was received" },
];

/** The page line the card points at. */
function PageLine({ caret = 168 }: { caret?: number }) {
  return (
    <div className="relative px-6 pt-5 font-serif text-[15px] leading-relaxed text-ink">
      <span className="text-[20px] font-bold leading-none">Chapter 1</span>
      <p className="mt-3 text-justify indent-5">
        It is a truth{" "}
        <mark className="rounded-[2px] bg-[#e58a8a]/80 px-px">universally</mark>{" "}
        <mark className="rounded-[2px] bg-[#c94b5e]/75 px-px text-black">acknowledged</mark>, that a{" "}
        <mark className="rounded-[2px] bg-[#e58a8a]/80 px-px">single</mark> man in possession of a good fortune…
      </p>
      <span aria-hidden className="absolute -bottom-0 hidden" style={{ left: caret }} />
    </div>
  );
}

function Caret({ x, flip }: { x: number; flip?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("absolute z-10 size-3.5 rotate-45 border-line bg-surface", flip ? "-bottom-[7px] border-r border-b" : "-top-[7px] border-t border-l")}
      style={{ left: x }}
    />
  );
}

/* ───────────── TODAY — rebuilt from dict/card.rs (WIDTH 320, PAD 14/10, FOOT 36, DOT 6) ───────────── */

function Rule1() {
  return <div className="h-px bg-line" />;
}

function TodayDots({ n, at, set }: { n: number; at: number; set: (i: number) => void }) {
  return (
    <div className="flex items-center" style={{ gap: 7.2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <button
          key={i}
          aria-label={`Entry ${i + 1} of ${n}`}
          onClick={() => set(i)}
          className="grid h-[18px] place-items-center outline-none"
          style={{ width: i === at ? 15.6 : 6 }}
        >
          <span className={cn("h-1.5 w-full rounded-full transition-colors", i === at ? "bg-accent" : "bg-muted/45 hover:bg-muted")} />
        </button>
      ))}
    </div>
  );
}

export function TodayDictCard() {
  const [at, setAt] = useState(0);
  const e = ENTRIES[at];
  return (
    <div className="relative w-[320px]">
      <Caret x={150} />
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-[0_8px_24px_var(--shadow)]">
        <div className="flex flex-col gap-1.5 py-2.5 pr-2 pl-3.5">
          <div className="flex items-center">
            <div className="flex flex-1 items-baseline gap-2 truncate">
              <span className="text-[20px] leading-7">acknowledged</span>
              <span className="text-[14px] italic text-muted">verb</span>
              <span className="text-[12px] text-muted">B1</span>
            </div>
            <div className="flex gap-0.5">
              <IconButton icon={Volume2} label="Say the word" size="sm" />
              <IconButton icon={BookA} label="Open in the Dictionary" size="sm" />
              <IconButton icon={X} label="Close" size="sm" />
            </div>
          </div>
          <span className="w-fit rounded-full bg-hover/70 px-3 py-1 text-[13px] text-muted">English → French</span>
        </div>
        <Rule1 />
        <div className="px-3.5 py-2.5">
          <div className="text-[14px] text-muted">≈ acknowledge</div>
          <div className="mt-1 text-[18px] leading-tight">{e.tr}</div>
          <div className="mt-1 text-[14px] italic text-muted">{e.def}</div>
        </div>
        <Rule1 />
        <div className="flex h-9 items-center px-2">
          <IconButton icon={ChevronLeft} label="Previous entry" size="sm" disabled={at === 0} onClick={() => setAt(at - 1)} />
          <div className="flex flex-1 justify-center">
            <TodayDots n={ENTRIES.length} at={at} set={setAt} />
          </div>
          <IconButton icon={ChevronRight} label="Next entry" size="sm" disabled={at === ENTRIES.length - 1} onClick={() => setAt(at + 1)} />
        </div>
      </div>
    </div>
  );
}

export function TodayAICard() {
  return (
    <div className="relative w-[380px]">
      <div className="relative rounded-xl border border-line bg-surface p-3.5 text-ink shadow-[0_8px_24px_var(--shadow)]">
        <div className="flex items-center">
          <div className="flex flex-1 items-baseline gap-2">
            <span className="text-[20px] leading-7">acknowledged</span>
            <span className="text-[14px] italic text-muted">verb</span>
            <span className="text-[12px] text-muted">B1</span>
          </div>
          <IconButton icon={Volume2} label="Say the word" size="sm" />
          <IconButton icon={X} label="Close" size="sm" />
        </div>
        <div className="mt-1 text-[13px] text-muted">Meaning</div>
        <p className="text-[16px] leading-snug">
          Accepted as true or recognized. Here, Austen frames a belief about wealthy bachelors and marriage as unquestioned, with a wry edge.
        </p>
        <div className="mt-2.5 text-[13px] text-muted">Synonyms</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {["recognized", "accepted", "assumed", "understood", "taken for granted"].map((s) => (
            <span key={s} className="rounded-full bg-accent-soft px-3 py-1 text-[14px]">{s}</span>
          ))}
        </div>
        <div className="mt-2.5 text-[13px] text-muted">Usages</div>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[16px] italic leading-snug marker:text-muted">
          <li>Her contribution was acknowledged in the report.</li>
          <li>He acknowledged that the first plan had failed.</li>
          <li>The report acknowledges the limits of the evidence.</li>
        </ul>
        <div className="mt-3 flex items-center justify-between text-[13px]">
          <span className="text-muted">Assistant-generated sample</span>
          <span className="text-[14px] text-accent">Ask again</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────── PROPOSED ───────────── */

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
/** CEFR as a six-step meter: the level reads as a position, not just a letter. */
export function Cefr({ level = "B1", compact }: { level?: string; compact?: boolean }) {
  const i = LEVELS.indexOf(level);
  return (
    <Tip label={`CEFR ${level} — ${["beginner", "elementary", "intermediate", "upper-intermediate", "advanced", "proficient"][i]}`}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-[3px] text-[11.5px] font-semibold leading-none text-ink">
        {level}
        {!compact && (
          <span className="flex gap-[2px]" aria-hidden>
            {LEVELS.map((l, j) => (
              <span key={l} className={cn("h-[9px] w-[3px] rounded-full", j <= i ? "bg-accent" : "bg-track")} />
            ))}
          </span>
        )}
      </span>
    </Tip>
  );
}

export function ProposedDictCard() {
  const [at, setAt] = useState(0);
  const [saved, setSaved] = useState(false);
  const e = ENTRIES[at];
  const [saying, setSaying] = useState(false);
  return (
    <div className="relative w-[320px]">
      <Caret x={150} />
      <div
        className="relative overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-[0_8px_24px_var(--shadow)]"
        onKeyDown={(k) => {
          if (k.key === "ArrowRight") setAt((a) => Math.min(ENTRIES.length - 1, a + 1));
          if (k.key === "ArrowLeft") setAt((a) => Math.max(0, a - 1));
        }}
      >
        <div className="px-3.5 pt-3 pb-2.5">
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[22px] font-semibold leading-7 tracking-tight">acknowledged</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] italic text-muted">verb</span>
                <Cefr level="B1" />
                <span className="inline-flex items-center gap-1 text-[12px] text-muted">EN<ArrowRight size={11} />FR</span>
              </div>
            </div>
            <div className="-mr-1 flex">
              <IconButton icon={Volume2} label="Say the word" size="sm" active={saying} onClick={() => { setSaying(true); setTimeout(() => setSaying(false), 1100); }} />
              <IconButton icon={saved ? BookmarkCheck : Bookmark} label={saved ? "Saved to vocabulary" : "Save to vocabulary"} size="sm" active={saved} onClick={() => setSaved((s) => !s)} />
              <IconButton icon={X} label="Close" keys="Esc" size="sm" />
            </div>
          </div>
        </div>
        <div className="border-t border-line bg-card/70 px-3.5 py-3">
          <div className="flex items-baseline gap-2">
            <span key={at} className="pop-in text-[21px] font-medium leading-tight">{e.tr}</span>
          </div>
          <div className="mt-1 text-[13.5px] leading-snug text-muted">
            <span className="mr-1.5 rounded bg-hover/70 px-1.5 py-px text-[11.5px] not-italic">≈ acknowledge</span>
            <span className="italic">{e.def}</span>
          </div>
        </div>
        {/* senses are named, so the pager says what it will show */}
        <div className="flex items-center gap-1 border-t border-line px-2 py-1.5">
          <div role="tablist" aria-label="Senses" className="flex flex-1 gap-1">
            {ENTRIES.map((s, i) => (
              <button
                key={s.gloss}
                role="tab"
                aria-selected={i === at}
                onClick={() => setAt(i)}
                className={cn(
                  "h-7 flex-1 truncate rounded-md px-2 text-[12.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
                  i === at ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover hover:text-ink"
                )}
              >
                <span className="mr-1 tabular-nums opacity-60">{i + 1}</span>
                {s.gloss}
              </button>
            ))}
          </div>
          <IconButton icon={ArrowUpRight} label="Open in the Dictionary" size="sm" />
        </div>
      </div>
    </div>
  );
}

export function ProposedAICard() {
  const [more, setMore] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const usages = [
    "Her contribution was acknowledged in the report.",
    "He acknowledged that the first plan had failed.",
    "The report acknowledges the limits of the evidence.",
  ];
  const bold = (s: string): ReactNode => {
    const m = s.match(/acknowledg\w*/i);
    if (!m || m.index === undefined) return s;
    return (
      <>
        {s.slice(0, m.index)}
        <b className="font-semibold not-italic text-accent">{m[0]}</b>
        {s.slice(m.index + m[0].length)}
      </>
    );
  };
  return (
    <div className="relative w-[380px]">
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-[0_8px_24px_var(--shadow)]">
        <div className="flex items-start gap-1 px-3.5 pt-3 pb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-semibold leading-7 tracking-tight">acknowledged</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent"><Sparkles size={10} />AI</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[13px] italic text-muted">verb</span>
              <Cefr level="B1" />
            </div>
          </div>
          <div className="-mr-1 flex">
            <IconButton icon={Volume2} label="Say the word" size="sm" />
            <IconButton icon={saved ? BookmarkCheck : Bookmark} label="Save to vocabulary" size="sm" active={saved} onClick={() => setSaved((s) => !s)} />
            <IconButton icon={X} label="Close" size="sm" />
          </div>
        </div>
        <div className={cn("space-y-3 px-3.5 pb-3 transition-opacity", busy && "opacity-40")}>
          <p className="text-[15px] leading-snug">
            Accepted as true or recognized. Here, Austen frames a belief about wealthy bachelors and marriage as <span className="underline decoration-accent/50 decoration-2 underline-offset-2">unquestioned</span>, with a wry edge.
          </p>
          <div className="flex flex-wrap gap-1.5" aria-label="Synonyms">
            {["recognized", "accepted", "assumed", "understood", "taken for granted"].map((s) => (
              <Tip key={s} label={`Look up “${s}”`}>
                <button className="rounded-full bg-accent-soft/80 px-2.5 py-[3px] text-[13px] outline-none transition-colors hover:bg-accent-soft hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50">{s}</button>
              </Tip>
            ))}
          </div>
          <ul className="space-y-1.5 border-l-2 border-line pl-3 text-[14px] italic leading-snug text-ink/90">
            {(more ? usages : usages.slice(0, 2)).map((u) => (
              <li key={u}>{bold(u)}</li>
            ))}
          </ul>
          {!more && (
            <button onClick={() => setMore(true)} className="-mt-1 text-[12.5px] text-muted hover:text-ink">+ 1 more example</button>
          )}
        </div>
        <div className="flex items-center gap-1 border-t border-line bg-card/70 px-3 py-1.5 text-[12px] text-muted">
          <Sparkles size={12} />
          <span className="flex-1 truncate">gpt-4.1-mini · generated sample</span>
          <IconButton icon={Copy} label="Copy" size="xs" />
          <button
            onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 900); }}
            className="flex h-6 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium text-accent hover:bg-accent-soft"
          >
            <RefreshCw size={12} className={busy ? "animate-spin" : ""} />
            Ask again
          </button>
        </div>
      </div>
    </div>
  );
}

/** The quickest look: one line over the word. Click it to open the full card. */
export function Glance() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="relative flex h-9 items-center gap-2 rounded-full border border-line bg-surface pr-1.5 pl-3.5 text-[14px] shadow-[0_6px_18px_var(--shadow)] outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <span className="font-medium">acknowledged</span>
          <span className="text-muted">→</span>
          <span>reconnaître</span>
          <Cefr level="B1" compact />
          <span className="ml-0.5 grid size-6 place-items-center rounded-full text-muted"><ChevronRight size={14} className={cn("transition-transform", open && "rotate-90")} /></span>
          <span aria-hidden className="absolute -bottom-[5px] left-8 size-2.5 rotate-45 border-r border-b border-line bg-surface" />
        </button>
      </div>
      <p className="font-serif text-[15px] text-ink">
        It is a truth universally <mark className="rounded-[2px] bg-[#c94b5e]/75 px-px">acknowledged</mark>, that a single man…
      </p>
      {open && <div className="pop-in text-[12px] text-muted">…the full card from the previous specimen opens here.</div>}
    </div>
  );
}

export default function DictionarySection() {
  return (
    <Block
      id="dictionary"
      n="04"
      title="Dictionary & AI lookup cards"
      verdict="tweak"
      source="dict/card.rs · dict/entry.rs · dict/window.rs · bubble.rs"
      lead="This is one of the app's best-looking surfaces: the caret, the big word, the quiet rules. Redesign here is about information, not chrome — the pager is dots with no names, CEFR is a bare “B1”, and the icons on the right (speaker / book / ✕) lean on tooltips."
      notes={[
        { kind: "idea", text: "Name the senses. Three dots tell you nothing; a segmented pager with a one-word gloss tells you what you'll see. Arrow keys still work, and so does the wheel flick the code already handles." },
        { kind: "idea", text: "CEFR as a 6-step meter reads as “how hard”, which is the whole reason the highlights exist. Same footprint as the plain text." },
        { kind: "idea", text: "Save-to-vocabulary is reachable right from the card (a toggle with a visible saved state). Today you have to leave the card for it." },
        { kind: "warn", text: "Keep the AI card visually distinct from dictionary entries — an “AI” badge and a model name in the footer. It is generated text, and reading apps shouldn't let it pass for a dictionary." },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="today" title="Lookup card" caption="320 pt · dots pager" bodyClassName="pb-8">
          <PageLine />
          <div className="relative mt-2.5 flex justify-center"><TodayDictCard /></div>
        </Specimen>
        <Specimen kind="proposed" title="Lookup card" caption="named senses · CEFR meter · save" bodyClassName="pb-8">
          <PageLine />
          <div className="relative mt-2.5 flex justify-center"><ProposedDictCard /></div>
        </Specimen>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="today" title="AI lookup" caption="380 pt" bodyClassName="flex justify-center p-6">
          <TodayAICard />
        </Specimen>
        <Specimen kind="proposed" title="AI lookup" caption="~25% shorter · tappable synonyms · bolded target" bodyClassName="flex justify-center p-6">
          <ProposedAICard />
        </Specimen>
      </div>
      <Specimen kind="variant" title="Glance" caption="new: the one-line peek, for the 90% of lookups that need only a translation" bodyClassName="p-6 pt-8">
        <Glance />
      </Specimen>
    </Block>
  );
}

