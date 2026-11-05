import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, BookOpenText, Columns2, Copy, Expand, Highlighter, Maximize2, Minus, MoveVertical, NotebookPen,
  PanelTop, Pin, Plus, Rows3, Settings, Sparkles, Volume2, Zap, Keyboard,
} from "lucide-react";
import { cn } from "../utils/cn";
import { CiteTag, Duel, Kbd, Panel, SpaceMeter, Switch, VerdictCard } from "./kit";
import { SOURCES, VERDICTS } from "../data/audit";

/* ------------------------------ shared view state --------------------------- */

type VMode = "Single" | "Spread" | "Vertical" | "Strip";
const VMODES: { n: VMode; icon: React.ReactNode; keys: string }[] = [
  { n: "Single", icon: <BookOpen size={16} />, keys: "1" },
  { n: "Spread", icon: <Columns2 size={16} />, keys: "2" },
  { n: "Vertical", icon: <MoveVertical size={16} />, keys: "3" },
  { n: "Strip", icon: <Rows3 size={16} />, keys: "4" },
];

function ShippedViewMenu({ mode, setMode, zoom, setZoom }: { mode: VMode; setMode: (m: VMode) => void; zoom: number; setZoom: (z: number) => void }) {
  const Row = ({ icon, label, keys, on, onClick }: { icon: React.ReactNode; label: string; keys?: string; on?: boolean; onClick?: () => void }) => (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-left text-[13px] text-stone-200 hover:bg-white/6">
      <span className="text-stone-400">{icon}</span>
      <span className="flex-1">{label}</span>
      {on && <span className="h-1.5 w-1.5 rounded-full bg-[#f5b83d]" />}
      {keys && <Kbd>{keys}</Kbd>}
    </button>
  );
  return (
    <div className="w-[272px] rounded-xl border border-[#3a332b] bg-[#211c16] p-2 shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
      <p className="px-2 pt-1 pb-1 font-mono text-[10.5px] tracking-wider text-stone-500 uppercase">Layout</p>
      <div className="flex h-[46px]">
        {VMODES.map((m) => (
          <button key={m.n} onClick={() => setMode(m.n)} title={`${m.n} (${m.keys})`}
            className={cn("flex flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[11px]", mode === m.n ? "bg-white/10 text-[#f5b83d]" : "text-stone-300 hover:bg-white/6")}>
            {m.icon}{m.n}
          </button>
        ))}
      </div>
      <p className="px-2 pt-2 pb-1 font-mono text-[10.5px] tracking-wider text-stone-500 uppercase">Zoom</p>
      <div className="flex items-center gap-0.5 px-2">
        <button onClick={() => setZoom(Math.max(50, zoom - 10))} aria-label="Zoom out" className="rounded-md p-1.5 text-stone-300 hover:bg-white/8"><Minus size={14} /></button>
        <span className="w-[52px] text-center font-mono text-[12px] text-stone-200">{zoom}%</span>
        <button onClick={() => setZoom(Math.min(300, zoom + 10))} aria-label="Zoom in" className="rounded-md p-1.5 text-stone-300 hover:bg-white/8"><Plus size={14} /></button>
        <span className="flex-1" />
        <button title="Fit page" className="rounded-md p-1.5 text-stone-400 hover:bg-white/8"><Expand size={14} /></button>
        <button title="Fit width" className="rounded-md p-1.5 text-stone-400 hover:bg-white/8"><Maximize2 size={14} /></button>
      </div>
      <p className="px-2 pt-2 pb-1 font-mono text-[10.5px] tracking-wider text-stone-500 uppercase">Reading</p>
      <Row icon={<Zap size={15} />} label="Auto-scroll" keys="A" />
      <Row icon={<Volume2 size={15} />} label="Read aloud" keys="R" on />
      <Row icon={<Expand size={15} />} label="Full screen" keys="F11" />
      <Row icon={<PanelTop size={15} />} label="Distraction-free" keys="F" />
      <Row icon={<Pin size={15} />} label="Keep title bar shown" />
      <div className="my-1.5 h-px bg-white/8" />
      <Row icon={<Settings size={15} />} label="Settings" keys="⌘," />
      <Row icon={<Keyboard size={15} />} label="Keyboard shortcuts" keys="?" />
      <p className="px-2 pt-1 pb-0.5 font-mono text-[10.5px] text-stone-600">Mareader 0.9 · 14 rows, one column</p>
    </div>
  );
}

function NewViewMenu({ mode, setMode, zoom, setZoom, auto, setAuto, aloud, setAloud }: {
  mode: VMode; setMode: (m: VMode) => void; zoom: number; setZoom: (z: number) => void;
  auto: boolean; setAuto: () => void; aloud: boolean; setAloud: () => void;
}) {
  return (
    <div className="w-[min(320px,100%)] overflow-hidden rounded-2xl border border-[#3a332b] bg-[#211c16] shadow-[0_18px_44px_rgba(0,0,0,0.6)]">
      <div className="border-b border-white/8 p-2.5">
        <p className="px-1 pb-1.5 font-mono text-[10.5px] tracking-wider text-stone-500 uppercase">Layout</p>
        <div className="grid grid-cols-2 gap-1">
          {VMODES.map((m) => (
            <button key={m.n} onClick={() => setMode(m.n)}
              className={cn("flex items-center gap-2 rounded-lg border px-2 py-2 text-left", mode === m.n ? "border-[#f5b83d]/60 bg-[#f5b83d]/10" : "border-transparent hover:bg-white/6")}>
              <span className={mode === m.n ? "text-[#f5b83d]" : "text-stone-400"}>{m.icon}</span>
              <span className="flex-1 text-[12.5px] font-medium text-stone-100">{m.n}</span>
              <Kbd>{m.keys}</Kbd>
            </button>
          ))}
        </div>
      </div>
      <div className="border-b border-white/8 p-2.5">
        <div className="flex items-center justify-between px-1 pb-1.5">
          <p className="font-mono text-[10.5px] tracking-wider text-stone-500 uppercase">Zoom</p>
          <div className="flex gap-1">
            {(["Page", "Width"] as const).map((f) => (
              <button key={f} onClick={() => setZoom(f === "Page" ? 100 : 120)} className="rounded-md bg-white/6 px-2 py-0.5 font-mono text-[10.5px] text-stone-300 hover:bg-white/10">Fit {f}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 px-1">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} aria-label="Zoom out" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6 text-stone-200 hover:bg-white/10"><Minus size={14} /></button>
          <input type="range" min={50} max={300} step={5} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="demo-range flex-1" aria-label="Zoom" />
          <span className="w-12 text-right font-mono text-[12.5px] font-semibold text-stone-100">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(300, zoom + 10))} aria-label="Zoom in" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6 text-stone-200 hover:bg-white/10"><Plus size={14} /></button>
        </div>
      </div>
      <div className="space-y-1 p-2.5">
        <p className="px-1 pb-0.5 font-mono text-[10.5px] tracking-wider text-stone-500 uppercase">Reading</p>
        <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/4">
          <span className="flex items-center gap-2 text-[13px] text-stone-200"><Zap size={14} className="text-stone-400" /> Auto-scroll <Kbd>A</Kbd></span>
          <Switch on={auto} onFlip={setAuto} label="" />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[#f5b83d]/8 px-2 py-1.5 ring-1 ring-[#f5b83d]/25 ring-inset">
          <span className="flex items-center gap-2 text-[13px] font-medium text-stone-100"><Volume2 size={14} className="text-[#f5b83d]" /> Read aloud <Kbd>R</Kbd></span>
          <Switch on={aloud} onFlip={setAloud} label="" />
        </div>
        <p className="px-2 pt-1 font-mono text-[10.5px] text-stone-600">3 groups · switches act inline · menu stays open</p>
      </div>
    </div>
  );
}

/* ------------------------------- context menu -------------------------------- */

const SAMPLES = [
  { id: 0, text: "universally acknowledged", words: 2 },
  { id: 1, text: "a single man in possession of a good fortune", words: 9 },
  { id: 2, text: "It is a truth universally acknowledged, that a single man…", words: 11 },
];
const SWATCHES = ["#f5b83d", "#7ddc7d", "#7cc4ff", "#e07bff"];

function ContextDemo() {
  const [sel, setSel] = useState(SAMPLES[1]);
  const [hl, setHl] = useState<string | null>("#f5b83d");
  const [note, setNote] = useState<string | null>(null);
  const act = (s: string) => {
    setNote(s);
    setTimeout(() => setNote(null), 1600);
  };
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div className="rounded-xl bg-[#efe7d8] p-4">
        <p className="mb-2 font-mono text-[10.5px] tracking-wider text-[#8a7a5c] uppercase">1 · pick a selection</p>
        <div className="space-y-1.5">
          {SAMPLES.map((s) => (
            <button key={s.id} onClick={() => setSel(s)}
              className={cn("block w-full rounded-lg border px-2.5 py-2 text-left font-serif text-[14px]", sel.id === s.id ? "border-[#8a7a5c] bg-white/60 text-[#2c261d]" : "border-transparent text-[#6b5f4b] hover:bg-white/40")}>
              “{hl && sel.id === s.id ? <mark style={{ background: `${hl}66` }} className="rounded px-0.5">{s.text}</mark> : s.text}”
            </button>
          ))}
        </div>
        <div className="mt-3 flex h-5 items-center font-mono text-[11px] text-[#7a5c14]">
          <AnimatePresence>{note && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>→ {note}</motion.span>}</AnimatePresence>
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10.5px] tracking-wider text-stone-500 uppercase">2 · the menu knows what it acts on</p>
        <div className="overflow-hidden rounded-2xl border border-[#3a332b] bg-[#211c16] shadow-[0_18px_44px_rgba(0,0,0,0.6)]">
          <div className="border-b border-white/8 bg-black/20 px-3.5 py-2.5">
            <p className="truncate font-serif text-[14px] text-stone-100 italic">“{sel.text}”</p>
            <p className="mt-0.5 font-mono text-[10.5px] text-stone-500">{sel.words} words · p.1</p>
          </div>
          <div className="p-1.5">
            <div className="grid grid-cols-2 gap-1 p-1">
              <button onClick={() => act("lookup opened")} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#f5b83d] px-2 py-2 text-[12.5px] font-semibold text-[#14100a] hover:bg-[#ffc95c]"><BookOpenText size={14} /> Look up</button>
              <button onClick={() => act("AI explaining…")} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#7cc4ff]/15 px-2 py-2 text-[12.5px] font-semibold text-[#7cc4ff] hover:bg-[#7cc4ff]/25"><Sparkles size={14} /> Explain</button>
            </div>
            <div className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white/4">
              <span className="flex items-center gap-2 text-[13px] text-stone-200"><Highlighter size={14} className="text-stone-400" /> Highlight</span>
              <span className="flex gap-1.5">
                {SWATCHES.map((c) => (
                  <button key={c} onClick={() => { setHl(c); act(`highlighted ${c}`); }} aria-label={`Highlight ${c}`}
                    className={cn("h-5 w-5 rounded-full ring-2 ring-offset-2 ring-offset-[#211c16]", hl === c ? "ring-white" : "ring-transparent hover:ring-stone-500")} style={{ background: c }} />
                ))}
              </span>
            </div>
            {[
              { icon: <Copy size={14} />, label: "Copy", k: "⌘C", fn: () => act("copied to clipboard") },
              { icon: <NotebookPen size={14} />, label: "Add note…", k: "N", fn: () => act("note editor opened") },
              { icon: <Volume2 size={14} />, label: "Speak selection", k: "S", fn: () => act("speaking…") },
              { icon: <BookOpen size={14} />, label: "Save to Words", k: "W", fn: () => act("saved to Words") },
            ].map((r) => (
              <button key={r.label} onClick={r.fn} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-stone-200 hover:bg-white/6">
                <span className="text-stone-400">{r.icon}</span><span className="flex-1">{r.label}</span><Kbd>{r.k}</Kbd>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- selection toolbar ---------------------------- */

function SelectionDuel() {
  const [hl, setHl] = useState<string | null>("#f5b83d");
  const [note, setNote] = useState<string | null>(null);
  const act = (s: string) => {
    setNote(s);
    setTimeout(() => setNote(null), 1500);
  };
  const sentence = (bubble: React.ReactNode) => (
    <div className="rounded-xl bg-[#efe7d8] px-4 pt-4 pb-5">
      <div className="flex justify-center pb-2">{bubble}</div>
      <p className="mx-auto max-w-[380px] text-center font-serif text-[16px] leading-relaxed text-[#4a4136]">
        …in possession of a <span className="rounded px-0.5" style={{ background: hl ? `${hl}59` : "rgba(124,196,255,.4)" }}>good fortune</span>, must be in want of a wife.
      </p>
      <div className="flex h-4 items-center justify-center pt-1 font-mono text-[10.5px] text-[#7a5c14]">
        <AnimatePresence>{note && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>→ {note}</motion.span>}</AnimatePresence>
      </div>
    </div>
  );
  const caret = "absolute -bottom-[7px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[8px] border-x-transparent border-t-[#211c16]";
  return (
    <Duel
      beforeLabel="Pre-audit"
      before={<Panel><div className="p-3">{sentence(
        <div className="relative flex items-center gap-0.5 rounded-xl border border-[#3a332b] bg-[#211c16] px-1.5 py-1.5 shadow-lg">
          <span className={caret} />
          {[Copy, Sparkles, BookOpenText, Highlighter, NotebookPen].map((I, i) => (
            <button key={i} onClick={() => act("which one was Explain again?")} className="rounded-lg p-2 text-stone-300 hover:bg-white/8" title="???"><I size={15} /></button>
          ))}
        </div>
      )}<p className="px-1 pt-2 font-mono text-[11px] text-stone-500">5 mystery icons · audit §2.2 already condemned this — shown for contrast</p></div></Panel>}
      afterLabel="Kept + refined"
      after={<Panel><div className="p-3">{sentence(
        <div className="relative flex items-center gap-1 rounded-xl border border-[#3a332b] bg-[#211c16] px-1.5 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
          <span className={caret} />
          <button onClick={() => act("lookup opened")} className="rounded-lg bg-[#f5b83d] px-2.5 py-1.5 text-[12px] font-semibold text-[#14100a] hover:bg-[#ffc95c]">Look up</button>
          <button onClick={() => act("AI explaining…")} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[#7cc4ff] hover:bg-[#7cc4ff]/12"><Sparkles size={13} /> Explain</button>
          <span className="mx-1 h-5 w-px bg-white/10" />
          {SWATCHES.map((c) => (
            <button key={c} onClick={() => { setHl(c); act(`highlight ${c}`); }} aria-label={`Highlight ${c}`}
              className={cn("h-[18px] w-[18px] rounded-full ring-2 ring-offset-2 ring-offset-[#211c16]", hl === c ? "ring-white" : "ring-transparent hover:ring-stone-500")} style={{ background: c }} />
          ))}
          <span className="mx-1 h-5 w-px bg-white/10" />
          <button onClick={() => act("copied")} title="Copy" className="rounded-lg p-1.5 text-stone-300 hover:bg-white/8"><Copy size={14} /></button>
          <button onClick={() => act("note editor opened")} title="Add note" className="rounded-lg p-1.5 text-stone-300 hover:bg-white/8"><NotebookPen size={14} /></button>
        </div>
      )}<p className="px-1 pt-2 font-mono text-[11px] text-stone-500">text verbs + swatch pens + divider · try the swatches — the sentence obeys</p></div></Panel>}
    />
  );
}

/* ---------------------------------- lab ----------------------------------- */

export default function MenuLab() {
  const [mode, setMode] = useState<VMode>("Spread");
  const [zoom, setZoom] = useState(100);
  const [auto, setAuto] = useState(false);
  const [aloud, setAloud] = useState(true);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <CiteTag cite={SOURCES.viewMenu} />
      </div>
      <VerdictCard verdict={VERDICTS.menus} />

      <div>
        <h3 className="mb-3 text-[15px] font-semibold text-stone-200">View menu <span className="font-mono text-[11.5px] font-normal text-stone-500">· mode + zoom stay in sync</span></h3>
        <Duel
          before={<Panel><div className="flex justify-center p-4"><ShippedViewMenu mode={mode} setMode={setMode} zoom={zoom} setZoom={setZoom} /></div></Panel>}
          after={<Panel><div className="flex justify-center bg-[#f5b83d]/3 p-4"><NewViewMenu mode={mode} setMode={setMode} zoom={zoom} setZoom={setZoom} auto={auto} setAuto={() => setAuto(!auto)} aloud={aloud} setAloud={() => setAloud(!aloud)} /></div></Panel>}
        />
      </div>

      <div>
        <h3 className="mb-3 text-[15px] font-semibold text-stone-200">Context menu <span className="rounded bg-[#f5b83d] px-1.5 py-0.5 align-middle font-mono text-[10px] font-semibold text-[#14100a] uppercase">new component</span></h3>
        <Panel><div className="p-3 md:p-4"><ContextDemo /></div></Panel>
      </div>

      <div>
        <h3 className="mb-3 text-[15px] font-semibold text-stone-200">Selection toolbar <span className="font-mono text-[11.5px] font-normal text-stone-500">· anchored bubble, caret on the words</span></h3>
        <SelectionDuel />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SpaceMeter
          rows={[
            { label: "View menu height", before: 560, after: 430, unit: "px" },
            { label: "Zoom: 100→103% effort", before: 3, after: 1, unit: " gestures" },
            { label: "Selection bar icon-guesses", before: 5, after: 0, unit: "" },
          ]}
        />
        <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
          <span className="font-semibold text-stone-100">Why a zoom slider.</span> Steppers quantize taste to 10% jumps and punish precision (three clicks for 103%). A slider with a live % keeps the steppers for coarse jumps, adds drag for fine ones, and moves Fit Page/Width out of the icon soup into labeled chips. Same rows — one extra gesture nobody has to discover, because the slider <em>is</em> the row.
          <span className="mt-2 block"><span className="font-semibold text-stone-100">Why the context header.</span> Menus that show their target (“9 words · p.1”) convert a right-click from a gamble into a confirmation — the same reason dialog titles name the file. It costs 48px and deletes a whole class of “oops, wrong selection” undos.</span>
        </div>
      </div>
    </div>
  );
}
