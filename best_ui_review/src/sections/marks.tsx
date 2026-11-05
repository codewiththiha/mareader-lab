import { useState } from "react";
import { List, Table2, Image as ImageIcon } from "lucide-react";
import { Grid, Notes, Section, Specimen } from "../kit/frame";
import { Kbd, Segmented } from "../kit/primitives";
import { CEFR } from "./dict";
import { cn } from "../kit/cn";

const TEXT: [string, string?][] = [["It is a truth "], ["universally", "C1"], [" "], ["acknowledged", "B1"], [", that a "], ["single", "A2"], [" man in "], ["possession", "B2"], [" of a "], ["good", "A1"], [" fortune, must be in "], ["want", "A2"], [" of a wife. However little known the "], ["feelings", "B1"], [" or views of such a man may be on his first entering a "], ["neighbourhood", "B2"], [", this truth is so well "], ["fixed", "B1"], [" in the minds of the surrounding families."]];

type Style = "current" | "wash" | "underline" | "dot";
function Mark({ w, lvl, style }: { w: string; lvl?: string; style: Style }) {
  if (!lvl || (style !== "current" && ["A1", "A2"].includes(lvl))) return <>{w}</>;
  const c = CEFR[lvl];
  if (style === "current") return <span style={{ background: "var(--cefr-red)" }}>{w}</span>;
  if (style === "wash") return <span className="rounded-[3px] px-[1px]" style={{ background: `color-mix(in oklab, ${c} 20%, transparent)` }}>{w}</span>;
  if (style === "underline") return <span style={{ textDecoration: "underline", textDecorationColor: c, textDecorationThickness: lvl.startsWith("C") ? 2.5 : 1.5, textDecorationStyle: lvl === "B1" ? "dotted" : "solid", textUnderlineOffset: 3 }}>{w}</span>;
  return <span className="relative">{w}<span className="absolute -top-[3px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full" style={{ background: c }} /></span>;
}
function Paragraph({ style }: { style: Style }) {
  return <p className="max-w-[520px] font-book text-[17px] leading-[1.6] text-ink [text-align:justify]">{TEXT.map(([w, l], i) => <Mark key={i} w={w} lvl={l} style={style} />)}</p>;
}

/* read_aloud/ask.rs: 44 pt pill, rises 8 pt, 10 pt above the player. */
function AskCurrent() {
  return (
    <div className="flex h-[44px] items-center gap-2 rounded-full border border-line bg-surface pl-[6px] pr-[6px] pop">
      <span className="grid h-[32px] w-[32px] place-items-center rounded-full bg-accent-soft text-accent"><List size={16} /></span>
      <span className="pr-2 text-[14px] text-ink">List ahead</span>
      <button className="h-[30px] rounded-full px-3 text-[12px] text-ink hover:bg-line">Read</button>
      <button className="h-[30px] rounded-full bg-accent px-3 text-[12px] text-on-accent">Skip</button>
    </div>
  );
}
function AskProposed() {
  const [kind, setKind] = useState<"List" | "Table" | "Figure">("Table");
  const [always, setAlways] = useState(false);
  const I = kind === "List" ? List : kind === "Table" ? Table2 : ImageIcon;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 rounded-[18px] border border-line bg-surface p-[6px] pl-2 pop">
        <span className="grid h-[32px] w-[32px] place-items-center rounded-[10px] bg-accent-soft text-accent"><I size={16} /></span>
        <div className="pr-1 leading-tight">
          <div className="text-[13.5px] font-medium text-ink">{kind} ahead</div>
          <div className="text-[11.5px] text-muted">{kind === "Table" ? "6 rows · ~40 s" : kind === "List" ? "9 items · ~25 s" : "caption · ~5 s"}</div>
        </div>
        <button className="flex h-[30px] items-center gap-1.5 rounded-[10px] px-2.5 text-[12.5px] text-ink hover:bg-line">Read <Kbd>␣</Kbd></button>
        <button className="flex h-[30px] items-center gap-1.5 rounded-[10px] bg-accent px-2.5 text-[12.5px] text-on-accent">Skip <span className="rounded bg-white/20 px-1 text-[10.5px]">Esc</span></button>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted">
        <input type="checkbox" checked={always} onChange={(e) => setAlways(e.target.checked)} className="accent-[var(--accent)]" /> Always skip {kind.toLowerCase()}s in this book
      </label>
      <div className="w-[240px]"><Segmented size="sm" value={kind} onChange={setKind} options={[{ v: "List", label: "List" }, { v: "Table", label: "Table" }, { v: "Figure", label: "Figure" }]} /></div>
    </div>
  );
}

export function MarksSection() {
  const [style, setStyle] = useState<Style>("wash");
  return (
    <Section id="marks" kicker="study/ · vocab.rs · read_aloud/ask.rs" title="Page marks & the read-aloud question"
      intro={<>From <code>cefr-word-lookup.jpg</code> and <code>notes-panel.jpg</code>: words above your level are painted as <b>solid, saturated red blocks</b>, every one the same colour, and user highlights use a raw <code>#efee00</code> yellow that ignores the sepia tint the rest of the page follows. On a paper-first reader, the page should stay the quietest thing.</>}>
      <Grid>
        <Specimen tag="current" title="CEFR marks as shipped" src="screenshot: cefr-word-lookup.jpg" stageClass="py-10"><Paragraph style="current" /></Specimen>
        <Specimen tag="proposed" title="Level-graded, tint-aware marks" stageClass="flex-col gap-5 py-10" note="Marks share one level scale (A→C runs green→amber→red), the same one as the card's badge. They are weighted by level so C-words stand out more than B1s, and words at or below your level aren't marked. Underline and dot styles leave the text colour and paper untouched, which matters for long reading.">
          <div className="w-[360px]"><Segmented value={style} onChange={setStyle} options={[{ v: "wash", label: "Soft wash" }, { v: "underline", label: "Underline" }, { v: "dot", label: "Dot" }]} /></div>
          <Paragraph style={style} />
          <div className="flex flex-wrap justify-center gap-2 text-[11px]">{Object.entries(CEFR).map(([k, c]) => <span key={k} className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", ["A1", "A2"].includes(k) && "opacity-40")} style={{ background: `${c}1f`, color: c }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{k}</span>)}</div>
        </Specimen>
        <Specimen tag="current" title="Highlight & note markers" src="screenshot: notes-panel.jpg" stageClass="py-10">
          <p className="max-w-[460px] font-book text-[16px] leading-[1.6] text-ink">It is a truth <span style={{ background: "var(--hl-raw)" }}>universally acknowledged</span>, that a single man in possession of a <span style={{ background: "var(--hl-raw)" }}>good fortune</span>, must be in want of <span style={{ background: "var(--hl-raw)" }}>a wife</span>.
            <span className="ml-2 inline-grid h-[14px] w-[14px] place-items-center rounded-full border border-black/30 align-middle" style={{ background: "var(--hl-raw)" }}><span className="h-[6px] w-[5px] border border-black/50" /></span></p>
        </Specimen>
        <Specimen tag="proposed" title="Highlights mixed into the paper" stageClass="py-10" note="The highlight colour is blended with the paper (multiply in light modes, screen in dark), so it takes the tint. A note becomes a 2 pt underline-tab after the passage rather than a bright circle in the margin, and the margin icon only appears on hover.">
          <p className="max-w-[460px] font-book text-[16px] leading-[1.6] text-ink">It is a truth <span className="rounded-[2px]" style={{ background: "color-mix(in oklab, #f2d43a 42%, var(--paper))", boxShadow: "inset 0 -2px 0 color-mix(in oklab, #c79a00 60%, transparent)" }}>universally acknowledged</span>, that a single man in possession of a <span className="rounded-[2px]" style={{ background: "color-mix(in oklab, #f2d43a 42%, var(--paper))" }}>good fortune</span>, must be in want of <span className="rounded-[2px]" style={{ background: "color-mix(in oklab, #8fc1e8 40%, var(--paper))" }}>a wife</span>.</p>
        </Specimen>
      </Grid>
      <Grid>
        <Specimen tag="current" title="“List ahead” question · 44 pt pill" src="read_aloud/ask.rs" stageClass="py-12"><AskCurrent /></Specimen>
        <Specimen tag="proposed" title="Question with cost, keys and a remembered answer" stageClass="py-10" note="Saying how long the part is turns a blind choice into an informed one. The keys (Play/Space = Read, Esc = Skip) already exist in the code but are invisible, so show them. 'Always skip in this book' saves a trip to Settings."><AskProposed /></Specimen>
      </Grid>
      <Notes title="Review" items={[
        ["issue", "One flat red for every marked word means ‘acknowledged’ (B1) shouts as loudly as ‘universally’ (C1). Level information exists (the card shows it) but the page discards it."],
        ["issue", "Raw-yellow highlights break the 'one theme source' principle in design.md: everything else is derived through the OKLCH tint, but these are not."],
        ["warn", "Colour-only level coding fails for colour-blind readers. Pair it with weight (underline thickness or style) as the underline variant does, and keep the level in the hover card."],
        ["warn", "'Always skip' changes behaviour users rely on only if it's default-on. Keep it opt-in, per book, and undoable from the player's ⋯ menu."],
      ]} />
    </Section>
  );
}
