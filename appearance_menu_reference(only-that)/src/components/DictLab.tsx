import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Bookmark, ChevronLeft, ChevronRight, Languages, Sparkles, Volume2, X } from "lucide-react";
import { cn } from "../utils/cn";
import { CiteTag, Duel, Panel, Seg, SpaceMeter, VerdictCard } from "./kit";
import { SOURCES, VERDICTS } from "../data/audit";

type Entry = { pos: string; level: string; gloss: string; my: string; ex: string; exMy: string; tag: string };
const ENTRIES: Entry[] = [
  { pos: "adjective", level: "B2", tag: "Adj", gloss: "widely recognized; accepted as true", my: "အသိအမှတ်ပြုသော", ex: "an acknowledged expert in the field", exMy: "နယ်ပယ်တွင် အသိအမှတ်ပြုခံရသော ကျွမ်းကျင်သူ" },
  { pos: "verb · past", level: "A2", tag: "Verb", gloss: "accepted that something is true or exists", my: "ဝန်ခံခဲ့သော", ex: "she acknowledged her mistake", exMy: "သူမက သူမအမှားကို ဝန်ခံခဲ့သည်" },
  { pos: "verb · formal", level: "C1", tag: "Formal", gloss: "expressed thanks for something received", my: "ကျေးဇူးတင်စကား ပြောကြားသော", ex: "he acknowledged the applause with a bow", exMy: "လက်ခုပ်သံအတွက် ဦးညွှတ်ပြီး ကျေးဇူးတင်စကား ပြောကြားခဲ့သည်" },
  { pos: "verb · legal", level: "C1", tag: "Legal", gloss: "accepted responsibility or authorship", my: "တာဝန်ယူသော", ex: "the bank acknowledged receipt of the funds", exMy: "ဘဏ်က ငွေလက်ခံရရှိမှုကို အသိအမှတ်ပြုခဲ့သည်" },
  { pos: "verb · rare", level: "C2", tag: "Rare", gloss: "greeted or recognized with a gesture", my: "နှုတ်ဆက်သော", ex: "she acknowledged him with a nod", exMy: "သူမက ခေါင်းညိတ်ပြီး သူ့ကို နှုတ်ဆက်ခဲ့သည်" },
];

function speak(word: string, onDone: () => void) {
  try {
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.9;
    u.onend = onDone;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    setTimeout(onDone, 2500);
  } catch {
    onDone();
  }
}

/* ------------------------------- shipped card ------------------------------- */

function ShippedDict({ at, setAt }: { at: number; setAt: (n: number) => void }) {
  const e = ENTRIES[at];
  return (
    <div className="w-[min(320px,100%)] overflow-hidden rounded-xl border border-[#3a332b] bg-[#211c16] shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold text-stone-100">acknowledged</div>
          <div className="mt-0.5 flex items-center justify-between text-[11.5px]">
            <span className="text-stone-400 italic">{e.pos}</span>
            <span className="font-mono text-[10.5px] text-stone-500">via English</span>
          </div>
        </div>
        <button className="rounded-md p-1.5 text-stone-400 hover:bg-white/8" title="EN → MY" aria-label="Languages"><Languages size={15} /></button>
        <button className="rounded-md p-1.5 text-stone-400 hover:bg-white/8" title="Speak" aria-label="Speak"><Volume2 size={15} /></button>
        <button className="rounded-md p-1.5 text-stone-400 hover:bg-white/8" title="Close" aria-label="Close"><X size={15} /></button>
      </div>
      <div className="h-px bg-white/8" />
      <div className="min-h-[96px] px-3.5 py-2.5">
        <p className="text-[13.5px] leading-relaxed text-stone-200">{e.gloss}.</p>
        <p className="mt-1 text-[13px] text-stone-400">{e.my}</p>
        <p className="mt-1.5 text-[12.5px] text-stone-500 italic">“{e.ex}”</p>
      </div>
      <div className="h-px bg-white/8" />
      <div className="flex h-9 items-center justify-center gap-3">
        <button onClick={() => setAt((at + ENTRIES.length - 1) % ENTRIES.length)} aria-label="Previous entry" className="text-stone-400 hover:text-white"><ChevronLeft size={16} /></button>
        <div className="flex items-center gap-1.5">
          {ENTRIES.map((_, i) => (
            <button key={i} onClick={() => setAt(i)} aria-label={`Entry ${i + 1}`}
              className={cn("h-[6px] w-[6px] rounded-full", i === at ? "bg-[#f5b83d]" : "bg-stone-600 hover:bg-stone-500")} />
          ))}
        </div>
        <button onClick={() => setAt((at + 1) % ENTRIES.length)} aria-label="Next entry" className="text-stone-400 hover:text-white"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

/* ------------------------------ redesigned card ----------------------------- */

function NewDict({ at, setAt, side }: { at: number; setAt: (n: number) => void; side: "below" | "above" }) {
  const e = ENTRIES[at];
  const [saved, setSaved] = useState(false);
  const [saying, setSaying] = useState(false);
  const [ai, setAi] = useState(false);

  const caret = side === "below"
    ? "top-[-7px] border-b-[#211c16]"
    : "bottom-[-7px] border-t-[#211c16]";

  return (
    <div className="w-[min(360px,100%)]">
      <div className={cn("relative overflow-hidden rounded-2xl border border-[#3a332b] bg-[#211c16] shadow-[0_18px_44px_rgba(0,0,0,0.6)]")}>
        <div className={cn("absolute left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-[8px] border-x-transparent", caret, side === "below" ? "border-b-[8px]" : "border-t-[8px]")} />
        <div className="px-4 pt-3.5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-serif text-[21px] font-semibold text-stone-50">acknowledged</h4>
                <button
                  onClick={() => { setSaying(true); speak("acknowledged", () => setSaying(false)); }}
                  aria-label="Pronounce"
                  className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors", saying ? "bg-[#f5b83d] text-[#14100a]" : "bg-white/8 text-stone-300 hover:bg-white/14")}
                >
                  {saying ? <span className="flex h-3 items-end gap-[2px]">{[0, 1, 2].map((i) => <span key={i} className="bar-dance w-[2.5px] rounded-full bg-current" style={{ height: "100%", animationDelay: `${i * 0.13}s` }} />)}</span> : <Volume2 size={14} />}
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-[#f5b83d]/15 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-[#f5b83d]">{e.level}</span>
                <span className="rounded-md bg-white/6 px-1.5 py-0.5 text-[11px] text-stone-300 italic">{e.pos}</span>
                <span className="flex items-center gap-1 rounded-md bg-white/6 px-1.5 py-0.5 font-mono text-[10.5px] text-stone-400"><ArrowLeftRight size={10} /> EN → MY</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button onClick={() => setSaved(!saved)} title={saved ? "Saved to Words" : "Save to Words"} aria-label="Save"
                className={cn("rounded-lg p-1.5", saved ? "text-[#f5b83d]" : "text-stone-500 hover:bg-white/8 hover:text-stone-200")}>
                <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
              </button>
              <button title="Close" aria-label="Close" className="rounded-lg p-1.5 text-stone-500 hover:bg-white/8 hover:text-stone-200"><X size={15} /></button>
            </div>
          </div>

          {/* one paging language: labeled tabs */}
          <div className="mt-2.5 flex gap-1 rounded-lg bg-black/25 p-1" role="tablist" aria-label="Entries">
            {ENTRIES.map((en, i) => (
              <button key={i} role="tab" aria-selected={i === at} onClick={() => setAt(i)}
                className={cn("flex-1 rounded-md px-1 py-1 text-[11px] font-medium transition-colors",
                  i === at ? "bg-[#f5b83d] text-[#14100a]" : "text-stone-400 hover:bg-white/6 hover:text-stone-200")}>
                {i + 1} · {en.tag}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={at} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.16 }}>
              <p className="mt-2.5 text-[15.5px] leading-relaxed text-stone-100">{e.gloss}.</p>
              <p className="mt-0.5 text-[14px] text-[#7cc4ff]/90">{e.my}</p>
              <div className="mt-2 rounded-lg border-l-2 border-[#f5b83d]/60 bg-white/4 px-2.5 py-1.5">
                <p className="font-serif text-[13.5px] text-stone-300 italic">“{e.ex}”</p>
                <p className="mt-0.5 text-[12px] text-stone-500">{e.exMy}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-2.5 flex items-center gap-1.5">
            <button onClick={() => setAi(!ai)} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] font-semibold", ai ? "bg-[#7cc4ff] text-[#10151c]" : "bg-[#7cc4ff]/12 text-[#7cc4ff] hover:bg-[#7cc4ff]/20")}>
              <Sparkles size={13} /> Explain in context
            </button>
            <button onClick={() => setAt((at + ENTRIES.length - 1) % ENTRIES.length)} aria-label="Previous entry" className="rounded-lg bg-white/6 p-1.5 text-stone-300 hover:bg-white/10"><ChevronLeft size={15} /></button>
            <button onClick={() => setAt((at + 1) % ENTRIES.length)} aria-label="Next entry" className="rounded-lg bg-white/6 p-1.5 text-stone-300 hover:bg-white/10"><ChevronRight size={15} /></button>
          </div>
          <AnimatePresence>
            {ai && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="mt-2 rounded-lg bg-[#7cc4ff]/8 p-2.5 text-[12.5px] leading-relaxed text-stone-300">
                  <span className="font-semibold text-[#7cc4ff]">Austen is being arch:</span> “universally acknowledged” frames gossip as natural law. The Myanmar gloss leans formal — in dialogue you'd hear <span className="font-mono text-[12px]">လူတိုင်းသိတယ်</span> instead.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- lab ----------------------------------- */

export default function DictLab() {
  const [at, setAt] = useState(1);
  const [side, setSide] = useState<"below" | "above">("below");

  const anchor = (card: React.ReactNode) => (
    <div className="rounded-xl bg-[#efe7d8] p-4">
      <div className="paper-noise -m-4 mb-3 p-4 pb-0">
        <p className="mx-auto max-w-[400px] text-center font-serif text-[16px] leading-relaxed text-[#4a4136]">
          “It is a truth universally <span className="relative rounded bg-[#f5b83d]/60 px-1 font-semibold whitespace-nowrap">acknowledged<span className="absolute -bottom-[5px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rotate-45 bg-[#f5b83d]/60" /></span>, that a single man…”
        </p>
        <p className="mt-1 text-center font-mono text-[10.5px] text-[#8a7a5c]">anchor · caret on the word's midline · gap 11</p>
      </div>
      <div className="flex justify-center pt-1">{card}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <CiteTag cite={SOURCES.dictCard} />
        <CiteTag cite={SOURCES.bubble} />
      </div>
      <VerdictCard verdict={VERDICTS.dict} />

      <Panel label="anchored pair — entry paging stays in sync across both">
        <div className="flex flex-wrap items-center gap-4 border-b border-[#2c2620] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-stone-500 uppercase">Caret side</span>
            <Seg value={side} onChange={setSide} options={[{ value: "below", label: "Below word" }, { value: "above", label: "Above word" }]} />
          </div>
          <span className="text-[12px] text-stone-500">entry {at + 1} of {ENTRIES.length} · try the speaker — it uses your real voice engine</span>
        </div>
        <div className="bg-[#0d0b09] p-3 md:p-4">
          <Duel
            before={<Panel><div className="p-3">{anchor(<ShippedDict at={at} setAt={setAt} />)}<p className="px-1 pt-2 font-mono text-[11px] text-stone-500">320px · header crowds word + 3 buttons · anonymous dots · “via English” floats</p></div></Panel>}
            after={<Panel><div className="p-3">{anchor(<NewDict at={at} setAt={setAt} side={side} />)}<p className="px-1 pt-2 font-mono text-[11px] text-stone-500">360px · chips carry level/pos/route · numbered tabs = one paging language · gloss at reading size</p></div></Panel>}
          />
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <SpaceMeter
          rows={[
            { label: "Card width", before: 320, after: 360, unit: "px" },
            { label: "Gloss type size", before: 13.5, after: 15.5, unit: "px" },
            { label: "Paging languages to learn", before: 2, after: 1, unit: "" },
          ]}
        />
        <div className="space-y-3">
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why wider is smaller.</span> 320px forces the header into truncation and the gloss into label-size type. 360px buys chips instead of a crowded header, a 15.5px gloss (content, per the audit's own rule), and labeled tabs that delete the dots-vs-count split brain — net: fewer rows, less scrolling, faster scanning.
          </div>
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why tabs, not dots.</span> Dots say “there is more” but never “what”. Numbered part-of-speech tabs turn paging into navigation — verb hunters jump straight to entry 2. The <span className="font-mono text-[12px] text-stone-400">STEP 24</span> wheel-flick survives underneath for trackpad loyalists; it just stops being the only map.
          </div>
        </div>
      </div>
    </div>
  );
}
