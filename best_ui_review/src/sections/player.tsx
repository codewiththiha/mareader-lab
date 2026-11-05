import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Ellipsis, Pause, Play, SkipBack, SkipForward, X, Square, Gauge, Maximize2 } from "lucide-react";
import { Grid, Notes, Section, Specimen } from "../kit/frame";
import { IconBtn, Ring } from "../kit/primitives";
import { BOOK, WORDS, leftText, usePlayback, type Playback } from "../kit/playback";
import { cn } from "../kit/cn";

/* ---------- shared bits, faithful to read_aloud/control.rs ---------- */
function PlayBtn({ p, size = 36, ring }: { p: Playback; size?: number; ring?: boolean }) {
  const I = p.playing ? Pause : Play;
  return (
    <button onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"} className="relative grid shrink-0 place-items-center rounded-full" style={{ width: size + (ring ? 8 : 0), height: size + (ring ? 8 : 0) }}>
      {ring && <Ring size={size + 8} stroke={2.5} value={p.progress} className="absolute inset-0" />}
      <span className="grid place-items-center rounded-full bg-accent text-on-accent transition-transform active:scale-95" style={{ width: size, height: size }}>
        <I size={size * 0.44} fill="currentColor" strokeWidth={0} className={p.playing ? "" : "translate-x-[1px]"} />
      </span>
    </button>
  );
}
const VRule = () => <span className="mx-1 h-5 w-px shrink-0 bg-line" />;

function Track({ value, width }: { value: number; width: number }) {
  return (
    <div className="relative mx-2 flex h-8 items-center" style={{ width }}>
      <div className="h-[3px] w-full rounded-full bg-track/80" />
      <div className="absolute left-0 h-[3px] rounded-full bg-accent" style={{ width: `${value * 100}%` }} />
      <span className="absolute h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-accent" style={{ left: `${value * 100}%` }} />
    </div>
  );
}

function Bars({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex h-[14px] items-end gap-[2px]", className)}>
      {[0, 0.25, 0.5].map((d) => (
        <span key={d} className={cn("w-[3px] rounded-sm bg-accent", playing ? "bar-dance" : "")} style={{ height: "100%", animationDelay: `${d}s`, transform: playing ? undefined : "scaleY(.4)", transformOrigin: "bottom" }} />
      ))}
    </span>
  );
}

function Lyric({ word, size = 16, lines }: { word: number; size?: number; lines?: number }) {
  return (
    <p className="leading-snug" style={{ fontSize: size, display: lines ? "-webkit-box" : undefined, WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
      {WORDS.map((w, i) => (
        <span key={i} className={cn("transition-colors", i < word ? "text-accent" : i === word ? "text-ink" : "text-muted")}>{w} </span>
      ))}
    </p>
  );
}

function Cover({ w, h }: { w: number; h: number }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-end gap-[3px] rounded-[3px] border border-line bg-[#fbf8f2] px-1.5 pb-2 shadow-sm" style={{ width: w, height: h }}>
      <div className="mb-auto mt-2 w-full space-y-[2px]">{Array.from({ length: 7 }, (_, i) => <div key={i} className="h-[1.5px] rounded bg-black/15" style={{ width: `${70 + ((i * 37) % 30)}%` }} />)}</div>
      <div className="font-book text-[5px] font-bold text-black/70">PRIDE AND PREJUDICE</div>
      <div className="font-book text-[4px] text-black/50">By Jane Austen</div>
    </div>
  );
}

/* ---------------------------- CURRENT ----------------------------- */
/** HEIGHT 44, BUTTON 32, PLAY 36, PAD 6, narrowest 300 (design.md § player width). */
export function PillCurrent({ p, width = 300 }: { p: Playback; width?: number }) {
  const track = width - 6 * 2 - 32 * 5 - 36 - 9 - 16;
  return (
    <div className="flex h-[44px] items-center rounded-full border border-line bg-surface px-[6px] pop" style={{ width }}>
      <IconBtn icon={SkipBack} label="Back a sentence" />
      <PlayBtn p={p} />
      <IconBtn icon={SkipForward} label="Next sentence" />
      <Track value={p.progress} width={track} />
      <IconBtn icon={ChevronUp} label="Show the card" />
      <IconBtn icon={Ellipsis} label="Options" />
      <VRule />
      <IconBtn icon={X} label="Stop reading aloud" />
    </div>
  );
}

/** card::HEIGHT 224, FULL_LEAST 380, PAD 14, COVER 70×105, NOW_SIZE 16. */
export function CardCurrent({ p }: { p: Playback }) {
  return (
    <div className="flex h-[224px] w-[380px] flex-col rounded-[12px] border border-line bg-surface pop">
      <div className="flex flex-1 gap-3 p-[14px] pb-0">
        <Cover w={70} h={105} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-[15px] font-medium text-ink">{BOOK}</div>
            <Bars playing={p.playing} className="ml-auto" />
          </div>
          <div className="text-[13px] text-muted">Page 14</div>
          <div className="mt-7"><Lyric word={p.word} lines={3} /></div>
        </div>
      </div>
      <div className="flex h-[44px] items-center px-[6px] pb-1">
        <IconBtn icon={SkipBack} label="Back" disabled />
        <PlayBtn p={p} />
        <IconBtn icon={SkipForward} label="Next" />
        <Track value={p.progress} width={78} />
        <span className="flex items-center gap-1 text-[12px] text-muted"><Clock size={13} /> {leftText(p.progress)}</span>
        <span className="flex-1" />
        <IconBtn icon={ChevronDown} label="Hide the card" />
        <IconBtn icon={Ellipsis} label="Options" />
        <VRule />
        <IconBtn icon={X} label="Stop" />
      </div>
    </div>
  );
}

/** Fault state at HEAD (shot: epub=sample read_aloud=true, no voice installed).
 *  control.rs::note lays the link out with layout_no_wrap and only clips it with the painter → "Voice settir". */
export function PillFaultCurrent() {
  return (
    <div className="flex h-[44px] w-[300px] items-center rounded-full border border-line bg-surface px-[6px] pop">
      <IconBtn icon={SkipBack} label="Back" disabled />
      <span className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full bg-accent/45 text-on-accent"><Play size={16} fill="currentColor" strokeWidth={0} className="translate-x-[1px]" /></span>
      <IconBtn icon={SkipForward} label="Next" disabled />
      <div className="mx-2 w-[67px] overflow-hidden whitespace-nowrap text-[13px] text-accent">Voice settings…</div>
      <IconBtn icon={ChevronUp} label="Show the card" />
      <IconBtn icon={Ellipsis} label="Options" />
      <VRule />
      <IconBtn icon={X} label="Stop reading aloud" />
    </div>
  );
}
export function PillFaultProposed() {
  return (
    <div className="flex h-[44px] w-[300px] items-center gap-1 rounded-full border border-line bg-surface pl-[4px] pr-[6px] pop">
      <span className="relative grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full bg-chip text-muted"><Play size={15} fill="currentColor" strokeWidth={0} className="translate-x-[1px]" /></span>
      <div className="min-w-0 flex-1 px-1.5 leading-tight">
        <div className="truncate text-[12.5px] font-medium text-ink">No voice installed</div>
        <div className="truncate text-[11px] text-muted">Kokoro · 82 MB · or use the system voice</div>
      </div>
      <button className="h-[28px] shrink-0 rounded-full bg-accent px-3 text-[12px] font-medium text-on-accent">Get a voice</button>
      <IconBtn icon={X} label="Close the player" size={28} icon_size={14} className="text-muted" />
    </div>
  );
}

/* ---------------------------- PROPOSED ---------------------------- */
function Scrub({ p, always }: { p: Playback; always?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div
      className={cn("group/scrub absolute inset-x-5 -bottom-[1px] h-3 cursor-pointer", !always && "opacity-0 transition-opacity group-hover:opacity-100")}
      onMouseMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); setHover((e.clientX - b.left) / b.width); }}
      onMouseLeave={() => setHover(null)}
      onClick={(e) => { const b = e.currentTarget.getBoundingClientRect(); p.setProgress((e.clientX - b.left) / b.width); }}
    >
      <div className="absolute inset-x-0 bottom-[4px] h-[2px] rounded-full bg-line" />
      <div className="absolute bottom-[4px] left-0 h-[2px] rounded-full bg-accent" style={{ width: `${p.progress * 100}%` }} />
      {hover !== null && (
        <div className="absolute bottom-3 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[11px] text-paper" style={{ left: `${hover * 100}%` }}>
          p. {Math.round(hover * 234) || 1} · Ch. {Math.max(1, Math.round(hover * 61))}
        </div>
      )}
    </div>
  );
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
function SpeedChip({ p }: { p: Playback }) {
  return (
    <button onClick={() => p.setSpeed(SPEEDS[(SPEEDS.indexOf(p.speed) + 1) % SPEEDS.length])} title="Speed — click to cycle, scroll to fine-tune"
      className="h-6 shrink-0 rounded-full bg-chip px-2 text-[11.5px] font-medium tabular-nums text-ink hover:bg-line">{p.speed}×</button>
  );
}

/** Same 44 × 300 footprint. Progress moves to a ring round Play, so the
 *  squeezed 70 pt track gives its room to the words being read. */
export function PillProposed({ p, width = 300 }: { p: Playback; width?: number }) {
  return (
    <div className="group relative flex h-[44px] items-center gap-0.5 rounded-full border border-line bg-surface pl-[2px] pr-[6px] pop" style={{ width }}>
      <PlayBtn p={p} size={32} ring />
      <IconBtn icon={SkipBack} label="Back a sentence" size={28} icon_size={15} />
      <IconBtn icon={SkipForward} label="Next sentence" size={28} icon_size={15} />
      <button className="fade-x min-w-0 flex-1 overflow-hidden whitespace-nowrap px-1 text-left text-[13px]" title="Show the card">
        <span className="text-accent">{WORDS.slice(Math.max(0, p.word - 2), p.word).join(" ")} </span>
        <span className="font-medium text-ink">{WORDS[p.word]}</span>
        <span className="text-muted"> {WORDS.slice(p.word + 1, p.word + 5).join(" ")}</span>
      </button>
      {width >= 340 && <span className="shrink-0 px-1 text-[11.5px] tabular-nums text-muted">{leftText(p.progress)}</span>}
      <SpeedChip p={p} />
      <IconBtn icon={Ellipsis} label="Options" size={28} icon_size={15} />
      <IconBtn icon={Square} label="Stop reading aloud" size={28} icon_size={12} className="text-muted hover:text-danger" />
      <Scrub p={p} />
    </div>
  );
}

/** 380 × 168 instead of 224: no dead band between "Page 14" and the words. */
export function CardProposed({ p }: { p: Playback }) {
  return (
    <div className="group relative w-[380px] rounded-[16px] border border-line bg-surface p-3 pop">
      <div className="flex items-center gap-3">
        <div className="relative"><Cover w={36} h={54} /><Bars playing={p.playing} className="absolute -bottom-1 -right-1 rounded bg-surface p-[2px]" /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium text-ink">{BOOK}</div>
          <div className="text-[12px] text-muted">Chapter 6 · Page 14 of 234 · {leftText(p.progress)} left</div>
        </div>
        <IconBtn icon={ChevronDown} label="Fold to the pill" size={28} icon_size={15} />
      </div>
      <div className="my-3 rounded-xl bg-paper/60 px-3 py-2.5"><Lyric word={p.word} size={15} lines={2} /></div>
      <div className="flex items-center gap-1">
        <SpeedChip p={p} />
        <span className="flex-1" />
        <IconBtn icon={SkipBack} label="Back a sentence" />
        <PlayBtn p={p} size={40} ring />
        <IconBtn icon={SkipForward} label="Next sentence" />
        <span className="flex-1" />
        <IconBtn icon={Ellipsis} label="Options" size={28} icon_size={15} />
        <IconBtn icon={Square} label="Stop" size={28} icon_size={12} className="text-muted hover:text-danger" />
      </div>
      <Scrub p={p} always />
    </div>
  );
}

/** For panes under ~320 pt, or a parked player: everything in 44 pt. */
export function OrbProposed({ p }: { p: Playback }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full border border-line bg-surface p-[2px] pop"><PlayBtn p={p} size={36} ring /></div>
      <span className="text-[12px] text-muted">Orb · 48 pt</span>
    </div>
  );
}

export function PlayerSection() {
  const p = usePlayback();
  return (
    <Section id="player" kicker="read_aloud/control.rs · card.rs · edges.rs" title="Read-aloud player"
      intro={<>The pill is already well built: it morphs play into pause, has a spinner state, resizable sides with a grip and a reset on double-click, and it drops speed, then time, then shortens the track as room shrinks (<code>Fit::new</code>). The problem is what survives at its <b>narrowest 300 pt</b>, the default. That leaves about 70 pt of track with no time and no speed, and the full card spends 224 pt of height on a 70×105 cover beside a large empty band.</>}>
      <Grid>
        <Specimen tag="current" title="Compact pill · 300 × 44" src="read_aloud/control.rs" note="Measured from the code: 6 + 32·5 + 36 + rule + 6 leaves the track roughly 70 pt at the default width. In the screenshot it is a dot on a line: no time and no target, and too short to scrub with any precision.">
          <PillCurrent p={p} />
        </Specimen>
        <Specimen tag="proposed" title="Pill 2.0 · same 300 × 44" note="Progress becomes a ring round Play, which is always visible. The freed room shows the words being read (the reason the player exists). On hover, a full-width hairline scrubber appears along the bottom edge with a page and chapter bubble: four times the precision of the 70 pt track. Speed becomes a one-tap chip. Stop uses a stop glyph, kept apart and turning red on hover, so it is not mistaken for 'close menu'.">
          <PillProposed p={p} />
        </Specimen>
        <Specimen tag="current" title="Full card · 380 × 224" src="read_aloud/card.rs" stageClass="py-10">
          <CardCurrent p={p} />
        </Specimen>
        <Specimen tag="proposed" title="Card 2.0 · 380 × 168 (−25 % height)" stageClass="py-10" note="The cover shrinks to a 36 pt thumbnail with the dancing bars badged on it. Chapter, page and time-left share one line. The words sit on a soft well, so they read as the hero. Play is centred and largest, as players usually are, and the scrubber runs the full width.">
          <CardProposed p={p} />
        </Specimen>
      </Grid>
      <Grid>
        <Specimen tag="current" title="No voice yet · rendered at HEAD" src="read_aloud/control.rs::note" note={<>A real bug, reproduced with the repo's <code>shot</code> tool: the fix-it link is laid out unwrapped and hard-clipped to the ~67 pt track slot, so it reads <b>“Voice settir”</b>. Back and Next are disabled, and Play is faded but still the most prominent thing on the pill.</>}><PillFaultCurrent /></Specimen>
        <Specimen tag="proposed" title="Fault state as a call to action" note="When there is nothing to play, the pill switches to a fault layout: what is wrong, what it costs, and one filled button that fixes it. Transport controls that can't act are hidden rather than greyed. The fix in place is one line: truncate_at_width the link as well, or fall back to an icon-only ⚙ when it doesn't fit."><PillFaultProposed /></Specimen>
      </Grid>
      <Grid cols={3}>
        <Specimen tag="variant" title="Wide pill · 420 (user-dragged)"><PillProposed p={p} width={420} /></Specimen>
        <Specimen tag="variant" title="Orb · narrow panes & parked"><OrbProposed p={p} /></Specimen>
        <Specimen tag="variant" title="Expand affordance" note="The whole ticker is the expand target (Fitts), so the separate chevron goes away.">
          <div className="flex items-center gap-2 text-[12px] text-muted"><Maximize2 size={14} /> click words → card <Gauge size={14} className="ml-2" /> chip → speed</div>
        </Specimen>
      </Grid>
      <Notes title="Review" items={[
        ["keep", "Morphing play↔pause quads, the grip that appears only while an edge is hot, and drop-order priorities in Fit. These are good details; keep them."],
        ["issue", "At 300 pt the seek track is about 70 pt wide, so each pixel spans roughly 0.3 % of a 15 h book. It reads as decoration, not a control."],
        ["issue", "The full card's lyric starts about 28 pt below 'Page 14' with nothing in between: dead space in a floating card that already covers text."],
        ["issue", "✕ for stop sits next to ⋯ after a hairline. The same glyph means 'dismiss' everywhere else in the app (toasts, dictionary), but here it ends a session."],
        ["issue", "Bug at HEAD: note() truncates the message but not the link galley (layout_no_wrap + with_clip_rect), so at the default width the call to action reads “Voice settir”."],
        ["warn", "If the ring replaces the track, keep keyboard seeking (← → by sentence; ⇧ by chapter) and an aria-valuetext on the ring. Otherwise screen-reader users lose the slider."],
      ]} />
    </Section>
  );
}
