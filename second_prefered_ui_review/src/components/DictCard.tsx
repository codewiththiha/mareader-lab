import { useRef, useState } from "react";
import { Volume2, BookA, X, ChevronLeft, ChevronRight, ArrowLeftRight, Sparkles, Plus, GripVertical, Search } from "lucide-react";
import { clsx } from "clsx";
import { Compare, Finding, Findings, Kbd, PageText, Section, Stage } from "../lib/ui";

const ENTRIES = [
  { lemma: "acknowledge", answer: "reconnaître", gloss: "to admit the knowledge of" },
  { lemma: "acknowledge", answer: "accuser réception de", gloss: "to confirm that something was received" },
  { lemma: "acknowledge", answer: "saluer", gloss: "to show that one has noticed someone" },
];
const CEFR: Record<string, string> = { A1: "#16a34a", A2: "#65a30d", B1: "#ca8a04", B2: "#ea580c", C1: "#dc2626", C2: "#7c3aed" };

function Caret({ side = "above" }: { side?: "above" | "below" }) {
  return <span className={clsx("absolute left-[60px] h-[14px] w-[14px] rotate-45 border-line bg-surface", side === "above" ? "-bottom-[8px] border-b border-r" : "-top-[8px] border-l border-t")} />;
}

/** dict/card.rs: WIDTH 320, PAD 14/10, header / entry / footer split by hairlines, dots ≤ 7. */
function CurrentDict() {
  const [i, setI] = useState(0);
  const e = ENTRIES[i];
  return (
    <div className="rise relative w-[320px] rounded-[12px] border border-line bg-surface shadow-pop">
      <Caret />
      <div className="px-[14px] pt-[10px] pb-[8px]">
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-medium leading-tight ink">acknowledged</span>
          <span className="serif text-[15px] italic muted">verb</span>
          <span className="text-[13px] muted">B1</span>
          <span className="ml-auto flex items-center gap-1">
            <button className="sb" aria-label="Say it"><Volume2 size={15} /></button>
            <button className="sb" aria-label="Open in the Dictionary"><BookA size={15} /></button>
            <button className="sb" aria-label="Close"><X size={15} /></button>
          </span>
        </div>
        <button className="mt-2 rounded-full px-3 py-[3px] text-[13px] muted" style={{ background: "var(--hover)" }}>English → French</button>
      </div>
      <div className="hairline" />
      <div className="px-[14px] py-[10px]">
        <div className="text-[13px] muted">≈ {e.lemma}</div>
        <div className="mt-1 text-[16px] ink">{e.answer}</div>
        <div className="mt-1 text-[14px] italic muted">{e.gloss}</div>
      </div>
      <div className="hairline" />
      <div className="flex h-[36px] items-center justify-between px-[10px]">
        <button className="sb" onClick={() => setI((i + ENTRIES.length - 1) % ENTRIES.length)} aria-label="Previous entry"><ChevronLeft size={15} /></button>
        <span className="flex items-center gap-[6px]">{ENTRIES.map((_, k) => <span key={k} className="h-[6px] rounded-full transition-all" style={{ width: k === i ? 18 : 6, background: k === i ? "var(--accent)" : "var(--track)" }} />)}</span>
        <button className="sb" onClick={() => setI((i + 1) % ENTRIES.length)} aria-label="Next entry"><ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

/** Proposal: one card, two tabs (Dictionary · AI), CEFR chip in colour, a swap button, "2 of 3" pager. */
function ProposedDict() {
  const [i, setI] = useState(0);
  const [tab, setTab] = useState<"dict" | "ai">("dict");
  const e = ENTRIES[i];
  return (
    <div className="rise relative w-[320px] rounded-[12px] border border-line bg-surface shadow-pop">
      <Caret />
      <div className="px-[14px] pt-[10px] pb-[8px]">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="truncate text-[22px] font-medium leading-tight ink">acknowledged</span>
              <span className="serif text-[14px] italic muted">verb</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-[5px] px-1.5 py-[1px] text-[11px] font-bold text-white" style={{ background: CEFR.B1 }}>B1</span>
              <span className="text-[12px] muted">/əkˈnɒlɪdʒd/</span>
              <button className="sb !h-5 !w-5" aria-label="Say it"><Volume2 size={13} /></button>
            </div>
          </div>
          <button className="sb" aria-label="Close"><X size={15} /></button>
        </div>
        <div className="mt-2 flex items-center gap-1 rounded-[8px] p-[2px]" style={{ background: "var(--hover)" }}>
          {(["dict", "ai"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={clsx("flex h-[24px] flex-1 items-center justify-center gap-1 rounded-[6px] text-[12.5px] font-medium transition-colors", tab === k ? "bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,.12)] ink" : "muted")}>
              {k === "dict" ? <><BookA size={13} />Dictionary</> : <><Sparkles size={13} />AI in context</>}
            </button>
          ))}
        </div>
      </div>
      <div className="hairline" />
      {tab === "dict" ? (
        <div className="px-[14px] py-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] muted">≈ {e.lemma}</span>
            <button className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11.5px] muted hover:bg-[var(--hover)]" title="Swap languages">EN <ArrowLeftRight size={10} /> FR</button>
          </div>
          <div className="mt-1 text-[17px] ink">{e.answer}</div>
          <div className="mt-0.5 text-[14px] italic muted">{e.gloss}</div>
        </div>
      ) : (
        <div className="px-[14px] py-[10px] text-[14px] leading-snug ink">
          Accepted as true or recognized. Here, Austen frames a belief about wealthy bachelors as unquestioned, with a wry edge.
          <div className="mt-2 flex flex-wrap gap-1">{["recognized", "accepted", "assumed"].map((s) => <span key={s} className="rounded-full px-2 py-[2px] text-[12px]" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{s}</span>)}</div>
        </div>
      )}
      <div className="hairline" />
      <div className="flex h-[36px] items-center px-[10px]">
        {tab === "dict" ? (
          <>
            <button className="sb" onClick={() => setI((i + ENTRIES.length - 1) % ENTRIES.length)} aria-label="Previous entry"><ChevronLeft size={15} /></button>
            <span className="w-[56px] text-center text-[12px] tabular-nums muted">{i + 1} of {ENTRIES.length}</span>
            <button className="sb" onClick={() => setI((i + 1) % ENTRIES.length)} aria-label="Next entry"><ChevronRight size={15} /></button>
            <span className="ml-auto flex items-center gap-1">
              <button className="inline-flex h-[24px] items-center gap-1 rounded-[6px] px-2 text-[12px] font-medium ink hover:bg-[var(--hover)]"><Plus size={13} />Word list</button>
              <button className="sb" aria-label="Open in the Dictionary"><BookA size={15} /></button>
            </span>
          </>
        ) : (
          <><span className="text-[12px] muted">Assistant-generated</span><button className="ml-auto text-[13px] font-medium" style={{ color: "var(--accent)" }}>Ask again</button></>
        )}
      </div>
    </div>
  );
}

/** The dictionary page window (dict/window.rs) on a stage: drag it past an edge to park it. */
function ParkStage({ proposed }: { proposed?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const W = 300, H = 220, PEEK = 20, MAGNET = 8;
  const [pos, setPos] = useState({ x: 140, y: 60 });
  const [park, setPark] = useState<null | "left" | "right">(null);
  const [hot, setHot] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const justParked = useRef(false);
  const onDown = (e: React.PointerEvent) => { drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }; (e.currentTarget as Element).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { if (!drag.current) return; setPark(null); setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy }); };
  const onUp = () => {
    if (!drag.current) return; drag.current = null;
    const sw = stage.current?.clientWidth ?? 600;
    const overL = Math.max(0, -pos.x), overR = Math.max(0, pos.x + W - sw);
    // dict/window.rs: past half its width over an edge, it parks there.
    if (Math.max(overL, overR) > W * 0.5) { setPark(overL > overR ? "left" : "right"); justParked.current = true; }
    else setPos((p) => ({ x: Math.min(Math.max(8, p.x), sw - W - 8), y: Math.min(Math.max(8, p.y), H + 80) }));
  };
  const sw = stage.current?.clientWidth ?? 600;
  const lift = park && hot ? MAGNET : 0;
  const x = park === "left" ? -W + PEEK + lift : park === "right" ? sw - PEEK - lift : pos.x;
  const y = park ? Math.min(Math.max(8, pos.y), 120) : pos.y;
  return (
    <div ref={stage} className="relative h-[380px] overflow-hidden">
      <div className="p-5 pr-[40%] opacity-70"><PageText /></div>
      <div className="absolute right-4 top-4 text-[12px] muted">Drag the window past the left or right edge</div>
      <div
        className={clsx("absolute select-none overflow-hidden rounded-[12px] border border-line bg-surface shadow-pop", park ? "transition-all duration-[260ms] ease-out" : "")}
        style={{ width: W, height: H, left: x, top: y, cursor: park ? "pointer" : "grab" }}
        onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)}
        onPointerDown={park ? undefined : onDown} onPointerMove={onMove} onPointerUp={onUp}
        onClick={() => { if (justParked.current) { justParked.current = false; return; } if (park) { setPark(null); setPos((p) => ({ ...p, x: park === "left" ? 16 : sw - W - 16 })); } }}
      >
        {/* window body */}
        <div className={clsx("absolute inset-0 flex flex-col", park && "pointer-events-none")}>
          <div className="flex h-[40px] items-center gap-2 border-b border-line px-3">
            <Search size={14} className="muted" /><span className="flex-1 text-[13px] ink">acknowledged</span><span className="text-[11px] muted">EN → FR</span><X size={14} className="muted" />
          </div>
          <div className="p-3">
            <div className="text-[18px] font-medium ink">acknowledged <span className="serif text-[13px] italic muted">verb</span> <span className="text-[12px] muted">B1</span></div>
            <div className="mt-2 text-[15px] ink">reconnaître</div>
            <div className="text-[13px] italic muted">to admit the knowledge of</div>
            <div className="mt-2 text-[13px] ink">accuser réception de</div>
            <div className="text-[13px] italic muted">to confirm that something was received</div>
          </div>
        </div>
        {/* Proposed: the peek strip is a labelled tab, not an empty slice of frame */}
        {proposed && park && (
          <div className={clsx("absolute inset-y-0 flex w-[20px] flex-col items-center justify-center gap-2 bg-surface", park === "left" ? "right-0 border-l border-line" : "left-0 border-r border-line")}>
            <GripVertical size={12} className="muted" />
            <BookA size={13} style={{ color: "var(--accent)" }} />
            <span className="text-[10.5px] font-semibold ink" style={{ writingMode: "vertical-rl", transform: park === "left" ? "rotate(180deg)" : undefined }}>acknowledged</span>
          </div>
        )}
      </div>
      {park && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-[var(--surface)] px-3 py-1 text-[12px] muted">Parked at the {park} edge · hover pulls it {MAGNET} pt · click reveals</div>}
    </div>
  );
}

export default function DictCard() {
  return (
    <Section id="dict" title="Lookup card, AI card & edge parking" source="crates/ui/src/dict/card.rs · dict/look.rs · bubble.rs · dict/window.rs · park.rs" verdict="polish"
      summary="The lookup card is in good shape since the UX audit: an anchored bubble with a caret on the word's midline, header / entry / footer split by hairlines, definitions at reading size. The AI card shares the bubble. Two things remain: the two cards are two different shapes for one question, and a parked window is a blank 20 pt slice.">
      <Compare
        current={<div className="p-5"><div className="mb-[70px] max-w-[460px]"><PageText hl /></div><div className="absolute left-5 top-[88px]"><CurrentDict /></div></div>}
        proposed={<div className="p-5"><div className="mb-[70px] max-w-[460px]"><PageText hl /></div><div className="absolute left-5 top-[88px]"><ProposedDict /></div></div>}
        currentNote="Word 22 pt, part of speech in the serif italic, “B1” as plain muted text, the language pair as a pill, then ≈ lemma / answer / gloss. Footer ‹ dots › shows only with more than one entry."
        proposedNote={<>One bubble for both answers: a Dictionary · AI tab in the header. The CEFR level is a coloured chip (the shading the page already uses), the pager reads <em>1 of 3</em>, “Add to word list” sits in the footer where the hand already is, and the language pair becomes a swap button at the entry, not a pill in the header. <Kbd>←</Kbd> <Kbd>→</Kbd> page.</>}
      />
      <Findings>
        <Finding kind="ok">The caret clear of rounded corners, measuring in an invisible first pass to pick the side, and the 160 ms 4 pt rise are all right (ux-audit 1.1–1.6 done). The answer 15 % larger than UI text is the single best decision in this card.</Finding>
        <Finding kind="bug">Two cards, two shapes: lookup has a language pill, dots, a Dictionary button; the AI card has Meaning / Synonyms / Usages, a footer link, and no Dictionary button. A reader who pressed the wrong one closes and re-selects. The selection bar's two buttons (Look up, AI Dictionary) can open the same card on different tabs.</Finding>
        <Finding kind="bug">“B1” is plain 13 pt muted text beside the italic “verb” — the one fact the CEFR feature exists to show is the quietest thing in the header. The page already colours words by level; the chip should reuse that colour.</Finding>
        <Finding kind="idea">Dots with DOTS_MAX 7 and a wide active dot say “there are more” but not how many; at 5 + entries a count is faster to read and costs the same 36 pt footer.</Finding>
      </Findings>
      <h3 className="pt-2 text-[16px] font-semibold">Parking a floating window at an edge</h3>
      <Compare tall current={<ParkStage />} proposed={<ParkStage proposed />}
        currentNote="park.rs: Tuck keeps the window's size and leaves PEEK 20 pt on stage; HIDE 0.26 s, REVEAL 0.34 s, MAGNET 8 pt in 0.18 s on hover; a click on the peek reveals. The peek is the window's own edge: frame, nothing else."
        proposedNote="Same geometry and timings. The 20 pt that stays on stage becomes a tab: grip, the panel's icon in accent, and its subject written vertically. A row of two or three parked panels then reads as a rail." />
      <Findings>
        <Finding kind="ok">The park mechanism itself — same size, slide not shrink, magnet pull as an affordance, `with_resume` so the stored rect survives — is well judged. Also the `dict-window-edge` 8 pt resize bands and refusing to park while the pointer is down.</Finding>
        <Finding kind="bug">`dict/window.rs` parks on Left or Right only; `read_aloud/mod.rs` parks on Bottom only. A reader cannot choose. Let both go to any of the three edges (the `Edge` enum already has all three); the one rule is “past half of me over an edge”.</Finding>
        <Finding kind="idea">A window parked at an edge should still receive a lookup: when a word is looked up while parked, slide out, show, and (if untouched for 4 s, as `unparked_until` already does for the player) slide back.</Finding>
      </Findings>
      <Stage label="AI card as shipped (dict/look.rs) — for reference" tone="plain" className="!min-h-0">
        <div className="flex flex-wrap gap-6 p-5">
          <div className="w-[320px] rounded-[12px] border border-line bg-surface p-[14px] shadow-pop">
            <div className="flex items-center gap-2"><span className="text-[22px] font-medium ink">acknowledged</span><span className="serif text-[15px] italic muted">verb</span><span className="text-[13px] muted">B1</span><span className="ml-auto flex gap-1"><Volume2 size={15} className="muted" /><X size={15} className="muted" /></span></div>
            <div className="mt-3 text-[13px] muted">Meaning</div>
            <p className="mt-1 text-[16px] leading-snug ink">Accepted as true or recognized. Here, Austen frames a belief about wealthy bachelors and marriage as unquestioned, with a wry edge.</p>
            <div className="mt-3 text-[13px] muted">Synonyms</div>
            <div className="mt-1 flex flex-wrap gap-1.5">{["recognized", "accepted", "assumed", "understood", "taken for granted"].map((s) => <span key={s} className="rounded-full px-2.5 py-[3px] text-[14px]" style={{ background: "var(--accent-soft)", color: "var(--ink)" }}>{s}</span>)}</div>
            <div className="mt-3 text-[13px] muted">Usages</div>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] italic ink"><li>Her contribution was acknowledged in the report.</li><li>He acknowledged that the first plan had failed.</li></ul>
            <div className="mt-3 flex items-center justify-between text-[13px]"><span className="muted">Assistant-generated sample</span><span style={{ color: "var(--accent)" }}>Ask again</span></div>
          </div>
          <div className="max-w-sm self-center text-[13.5px] leading-relaxed muted">
            The synonym chips are `accent_soft` with `ink` text; at Parchment strength the chip and the card are two near-identical creams (see the README shot). Using accent for the chip text, as the proposed tab does, keeps them legible on every tint without a new token.
          </div>
        </div>
      </Stage>
    </Section>
  );
}
