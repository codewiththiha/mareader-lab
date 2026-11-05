import { useEffect, useState } from "react";
import { SkipBack, SkipForward, Play, Pause, X, ChevronUp, MoreHorizontal, Clock, GripHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { Compare, Finding, Findings, PageText, Section, Stage } from "../lib/ui";

const SENTENCE = "When she is secure of him, there will be more leisure for falling in love as much as she chooses.".split(" ");

function useReading() {
  const [playing, setPlaying] = useState(true);
  const [at, setAt] = useState(0.06); // share of the book
  const [word, setWord] = useState(4);
  useEffect(() => {
    if (!playing) return;
    const h = setInterval(() => { setWord((w) => (w + 1) % SENTENCE.length); setAt((a) => (a + 0.0006) % 1); }, 380);
    return () => clearInterval(h);
  }, [playing]);
  return { playing, setPlaying, at, setAt, word };
}

const Btn = ({ children, label, disabled, onClick, size = 32 }: { children: React.ReactNode; label: string; disabled?: boolean; onClick?: () => void; size?: number }) => (
  <button aria-label={label} title={label} disabled={disabled} onClick={onClick}
    className={clsx("grid shrink-0 place-items-center rounded-full ink transition-colors", disabled ? "opacity-40" : "hover:bg-[var(--hover)] active:bg-[var(--pressed)]")}
    style={{ width: size, height: size }}>{children}</button>
);

function PlayButton({ playing, onClick, ring }: { playing: boolean; onClick: () => void; ring?: number }) {
  return (
    <button aria-label={playing ? "Pause" : "Play"} onClick={onClick} className="relative grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full transition-transform hover:scale-[1.06] active:scale-[0.92]" style={{ background: "var(--accent)", color: "var(--ink-on-accent)" }}>
      {ring != null && (
        <svg className="absolute -inset-[3px]" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="19.5" fill="none" stroke="rgb(var(--accent-rgb) / .25)" strokeWidth="2" />
          <circle cx="21" cy="21" r="19.5" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${ring * 122.5} 200`} transform="rotate(-90 21 21)" />
        </svg>
      )}
      {playing ? <Pause size={15} fill="currentColor" strokeWidth={0} /> : <Play size={15} fill="currentColor" strokeWidth={0} className="ml-[2px]" />}
    </button>
  );
}

function Track({ at, onSeek, ticks, width = 168 }: { at: number; onSeek: (v: number) => void; ticks?: number[]; width?: number }) {
  const [hot, setHot] = useState(false);
  return (
    <div className="relative flex h-[32px] items-center" style={{ width }} onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)}>
      <div className="relative mx-[6px] w-full rounded-[3px] transition-all" style={{ height: hot ? 6 : 4, background: "var(--track)" }}>
        {ticks?.map((t) => <span key={t} className="absolute top-0 h-full w-[1.5px] bg-[var(--surface)]" style={{ left: `${t * 100}%` }} />)}
        <div className="h-full rounded-[3px]" style={{ width: `${at * 100}%`, background: "var(--accent)" }} />
        <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all" style={{ left: `${at * 100}%`, width: hot ? 12 : 5, height: hot ? 12 : 5, background: "var(--accent)", boxShadow: "0 0 0 2px var(--surface)" }} />
      </div>
      <input type="range" min={0} max={1000} value={at * 1000} onChange={(e) => onSeek(+e.target.value / 1000)} aria-label="Reading position" className="absolute inset-0 cursor-pointer opacity-0" />
    </div>
  );
}

const fmtLeft = (at: number) => { const h = Math.round((1 - at) * 14.9); return h >= 1 ? `${h}h` : `${Math.round((1 - at) * 894)}m`; };

/** control.rs::show — slots laid left to right exactly as the source does. */
function Pill({ r, expanded, onExpand, onStop, proposed }: { r: ReturnType<typeof useReading>; expanded: boolean; onExpand: () => void; onStop: () => void; proposed?: boolean }) {
  const [speed, setSpeed] = useState(1.0);
  return (
    <div className="flex h-[44px] items-center px-[6px]">
      <Btn label="Previous sentence"><SkipBack size={16} /></Btn>
      <PlayButton playing={r.playing} onClick={() => r.setPlaying(!r.playing)} ring={proposed ? r.at : undefined} />
      <Btn label="Next sentence"><SkipForward size={16} /></Btn>
      <span style={{ width: 10 }} />
      <Track at={r.at} onSeek={r.setAt} ticks={proposed ? [0.08, 0.17, 0.26, 0.41, 0.55, 0.7, 0.86] : undefined} />
      <button className="ml-[8px] inline-flex h-[22px] w-[66px] items-center gap-1 rounded-full px-1.5 text-[12px] muted hover:bg-[var(--hover)]" title="Click for how much is read">
        <Clock size={11} /><span className="tabular-nums">{fmtLeft(r.at)}</span>
      </button>
      <span style={{ width: 4 }} />
      {proposed ? (
        <button onClick={() => setSpeed((s) => (s >= 2 ? 0.8 : +(s + 0.1).toFixed(1)))} onWheel={(e) => setSpeed((s) => Math.min(2, Math.max(0.8, +(s + (e.deltaY < 0 ? 0.1 : -0.1)).toFixed(1))))}
          className="h-[24px] w-[54px] rounded-full text-[12px] font-semibold tabular-nums ink hover:bg-[var(--hover)]" title="Speed · click steps, scroll adjusts">{speed.toFixed(1)}×</button>
      ) : (
        <button className="h-[24px] w-[54px] rounded-[8px] text-[12px] font-medium tabular-nums ink hover:bg-[var(--hover)]">1.0×</button>
      )}
      <Btn label={expanded ? "Collapse player" : "Expand player"} onClick={onExpand}><ChevronUp size={16} className="transition-transform duration-300" style={{ transform: `rotate(${expanded ? 180 : 0}deg)` }} /></Btn>
      <Btn label="More"><MoreHorizontal size={16} /></Btn>
      <span className="mx-[3.5px] h-[18px] w-px bg-[var(--line)]" />
      <Btn label="Stop reading aloud" onClick={onStop}><X size={16} /></Btn>
    </div>
  );
}

function Lyrics({ word, proposed }: { word: number; proposed?: boolean }) {
  return (
    <div className="relative overflow-hidden" style={{ height: proposed ? 78 : 92 }}>
      {!proposed && <p className="text-[13px] leading-snug muted">should therefore make the most of every half-hour in which she can command his attention.</p>}
      <p className={clsx("leading-snug", proposed ? "mt-0 text-[17px]" : "mt-1 text-[16px]")}>
        {SENTENCE.map((w, i) => (
          <span key={i} className="transition-colors duration-200" style={{ color: i <= word ? "var(--accent)" : "var(--ink)", fontWeight: i === word && proposed ? 600 : 400 }}>{w} </span>
        ))}
      </p>
      <p className="mt-1 text-[13px] leading-snug muted">"Your plan is a good one," replied Elizabeth, "where nothing is in question but the desire of being well married…</p>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22px]" style={{ background: "linear-gradient(to bottom, transparent, var(--surface))" }} />
      {!proposed && <div className="pointer-events-none absolute inset-x-0 top-0 h-[14px]" style={{ background: "linear-gradient(to top, transparent, var(--surface))" }} />}
    </div>
  );
}

const Cover = () => (
  <div className="relative h-[105px] w-[70px] shrink-0 overflow-hidden rounded-[4px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.18)]">
    <div className="absolute inset-x-2 top-2 space-y-[3px]">{[8, 6, 7, 5, 7, 6].map((w, i) => <div key={i} className="h-[2px] rounded bg-neutral-300" style={{ width: `${w * 10}%` }} />)}</div>
    <div className="serif absolute inset-x-0 top-[48px] text-center text-[6px] font-bold tracking-tight text-neutral-800">PRIDE AND<br />PREJUDICE</div>
    <div className="serif absolute inset-x-0 top-[68px] text-center text-[4.5px] text-neutral-700">By Jane Austen</div>
  </div>
);

function Bars({ playing }: { playing: boolean }) {
  return <span className="inline-flex h-[14px] w-[18px] items-end justify-center gap-[2px]">{[1, 2, 3].map((i) => <span key={i} className="w-[3px] rounded-sm" style={{ background: "var(--accent)", height: playing ? undefined : 4, animation: playing ? `dance${i} .9s ease-in-out infinite` : "none" }} />)}</span>;
}

function Card({ r, children, proposed }: { r: ReturnType<typeof useReading>; children: React.ReactNode; proposed?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-pop" style={{ width: proposed ? 440 : 500 }}>
      <div className="flex gap-[14px] p-[14px] pb-0">
        <Cover />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-medium ink">Pride and Prejudice, by Jane Austen</span>
            <Bars playing={r.playing} />
          </div>
          <div className="text-[13px] muted">{proposed ? "Chapter 6 · Page 14" : "Page 14"}</div>
          <div className={proposed ? "mt-1" : "mt-5"}><Lyrics word={r.word} proposed={proposed} /></div>
        </div>
      </div>
      {children}
    </div>
  );
}

/** park.rs: Edge::Bottom with PEEK 20; `tucked_rest` draws the frame only. */
function Parked({ proposed, r, onReveal }: { proposed?: boolean; r: ReturnType<typeof useReading>; onReveal: () => void }) {
  const [hot, setHot] = useState(false);
  return (
    <button onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)} onClick={onReveal}
      className="absolute left-1/2 w-[500px] -translate-x-1/2 overflow-hidden rounded-t-[22px] border border-line bg-surface text-left shadow-pop transition-all duration-200"
      style={{ bottom: hot ? -24 + 8 : -24, height: 44 }} title={proposed ? "Pride and Prejudice · 14h left · click to show player" : undefined}>
      {proposed && (
        <div className="relative flex h-[20px] items-center gap-2 px-3">
          <GripHorizontal size={12} className="muted" />
          <span className="grid h-[14px] w-[14px] place-items-center rounded-full" style={{ background: "var(--accent)", color: "var(--ink-on-accent)" }}>{r.playing ? <Pause size={8} fill="currentColor" strokeWidth={0} /> : <Play size={8} fill="currentColor" strokeWidth={0} />}</span>
          <span className="truncate text-[11px] font-medium ink">Pride and Prejudice</span>
          <span className="ml-auto text-[11px] tabular-nums muted">{fmtLeft(r.at)}</span>
          <div className="absolute inset-x-[14px] bottom-0 h-[2px] rounded-full" style={{ background: "var(--track)" }}><div className="h-full rounded-full" style={{ width: `${r.at * 100}%`, background: "var(--accent)" }} /></div>
        </div>
      )}
    </button>
  );
}

function Demo({ proposed }: { proposed?: boolean }) {
  const r = useReading();
  const [expanded, setExpanded] = useState(false);
  const [parked, setParked] = useState(false);
  const [stopped, setStopped] = useState(false);
  return (
    <div className="relative h-[420px]">
      <div className="absolute inset-0 p-5 pr-[52%] opacity-90"><PageText /></div>
      <div className="absolute inset-y-0 right-0 w-[48%] p-5 opacity-90"><PageText /></div>
      <div className="absolute right-3 top-3 flex gap-2">
        <button onClick={() => setParked((p) => !p)} className="rounded-[8px] border border-line bg-[var(--surface)] px-2.5 py-1 text-[12px] font-medium hover:bg-[var(--hover)]">{parked ? "Unpark" : "Simulate dict covering → park"}</button>
        {stopped && <button onClick={() => setStopped(false)} className="rounded-[8px] border border-line bg-[var(--surface)] px-2.5 py-1 text-[12px] font-medium">Start reading aloud</button>}
      </div>
      {!stopped && (parked ? (
        <Parked proposed={proposed} r={r} onReveal={() => setParked(false)} />
      ) : (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300">
          {expanded ? (
            <Card r={r} proposed={proposed}><Pill r={r} expanded onExpand={() => setExpanded(false)} onStop={() => setStopped(true)} proposed={proposed} /></Card>
          ) : (
            <div className="rounded-full border border-line bg-surface shadow-pop"><Pill r={r} expanded={false} onExpand={() => setExpanded(true)} onStop={() => setStopped(true)} proposed={proposed} /></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Player() {
  return (
    <Section id="player" title="Read-aloud player" source="crates/ui/src/read_aloud/control.rs · read_aloud/card.rs · read_aloud/mod.rs · park.rs" verdict="polish"
      summary="A 44 pt pill with a morphing play glyph, a seek track whose knob grows from 2.5 to 6 pt on hover, a time label that swaps to percent on click, and a 224 pt card where words light up like lyrics. The compact and full states are right. What is weak is the parked state and how little the pill tells you at a glance.">
      <Compare tall
        current={<Demo />}
        proposed={<Demo proposed />}
        currentNote={<>Click the chevron for the card. Press <em>Simulate dict covering → park</em>: `read_aloud/mod.rs` tucks the whole player below the stage's bottom edge, keeping `PEEK` = 20 pt. `if tucked_rest {'{'} return; {'}'}` means the strip is an empty frame; the magnet lifts it 8 pt on hover.</>}
        proposedNote="The 20 pt peek carries a state glyph, the title, time left and a 2 pt progress line, so a tucked player still reads as a player. The play button wears the book's progress ring; chapter ticks sit in the track; speed is a round chip that steps on click and nudges on scroll."
      />
      <Findings>
        <Finding kind="ok">The pill's `Fit` (drop speed first, then time, before the track shrinks under 56 pt) is the right priority order. The ghost fill between the knob and the pointer on hover, and the time/percent swap pinned to the track's end, are small things done properly.</Finding>
        <Finding kind="bug">Parked (`tucked_rest`), the player is a 20 pt blank strip of `surface` with a `line` border. Nothing says it is the player, nothing says it is still playing. The strip has the room for a glyph, a truncated title and the progress line; it should use it. The same applies to `dict/window.rs`'s left/right tucks.</Finding>
        <Finding kind="bug">The park only happens when the dictionary window overlaps (`covered = stage.dict.intersects(rect)`), and it un-parks for 4 s after interaction (`unparked_until`). The reader has no way to park it deliberately; a drag downward past the pill's half height should park it too, as the dict window already parks when dragged past half its width.</Finding>
        <Finding kind="idea">The full card keeps the title row 8 pt under the cover's top and the lyric block 20 pt below the place line (`EYE 0.4`), leaving a 24 pt dead band in a 224 pt card. Tightening to a chapter · page line directly under the title gains a third lyric line without growing the card.</Finding>
        <Finding kind="idea">Speed is a 54 pt text button that opens a menu of `RATES`. Speed is adjusted often and in small steps; click-to-step with scroll-to-nudge (shown) is one gesture fewer and the label is the control.</Finding>
        <Finding kind="idea">In the Library the card is 500 pt wide for a 70×105 cover and three lines of text. At 440 pt nothing is lost and it stops looking like a dialog.</Finding>
      </Findings>
      <Stage label="Compact pill under 420 pt (Fit drops speed, then time)" tone="plain" className="!min-h-0 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex h-[44px] items-center rounded-full border border-line bg-surface px-[6px] shadow-pop">
            <Btn label="Previous"><SkipBack size={16} /></Btn><PlayButton playing onClick={() => {}} /><Btn label="Next"><SkipForward size={16} /></Btn>
            <span style={{ width: 10 }} /><Track at={0.06} onSeek={() => {}} width={110} /><span className="ml-2 w-[66px] text-[12px] muted">◷ 14h</span>
            <Btn label="Expand"><ChevronUp size={16} /></Btn><Btn label="More"><MoreHorizontal size={16} /></Btn><span className="mx-[3.5px] h-[18px] w-px bg-[var(--line)]" /><Btn label="Stop"><X size={16} /></Btn>
          </div>
          <div className="inline-flex h-[44px] items-center rounded-full border border-line bg-surface px-[6px] shadow-pop" title="Proposed: the ring carries progress when the track is gone">
            <Btn label="Previous"><SkipBack size={16} /></Btn><PlayButton playing onClick={() => {}} ring={0.06} /><Btn label="Next"><SkipForward size={16} /></Btn>
            <span className="mx-1 text-[12px] tabular-nums muted">14h</span>
            <Btn label="More"><MoreHorizontal size={16} /></Btn><span className="mx-[3.5px] h-[18px] w-px bg-[var(--line)]" /><Btn label="Stop"><X size={16} /></Btn>
          </div>
        </div>
      </Stage>
    </Section>
  );
}
