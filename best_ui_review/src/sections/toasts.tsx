import { useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, Check, CircleCheck, ChevronDown, X, Undo2, Copy } from "lucide-react";
import { BookText, Notes, Section, Specimen, Grid } from "../kit/frame";
import { IconBtn } from "../kit/primitives";
import { PillProposed } from "./player";
import { usePlayback } from "../kit/playback";
import { cn } from "../kit/cn";

/* toast.rs: SHOW_FOR 3.5, ERROR_FOR 6, HOVER_GRACE 1.5, KEEP 12, INSET 16, WIDTH 360
   toast/stack.rs: PEEK 8, NARROW 10, THROW 96, STRIP_H 24 */
type Tone = "info" | "error" | "warning";
type T = { id: number; tone: Tone; msg: string; action?: string; times: number; dur: number; left: number };
const SAMPLES: Omit<T, "id" | "times" | "dur" | "left">[] = [
  { tone: "info", msg: "Copied to the clipboard" },
  { tone: "info", msg: "Moved “Dune” to Science fiction", action: "Undo" },
  { tone: "error", msg: "Couldn't open river-dusk.pdf: the file is damaged" },
  { tone: "warning", msg: "The French voice is still downloading" },
];
const TONE = {
  info: { icon: CircleCheck, fg: "var(--accent)" },
  error: { icon: AlertCircle, fg: "var(--danger)" },
  warning: { icon: AlertTriangle, fg: "var(--caution)" },
};

function useToasts() {
  const [list, setList] = useState<T[]>([]);
  const paused = useRef(false);
  const seq = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current) return;
      setList((l) => l.map((t) => ({ ...t, left: t.left - 0.05 })).filter((t) => t.left > 0));
    }, 50);
    return () => clearInterval(id);
  }, []);
  const push = (s: (typeof SAMPLES)[number]) => setList((l) => {
    const dur = s.tone === "error" || s.action ? 6 : 3.5;
    const same = l.find((t) => t.msg === s.msg);
    if (same) return [...l.filter((t) => t !== same), { ...same, times: same.times + 1, left: dur }];
    return [...l, { ...s, id: ++seq.current, times: 1, dur, left: dur }].slice(-12);
  });
  const pause = (v: boolean) => { paused.current = v; if (!v) setList((l) => l.map((t) => ({ ...t, left: Math.max(t.left, 1.5) }))); };
  const drop = (id: number) => setList((l) => l.filter((t) => t.id !== id));
  return { list, push, pause, drop, clear: () => setList([]) };
}

/* ----------------------------- CURRENT ----------------------------- */
function CardCurrent({ t, onClose, wash = true }: { t: T; onClose: () => void; wash?: boolean }) {
  const tone = TONE[t.tone];
  const share = t.left / t.dur;
  return (
    <div className="relative flex w-full items-center gap-[10px] overflow-hidden rounded-[12px] border bg-surface px-[12px] py-[10px] pop" style={{ borderColor: t.tone === "info" ? "transparent" : `color-mix(in oklab, ${tone.fg} 45%, var(--line))` }}>
      {wash && <div className="pointer-events-none absolute inset-y-0 left-0" style={{ width: `calc(${share * 100}% + 64px)`, background: `linear-gradient(90deg, ${t.tone === "info" ? "var(--toast-wash)" : `color-mix(in oklab, ${tone.fg} 14%, var(--surface))`} calc(100% - 64px), transparent)` }} />}
      <span className="relative grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full" style={{ background: t.tone === "info" ? "var(--mark-round)" : `color-mix(in oklab, ${tone.fg} 18%, transparent)`, color: tone.fg }}><tone.icon size={15} strokeWidth={1.9} /></span>
      <span className="relative flex-1 text-[14px] leading-snug text-ink">{t.msg}{t.times > 1 && <span className="ml-1.5 text-[12px] text-muted">×{t.times}</span>}</span>
      {t.action && <button className="relative h-[26px] shrink-0 rounded-lg bg-accent-soft px-2.5 text-[13px] text-accent">{t.action}</button>}
      <IconBtn icon={X} label="Close" size={24} icon_size={14} className="relative" onClick={onClose} />
    </div>
  );
}

function StackCurrent({ s }: { s: ReturnType<typeof useToasts> }) {
  const [open, setOpen] = useState(false);
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const front = s.list[s.list.length - 1];
  const behind = s.list.slice(-3, -1).reverse();
  useEffect(() => { if (s.list.length === 0) setOpen(false); }, [s.list.length]);
  return (
    <div className="absolute bottom-4 right-4 w-[360px]" onMouseEnter={() => s.pause(true)} onMouseLeave={() => s.pause(false)}>
      {open ? (
        <div className="anim-rise rounded-[12px] border border-line bg-card p-2 pop">
          <div className="flex items-center gap-2 px-1 pb-2"><span className="text-[13px] font-medium text-ink">Notifications</span><span className="text-[12px] text-muted">{s.list.length}</span><button className="ml-auto text-[12px] text-accent" onClick={s.clear}>Clear all</button><IconBtn icon={ChevronDown} label="Close the list" size={24} onClick={() => setOpen(false)} /></div>
          <div className="thin-scroll max-h-[240px] space-y-1.5 overflow-y-auto">{[...s.list].reverse().map((t) => <CardCurrent key={t.id} t={t} wash={false} onClose={() => s.drop(t.id)} />)}</div>
        </div>
      ) : (
        <>
          {s.list.length >= 2 && (
            <div className="mb-[6px] flex justify-end gap-1.5" style={{ marginBottom: 6 + behind.length * 8 }}>
              <button onClick={() => setOpen(true)} className="h-[24px] rounded-full border border-line bg-surface px-2.5 text-[12px] text-ink pop">Show all · {s.list.length}</button>
              <button onClick={s.clear} className="h-[24px] rounded-full border border-line bg-surface px-2.5 text-[12px] text-ink pop">Clear all</button>
            </div>
          )}
          <div className="relative">
            {behind.map((t, k) => (
              <div key={t.id} className="absolute inset-x-0 bottom-0 transition-all duration-200" style={{ transform: `translateY(${-(k + 1) * 8}px)`, padding: `0 ${(k + 1) * 10}px`, opacity: 0.75 - k * 0.25 }}>
                <div className="h-[46px] rounded-[12px] border border-line bg-surface pop" />
              </div>
            ))}
            {front && (
              <div key={front.id} className="anim-rise relative cursor-grab touch-none" style={{ transform: `translateX(${dx}px)`, opacity: 1 - Math.max(0, dx) / 260, transition: start.current === null ? "transform .2s" : "none" }}
                onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; start.current = e.clientX; (e.currentTarget as Element).setPointerCapture(e.pointerId); }}
                onPointerMove={(e) => { if (start.current !== null) { const d = e.clientX - start.current; setDx(d < 0 ? d * 0.3 : d); } }}
                onPointerUp={() => { if (start.current === null) return; if (dx > 96) s.drop(front.id); else if (Math.abs(dx) < 3 && s.list.length > 1) setOpen(true); start.current = null; setDx(0); }}>
                <CardCurrent t={front} onClose={() => s.drop(front.id)} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------------------- PROPOSED ----------------------------- */
function CardProposed({ t, onClose, compact }: { t: T; onClose: () => void; compact?: boolean }) {
  const tone = TONE[t.tone];
  return (
    <div className="relative flex w-full items-center gap-2.5 overflow-hidden rounded-[14px] border border-line bg-surface py-2 pl-2.5 pr-1.5 pop">
      <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full" style={{ background: tone.fg }} />
      <tone.icon size={15} strokeWidth={2.2} style={{ color: tone.fg }} className="ml-1 shrink-0" />
      <span className={cn("flex-1 text-[13.5px] leading-snug text-ink", compact && "truncate")}>{t.msg}{t.times > 1 && <span className="ml-1.5 rounded-full bg-chip px-1.5 text-[11px] font-medium text-muted">{t.times}</span>}</span>
      {t.action && <button className="flex h-7 shrink-0 items-center gap-1 rounded-lg px-2 text-[12.5px] font-medium text-accent hover:bg-accent-soft"><Undo2 size={13} />{t.action}<span className="ml-0.5 text-[10.5px] font-normal text-muted">⌘Z</span></button>}
      <IconBtn icon={X} label="Dismiss" size={26} icon_size={13} className="text-muted" onClick={onClose} />
      <span className="absolute bottom-0 left-0 h-[2px] transition-[width] duration-75 ease-linear" style={{ width: `${(t.left / t.dur) * 100}%`, background: `color-mix(in oklab, ${tone.fg} 55%, transparent)` }} />
    </div>
  );
}

function StackProposed({ s }: { s: ReturnType<typeof useToasts> }) {
  const [fan, setFan] = useState(false);
  const shown = [...s.list].reverse();
  const n = s.list.length;
  return (
    <div className="absolute bottom-4 right-4 w-[340px]" onMouseEnter={() => { setFan(true); s.pause(true); }} onMouseLeave={() => { setFan(false); s.pause(false); }}>
      <div className={cn("mb-1.5 flex items-center justify-between px-1 text-[12px] transition-all duration-200", fan && n > 1 ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
        <span className="text-muted">{n} notifications · paused</span>
        <button onClick={s.clear} className="rounded-md px-1.5 py-0.5 text-accent hover:bg-accent-soft">Clear all</button>
      </div>
      <div className="relative" style={{ height: n === 0 ? 0 : fan ? Math.min(n, 4) * 50 - 4 : 46 + Math.min(n - 1, 2) * 6, transition: "height .22s cubic-bezier(.2,.8,.2,1)" }}>
        {shown.slice(0, fan ? 4 : 3).map((t, k) => (
          <div key={t.id} className="absolute inset-x-0 transition-all duration-200" style={{
            bottom: fan ? k * 50 : 0, zIndex: 10 - k,
            transform: fan ? "none" : `translateY(${-k * 6}px) scale(${1 - k * 0.04})`, opacity: fan ? 1 : 1 - k * 0.3, transformOrigin: "bottom center",
          }}>
            <CardProposed t={t} onClose={() => s.drop(t.id)} compact={!fan && k > 0} />
          </div>
        ))}
        {!fan && n > 1 && <span className="absolute -right-1.5 -top-2 z-20 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-on-accent shadow" style={{ top: -(Math.min(n - 1, 2) * 6) - 8 }}>{n}</span>}
      </div>
    </div>
  );
}

function Triggers({ s }: { s: ReturnType<typeof useToasts> }) {
  return (
    <div className="absolute left-4 top-4 z-30 flex flex-wrap gap-1.5">
      {SAMPLES.map((x, i) => {
        const I = TONE[x.tone].icon;
        return <button key={i} onClick={() => s.push(x)} className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface px-2 text-[12px] text-ink hover:bg-card"><I size={12} style={{ color: TONE[x.tone].fg }} />{x.action ? "With Undo" : x.tone === "info" ? "Info" : x.tone === "error" ? "Error" : "Warning"}</button>;
      })}
    </div>
  );
}

function IslandDemo() {
  const p = usePlayback();
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t); }, [msg]);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={cn("absolute inset-x-6 bottom-[calc(100%-14px)] flex items-start justify-center rounded-t-[16px] border border-b-0 border-line bg-surface px-3 pb-4 pt-1.5 text-[12.5px] text-ink transition-all duration-300", msg ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>
          <Check size={13} className="mr-1.5 mt-[2px] text-accent" />{msg ?? " "}
        </div>
        <div className="relative"><PillProposed p={p} /></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMsg("Copied the sentence")} className="flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface px-2 text-[12px] text-ink"><Copy size={12} /> Copy sentence</button>
        <button onClick={() => setMsg("Speed 1.25× · saved for this book")} className="h-7 rounded-lg border border-line bg-surface px-2 text-[12px] text-ink">Change speed</button>
      </div>
    </div>
  );
}

export function ToastSection() {
  const a = useToasts();
  const b = useToasts();
  return (
    <Section id="toasts" kicker="toast.rs · toast/card.rs · toast/stack.rs" title="Toasts"
      intro={<>A mature system: dedupes repeats into ×N, pauses every clock on hover, leaves at once when a summoned card would sit under it (<code>keep_clear</code>), queues while the corner is busy, swipe-to-dismiss with resistance on the wrong side. What I would change is <b>visual weight and height</b>: the countdown is a full-card wash that drains behind the text, and a separate 24 pt pill strip sits above the pile.</>}>
      <Grid>
        <Specimen tag="current" title="Stack · 360 wide, bottom-right" src="toast/stack.rs · card.rs" stageClass="h-[360px] items-start justify-start p-0" note="Fire several. Hover pauses; drag the front card right past 96 pt to throw it; click the pile to open the list.">
          <div className="absolute inset-x-[10%] top-16"><BookText lines={11} /></div>
          <Triggers s={a} /><StackCurrent s={a} />
        </Specimen>
        <Specimen tag="proposed" title="Stack 2.0 · 340 wide, fans on hover" stageClass="h-[360px] items-start justify-start p-0" note="The countdown moves off the text into a 2 pt hairline along the bottom edge, and tone is a 3 pt edge plus the icon. The 'Show all / Clear all' strip folds into a count badge. Hovering fans the pile into a list with its own header, so there is no second mode to open and close. Undo shows its shortcut.">
          <div className="absolute inset-x-[10%] top-16"><BookText lines={11} /></div>
          <Triggers s={b} /><StackProposed s={b} />
        </Specimen>
      </Grid>
      <Grid>
        <Specimen tag="variant" title="Island toast · confirmations ride the player" stageClass="min-h-[220px] pt-16" note="With read-aloud open, the bottom-right corner is contested: today the player shrinks or the dictionary shifts left to make room (toast::bed). For short confirmations that come from the player itself, a tab that rises out of the pill avoids the conflict entirely."><IslandDemo /></Specimen>
        <Notes title="Review" items={[
          ["keep", "Dedup counting, hover-pauses-all with a 1.5 s grace, keep_clear and queueing, and drops after waiting longer than it would have shown. This is better than most apps."],
          ["issue", "The countdown is the card's own fill. At birth the whole card is a darker wash (#eacfb6 over #fbe6d2 in the HEAD render), and a 64 pt feathered edge then sweeps right-to-left behind the words for 3.5–6 s. That is motion under text in peripheral vision, which design.md's 'animate only motion that explains something' argues against, and the card's resting colour is never clear."],
          ["issue", "Two stacking concepts (peeking pile plus pill strip) and two modes (pile vs list) add 30 pt of height and a click."],
          ["issue", "Every toast carries a 26 pt soft-round mark, even 'Copied'. Info confirmations don't need that much ceremony."],
          ["warn", "Fan-on-hover must keep a click/Enter path for keyboard and touch users. Also announce toasts via aria-live='polite' (errors 'assertive'), which the egui AccessKit output should mirror."],
        ]} />
      </Grid>
    </Section>
  );
}
