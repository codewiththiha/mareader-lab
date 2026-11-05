import { useRef, useState, type ReactNode, type WheelEvent } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { DICT, type Entry } from "../data/sample";
import { boxWithin, roomOf, useSize, type Box } from "../lib/geometry";
import { Anchored, useDismiss } from "./Floating";
import { Button, IconButton, Level, Segmented, cx } from "./ui";

export type CardVariant = "card" | "compact" | "sheet";

/**
 * The lookup card's body: the word and its level, the answer at reading size,
 * and a pager for the senses. Wheel flicks turn one sense at a time.
 */
export function LookupCard({ entry, variant = "card", onClose }: { entry: Entry; variant?: CardVariant; onClose?: () => void }) {
  const [at, setAt] = useState(0);
  const last = useRef(0);
  const n = entry.senses.length;
  const s = entry.senses[at];
  const turn = (d: number) => setAt((i) => Math.min(n - 1, Math.max(0, i + d)));
  const wheel = (e: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) < 24 || Date.now() - last.current < 380) return;
    last.current = Date.now();
    turn(e.deltaY > 0 ? 1 : -1);
  };
  const compact = variant === "compact";
  return (
    <div
      onWheel={wheel}
      className={cx(
        "text-ink",
        variant !== "sheet" && "overflow-hidden rounded-2xl border border-line bg-surface shadow-pop",
      )}
    >
      <header className="flex items-start gap-1.5 px-4 pt-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h4 className={cx("font-semibold leading-tight tracking-tight", compact ? "text-[17px]" : "text-[20px]")}>
              {entry.word}
            </h4>
            <span className="text-[12px] italic text-muted">{s.pos}</span>
            <Level>{s.level}</Level>
          </div>
          {!compact && (
            <span className="mt-1.5 inline-flex h-5 items-center rounded-full bg-ink/10 px-2 text-[11px] text-muted">
              {entry.pair}
            </span>
          )}
        </div>
        {!compact && <IconButton label="Say it aloud" icon={Volume2} size={30} />}
        {!compact && <IconButton label="Open in the Dictionary" icon={BookOpen} size={30} />}
        {onClose && <IconButton label="Close" icon={X} size={30} onClick={onClose} />}
      </header>
      <div className="px-4 pb-3 pt-2.5">
        {s.near && <p className="text-[12px] text-muted">≈ {s.near}</p>}
        <p
          className="mt-0.5 font-reading leading-snug"
          style={{ fontSize: compact ? "calc(var(--read-size) * 1)" : "calc(var(--read-size) * 1.2)" }}
        >
          {s.answer}
        </p>
        <p className="mt-1 text-[13px] italic text-muted">{s.gloss}</p>
      </div>
      {n > 1 && (
        <footer className="flex items-center justify-between border-t border-line px-2 py-1.5">
          <IconButton label="Previous entry" icon={ChevronLeft} size={28} disabled={at === 0} onClick={() => turn(-1)} />
          {n <= 5 ? (
            <div className="flex items-center gap-1.5">
              {entry.senses.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Entry ${i + 1} of ${n}`}
                  onClick={() => setAt(i)}
                  className={cx(
                    "h-1.5 rounded-full transition-all duration-200",
                    i === at ? "w-4 bg-accent" : "w-1.5 bg-ink/25 hover:bg-ink/45",
                  )}
                />
              ))}
            </div>
          ) : (
            <span className="text-[12px] tabular-nums text-muted">
              {at + 1} of {n}
            </span>
          )}
          <IconButton label="Next entry" icon={ChevronRight} size={28} disabled={at === n - 1} onClick={() => turn(1)} />
        </footer>
      )}
    </div>
  );
}

/**
 * The lab: tap a shaded word on a page. The card anchors to it and flips when
 * there is no room below. In a narrow stage it becomes a sheet. "Fold" parks it
 * as a pill on the stage edge, peeking 20 pt, as mareader's dictionary does.
 */
export function DictionaryLab() {
  const [stageRef, size] = useSize<HTMLDivElement>();
  const [active, setActive] = useState<{ key: string; box: Box } | null>(null);
  const [folded, setFolded] = useState(false);
  const [hot, setHot] = useState(false);
  const [variant, setVariant] = useState<"card" | "compact">("card");
  const [phone, setPhone] = useState(false);
  const room = roomOf(size);
  const narrow = phone || size.w < 440;
  const close = () => setActive(null);
  useDismiss(!!active && !folded, close, stageRef);

  const pick = (key: string, el: HTMLElement) => {
    const stage = stageRef.current;
    if (!stage) return;
    setActive({ key, box: boxWithin(el, stage) });
    setFolded(false);
  };

  const hit = (key: string, text: string): ReactNode => (
    <button
      type="button"
      onClick={(e) => pick(key, e.currentTarget)}
      className="rounded-[4px] bg-danger/15 px-[3px] text-ink underline decoration-danger/60 decoration-2 underline-offset-[5px] transition hover:bg-danger/25"
    >
      {text}
    </button>
  );

  const card = active ? DICT[active.key] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          size="sm"
          label="Card variant"
          value={variant}
          onChange={setVariant}
          options={[
            { value: "card", label: "Card" },
            { value: "compact", label: "Compact" },
          ]}
        />
        <Segmented
          size="sm"
          label="Stage width"
          value={phone ? "phone" : "desk"}
          onChange={(v) => setPhone(v === "phone")}
          options={[
            { value: "desk", label: "Desktop" },
            { value: "phone", label: "Narrow 360" },
          ]}
        />
        {card && !folded && (
          <Button size="sm" variant="soft" onClick={() => setFolded(true)}>
            Fold to the edge
          </Button>
        )}
        <span className="ml-auto text-[12px] text-muted">
          {narrow ? "Narrow stages turn the card into a sheet" : "Tap a shaded word. The card flips when there's no room below."}
        </span>
      </div>
      <div
        ref={stageRef}
        className="relative mx-auto max-w-full overflow-hidden rounded-2xl border border-line bg-paper transition-[width] duration-300"
        style={{ height: 360, width: phone ? 360 : "100%" }}
      >
        <div className="reading p-7 pt-8" style={{ fontSize: 16 }}>
          <p>
            It is a truth {hit("universally", "universally")} {hit("acknowledged", "acknowledged")}, that a single man in{" "}
            {hit("possession", "possession")} of a good {hit("fortune", "fortune")}, must be in want of a wife.
          </p>
          <p>
            However little known the feelings or views of such a man may be on his first entering a neighbourhood, this
            truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property
            of some one or other of their daughters.
          </p>
        </div>

        {card && active && !folded && !narrow && (
          <Anchored anchor={active.box} room={room} width={variant === "compact" ? 252 : 320}>
            <LookupCard entry={card} variant={variant} onClose={close} />
          </Anchored>
        )}

        {card && active && !folded && narrow && (
          <div className="absolute inset-x-0 bottom-0 z-30 animate-rise rounded-t-3xl border-t border-line bg-surface pb-3 pt-2 shadow-float">
            <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-ink/25" />
            <LookupCard entry={card} variant="sheet" onClose={close} />
          </div>
        )}

        {card && active && folded && (
          <button
            type="button"
            onPointerEnter={() => setHot(true)}
            onPointerLeave={() => setHot(false)}
            onClick={() => setFolded(false)}
            className="absolute right-0 top-1/2 z-30 flex h-12 items-center gap-2.5 rounded-l-2xl border border-r-0 border-line bg-surface py-2 pl-3 pr-5 text-left shadow-float transition-transform duration-300 ease-out"
            style={{ transform: hot ? "translateY(-50%)" : "translate(calc(100% - 20px), -50%)" }}
          >
            <BookOpen size={16} className="text-accent" />
            <span className="text-[13px] font-medium text-ink">{card.word}</span>
            <span className="max-w-[120px] truncate text-[13px] text-muted">{card.senses[0].answer}</span>
          </button>
        )}
      </div>
    </div>
  );
}
