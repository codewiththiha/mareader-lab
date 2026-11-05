import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, ChevronDown, ChevronUp, Gauge, ListMusic, Maximize2, MoreHorizontal,
  Pause, Play, SkipBack, SkipForward, Square, Volume2, X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { CiteTag, Duel, Panel, Seg, SpaceMeter, VerdictCard } from "./kit";
import { SOURCES, VERDICTS } from "../data/audit";

/* ------------------------------ playback engine ----------------------------- */

const SCRIPT = [
  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
  "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
  "“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”",
  "Mr. Bennet replied that he had not. “But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”",
  "Mr. Bennet made no answer. “Do you not want to know who has taken it?” cried his wife impatiently.",
];

const WORDS = SCRIPT.flatMap((s, si) => s.split(" ").map((w) => ({ w, si })));
const TOTAL = WORDS.length;

function usePlayback() {
  const [playing, setPlaying] = useState(true);
  const [rate, setRate] = useState(1);
  const [pos, setPos] = useState(14);
  const [note, setNote] = useState<string | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setPos((p) => (p + 1 >= TOTAL ? 0 : p + 1));
    }, 300 / rate);
    return () => clearInterval(iv);
  }, [playing, rate]);

  const sentIdx = WORDS[pos]?.si ?? 0;
  const sentStart = WORDS.findIndex((x) => x.si === sentIdx);
  const lit = pos - sentStart;
  const progress = pos / TOTAL;
  const leftSec = Math.max(0, Math.round(((TOTAL - pos) * 0.32) / rate));
  const mm = `${Math.floor(leftSec / 60)}:${String(leftSec % 60).padStart(2, "0")}`;
  const say = (s: string) => {
    setNote(s);
    setTimeout(() => setNote(null), 1600);
  };
  const jump = (d: number) => {
    const cur = WORDS[posRef.current].si;
    const next = Math.min(SCRIPT.length - 1, Math.max(0, cur + d));
    setPos(WORDS.findIndex((x) => x.si === next));
  };
  return { playing, setPlaying, rate, setRate, pos, setPos, sentIdx, lit, progress, mm, note, say, jump };
}
type Engine = ReturnType<typeof usePlayback>;

function Bars({ on, n = 4, h = 14 }: { on: boolean; n?: number; h?: number }) {
  return (
    <span className="flex items-end gap-[2.5px]" style={{ height: h }} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full bg-[#f5b83d]", on && "bar-dance")}
          style={{ height: on ? "100%" : `${30 + ((i * 37) % 40)}%`, animationDelay: `${i * 0.14}s`, opacity: on ? 1 : 0.35 }}
        />
      ))}
    </span>
  );
}

const fmtRate = (r: number) => `${r % 1 === 0 ? r.toFixed(1).replace(".0", "") : r}×`;

/* --------------------------- shipped pill replica --------------------------- */

function ShippedPill({ e, width }: { e: Engine; width: number }) {
  const speed = width >= 470;
  const time = width >= 400;
  const track = Math.max(56, Math.min(168, width - (speed ? 54 : 0) - (time ? 74 : 0) - 260));
  return (
    <div className="space-y-2">
      <div
        className="mx-auto flex h-[44px] items-center gap-1 rounded-full border border-[#3a332b] bg-[#211c16] px-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.5)]"
        style={{ width: Math.min(width, 560) }}
      >
        <IconBtn label="Previous sentence" onClick={() => e.jump(-1)}><SkipBack size={16} /></IconBtn>
        <button onClick={() => e.setPlaying(!e.playing)} aria-label="Play or pause"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-900 hover:bg-white">
          {e.playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <IconBtn label="Next sentence" onClick={() => e.jump(1)}><SkipForward size={16} /></IconBtn>
        <div className="mx-1 h-6 w-px bg-white/10" />
        {/* seek track */}
        <div className="group relative flex h-full items-center" style={{ width: track }} title="Seek">
          <div className="h-1 w-full rounded-full bg-white/12">
            <div className="h-full rounded-full bg-[#7cc4ff]" style={{ width: `${e.progress * 100}%` }} />
          </div>
          <input type="range" min={0} max={TOTAL - 1} value={e.pos} onChange={(e2) => e.setPos(Number(e2.target.value))}
            aria-label="Seek" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
        {time && <span className="w-[66px] shrink-0 font-mono text-[11px] text-stone-400">-{e.mm}</span>}
        {speed && (
          <button onClick={() => e.setRate(e.rate >= 2 ? 0.75 : e.rate + 0.25)} className="flex w-[54px] shrink-0 items-center justify-center gap-1 rounded-md py-1 font-mono text-[12px] text-stone-300 hover:bg-white/8" title="Speed">
            <Gauge size={13} />{fmtRate(e.rate)}
          </button>
        )}
        <IconBtn label="Toggle card" onClick={() => e.say("shipped: card toggled")}><ChevronUp size={16} /></IconBtn>
        <IconBtn label="More" onClick={() => e.say("shipped: overflow")}><MoreHorizontal size={16} /></IconBtn>
        <IconBtn label="Stop" onClick={() => { e.setPlaying(false); e.say("shipped: stopped"); }}><Square size={13} /></IconBtn>
      </div>
      <div className="mx-auto flex max-w-[560px] flex-wrap justify-center gap-1.5 font-mono text-[10.5px]">
        <span className="rounded bg-white/6 px-1.5 py-0.5 text-stone-400">track {Math.round(track)}px · spec 56–168</span>
        {!speed && <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-300">speed vanished — no trace</span>}
        {!time && <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-300">time vanished — no trace</span>}
        {speed && time && <span className="rounded bg-white/6 px-1.5 py-0.5 text-stone-500">all parts fit — for now</span>}
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-300 hover:bg-white/8 hover:text-white">
      {children}
    </button>
  );
}

/* ------------------------------ redesigned bar ------------------------------ */

function NewBar({ e, width, onExpand }: { e: Engine; width: number; onExpand: () => void }) {
  const [more, setMore] = useState(false);
  const speedInline = width >= 430;
  const timeInline = width >= 360;
  const hidden: string[] = [];
  if (!speedInline) hidden.push("speed");
  if (!timeInline) hidden.push("time");
  const track = Math.max(64, width - (speedInline ? 62 : 0) - (timeInline ? 66 : 0) - 268);
  return (
    <div
      className="relative mx-auto flex h-[52px] items-center gap-1 rounded-2xl border border-[#3a332b] bg-[#211c16] px-2 shadow-[0_14px_36px_rgba(0,0,0,0.55)]"
      style={{ width: Math.min(width, 600) }}
    >
      <IconBtn label="Previous sentence" onClick={() => e.jump(-1)}><SkipBack size={16} /></IconBtn>
      <button onClick={() => e.setPlaying(!e.playing)} aria-label="Play or pause"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5b83d] text-[#14100a] hover:bg-[#ffc95c]">
        {e.playing ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
      </button>
      <IconBtn label="Next sentence" onClick={() => e.jump(1)}><SkipForward size={16} /></IconBtn>
      <div className="group relative mx-1 flex h-full flex-1 items-center" style={{ maxWidth: Math.min(track, 220) }} title={`Page ${2 + Math.floor(e.progress * 6)} · Chapter 1`}>
        <div className="h-[5px] w-full rounded-full bg-white/10">
          <div className="relative h-full rounded-full bg-[#f5b83d]" style={{ width: `${e.progress * 100}%` }}>
            <span className="absolute -top-[3px] -right-[5px] h-[11px] w-[11px] rounded-full border-2 border-[#14100a] bg-[#f5b83d] opacity-0 shadow group-hover:opacity-100" />
          </div>
        </div>
        <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-black px-2 py-1 font-mono text-[10.5px] whitespace-nowrap text-stone-200 group-hover:block">
          Page {2 + Math.floor(e.progress * 6)} · Chapter 1
        </span>
        <input type="range" min={0} max={TOTAL - 1} value={e.pos} onChange={(e2) => e.setPos(Number(e2.target.value))} aria-label="Seek" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </div>
      {timeInline && <span className="shrink-0 font-mono text-[11.5px] text-stone-300">-{e.mm}</span>}
      {speedInline ? (
        <button onClick={() => e.setRate(e.rate >= 2 ? 0.75 : e.rate + 0.25)} title="Playback speed"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-white/6 px-2 py-1.5 font-mono text-[12px] font-semibold text-stone-200 hover:bg-white/10">
          <Gauge size={13} className="text-[#f5b83d]" />{fmtRate(e.rate)}
        </button>
      ) : null}
      <div className="relative">
        <button onClick={() => setMore(!more)} aria-label="More controls" title="More"
          className={cn("flex h-8 w-8 items-center justify-center rounded-full text-stone-300 hover:bg-white/8 hover:text-white", more && "bg-white/8")}>
          <MoreHorizontal size={16} />
          {hidden.length > 0 && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#f5b83d]" />}
        </button>
        <AnimatePresence>
          {more && (
            <motion.div initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.98 }}
              className="absolute right-0 bottom-10 z-20 w-[210px] rounded-xl border border-[#3a332b] bg-[#141109] p-1.5 shadow-xl">
              {hidden.includes("speed") && (
                <button onClick={() => { e.setRate(e.rate >= 2 ? 0.75 : e.rate + 0.25); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-stone-200 hover:bg-white/8">
                  <span className="flex items-center gap-2"><Gauge size={14} className="text-[#f5b83d]" /> Speed</span>
                  <span className="font-mono text-[12px]">{fmtRate(e.rate)}</span>
                </button>
              )}
              {hidden.includes("time") && (
                <div className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-stone-200">
                  <span className="flex items-center gap-2"><ListMusic size={14} className="text-stone-400" /> Remaining</span>
                  <span className="font-mono text-[12px]">-{e.mm}</span>
                </div>
              )}
              <button onClick={() => { onExpand(); setMore(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-stone-200 hover:bg-white/8">
                <Maximize2 size={14} className="text-stone-400" /> Open full card
              </button>
              <button onClick={() => { e.say("sleep timer: 15 min"); setMore(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-stone-200 hover:bg-white/8">
                <Volume2 size={14} className="text-stone-400" /> Sleep timer
              </button>
              {hidden.length === 0 && <p className="px-2.5 pt-1 pb-1.5 font-mono text-[10.5px] text-stone-500">nothing hidden at this width</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <IconBtn label="Stop and close" onClick={() => { e.setPlaying(false); e.say("stopped"); }}><X size={15} /></IconBtn>
    </div>
  );
}

/* ------------------------------ redesigned full ----------------------------- */

function NewFull({ e }: { e: Engine }) {
  const before = SCRIPT[e.sentIdx - 1];
  const now = SCRIPT[e.sentIdx].split(" ");
  const after = SCRIPT[e.sentIdx + 1];
  return (
    <div className="mx-auto w-[min(480px,100%)] overflow-hidden rounded-2xl border border-[#3a332b] bg-[#211c16] shadow-[0_18px_44px_rgba(0,0,0,0.55)]">
      <div className="flex gap-3.5 p-4">
        <button onClick={() => e.say("reveal: jumped to the words")} title="Show where it's reading"
          className="group relative h-[104px] w-[70px] shrink-0 overflow-hidden rounded-md bg-[#7a2e2e] text-left shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#f5b83d]/70" />
          <div className="p-1.5 font-serif text-[9px] leading-tight font-semibold text-[#f2e4c9]">Pride and Prejudice</div>
          <div className="absolute bottom-1.5 left-1.5 font-mono text-[8px] text-[#f2e4c9]/70">AUSTEN</div>
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            <BookOpen size={18} className="text-white" />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate text-[15px] font-semibold text-stone-100">Pride and Prejudice</h4>
            <Bars on={e.playing} />
          </div>
          <p className="mt-0.5 truncate text-[12px] text-stone-400">Page {2 + Math.floor(e.progress * 6)} · Chapter 1 · read by Amara</p>
          <div className="mt-2.5 h-[104px] overflow-hidden rounded-lg bg-black/25 p-2.5">
            <AnimatePresence mode="popLayout">
              <motion.div key={e.sentIdx} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.28 }}>
                {before && <p className="truncate text-[12px] text-stone-600">{before}</p>}
                <p className="mt-1 text-[14.5px] leading-snug">
                  {now.map((w, i) => (
                    <span key={i} className={cn("rounded px-[1px]", i <= e.lit ? "bg-[#f5b83d]/25 text-[#ffd98a]" : "text-stone-300")}>{w} </span>
                  ))}
                </p>
                {after && <p className="mt-1 truncate text-[12px] text-stone-600">{after}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 border-t border-white/8 px-3 py-2">
        <IconBtn label="Previous sentence" onClick={() => e.jump(-1)}><SkipBack size={15} /></IconBtn>
        <button onClick={() => e.setPlaying(!e.playing)} aria-label="Play or pause" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5b83d] text-[#14100a] hover:bg-[#ffc95c]">
          {e.playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <IconBtn label="Next sentence" onClick={() => e.jump(1)}><SkipForward size={15} /></IconBtn>
        <div className="relative mx-2 flex h-6 flex-1 items-center">
          <div className="h-1 w-full rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f5b83d]" style={{ width: `${e.progress * 100}%` }} /></div>
          <input type="range" min={0} max={TOTAL - 1} value={e.pos} onChange={(e2) => e.setPos(Number(e2.target.value))} aria-label="Seek" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
        <span className="font-mono text-[11px] text-stone-400">-{e.mm}</span>
        <button onClick={() => e.setRate(e.rate >= 2 ? 0.75 : e.rate + 0.25)} className="ml-1 rounded-md bg-white/6 px-2 py-1 font-mono text-[11.5px] font-semibold text-stone-200 hover:bg-white/10">{fmtRate(e.rate)}</button>
      </div>
    </div>
  );
}

function NewMini({ e, onExpand }: { e: Engine; onExpand: () => void }) {
  const R = 10;
  const C = 2 * Math.PI * R;
  return (
    <button onClick={onExpand} title="Expand player"
      className="mx-auto flex items-center gap-2.5 rounded-full border border-[#3a332b] bg-[#211c16] py-1.5 pr-2 pl-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.55)] hover:border-[#f5b83d]/40">
      <span onClick={(ev) => { ev.stopPropagation(); e.setPlaying(!e.playing); }}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f5b83d] text-[#14100a]" role="button" aria-label="Play or pause" tabIndex={0}>
        {e.playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </span>
      <svg width={24} height={24} className="-rotate-90">
        <circle cx={12} cy={12} r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={3} />
        <circle cx={12} cy={12} r={R} fill="none" stroke="#f5b83d" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${C * e.progress} ${C}`} />
      </svg>
      <span className="max-w-[150px] truncate text-[12.5px] text-stone-200">Pride and Prejudice</span>
      <Bars on={e.playing} n={3} h={12} />
      <ChevronUp size={14} className="text-stone-500" />
    </button>
  );
}

function NewRail({ e, onExpand }: { e: Engine; onExpand: () => void }) {
  return (
    <div className="mx-auto flex w-[52px] flex-col items-center gap-2 rounded-2xl border border-[#3a332b] bg-[#211c16] py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
      <button onClick={() => e.setPlaying(!e.playing)} aria-label="Play or pause" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5b83d] text-[#14100a] hover:bg-[#ffc95c]">
        {e.playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>
      <div className="relative flex h-24 w-[5px] items-end overflow-hidden rounded-full bg-white/10" title={`${Math.round(e.progress * 100)}% · -${e.mm}`}>
        <div className="w-full rounded-full bg-[#f5b83d]" style={{ height: `${e.progress * 100}%` }} />
      </div>
      <button onClick={() => e.setRate(e.rate >= 2 ? 0.75 : e.rate + 0.25)} title="Speed" className="font-mono text-[10.5px] font-semibold text-stone-300 hover:text-white">{fmtRate(e.rate)}</button>
      <button onClick={onExpand} title="Expand" className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-white/8 hover:text-white"><ChevronDown size={14} /></button>
    </div>
  );
}

/* ---------------------------------- lab ----------------------------------- */

export default function PlayerLab() {
  const e = usePlayback();
  const [variant, setVariant] = useState<"full" | "bar" | "mini" | "rail">("bar");
  const [width, setWidth] = useState(520);
  const fullFor = useMemo(() => variant, [variant]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <CiteTag cite={SOURCES.playerCard} />
        <CiteTag cite={SOURCES.playerControl} />
      </div>
      <VerdictCard verdict={VERDICTS.player} />

      <Panel label="responsive stress — one engine, two bodies, drag the width">
        <div className="flex flex-wrap items-center gap-4 border-b border-[#2c2620] px-4 py-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-3">
            <span className="font-mono text-[11px] whitespace-nowrap text-stone-500 uppercase">Dock width</span>
            <input type="range" min={300} max={600} value={width} onChange={(ev) => setWidth(Number(ev.target.value))} className="demo-range flex-1" aria-label="Dock width" />
            <span className="font-mono text-[12px] text-stone-300">{width}px</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-stone-500 uppercase">New form</span>
            <Seg value={variant} onChange={setVariant} options={[
              { value: "full", label: "Card" }, { value: "bar", label: "Bar" }, { value: "mini", label: "Mini" }, { value: "rail", label: "Rail" },
            ]} />
          </div>
          <div className="h-5 min-w-[140px] font-mono text-[11.5px] text-[#f5b83d]">
            <AnimatePresence>{e.note && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{e.note}</motion.span>}</AnimatePresence>
          </div>
        </div>
        <div className="dotgrid-fine bg-[#0d0b09] px-4 py-6">
          <Duel
            before={
              <div className="rounded-xl border border-[#2c2620] bg-[#16130f] p-4">
                <ShippedPill e={e} width={width} />
                <p className="pt-3 text-center font-mono text-[11px] text-stone-500">pill 44 · track shrinks 168→56 · then speed, then time drop silently</p>
              </div>
            }
            after={
              <div className="rounded-xl border border-[#f5b83d]/25 bg-[#16130f] p-4">
                {fullFor === "bar" && <NewBar e={e} width={width} onExpand={() => setVariant("full")} />}
                {fullFor === "full" && <NewFull e={e} />}
                {fullFor === "mini" && <div className="py-6"><NewMini e={e} onExpand={() => setVariant("bar")} /></div>}
                {fullFor === "rail" && <div className="py-2"><NewRail e={e} onExpand={() => setVariant("bar")} /></div>}
                <p className="pt-3 text-center font-mono text-[11px] text-stone-500">
                  {variant === "bar" ? "collapsed parts move into “more” with a dot — nothing vanishes" : variant === "full" ? "lyrics stream · lit words · cover reveals the page" : variant === "mini" ? "ring progress · one tap back to the bar" : "vertical rail for edge-dock or narrow splits"}
                </p>
              </div>
            }
          />
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <SpaceMeter
          rows={[
            { label: "Full card height", before: 224, after: 196, unit: "px" },
            { label: "Bar height", before: 44, after: 52, unit: "px" },
            { label: "Mini footprint", before: 380, after: 210, unit: "px" },
          ]}
        />
        <div className="space-y-3">
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why the bar got 8px taller.</span> The shipped 44px pill sets 16px icons on a 36px play target with a 1px track — dense for a control you hit without looking. 52px buys a 40px play target, a 5px seek track, and a visible scrub thumb. Mini + Rail then cover the cases where 52px is too much — better than one pill stretched across every context.
          </div>
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why “more” has a dot.</span> The <span className="font-mono text-[12px] text-stone-400">Fit</span> cascade's only sin is silence. Same breakpoints, but evicted controls file into the overflow with a badge — the UI equivalent of a “continued on page 2” note. Nothing to re-learn; nothing lost.
          </div>
        </div>
      </div>
    </div>
  );
}
