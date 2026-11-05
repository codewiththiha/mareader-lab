import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, GripVertical, Magnet, MousePointer2, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "../utils/cn";
import { CiteTag, Panel, Seg, Switch, VerdictCard, Warn, Kbd } from "./kit";
import { SOURCES, VERDICTS } from "../data/audit";

type Edge = "left" | "right" | "bottom";
type CardId = "player" | "dict";

const PEEK = 20;
const MAGNET = 8;
const EASE = [0.22, 1, 0.36, 1] as const;

function useProg(playing: boolean) {
  const [p, setP] = useState(0.34);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setP((x) => (x >= 1 ? 0 : x + 0.004)), 120);
    return () => clearInterval(iv);
  }, [playing]);
  return p;
}

export default function EdgeParkLab() {
  const [mode, setMode] = useState<"new" | "shipped">("new");
  const [docked, setDocked] = useState<Partial<Record<CardId, Edge>>>({ dict: "right" });
  const [gone, setGone] = useState<CardId[]>([]);
  const [near, setNear] = useState<Edge | null>(null);
  const [nearCard, setNearCard] = useState<CardId | null>(null);
  const [playing, setPlaying] = useState(true);
  const [magnet, setMagnet] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const prog = useProg(playing);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && Object.keys(docked).length > 0) {
        setDocked({});
        ping("revealed all · Esc");
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [docked]);

  const ping = (s: string) => {
    setFlash(s);
    setTimeout(() => setFlash(null), 1500);
  };

  const edgeOf = (clientX: number, clientY: number): Edge | null => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return null;
    const d = { left: clientX - r.left, right: r.right - clientX, bottom: r.bottom - clientY };
    const m = Math.min(d.left, d.right, d.bottom);
    if (m > 72) return null;
    return (Object.keys(d) as Edge[]).find((k) => d[k] === m) ?? null;
  };

  const dockPos = (id: CardId, edge: Edge) => {
    // home rects (approx): player 300x132 @ (48,64) · dict 300x150 @ (48,220)
    const home = id === "player" ? { x: 48, y: 64, w: 300, h: 132 } : { x: 48, y: 216, w: 300, h: 152 };
    const W = stage.current?.clientWidth ?? 800;
    const H = stage.current?.clientHeight ?? 440;
    if (edge === "right") return { x: W - PEEK - home.w - home.x, y: 0 };
    if (edge === "left") return { x: PEEK - home.w - home.x, y: 0 };
    return { x: 0, y: H - PEEK - home.h - home.y };
  };

  const visible = (id: CardId) => !gone.includes(id);
  const tabsOn = (edge: Edge) => (["player", "dict"] as CardId[]).filter((c) => docked[c] === edge && visible(c));

  const cardShell = "w-[300px] rounded-xl border border-[#3a332b] bg-[#211c16] shadow-[0_16px_40px_rgba(0,0,0,0.55)]";

  const renderCard = (id: CardId, homeY: number) => {
    if (!visible(id)) return null;
    const isDocked = !!docked[id];
    if (mode === "new" && isDocked) return null; // replaced by its tab
    return (
      <motion.div
        key={id + mode}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={
          isDocked
            ? { opacity: 1, scale: 1, ...dockPos(id, docked[id]!) }
            : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        transition={{ duration: isDocked ? 0.26 : 0.34, ease: EASE }}
        drag={!isDocked}
        dragConstraints={stage}
        dragElastic={0.08}
        dragMomentum={false}
        onDrag={(_, info) => {
          setNear(edgeOf(info.point.x, info.point.y));
          setNearCard(id);
        }}
        onDragEnd={(_, info) => {
          const edge = edgeOf(info.point.x, info.point.y);
          setNear(null);
          setNearCard(null);
          if (edge) {
            setDocked((d) => ({ ...d, [id]: edge }));
            ping(`${id} parked → ${edge} · ${mode === "new" ? "labeled tab" : `${PEEK}px sliver`}`);
          }
        }}
        onClick={() => isDocked && (setDocked((d) => { const n = { ...d }; delete n[id]; return n; }), ping(`${id} revealed`))}
        style={{ left: 48, top: homeY }}
        className={cn("absolute z-10", isDocked && "cursor-pointer")}
        title={isDocked ? "Click to reveal" : "Drag me to an edge to park"}
      >
        {id === "player" ? (
          <div className={cardShell}>
            <div className="flex items-center gap-2.5 p-3">
              <button onClick={(e) => { e.stopPropagation(); setPlaying(!playing); }} aria-label="Play or pause"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5b83d] text-[#14100a]">
                {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-stone-100">Pride and Prejudice</div>
                <div className="mt-1 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f5b83d]" style={{ width: `${prog * 100}%` }} /></div>
              </div>
              <GripVertical size={14} className="shrink-0 text-stone-600" />
            </div>
            <div className="flex items-center justify-between border-t border-white/8 px-3 py-1.5">
              <span className="flex items-center gap-1 font-mono text-[10.5px] text-stone-500"><Volume2 size={11} /> read-aloud</span>
              <span className="font-mono text-[10.5px] text-stone-500">{Math.round(prog * 100)}% · 1×</span>
            </div>
          </div>
        ) : (
          <div className={cardShell}>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-serif text-[19px] font-semibold text-stone-100">acknowledged</div>
                  <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10.5px]">
                    <span className="rounded bg-[#f5b83d]/15 px-1.5 py-px text-[#f5b83d]">B2</span>
                    <span className="text-stone-500">adjective · EN → MY</span>
                  </div>
                </div>
                <GripVertical size={14} className="shrink-0 text-stone-600" />
              </div>
              <p className="mt-1.5 text-[12.5px] leading-snug text-stone-300">widely recognized; accepted as true. <span className="text-stone-500">အသိအမှတ်ပြုသော</span></p>
            </div>
            <div className="flex items-center justify-between border-t border-white/8 px-3 py-1.5">
              <span className="flex items-center gap-1 font-mono text-[10.5px] text-stone-500"><BookOpenText size={11} /> dictionary</span>
              <span className="font-mono text-[10.5px] text-stone-500">‹ 2 of 5 ›</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderTab = (id: CardId, edge: Edge, slot: number) => {
    const base = "absolute z-20 flex items-center gap-2 border-[#f5b83d]/35 bg-[#211c16] shadow-[0_10px_26px_rgba(0,0,0,0.55)] hover:border-[#f5b83d]/70";
    const pos =
      edge === "right" ? { right: 0, top: 120 + slot * 64, className: "rounded-l-xl border border-r-0 py-2.5 pr-3 pl-2.5" } :
      edge === "left" ? { left: 0, top: 120 + slot * 64, className: "rounded-r-xl border border-l-0 py-2.5 pr-2.5 pl-3" } :
      { left: 200 + slot * 190, bottom: 0, className: "rounded-t-xl border border-b-0 px-3 py-2" };
    const pull = magnet ? (edge === "right" ? { x: -MAGNET } : edge === "left" ? { x: MAGNET } : { y: -MAGNET }) : {};
    return (
      <motion.button
        key={id + edge}
        initial={{ opacity: 0, x: edge === "right" ? 24 : edge === "left" ? -24 : 0, y: edge === "bottom" ? 24 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: edge === "right" ? 24 : edge === "left" ? -24 : 0, y: edge === "bottom" ? 24 : 0 }}
        whileHover={pull}
        transition={{ duration: 0.26, ease: EASE }}
        onClick={() => { setDocked((d) => { const n = { ...d }; delete n[id]; return n; }); ping(`${id} revealed`); }}
        title={`${id === "player" ? "Read-aloud player" : "Dictionary: acknowledged"} — click to reveal · Esc reveals all`}
        style={{ [edge === "bottom" ? "left" : "top"]: edge === "bottom" ? pos.left : pos.top, [edge === "right" ? "right" : edge === "left" ? "left" : "bottom"]: 0 }}
        className={cn(base, pos.className)}
      >
        {id === "player" ? (
          <>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5b83d]/15 text-[#f5b83d]"><Volume2 size={14} /></span>
            <span className="text-left leading-tight">
              <span className="block text-[12px] font-semibold text-stone-100">Player</span>
              <span className="block font-mono text-[10px] text-stone-500">{playing ? "playing" : "paused"} · {Math.round(prog * 100)}%</span>
            </span>
            <span className="relative flex h-1.5 w-1.5"><span className="ping-soft absolute h-full w-full rounded-full bg-[#f5b83d]" /><span className="h-1.5 w-1.5 rounded-full bg-[#f5b83d]" /></span>
          </>
        ) : (
          <>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7cc4ff]/15 text-[#7cc4ff]"><BookOpenText size={14} /></span>
            <span className="text-left leading-tight">
              <span className="block max-w-[110px] truncate text-[12px] font-semibold text-stone-100">acknowledged</span>
              <span className="block font-mono text-[10px] text-stone-500">B2 · 2 of 5</span>
            </span>
          </>
        )}
      </motion.button>
    );
  };

  return (
    <div className="space-y-5">
      <CiteTag cite={SOURCES.park} />
      <VerdictCard verdict={VERDICTS.park} />

      <Panel label="live stage — drag either card to any edge, click a peek to reveal">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[#2c2620] px-4 py-3">
          <Seg value={mode} onChange={(m) => { setMode(m); setDocked({ dict: "right" }); }} options={[
            { value: "new", label: "Redesign: labeled tabs" },
            { value: "shipped", label: `Shipped: ${PEEK}px sliver` },
          ]} />
          <Switch on={magnet} onFlip={() => setMagnet(!magnet)} label={`Magnet pull (${MAGNET}px)`} />
          <button onClick={() => { setDocked({}); setGone([]); }} className="flex items-center gap-1.5 rounded-lg bg-white/8 px-2.5 py-1.5 text-[12.5px] text-stone-200 hover:bg-white/12">
            <RotateCcw size={13} /> Reset stage
          </button>
          <span className="flex items-center gap-1.5 text-[12px] text-stone-500"><Kbd>Esc</Kbd> reveals all docked</span>
          <div className="h-5 min-w-[180px] font-mono text-[11.5px] text-[#f5b83d]">
            <AnimatePresence>{flash && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{flash}</motion.span>}</AnimatePresence>
          </div>
        </div>

        <div className="bg-[#0d0b09] p-3 md:p-4">
          <div ref={stage} className="relative h-[440px] overflow-hidden rounded-xl border border-[#2c2620] bg-[#efe7d8]">
            <div className="paper-noise absolute inset-0" />
            {/* mock reader chrome */}
            <div className="absolute inset-y-0 left-0 w-12 border-r border-[#ddd2ba] bg-[#e7ddc8]/60" />
            <div className="absolute top-0 right-0 left-12 flex h-10 items-center justify-between border-b border-[#ddd2ba] bg-[#e7ddc8]/60 px-3">
              <span className="font-serif text-[13px] font-semibold text-[#4a4136]">Pride and Prejudice</span>
              <span className="font-mono text-[10.5px] text-[#8a7a5c]">drag cards to an edge ↓</span>
            </div>
            <div className="absolute top-14 right-6 bottom-6 left-[72px] space-y-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={cn("h-2 rounded-full bg-[#d8cdb4]", i % 3 === 2 ? "w-10/12" : "w-full")} />
              ))}
            </div>

            {/* edge hints while dragging */}
            <AnimatePresence>
              {near && nearCard && (
                <motion.div key={near + nearCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={cn("absolute z-30 flex items-center justify-center bg-[#f5b83d]/25 font-mono text-[11px] font-semibold tracking-wider text-[#7a5c14] uppercase",
                    near === "right" && "inset-y-0 right-0 w-[72px] border-l-2 border-[#f5b83d]",
                    near === "left" && "inset-y-0 left-0 w-[72px] border-r-2 border-[#f5b83d]",
                    near === "bottom" && "inset-x-0 bottom-0 h-[72px] border-t-2 border-[#f5b83d]")}>
                  <span className={cn("flex items-center gap-1.5 rounded-full bg-[#f5b83d] px-2.5 py-1 text-[#14100a]", near !== "bottom" && "rotate-90 whitespace-nowrap")}>
                    <Magnet size={12} /> park {nearCard}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {renderCard("player", 64)}
            {renderCard("dict", 216)}

            <AnimatePresence>
              {mode === "new" && (["left", "right", "bottom"] as Edge[]).flatMap((edge) => tabsOn(edge).map((id, i) => renderTab(id, edge, i)))}
            </AnimatePresence>

            {mode === "shipped" && Object.keys(docked).length > 0 && (
              <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#14100a]/90 px-3 py-1.5 font-mono text-[10.5px] text-stone-300">
                <MousePointer2 size={12} className="text-[#f5b83d]" /> that 20px sliver is your whole UI — click it, we dare you
              </div>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Why tabs beat slivers.</span> Parking is a memory problem: the reader must recall <em>what</em> is parked and <em>where</em>. A 20px slice answers neither — two parked cards are indistinguishable. A labeled tab restores recognition-over-recall (the audit's own heuristic), shows live state (playing · 34%), and costs ~120×52px on an edge nobody reads on.
          </div>
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4 text-[13px] leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Kept from <span className="font-mono text-[12px]">park.rs</span>:</span> the physics. Hide 0.26s / reveal 0.34s with cubic ease-out, the 8px magnet pull on hover, click-to-reveal — all preserved in the demo above. Only the resting face changed.
          </div>
        </div>
        <div className="space-y-3">
          <Warn>
            <span className="font-semibold text-rose-300">Genuinely needed warning:</span> don't auto-park on a timer. The shipped code only tucks on explicit drag, which is correct — a card that slides away mid-read breaks trust faster than any sliver. Park on gesture, reveal on click or <Kbd>Esc</Kbd>, never on idle.
          </Warn>
          <div className="rounded-xl border border-[#2c2620] bg-[#0d0b09] p-4">
            <div className="mb-2 font-mono text-[11px] tracking-wider text-stone-500 uppercase">Suggested edge priority</div>
            <ul className="space-y-1.5 text-[13px] text-stone-300">
              <li><span className="font-mono text-[12px] text-[#f5b83d]">bottom → player</span> · transport controls live near thumbs + page pill</li>
              <li><span className="font-mono text-[12px] text-[#7cc4ff]">right → dictionary</span> · LTR margin; mirrors the word, never covers it</li>
              <li><span className="font-mono text-[12px] text-stone-400">left → overflow</span> · second parked card stacks, never overlaps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
