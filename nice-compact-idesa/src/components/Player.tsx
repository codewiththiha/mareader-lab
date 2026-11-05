import { useEffect, useState } from "react";
import { Ellipsis, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { PAGE } from "../data/sample";
import { Knob } from "./Knob";
import { IconButton, Segmented, cx, type SegOption } from "./ui";
import { useRef, type PointerEvent } from "react";

/** A 36-second clip stands in for a chapter. The clock reads as a chapter would. */
export const DEMO_SEC = 36;
const RATES = [0.75, 1, 1.25, 1.5, 2];

export type Mode = "sentence" | "phrase" | "word";

export function clock(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const timeAt = (p: number) => `${clock((1 - p) * DEMO_SEC)} left`;

export interface Playback {
  playing: boolean;
  toggle: () => void;
  rate: number;
  setRate: (r: number) => void;
  cycle: () => void;
  progress: number;
  seek: (p: number) => void;
  skip: (d: number) => void;
  idx: number;
  words: string[];
  lit: number;
  left: number;
}

/** A small playback model: sentences advance with the clock, words light as they're said. */
export function usePlayback(start = 0.12): Playback {
  const [playing, setPlaying] = useState(true);
  const [rate, setRate] = useState(1);
  const [progress, setProgress] = useState(start);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = p + (0.25 * rate) / DEMO_SEC;
        return next >= 1 ? 0 : next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, rate]);

  useEffect(() => {
    if (progress >= 1) setPlaying(false);
  }, [progress]);

  const n = PAGE.length;
  const pos = progress * n;
  const idx = Math.min(n - 1, Math.floor(pos));
  const words = PAGE[idx].split(" ");
  const lit = Math.min(words.length - 1, Math.floor((pos - idx) * words.length));

  return {
    playing,
    toggle: () => {
      if (progress >= 1) {
        setProgress(0);
        setPlaying(true);
      } else {
        setPlaying((p) => !p);
      }
    },
    rate,
    setRate,
    cycle: () => setRate((r) => RATES[(RATES.indexOf(r) + 1) % RATES.length]),
    progress,
    seek: (p) => setProgress(Math.max(0, Math.min(1, p))),
    skip: (d) => setProgress(Math.max(0, Math.min(1, (idx + d) / n))),
    idx,
    words,
    lit,
    left: ((1 - progress) * DEMO_SEC) / rate,
  };
}

export function PlayButton({ playing, onClick, size = 42 }: { playing: boolean; onClick: () => void; size?: number }) {
  const icon = Math.round(size * 0.42);
  return (
    <button
      type="button"
      aria-label={playing ? "Pause" : "Play"}
      onClick={onClick}
      className="grid shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-md transition duration-150 hover:brightness-110 active:scale-95"
      style={{ width: size, height: size }}
    >
      {playing ? (
        <Pause size={icon} fill="currentColor" strokeWidth={0} />
      ) : (
        <Play size={icon} fill="currentColor" strokeWidth={0} className="translate-x-px" />
      )}
    </button>
  );
}

/** Three bars that rise and fall while it plays and rest low when it doesn't. */
export function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
      {[0, 0.18, 0.36].map((d) => (
        <span
          key={d}
          className="w-[3px] origin-bottom rounded-full bg-accent"
          style={{
            height: "100%",
            animation: playing ? `wave 1s ease-in-out ${d}s infinite` : undefined,
            transform: playing ? undefined : "scaleY(0.35)",
          }}
        />
      ))}
    </span>
  );
}

/** The seek track: click or drag anywhere, with the time left shown where the pointer is. */
export function SeekTrack({
  value,
  onSeek,
  className,
  timeAt: label,
}: {
  value: number;
  onSeek: (p: number) => void;
  className?: string;
  timeAt?: (p: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const frac = (x: number) => {
    const r = ref.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (x - r.left) / r.width));
  };
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Reading position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={label?.(value)}
      onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onSeek(frac(e.clientX));
      }}
      onPointerMove={(e) => {
        const f = frac(e.clientX);
        setHover(f);
        if (e.buttons & 1) onSeek(f);
      }}
      onPointerLeave={() => setHover(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(value + 0.02);
        if (e.key === "ArrowLeft") onSeek(value - 0.02);
      }}
      className={cx("group relative h-6 cursor-pointer touch-none outline-none", className)}
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-ink/15">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value * 100}%` }} />
      </div>
      <div
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow ring-2 ring-surface transition-transform group-hover:scale-125"
        style={{ left: `${value * 100}%` }}
      />
      {hover !== null && label && (
        <span
          className="pointer-events-none absolute -top-7 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-paper"
          style={{ left: `${hover * 100}%` }}
        >
          {label(hover)}
        </span>
      )}
    </div>
  );
}

/** The sentence as words: said words in ink, the one being said in accent, the rest muted. */
export function Words({ words, lit, mode = "word", className }: { words: string[]; lit: number; mode?: Mode; className?: string }) {
  const cls = (i: number) => {
    if (mode === "sentence") return i <= lit ? "text-accent" : "text-muted";
    if (mode === "phrase") {
      const s = Math.floor(lit / 3) * 3;
      if (i >= s && i < s + 3) return "text-accent font-semibold";
      return i < s ? "text-ink" : "text-muted";
    }
    if (i === lit) return "text-accent font-semibold";
    return i < lit ? "text-ink" : "text-muted";
  };
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className={cx("transition-colors duration-300", cls(i))}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/** The bar: transport, seek track with time left, speed, more, stop. */
export function PlayerBar({ pb, className }: { pb: Playback; className?: string }) {
  return (
    <div
      className={cx(
        "flex h-14 items-center gap-1 rounded-full border border-line bg-surface/95 px-1.5 shadow-float backdrop-blur-md",
        className,
      )}
    >
      <IconButton label="Previous sentence" icon={SkipBack} size={34} onClick={() => pb.skip(-1)} />
      <PlayButton playing={pb.playing} onClick={pb.toggle} />
      <IconButton label="Next sentence" icon={SkipForward} size={34} onClick={() => pb.skip(1)} />
      <span className="mx-1 h-6 w-px bg-line" />
      <SeekTrack className="w-44" value={pb.progress} onSeek={pb.seek} timeAt={timeAt} />
      <span className="w-[72px] text-center text-[12px] font-medium tabular-nums text-muted">{clock(pb.left)} left</span>
      <button
        type="button"
        onClick={pb.cycle}
        title="Speed"
        aria-label={`Speed ${pb.rate}×`}
        className="h-8 min-w-11 rounded-full px-2 text-[12px] font-semibold tabular-nums text-ink hover:bg-ink/10"
      >
        {pb.rate}×
      </button>
      <IconButton label="More options" icon={Ellipsis} size={34} />
      <IconButton label="Stop reading aloud" icon={X} size={34} />
    </div>
  );
}

/** The compact: the bar with one streaming line above it, and an equaliser. */
export function CompactPlayer({ pb }: { pb: Playback }) {
  return (
    <div className="w-[580px] max-w-full space-y-2">
      <div className="rounded-2xl border border-line bg-surface/90 px-4 py-2.5 backdrop-blur-md">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
          <Equalizer playing={pb.playing} />
          <span>{pb.playing ? "Reading aloud" : "Paused"} · Chapter 1</span>
        </div>
        <p className="line-clamp-2 text-[13.5px] leading-relaxed">
          <Words words={pb.words} lit={pb.lit} />
        </p>
      </div>
      <PlayerBar pb={pb} />
    </div>
  );
}

const HIGHLIGHT: SegOption<Mode>[] = [
  { value: "sentence", label: "Sentence" },
  { value: "phrase", label: "Phrases" },
  { value: "word", label: "Words" },
];

function Cover() {
  return (
    <div
      className="relative h-[92px] w-[68px] shrink-0 overflow-hidden rounded-lg shadow-md"
      style={{ background: "linear-gradient(160deg, #6b3f26, #c99a5c 58%, #f1e2c2)" }}
    >
      <p className="absolute inset-x-2 top-3 font-reading text-[11px] font-semibold leading-tight text-white/95">
        Pride and Prejudice
      </p>
      <span className="absolute bottom-2 left-2 text-[8.5px] uppercase tracking-[0.2em] text-white/75">Austen</span>
    </div>
  );
}

/** The full card: cover, place, the streaming lines, and the mareader options as controls. */
export function CardPlayer({ pb }: { pb: Playback }) {
  const [mode, setMode] = useState<Mode>("word");
  const prev = PAGE[pb.idx - 1] ?? "";
  const next = PAGE[pb.idx + 1] ?? "";
  return (
    <div className="w-[384px] max-w-full overflow-hidden rounded-3xl border border-line bg-surface shadow-float">
      <div className="flex gap-3.5 p-4 pb-3.5">
        <Cover />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Chapter 1 · p. 14</p>
          <p className="mt-0.5 truncate text-[15px] font-semibold text-ink">Pride and Prejudice</p>
          <p className="truncate text-[12px] text-muted">Jane Austen · Read by narrator</p>
          <div className="mt-2.5 flex items-center gap-1">
            <IconButton label="Previous sentence" icon={SkipBack} size={32} onClick={() => pb.skip(-1)} />
            <PlayButton playing={pb.playing} onClick={pb.toggle} size={40} />
            <IconButton label="Next sentence" icon={SkipForward} size={32} onClick={() => pb.skip(1)} />
            <span className="ml-auto text-[12px] tabular-nums text-muted">{clock(pb.left)} left</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 border-y border-line bg-paper/70 px-4 py-3">
        <p className="line-clamp-1 text-[12px] text-muted">{prev}</p>
        <p className="font-reading text-[15px] leading-snug">
          <Words words={pb.words} lit={pb.lit} mode={mode} />
        </p>
        <p className="line-clamp-1 text-[12px] text-muted/80">{next}</p>
      </div>
      <div className="px-4 pb-4 pt-3.5">
        <SeekTrack className="w-full" value={pb.progress} onSeek={pb.seek} timeAt={timeAt} />
        <div className="mt-3 flex items-center justify-between gap-3">
          <Segmented size="sm" label="Highlight" value={mode} onChange={setMode} options={HIGHLIGHT} />
          <Knob
            size="sm"
            label="Speed"
            value={pb.rate}
            min={0.75}
            max={2}
            step={0.25}
            defaultValue={1}
            format={(v) => `${v}×`}
            onChange={pb.setRate}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Parked at a stage edge: only a 20 pt peek shows, with a grip. Hovering slides it in.
 * (mareader's park.rs: whole panels resting partly beyond an edge.)
 */
export function ParkedPlayer({ pb, edge }: { pb: Playback; edge: "bottom" | "right" | "left" }) {
  const [hot, setHot] = useState(false);
  const PEEK = 20;
  const vertical = edge !== "bottom";
  const hidden =
    edge === "bottom"
      ? `translateY(calc(100% - ${PEEK}px))`
      : edge === "right"
        ? `translateX(calc(100% - ${PEEK}px))`
        : `translateX(calc(${PEEK}px - 100%))`;
  const place =
    edge === "bottom" ? "bottom-0 left-1/2 -translate-x-1/2" : edge === "right" ? "right-0 top-1/2 -translate-y-1/2" : "left-0 top-1/2 -translate-y-1/2";
  const grip =
    edge === "bottom"
      ? "left-1/2 top-2 h-1 w-9 -translate-x-1/2"
      : edge === "right"
        ? "left-2 top-1/2 h-9 w-1 -translate-y-1/2"
        : "right-2 top-1/2 h-9 w-1 -translate-y-1/2";
  return (
    <div className={cx("absolute z-20", place)}>
      <div
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        className={cx(
          "relative border border-line bg-surface shadow-float transition-transform duration-300 ease-out",
          vertical
            ? "flex w-[76px] flex-col items-center gap-3 rounded-3xl px-2 pb-3 pt-4"
            : "flex w-[420px] items-center gap-3 rounded-t-3xl px-4 pb-3.5 pt-7",
        )}
        style={{ transform: hot ? "none" : hidden }}
      >
        <span aria-hidden className={cx("absolute rounded-full bg-ink/25", grip)} />
        <PlayButton playing={pb.playing} onClick={pb.toggle} size={38} />
        {vertical ? (
          <div className="relative h-28 w-1.5 overflow-hidden rounded-full bg-ink/15">
            <div className="absolute bottom-0 w-full rounded-full bg-accent" style={{ height: `${pb.progress * 100}%` }} />
          </div>
        ) : (
          <SeekTrack className="flex-1" value={pb.progress} onSeek={pb.seek} timeAt={timeAt} />
        )}
        <span className={cx("text-[11px] tabular-nums text-muted", vertical && "text-center leading-tight")}>{clock(pb.left)}</span>
      </div>
    </div>
  );
}
