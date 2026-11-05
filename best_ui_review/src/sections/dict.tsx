import { useState } from "react";
import { BookA, BookmarkPlus, BookmarkCheck, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Volume2, X, RotateCw, Copy } from "lucide-react";
import { Grid, Notes, Section, Specimen } from "../kit/frame";
import { IconBtn } from "../kit/primitives";
import { cn } from "../kit/cn";

const ENTRIES = [
  { near: "acknowledge", answer: "reconnaître", gloss: "to admit the knowledge of" },
  { near: "acknowledge", answer: "admettre", gloss: "to accept as true or valid" },
  { near: "acknowledge", answer: "accuser réception", gloss: "to report receipt of" },
];

const Tail = () => <span className="absolute -top-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-line bg-surface" />;

/* ---------------- CURRENT: dict/card.rs (WIDTH 320, PAD 14/10, FOOT 36, DOT 6) ---------------- */
export function DictCardCurrent() {
  const [i, setI] = useState(0);
  const e = ENTRIES[i];
  return (
    <div className="relative w-[320px] rounded-[12px] border border-line bg-surface pop">
      <Tail />
      <div className="px-[14px] pb-[10px] pt-[10px]">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] text-ink">acknowledged</span>
          <span className="text-[15px] italic text-muted">verb</span>
          <span className="text-[13px] text-muted">B1</span>
          <span className="ml-auto flex translate-y-1 gap-1.5">
            <IconBtn icon={Volume2} label="Say it" size={24} />
            <IconBtn icon={BookA} label="Open in the Dictionary" size={24} />
            <IconBtn icon={X} label="Close" size={24} />
          </span>
        </div>
        <span className="mt-2 inline-block rounded-full bg-chip px-2.5 py-[2px] text-[12.5px] text-muted">English → French</span>
      </div>
      <div className="h-px bg-line" />
      <div className="min-h-[96px] px-[14px] py-[10px]">
        <div className="text-[13px] text-muted">≈ {e.near}</div>
        <div className="text-[19px] text-ink">{e.answer}</div>
        <div className="text-[14px] italic text-muted">{e.gloss}</div>
      </div>
      <div className="h-px bg-line" />
      <div className="flex h-[36px] items-center px-2">
        <IconBtn icon={ChevronLeft} label="Previous entry" size={24} disabled={i === 0} onClick={() => setI(i - 1)} />
        <div className="flex flex-1 items-center justify-center gap-[6px]">
          {ENTRIES.map((_, k) => <span key={k} className={cn("h-[6px] rounded-full transition-all", k === i ? "w-[15px] bg-accent" : "w-[6px] bg-track")} />)}
        </div>
        <IconBtn icon={ChevronRight} label="Next entry" size={24} disabled={i === ENTRIES.length - 1} onClick={() => setI(i + 1)} />
      </div>
    </div>
  );
}

/* CEFR tint scale, shared with the page marks proposal */
export const CEFR: Record<string, string> = { A1: "#5b8f3a", A2: "#7c9a2e", B1: "#c28a12", B2: "#d06a1c", C1: "#c2412d", C2: "#9b2c5a" };
export function LevelBadge({ level }: { level: string }) {
  return (
    <span title={`CEFR ${level} — upper-intermediate words are marked on the page`} className="inline-flex h-[18px] items-center gap-1 rounded-full px-1.5 text-[11px] font-semibold" style={{ background: `${CEFR[level]}22`, color: CEFR[level] }}>
      <span className="h-[6px] w-[6px] rounded-full" style={{ background: CEFR[level] }} />{level}
    </span>
  );
}

/* ---------------- PROPOSED ---------------- */
export function DictCardProposed() {
  const [i, setI] = useState(0);
  const [saved, setSaved] = useState(false);
  const e = ENTRIES[i];
  return (
    <div className="relative w-[320px] rounded-[14px] border border-line bg-surface pop">
      <Tail />
      <div className="flex items-start gap-2 px-3.5 pt-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[20px] font-medium tracking-tight text-ink">acknowledged</span>
            <LevelBadge level="B1" />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
            <span className="italic">verb</span><span>·</span><span>≈ {e.near}</span><span>·</span>
            <span className="rounded bg-chip px-1 text-[10.5px] font-semibold tracking-wide">EN→FR</span>
          </div>
        </div>
        <IconBtn icon={Volume2} label="Say it" size={28} icon_size={15} />
        <IconBtn icon={X} label="Close" size={28} icon_size={15} className="text-muted" />
      </div>
      {/* sense tabs: the pager now names what it pages through */}
      <div className="no-scrollbar mt-2.5 flex gap-1 overflow-x-auto px-3">
        {ENTRIES.map((x, k) => (
          <button key={k} onClick={() => setI(k)} className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] transition-colors", k === i ? "bg-accent text-on-accent" : "bg-chip text-ink hover:bg-line")}>{k + 1}. {x.answer}</button>
        ))}
      </div>
      <div key={i} className="anim-rise px-3.5 pb-3 pt-2.5">
        <div className="text-[18px] text-ink">{e.answer}</div>
        <div className="text-[13.5px] italic text-muted">{e.gloss}</div>
      </div>
      <div className="flex items-center gap-1 border-t border-line px-2 py-1.5">
        <button onClick={() => setSaved(!saved)} className={cn("flex h-7 items-center gap-1.5 rounded-lg px-2 text-[12.5px] transition-colors", saved ? "bg-accent-soft text-accent" : "text-ink hover:bg-line")}>
          {saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}{saved ? "In word list" : "Add to word list"}
        </button>
        <IconBtn icon={Copy} label="Copy answer" size={28} icon_size={14} />
        <span className="flex-1" />
        <button className="flex h-7 items-center gap-1 rounded-lg px-2 text-[12.5px] text-muted hover:bg-line hover:text-ink"><BookA size={14} /> Open</button>
      </div>
    </div>
  );
}

export function DictGlance() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={() => setOpen(!open)} className="relative flex h-[38px] items-center gap-2 rounded-full border border-line bg-surface pl-3.5 pr-1.5 pop">
        <span className="text-[14px] text-ink">acknowledged</span>
        <span className="text-muted">→</span>
        <span className="text-[14px] font-medium text-accent">reconnaître</span>
        <LevelBadge level="B1" />
        <span className="grid h-7 w-7 place-items-center rounded-full hover:bg-line"><Volume2 size={14} /></span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-chip"><ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} /></span>
      </button>
      {open && <div className="anim-rise"><DictCardProposed /></div>}
    </div>
  );
}

/* ---------------- AI card: current (from cefr-ai-lookup.jpg) and proposed ---------------- */
const SYN = ["recognized", "accepted", "assumed", "understood", "taken for granted"];
const USES = ["Her contribution was acknowledged in the report.", "He acknowledged that the first plan had failed.", "The report acknowledges the limits of the evidence."];

export function AiCardCurrent() {
  return (
    <div className="w-[380px] rounded-[12px] border border-line bg-surface p-4 pop">
      <div className="flex items-baseline gap-2"><span className="text-[22px] text-ink">acknowledged</span><span className="text-[15px] italic text-muted">verb</span><span className="text-[13px] text-muted">B1</span>
        <span className="ml-auto flex gap-2"><IconBtn icon={Volume2} label="Say" size={24} /><IconBtn icon={X} label="Close" size={24} /></span></div>
      <div className="mt-2 text-[13px] text-muted">Meaning</div>
      <div className="text-[15px] leading-snug text-ink">Accepted as true or recognized. Here, Austen frames a belief about wealthy bachelors and marriage as unquestioned, with a wry edge.</div>
      <div className="mt-2 text-[13px] text-muted">Synonyms</div>
      <div className="mt-1 flex flex-wrap gap-1.5">{SYN.map((s) => <span key={s} className="rounded-full bg-accent-soft/70 px-2.5 py-1 text-[13px] text-ink">{s}</span>)}</div>
      <div className="mt-2 text-[13px] text-muted">Usages</div>
      <ul className="ml-4 list-disc space-y-1 text-[14.5px] italic text-ink marker:text-muted">{USES.map((u) => <li key={u}>{u}</li>)}</ul>
      <div className="mt-3 flex text-[13px]"><span className="text-muted">Assistant-generated sample</span><span className="ml-auto text-accent">Ask again</span></div>
    </div>
  );
}

export function AiCardProposed() {
  const [more, setMore] = useState(false);
  return (
    <div className="w-[340px] rounded-[14px] border border-line bg-surface pop">
      <div className="flex items-center gap-2 px-3.5 pt-3">
        <span className="text-[20px] font-medium tracking-tight text-ink">acknowledged</span><LevelBadge level="B1" />
        <span className="flex-1" /><IconBtn icon={Volume2} label="Say" size={28} icon_size={15} /><IconBtn icon={X} label="Close" size={28} icon_size={15} className="text-muted" />
      </div>
      <div className="px-3.5 pb-2 text-[11.5px] italic text-muted">verb · in this sentence</div>
      <div className="mx-3 rounded-xl bg-paper/60 px-3 py-2.5 text-[14px] leading-snug text-ink">
        Accepted as true. <span className="text-muted">Austen frames a belief about wealthy bachelors as unquestioned, with a wry edge.</span>
      </div>
      <div className="no-scrollbar fade-x mt-2.5 flex gap-1.5 overflow-x-auto px-3.5">{SYN.map((s) => <button key={s} className="shrink-0 rounded-full border border-line px-2.5 py-[3px] text-[12.5px] text-ink hover:bg-chip">{s}</button>)}</div>
      <div className="px-3.5 pt-2.5">
        {(more ? USES : USES.slice(0, 1)).map((u) => (
          <p key={u} className="border-l-2 border-accent/40 py-0.5 pl-2.5 text-[13.5px] italic text-ink" dangerouslySetInnerHTML={{ __html: u.replace(/(acknowledg\w*)/, "<b class='not-italic font-semibold text-accent'>$1</b>") }} />
        ))}
        <button onClick={() => setMore(!more)} className="mt-1 text-[12px] text-muted hover:text-ink">{more ? "Fewer examples" : `+${USES.length - 1} more examples`}</button>
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-line px-3.5 py-2 text-[11.5px] text-muted">
        <Sparkles size={12} /> AI · may be imperfect
        <button className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-accent hover:bg-accent-soft"><RotateCw size={12} /> Ask again</button>
      </div>
    </div>
  );
}

export function DictSection() {
  return (
    <Section id="dict" kicker="dict/card.rs · dict/window.rs" title="Dictionary & AI word cards"
      intro={<>The hover card is clean and calm. Its weakest parts are structural: a whole 36 pt footer for three <b>anonymous dots</b>, a languages chip taking a full row, a CEFR level shown as plain grey text even though the page paints that same level in loud red, and no way to keep the word (the card has no word-list action; I checked <code>dict/card.rs</code>).</>}>
      <Grid>
        <Specimen tag="current" title="Hover card · 320 wide" src="dict/card.rs" stageClass="pt-12"><DictCardCurrent /></Specimen>
        <Specimen tag="proposed" title="Card 2.0 · 320 wide, ~40 pt shorter" stageClass="pt-12" note="The pager names its senses ('1. reconnaître', '2. admettre'), so you can jump straight to one. The language pair and lemma fold into one meta line. B1 becomes a badge in the same colour scale as the page marks. Add to word list and Copy sit in the action row; Open stays secondary.">
          <DictCardProposed />
        </Specimen>
        <Specimen tag="current" title="AI word card" src="ai.rs · page_ai/" stageClass="py-10"><AiCardCurrent /></Specimen>
        <Specimen tag="proposed" title="AI card 2.0 · tighter, sentence-first" stageClass="py-10" note="The contextual meaning comes first, its gist in ink and the commentary muted. Synonyms move to one swipeable row (they wrapped to two). Examples show one at a time with the headword highlighted, the rest on demand. The provenance line keeps its honesty but shrinks.">
          <AiCardProposed />
        </Specimen>
      </Grid>
      <Grid>
        <Specimen tag="variant" title="Glance · 38 pt, expands into the card" note="For quick lookups while reading, often the answer is all you need. Expanding opens Card 2.0 in place." stageClass="min-h-[340px] items-start pt-10"><DictGlance /></Specimen>
        <Notes title="Review" items={[
          ["keep", "Wheel-turns-one-entry (with a settle time), speak buttons only when a voice exists for the language, and tall scripts at 1.05× rather than 1.15×. These are thoughtful."],
          ["issue", "Dots carry no information: with 3+ senses you page blindly. Combined with the rules above and below, chrome takes about 38 % of the card's height."],
          ["issue", "The 'B1' label is unexplained and colourless, while the same level appears on the page as a saturated red block. The two should read as one system."],
          ["issue", "In the AI card, synonym chips wrap and three full italic examples make the card taller than the page area it is explaining."],
          ["warn", "Sense tabs must truncate long answers (Burmese, German compounds) at about 14 characters, with the full text in a tooltip."],
        ]} />
      </Grid>
    </Section>
  );
}
