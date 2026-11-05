import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, CircleAlert, Download, X } from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { Ring } from "../ui/kit";
import { cn } from "../utils/cn";

/* ═════════ rebuilt from toast.rs / toast/card.rs / toast/stack.rs ═════════
   WIDTH 360 · PAD 12×10 · MARK 26 · GAP 10 · CLOSE 24 · ACTION_H 26 · radius 12
   SHOW_FOR 3.5 s · ERROR_FOR 6 s · action 6 s · HOVER_GRACE 1.5 s · KEEP 12
   BEHIND 2 cards, PEEK 8, NARROW 10 · THROW 96 pt / FLICK 700 pt/s · RESIST 0.3     */

type Tone = "info" | "error" | "warning";
type T = { id: number; msg: string; tone: Tone; action?: string; times: number; left: number; total: number; gone?: "fade" | number };

const TONE = {
  info: { icon: Check, color: "var(--accent)", edge: "var(--line)", wash: 0.13 },
  error: { icon: CircleAlert, color: "var(--danger)", edge: "color-mix(in oklab, var(--danger) 50%, transparent)", wash: 0.16 },
  warning: { icon: AlertTriangle, color: "#b45309", edge: "color-mix(in oklab, #d97706 50%, transparent)", wash: 0.13 },
} as const;

function lasts(t: Pick<T, "tone" | "action">) {
  return t.action ? 6 : t.tone === "error" ? 6 : 3.5;
}

function Card({ t, behind, onClose, onAction, drag, dragging, dim }: { t: T; behind?: number; onClose?: () => void; onAction?: () => void; drag?: number; dragging?: boolean; dim?: boolean }) {
  const k = TONE[t.tone];
  const Icon = k.icon;
  const share = Math.max(0, Math.min(1, t.left / t.total));
  const edge = share * 100;
  return (
    <div
      className="relative flex min-h-[48px] w-full items-center gap-2.5 overflow-hidden rounded-xl border py-2.5 pr-2 pl-3 text-[14px] text-ink"
      style={{
        borderColor: k.edge,
        background: behind ? "color-mix(in oklab, var(--surface) 93%, var(--ink))" : "var(--surface)",
        boxShadow: behind ? undefined : "0 8px 24px var(--shadow)",
        transform: drag ? `translateX(${drag}px) rotate(${drag / 40}deg)` : undefined,
        opacity: dim ? 0.5 : 1,
        transition: dragging ? "none" : "transform .22s ease-out, opacity .2s",
      }}
    >
      {!behind && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(to right, color-mix(in oklab, ${k.color} ${k.wash * 100}%, transparent) 0, color-mix(in oklab, ${k.color} ${k.wash * 100}%, transparent) calc(${edge}% - 32px), transparent calc(${edge}% + 32px))`,
          }}
        />
      )}
      {!behind && (
        <>
          <span className="relative grid size-[26px] shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${k.color} 16%, transparent)`, color: k.color }}>
            <Icon size={15} strokeWidth={2} />
          </span>
          <span className="relative min-w-0 flex-1 leading-[1.35]">
            {t.msg}
            {t.times > 1 && <span className="ml-1.5 text-[12px] text-muted">×{t.times}</span>}
          </span>
          {t.action && (
            <button onClick={onAction} className="relative h-[26px] rounded-lg bg-accent-soft px-2.5 text-[14px] font-semibold text-accent outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-accent/50">
              {t.action}
            </button>
          )}
          <button aria-label="Dismiss" onClick={onClose} className="relative grid size-6 shrink-0 place-items-center rounded-md text-ink outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/50">
            <X size={14} />
          </button>
        </>
      )}
    </div>
  );
}

export function ToastPlayground({ width = 360 }: { width?: number }) {
  const [toasts, setToasts] = useState<T[]>([]);
  const hovered = useRef(false);
  const id = useRef(1);
  const [drag, setDrag] = useState<{ id: number; dx: number; x0: number; t0: number } | null>(null);

  const push = useCallback((msg: string, tone: Tone, action?: string) => {
    setToasts((ts) => {
      const same = ts.find((x) => x.msg === msg && x.tone === tone && !x.gone);
      if (same) return ts.map((x) => (x === same ? { ...x, times: x.times + 1, left: x.total } : x));
      const total = lasts({ tone, action });
      return [...ts, { id: id.current++, msg, tone, action, times: 1, left: total, total }].slice(-12);
    });
  }, []);
  const close = (i: number, how: "fade" | number = "fade") => {
    setToasts((ts) => ts.map((x) => (x.id === i ? { ...x, gone: how } : x)));
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== i)), 260);
  };

  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // seed the stack the first time it scrolls into view, so it reads as a stack
    const el = root.current;
    if (!el) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timers.push(setTimeout(() => push("Highlight saved", "info"), 200));
        timers.push(setTimeout(() => push("3 pages couldn't be rendered", "warning"), 500));
        timers.push(setTimeout(() => push("Book removed", "info", "Undo"), 800));
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, [push]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setToasts((ts) => {
        if (!ts.length) return ts;
        const front = ts.filter((x) => !x.gone).at(-1);
        let changed = false;
        const next = ts.map((x) => {
          // the app only runs the front card's clock; a held stack waits
          if (x.gone || x !== front || hovered.current || (drag && drag.id === x.id)) return x;
          changed = true;
          return { ...x, left: x.left - dt };
        });
        const expired = next.find((x) => !x.gone && x.left <= 0);
        if (expired) setTimeout(() => close(expired.id), 0);
        return changed ? next : ts;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag]);

  const live = toasts.filter((x) => !x.gone || x.gone);
  const visible = live.filter((x) => !x.gone);
  const front = visible.at(-1);
  const behind = visible.slice(-3, -1).reverse();
  const going = live.filter((x) => x.gone);

  return (
    <div ref={root} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["Highlight saved", "info" as Tone, undefined],
          ["Book removed", "info" as Tone, "Undo"],
          ["Couldn't download the voice model", "error" as Tone, undefined],
          ["3 pages couldn't be rendered", "warning" as Tone, undefined],
          ["Reading stopped", "info" as Tone, "Resume"],
        ].map(([m, tone, a]) => (
          <button key={m as string} onClick={() => push(m as string, tone as Tone, a as string | undefined)} className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] hover:bg-hover">
            <span className="size-2 rounded-full" style={{ background: TONE[tone as Tone].color }} />
            {m as string}
          </button>
        ))}
      </div>
      <div className="relative h-[220px] overflow-hidden rounded-xl border border-dashed border-line bg-card/40" style={{ minWidth: width + 32 }}>
        <div className="absolute inset-0 grid place-items-center text-[12.5px] text-muted">Fire some toasts · hover to hold the stack · drag a card sideways to throw it</div>
        <div
          className="absolute right-4 bottom-4"
          style={{ width }}
          onPointerEnter={() => (hovered.current = true)}
          onPointerLeave={() => (hovered.current = false)}
        >
          {behind.map((b, i) => (
            <div key={b.id} className="absolute inset-x-0 bottom-0" style={{ transform: `translateY(${-(i + 1) * 8}px) scale(${1 - (i + 1) * (20 / width)})`, transformOrigin: "bottom center" }}>
              <Card t={b} behind={i + 1} />
            </div>
          ))}
          {front && (
            <div
              className="relative touch-none"
              style={{ animation: "toast-in .22s ease-out both", cursor: "grab" }}
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag({ id: front.id, dx: 0, x0: e.clientX, t0: performance.now() });
              }}
              onPointerMove={(e) => {
                if (!drag) return;
                const raw = e.clientX - drag.x0;
                setDrag({ ...drag, dx: raw < 0 ? raw * 0.3 : raw });
              }}
              onPointerUp={() => {
                if (!drag) return;
                const v = Math.abs(drag.dx) / ((performance.now() - drag.t0) / 1000);
                if (drag.dx > 96 || (drag.dx > 24 && v > 700)) close(drag.id, 420);
                setDrag(null);
              }}
            >
              <Card t={front} drag={drag?.id === front.id ? drag.dx : 0} dragging={!!drag} onClose={() => close(front.id)} onAction={() => close(front.id)} />
            </div>
          )}
          {going.map((g) => (
            <div key={g.id} className="absolute inset-x-0 bottom-0" style={{ transform: typeof g.gone === "number" ? `translateX(${g.gone}px) rotate(8deg)` : undefined, opacity: 0, transition: "transform .26s ease-in, opacity .26s", pointerEvents: "none" }}>
              <Card t={g} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═════════ PROPOSED ADDITION — progress toast: the same wash, but it means "how much is done" ═════════ */
export function ProgressToast() {
  const [p, setP] = useState(0.18);
  const [state, setState] = useState<"running" | "done" | "cancelled">("running");
  useEffect(() => {
    if (state !== "running") return;
    const i = setInterval(() => setP((x) => Math.min(1, x + 0.006 + Math.random() * 0.01)), 120);
    return () => clearInterval(i);
  }, [state]);
  useEffect(() => {
    if (p >= 1 && state === "running") setState("done");
  }, [p, state]);
  const restart = () => { setP(0.04); setState("running"); };
  useEffect(() => {
    if (state === "running") return;
    const t = setTimeout(restart, 4200);
    return () => clearTimeout(t);
  }, [state]);
  const done = state === "done";
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex min-h-[56px] w-[360px] items-center gap-2.5 overflow-hidden rounded-xl border border-line bg-surface py-2.5 pr-2 pl-3 text-[14px] shadow-[0_8px_24px_var(--shadow)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[background] duration-200"
          style={{ background: `linear-gradient(to right, color-mix(in oklab, var(--accent) 13%, transparent) 0, color-mix(in oklab, var(--accent) 13%, transparent) calc(${p * 100}% - 32px), transparent calc(${p * 100}% + 32px))` }}
        />
        {done ? (
          <span className="relative grid size-[34px] shrink-0 place-items-center rounded-full bg-accent-soft text-accent"><Check size={16} /></span>
        ) : (
          <Ring value={p} size={34} stroke={2.5} className="relative shrink-0">
            <Download size={14} className="text-accent" />
          </Ring>
        )}
        <div className="relative min-w-0 flex-1 leading-tight">
          <div className="truncate">{done ? "Kokoro · Full is ready" : state === "cancelled" ? "Download cancelled" : "Downloading Kokoro · Full"}</div>
          {!done && state === "running" && <div className="text-[12px] tabular-nums text-muted">{(p * 347.9).toFixed(1)} of 347.9 MB · {Math.round(p * 100)}%</div>}
          {done && <div className="text-[12px] text-muted">49 voices in 7 languages</div>}
        </div>
        {state === "running" && (
          <button onClick={() => setState("cancelled")} className="relative h-[26px] rounded-lg px-2.5 text-[14px] font-medium text-muted outline-none hover:bg-hover hover:text-ink">Cancel</button>
        )}
        {done && <button className="relative h-[26px] rounded-lg bg-accent-soft px-2.5 text-[14px] font-semibold text-accent">Use voice</button>}
        {state === "cancelled" && <button onClick={restart} className="relative h-[26px] rounded-lg bg-accent-soft px-2.5 text-[14px] font-semibold text-accent">Retry</button>}
      </div>
      {state !== "running" && <button onClick={restart} className={cn("text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline")}>replay</button>}
    </div>
  );
}

export default function ToastSection() {
  return (
    <Block
      id="toast"
      n="07"
      title="Toasts"
      verdict="keep"
      source="toast.rs · toast/card.rs · toast/stack.rs"
      lead="Nothing to redesign — this is the best-considered component in the app. Tone is carried by icon and colour (never colour alone), the time left is a feathered wash instead of a progress bar, repeats collapse to ×N, a held stack waits, cards swipe away, and the player and dictionary both step aside for it. Rebuilt below pixel-for-pixel from the code; try to break it."
      notes={[
        { kind: "ok", text: "Keep as-is, including the stack-behind peek (2 cards, 8 pt each) and the 6 s lifetime for errors and action toasts." },
        { kind: "idea", text: "The one genuine gap: long-running work (voice-model downloads of 65–348 MB, library imports) has nowhere to live except Settings. The wash already means “time left” — reuse it to mean “done so far” and add a ring and Cancel. Same card, same stack, same dismissal rules." },
        { kind: "warn", text: "A progress toast must not auto-dismiss or time out while work is running; only the final “ready / failed” toast should use the normal 3.5 / 6 s clocks." },
      ]}
    >
      <Specimen kind="today" title="Toast stack — as shipped" caption="live: the countdown runs on the front card only" bodyClassName="p-4">
        <ToastPlayground />
      </Specimen>
      <Specimen kind="proposed" title="Progress toast" caption="same card · wash = progress · Cancel / Use voice / Retry" bodyClassName="grid place-items-center p-8">
        <ProgressToast />
      </Specimen>
    </Block>
  );
}
