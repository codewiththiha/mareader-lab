import { useRef, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Ellipsis,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
  Clock,
  Moon,
  Mic2,
  Minus,
  Plus,
  ScanText,
  ListMusic,
  Gauge,
} from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { Eq, IconButton, Ring, Surface, Tip, MenuRow, Rule, Switch } from "../ui/kit";
import { cn } from "../utils/cn";
import { SENTENCES, left, RATES, type Playback, usePlayback } from "../lab/usePlayback";

/* ═════════ TODAY — rebuilt from read_aloud/control.rs + card.rs (metrics in pt) ═════════
   HEIGHT 44 · BUTTON 32 · PLAY 36 · ICON 16 · PAD 6 · track 56–168 · radius = HEIGHT/2
   Card: HEIGHT 224 · PAD 14 · COVER 70×105 · NOW 16 / NEAR 13 · radius 18                */

function Cover({ w = 70, h = 105 }: { w?: number; h?: number }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-[3px] bg-white shadow-[0_1px_4px_rgba(0,0,0,.25)]"
      style={{ width: w, height: h }}
      aria-hidden
    >
      <div className="flex h-full flex-col px-[7px] pt-[6px] font-serif text-black/70">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="mb-[3px] h-[1.5px] rounded bg-black/20" style={{ width: `${88 - (i % 3) * 14}%` }} />
        ))}
        <div className="mt-[12px] text-center text-[5.5px] font-bold leading-none tracking-tight">PRIDE AND PREJUDICE</div>
        <div className="mt-[5px] text-center text-[4.5px] font-semibold leading-none">By Jane Austen</div>
        <div className="mx-auto mt-[6px] h-px w-[60%] bg-black/25" />
        <div className="mt-[6px] text-center text-[4px] font-semibold leading-none">Contents</div>
      </div>
    </div>
  );
}

function Transport({
  pb,
  playSize = 36,
  ring,
  disabledBack,
}: {
  pb: Playback;
  playSize?: number;
  ring?: boolean;
  disabledBack?: boolean;
}) {
  const playBtn = (
    <button
      type="button"
      aria-label={pb.playing ? "Pause" : "Play"}
      onClick={pb.toggle}
      className="grid place-items-center rounded-full bg-accent text-on-accent shadow-sm outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1"
      style={{ width: playSize, height: playSize }}
    >
      {pb.playing ? <Pause size={16} fill="currentColor" strokeWidth={0} /> : <Play size={16} fill="currentColor" strokeWidth={0} className="translate-x-px" />}
    </button>
  );
  return (
    <>
      <IconButton icon={SkipBack} label="Previous sentence" size="md" round disabled={disabledBack} onClick={() => pb.step(-1)} />
      {ring ? (
        <Ring value={pb.progress} size={playSize + 8} stroke={2.5}>
          {playBtn}
        </Ring>
      ) : (
        playBtn
      )}
      <IconButton icon={SkipForward} label="Next sentence" size="md" round onClick={() => pb.step(1)} />
    </>
  );
}

/** The seek track as drawn today: hairline, filled part, a small dot at the playhead. */
function TodayTrack({ pb, width }: { pb: Playback; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const seek = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    pb.setProgress(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };
  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Seek"
      aria-valuenow={Math.round(pb.progress * 100)}
      className="relative h-8 cursor-pointer touch-none"
      style={{ width }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seek(e);
      }}
      onPointerMove={(e) => e.buttons && seek(e)}
    >
      <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-track" />
      <div className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full bg-accent" style={{ width: `${pb.progress * 100}%` }} />
      <div
        className="absolute top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ left: `${pb.progress * 100}%` }}
      />
    </div>
  );
}

function CardFrame({ k, className, children, style }: { k: 0 | 1; className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("relative border border-line bg-surface text-ink", className)}
      style={{
        borderRadius: k ? 18 : 22,
        boxShadow: k ? "0 14px 42px var(--shadow)" : "0 8px 24px var(--shadow)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TodayPill({ pb, open, onToggleOpen, onStop }: { pb: Playback; open?: boolean; onToggleOpen?: () => void; onStop?: () => void }) {
  return (
    <CardFrame k={0} className="flex h-11 w-[304px] items-center px-1.5">
      <Transport pb={pb} disabledBack={pb.sentence === 0 && false} />
      <div className="w-[10px]" />
      <TodayTrack pb={pb} width={70} />
      <div className="w-1" />
      <IconButton icon={open ? ChevronDown : ChevronUp} label={open ? "Collapse player" : "Expand player"} size="md" round onClick={onToggleOpen} />
      <IconButton icon={Ellipsis} label="Voice, speed and highlight" size="md" round />
      <div className="mx-[3.5px] h-[18px] w-px bg-line" />
      <IconButton icon={X} label="Stop reading aloud" size="md" round onClick={onStop} />
    </CardFrame>
  );
}

/** Lyrics as the card draws them: the sentence said, 4-ish words lit, neighbours smaller and muted. */
function Lyrics({ pb, now = 16, near = 13, lit = 5 }: { pb: Playback; now?: number; near?: number; lit?: number }) {
  const words = SENTENCES[pb.sentence].split(" ");
  const prev = SENTENCES[(pb.sentence + SENTENCES.length - 1) % SENTENCES.length];
  const next = SENTENCES[(pb.sentence + 1) % SENTENCES.length];
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 78%, transparent)" }}>
      <p className="mb-1.5 line-clamp-1 text-muted/80" style={{ fontSize: near }}>{prev}</p>
      <p className="font-normal leading-snug text-muted" style={{ fontSize: now }}>
        {words.map((w, i) => (
          <span key={i} className={cn("transition-colors duration-200", i >= pb.word && i < pb.word + lit && "text-accent")}>
            {w}{" "}
          </span>
        ))}
      </p>
      <p className="mt-1.5 line-clamp-2 text-muted/70" style={{ fontSize: near }}>{next}</p>
    </div>
  );
}

export function TodayCard({ pb, onToggleOpen, onStop }: { pb: Playback; onToggleOpen?: () => void; onStop?: () => void }) {
  return (
    <CardFrame k={1} className="flex h-56 w-[380px] flex-col">
      <div className="flex min-h-0 flex-1 gap-3.5 p-3.5 pb-0">
        <Cover />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[15px] font-medium">Pride and Prejudice, by Jane Au…</span>
            <Eq playing={pb.playing} />
          </div>
          <span className="text-[12px] text-muted">Page 14</span>
          <div className="mt-2 flex min-h-0 flex-1 flex-col">
            <Lyrics pb={pb} />
          </div>
        </div>
      </div>
      <div className="flex h-11 shrink-0 items-center px-1.5">
        <Transport pb={pb} />
        <div className="w-[10px]" />
        <TodayTrack pb={pb} width={84} />
        <span className="ml-2 flex w-[66px] items-center gap-1 text-[12px] text-muted"><Clock size={13} />{left(pb.progress)}</span>
        <div className="flex-1" />
        <IconButton icon={ChevronDown} label="Collapse player" size="md" round onClick={onToggleOpen} />
        <IconButton icon={Ellipsis} label="More" size="md" round />
        <div className="mx-[3.5px] h-[18px] w-px bg-line" />
        <IconButton icon={X} label="Stop reading aloud" size="md" round onClick={onStop} />
      </div>
    </CardFrame>
  );
}

/* ═════════ PROPOSED A — Capsule: ring-on-play, scrub hint, speed chip, graceful narrowing ═════════ */

function ScrubTrack({ pb, className }: { pb: Playback; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const page = (p: number) => Math.max(1, Math.round(p * 234));
  const chapters = [0.07, 0.19, 0.31, 0.46, 0.58, 0.71, 0.85];
  const at = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Seek"
      aria-valuetext={`Page ${page(pb.progress)}`}
      className={cn("group/track relative h-9 min-w-10 flex-1 cursor-pointer touch-none", className)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pb.setProgress(at(e));
      }}
      onPointerMove={(e) => {
        setHover(at(e));
        if (e.buttons) pb.setProgress(at(e));
      }}
      onPointerLeave={() => setHover(null)}
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-track transition-[height] group-hover/track:h-1.5">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pb.progress * 100}%` }} />
      </div>
      {chapters.map((c) => (
        <span key={c} className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-surface" style={{ left: `${c * 100}%` }} />
      ))}
      <span
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent shadow transition-transform group-hover/track:scale-100"
        style={{ left: `${pb.progress * 100}%` }}
      />
      {hover !== null && (
        <span
          className="pointer-events-none absolute -top-6 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] leading-none shadow-[0_2px_8px_var(--shadow-soft)]"
          style={{ left: `${hover * 100}%` }}
        >
          Page {page(hover)} <span className="text-muted">· Ch. {Math.min(61, Math.floor(hover * 61) + 1)}</span>
        </span>
      )}
    </div>
  );
}

function SpeedChip({ pb }: { pb: Playback }) {
  const i = RATES.indexOf(pb.rate);
  return (
    <Tip label="Speed — click to cycle, scroll to fine-tune">
      <button
        type="button"
        onClick={() => pb.setRate(RATES[(i + 1) % RATES.length])}
        className="h-7 min-w-11 rounded-full px-2 text-[12px] font-medium tabular-nums text-ink outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        {pb.rate}×
      </button>
    </Tip>
  );
}

export function Capsule({ pb, width, onToggleOpen, open, onStop }: { pb: Playback; width: number; open?: boolean; onToggleOpen?: () => void; onStop?: () => void }) {
  const wide = width >= 440;
  const medium = width >= 330;
  const micro = width < 250;
  const [menu, setMenu] = useState(false);
  return (
    <CardFrame k={0} className="flex h-12 items-center gap-0.5 px-1.5" style={{ width }}>
      {micro ? (
        <>
          <Ring value={pb.progress} size={40} stroke={2.5}>
            <button
              type="button"
              aria-label={pb.playing ? "Pause" : "Play"}
              onClick={pb.toggle}
              className="grid size-8 place-items-center rounded-full bg-accent text-on-accent"
            >
              {pb.playing ? <Pause size={14} fill="currentColor" strokeWidth={0} /> : <Play size={14} fill="currentColor" strokeWidth={0} className="translate-x-px" />}
            </button>
          </Ring>
          <div className="flex flex-1 flex-col px-1.5 leading-tight">
            <span className="text-[12.5px] font-medium">Page 14</span>
            <span className="text-[11px] text-muted">{left(pb.progress)} left</span>
          </div>
          <Eq playing={pb.playing} className="mr-1" />
          <IconButton icon={ChevronUp} label="Expand player" size="md" round onClick={onToggleOpen} />
        </>
      ) : (
        <>
          <Transport pb={pb} playSize={36} ring />
          {medium ? <ScrubTrack pb={pb} className="mx-1.5" /> : <span className="flex-1" />}
          {medium && <span className="w-9 text-right text-[12px] tabular-nums text-muted">−{left(pb.progress)}</span>}
          {!medium && <span className="text-[12px] tabular-nums text-muted">−{left(pb.progress)}</span>}
          {wide && <SpeedChip pb={pb} />}
          <IconButton icon={open ? ChevronDown : ChevronUp} label={open ? "Collapse player" : "Expand player"} size="md" round onClick={onToggleOpen} />
          <div className="relative">
            <IconButton icon={Ellipsis} label="More" size="md" round active={menu} onClick={() => setMenu((m) => !m)} tip={!menu} />
            {menu && (
              <Surface className="pop-in absolute right-0 bottom-full z-30 mb-2 w-60 p-1.5">
                {!wide && <MenuRow icon={Gauge} label={`Speed ${pb.rate}×`} onClick={() => pb.setRate(RATES[(RATES.indexOf(pb.rate) + 1) % RATES.length])} />}
                <MenuRow icon={Mic2} label="Voice" trailing={<span className="text-[12px] text-muted">Kokoro · Heart</span>} />
                <MenuRow icon={Moon} label="Sleep timer" trailing={<span className="text-[12px] text-muted">Off</span>} />
                <MenuRow icon={ScanText} label="Highlight style" />
                <Rule />
                <MenuRow icon={ListMusic} label="Open in Library player" />
              </Surface>
            )}
          </div>
          <div className="mx-0.5 h-[18px] w-px bg-line" />
          <IconButton icon={X} label="Stop reading aloud" size="md" round onClick={onStop} />
        </>
      )}
    </CardFrame>
  );
}

/* ═════════ PROPOSED B — Now-playing card: fills the dead space with the controls people actually reach for ═════════ */

export function NowCard({ pb, onToggleOpen, onStop }: { pb: Playback; onToggleOpen?: () => void; onStop?: () => void }) {
  const [follow, setFollow] = useState(true);
  const [sleep, setSleep] = useState(false);
  return (
    <CardFrame k={1} className="flex h-56 w-[380px] flex-col">
      <div className="flex min-h-0 flex-1 gap-3.5 p-3.5 pb-1">
        <Cover />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[15px] font-medium">Pride and Prejudice</span>
            <Eq playing={pb.playing} />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
            <span>Page 14</span>
            <span aria-hidden>·</span>
            <span className="truncate">Chapter 6</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">−{left(pb.progress)}</span>
          </div>
          <div className="mt-2 flex min-h-0 flex-1 flex-col">
            <Lyrics pb={pb} />
          </div>
        </div>
      </div>
      {/* chips row: the controls hidden in "…" today */}
      <div className="flex items-center gap-1.5 px-3.5 pb-1">
        <div className="flex h-7 items-center rounded-full border border-line">
          <button aria-label="Slower" className="grid size-7 place-items-center rounded-full hover:bg-hover" onClick={() => pb.setRate(Math.max(0.75, +(pb.rate - 0.25).toFixed(2)))}><Minus size={12} /></button>
          <span className="w-9 text-center text-[12px] font-medium tabular-nums">{pb.rate}×</span>
          <button aria-label="Faster" className="grid size-7 place-items-center rounded-full hover:bg-hover" onClick={() => pb.setRate(Math.min(2, +(pb.rate + 0.25).toFixed(2)))}><Plus size={12} /></button>
        </div>
        <button onClick={() => setSleep((s) => !s)} className={cn("flex h-7 items-center gap-1 rounded-full border px-2.5 text-[12px] transition-colors", sleep ? "border-transparent bg-accent-soft text-accent" : "border-line text-muted hover:bg-hover")}>
          <Moon size={12} />{sleep ? "30 min" : "Sleep"}
        </button>
        <button className="flex h-7 min-w-0 items-center gap-1 rounded-full border border-line px-2.5 text-[12px] text-muted hover:bg-hover">
          <Mic2 size={12} /><span className="truncate">Heart</span>
        </button>
        <div className="flex-1" />
        <Tip label={follow ? "Page follows the voice" : "Page stays put"}>
          <span className="flex items-center gap-1.5 text-[11.5px] text-muted">Follow<Switch on={follow} onChange={setFollow} label="Follow along" /></span>
        </Tip>
      </div>
      <div className="flex h-12 shrink-0 items-center border-t border-line px-1.5">
        <Transport pb={pb} ring playSize={36} />
        <ScrubTrack pb={pb} className="mx-2" />
        <IconButton icon={ChevronDown} label="Collapse player" size="md" round onClick={onToggleOpen} />
        <div className="mx-0.5 h-[18px] w-px bg-line" />
        <IconButton icon={X} label="Stop reading aloud" size="md" round onClick={onStop} />
      </div>
    </CardFrame>
  );
}

/* ═════════ SECTION ═════════ */

export default function PlayerSection() {
  const pb = usePlayback(true);
  const pb2 = usePlayback(true);
  const [openToday, setOpenToday] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const [w, setW] = useState(440);

  return (
    <Block
      id="player"
      n="02"
      title="Read-aloud player"
      verdict="redesign"
      source="read_aloud/control.rs · read_aloud/card.rs · read_aloud/edges.rs · read_aloud/mod.rs"
      lead="The pill is already clever (it drops speed, then time, as it narrows, and you can drag its edges). What it can't do is tell you anything at its narrowest — which is the width it opens at. The track is a 70 pt hairline with no time, and speed, voice and sleep are all behind “…”."
      notes={[
        { kind: "ok", text: "Keep: lyrics-style streaming words, the cover, resize-by-edge with double-click reset, and the cross-fade between compact and full. They are good." },
        { kind: "idea", text: "A ring around Play carries progress at zero extra width, so the track can disappear on narrow panes instead of shrinking to a useless 56 pt." },
        { kind: "warn", text: "Close (✕) sits 8 pt from “…” and ends the session with no undo. The hairline rule helps; I'd also make ✕ pause first and offer “Resume” as a toast action — the toast system already supports action buttons." },
        { kind: "idea", text: "Controls that exist but are buried (speed, sleep, voice) become chips on the full card, where there's dead space under the lyrics today." },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="today" title="Compact pill" caption="control.rs · 304 × 44 as shipped" bodyClassName="grid min-h-[190px] place-items-center p-6">
          <div className="relative">
            <TodayPill pb={pb} open={openToday} onToggleOpen={() => setOpenToday((o) => !o)} />
          </div>
        </Specimen>
        <Specimen kind="today" title="Full card" caption="card.rs · 380 × 224" bodyClassName="grid place-items-center p-6">
          <TodayCard pb={pb} />
        </Specimen>
      </div>

      <Specimen
        kind="proposed"
        title="Capsule"
        caption="drag the slider — it re-flows like the real one, but each size stays useful"
        bodyClassName="flex min-h-[230px] flex-col items-center justify-end gap-6 px-6 pt-6 pb-8"
      >
        <div className="flex w-full max-w-md items-center gap-3 text-[12px] text-muted">
          <span>Width</span>
          <input type="range" min={210} max={520} value={w} onChange={(e) => setW(+e.target.value)} className="lab-range flex-1" style={{ ["--p" as string]: `${((w - 210) / 310) * 100}%` }} aria-label="Player width" />
          <span className="w-14 whitespace-nowrap text-right tabular-nums">{w} pt</span>
        </div>
        <Capsule pb={pb2} width={w} open={openNew} onToggleOpen={() => setOpenNew((o) => !o)} />
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-5">
          {[
            ["≥ 440", 470],
            ["≥ 330", 360],
            ["micro", 232],
          ].map(([name, width]) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <Capsule pb={pb2} width={width as number} />
              <span className="text-[11px] text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Specimen>

      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="proposed" title="Now-playing card" caption="same 380 × 224 footprint" bodyClassName="grid place-items-center p-6">
          <NowCard pb={pb2} />
        </Specimen>
        <Specimen kind="variant" title="Why the ring" caption="progress with no extra width" bodyClassName="flex min-h-[200px] items-center justify-center gap-8 p-6">
          {[0.08, 0.42, 0.9].map((v) => (
            <div key={v} className="flex flex-col items-center gap-2">
              <Ring value={v} size={52} stroke={3}>
                <span className="grid size-10 place-items-center rounded-full bg-accent text-on-accent"><Play size={16} fill="currentColor" strokeWidth={0} className="translate-x-px" /></span>
              </Ring>
              <span className="text-[11.5px] tabular-nums text-muted">{Math.round(v * 100)}%</span>
            </div>
          ))}
        </Specimen>
      </div>
    </Block>
  );
}
