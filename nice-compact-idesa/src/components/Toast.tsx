import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { cx } from "./ui";

export type Tone = "info" | "success" | "warning" | "error" | "progress";
export type Placement = "bottom-right" | "bottom-center" | "top-right";

export interface ToastInput {
  /** The same id is the same toast: it counts the repeat and restarts its clock. */
  id?: string;
  tone?: Tone;
  title: string;
  body?: string;
  action?: { label: string; run?: () => void };
  /** How long it stays, in ms. Set by tone when left out; progress toasts stay until updated. */
  ms?: number;
  /** 0–1. Draws a bar under the text. */
  progress?: number;
}

interface Item extends ToastInput {
  key: number;
  sig: string;
  count: number;
  /** ms left on the clock. */
  left: number;
  /** ms it started with. Infinity for progress toasts. */
  total: number;
  /** When it started leaving, or 0 while it is still here. */
  gone: number;
}

/** How far each card behind the front one shows above it, in px. */
const PEEK = 8;
/** After the pointer leaves, a toast keeps at least this long (mareader's HOVER_GRACE). */
const HOLD_GRACE = 1500;
const FADE = 260;
const MAX = 12;

function lifeOf(t: ToastInput): number {
  if (t.ms !== undefined) return t.ms;
  if (t.tone === "progress") return Infinity;
  if (t.action || t.tone === "error") return 6000;
  if (t.tone === "warning") return 4500;
  return 3500;
}

const TONE: Record<Tone, { Icon: LucideIcon; disc: string; text: string; bar: string }> = {
  info: { Icon: Info, disc: "bg-accent-soft text-accent", text: "text-accent", bar: "bg-accent" },
  success: { Icon: CircleCheck, disc: "bg-success/15 text-success", text: "text-success", bar: "bg-success" },
  warning: { Icon: TriangleAlert, disc: "bg-warning/15 text-warning", text: "text-warning", bar: "bg-warning" },
  error: { Icon: CircleAlert, disc: "bg-danger/15 text-danger", text: "text-danger", bar: "bg-danger" },
  progress: { Icon: LoaderCircle, disc: "bg-accent-soft text-accent", text: "text-accent", bar: "bg-accent" },
};

/** One toast's card. Used live in the stack, and static to document each tone. */
export function ToastFace({
  tone = "info",
  title,
  body,
  action,
  count,
  progress,
  pct,
  onAction,
  onDismiss,
  className,
}: {
  tone?: Tone;
  title: string;
  body?: string;
  action?: { label: string };
  count?: number;
  progress?: number;
  /** Share of the clock left, 0–100; draws the countdown line. */
  pct?: number;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  const T = TONE[tone];
  const Icon = T.Icon;
  return (
    <div className={cx("relative overflow-hidden rounded-2xl border border-line bg-surface shadow-float", className)}>
      <div className="flex items-start gap-3 p-3 pr-2.5">
        <span className={cx("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", T.disc)}>
          <Icon size={17} strokeWidth={2} className={tone === "progress" ? "animate-spin" : undefined} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-medium leading-snug text-ink">{title}</p>
            {count !== undefined && count > 1 && (
              <span className="shrink-0 rounded-full bg-ink/10 px-1.5 text-[10.5px] font-semibold leading-[18px] tabular-nums text-muted">
                ×{count}
              </span>
            )}
          </div>
          {body && <p className="mt-0.5 text-[12px] leading-snug text-muted">{body}</p>}
          {progress !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <span className="w-8 text-right text-[11px] tabular-nums text-muted">{Math.round(progress * 100)}%</span>
            </div>
          )}
        </div>
        {action && (
          <button
            type="button"
            onClick={onAction}
            className={cx("mt-0.5 h-7 shrink-0 rounded-lg bg-ink/8 px-2.5 text-[12px] font-semibold hover:bg-ink/12", T.text)}
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/10 hover:text-ink"
        >
          <X size={15} />
        </button>
      </div>
      {pct !== undefined && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-ink/5">
          <div className={cx("h-full ease-linear transition-[width] duration-100", T.bar)} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

interface ToastApi {
  notify: (t: ToastInput) => void;
  update: (id: string, patch: Partial<ToastInput>) => void;
  dismiss: (id: string) => void;
  placement: Placement;
  setPlacement: (p: Placement) => void;
  count: number;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Owns the queue and its clock. The stack shows the newest in front, two peeking behind. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [placement, setPlacement] = useState<Placement>("bottom-right");
  const [open, setOpen] = useState(false);
  const hover = useRef(false);
  const seq = useRef(0);

  const notify = useCallback((t: ToastInput) => {
    const sig = t.id ?? `${t.tone ?? "info"}|${t.title}|${t.body ?? ""}`;
    const key = ++seq.current;
    const life = lifeOf(t);
    setItems((list) => {
      const hit = list.find((x) => x.sig === sig && !x.gone);
      if (hit) {
        return list.map((x) => (x.key === hit.key ? { ...x, ...t, count: x.count + 1, total: life, left: life } : x));
      }
      return [...list.slice(-(MAX - 1)), { ...t, key, sig, count: 1, total: life, left: life, gone: 0 }];
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<ToastInput>) => {
    setItems((list) =>
      list.map((x) => {
        if (x.sig !== id) return x;
        const next = { ...x, ...patch };
        if (patch.tone && patch.tone !== "progress") {
          const life = lifeOf(next);
          return { ...next, total: life, left: life };
        }
        return next;
      }),
    );
  }, []);

  const leaveKey = useCallback((key: number) => {
    setItems((list) => list.map((x) => (x.key === key && !x.gone ? { ...x, gone: Date.now() } : x)));
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((list) => list.map((x) => (x.sig === id && !x.gone ? { ...x, gone: Date.now() } : x)));
  }, []);

  /** One clock for the whole stack. It holds while the pointer is over it. */
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setItems((list) => {
        let changed = false;
        const next: Item[] = [];
        for (const x of list) {
          if (x.gone) {
            if (now - x.gone < FADE) next.push(x);
            else changed = true;
            continue;
          }
          const left = hover.current ? x.left : x.left - 100;
          if (left <= 0) {
            changed = true;
            next.push({ ...x, left: 0, gone: now });
          } else {
            if (left !== x.left) changed = true;
            next.push(left !== x.left ? { ...x, left } : x);
          }
        }
        return changed ? next : list;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (items.length < 2) setOpen(false);
  }, [items.length]);

  const onStackLeave = () => {
    hover.current = false;
    setItems((list) => list.map((x) => (x.gone || x.left >= HOLD_GRACE ? x : { ...x, left: HOLD_GRACE })));
  };

  const front = [...items].reverse();
  const shown = open ? front : front.slice(0, 3);
  const dir = placement === "top-right" ? 1 : -1;
  const pos =
    placement === "bottom-center"
      ? "bottom-5 left-1/2 -translate-x-1/2"
      : placement === "top-right"
        ? "top-5 right-5"
        : "bottom-5 right-5";

  const api = useMemo<ToastApi>(
    () => ({ notify, update, dismiss, placement, setPlacement, count: items.length }),
    [notify, update, dismiss, placement, items.length],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className={cx("pointer-events-none fixed z-50 w-[360px] max-w-[calc(100vw-2rem)]", pos)}>
        <div
          className="pointer-events-auto"
          onPointerEnter={() => {
            hover.current = true;
          }}
          onPointerLeave={onStackLeave}
        >
          {items.length > 1 && (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="rounded-full border border-line bg-surface/95 px-2.5 py-1 text-[11.5px] font-medium text-muted shadow-pop backdrop-blur hover:text-ink"
              >
                {open ? "Collapse" : `Show all · ${items.length}`}
              </button>
            </div>
          )}
          <div className={cx(open ? "flex flex-col gap-2" : "grid pt-2")}>
            {shown.map((x, i) => (
              <ToastCard key={x.key} item={x} index={i} open={open} dir={dir} onLeave={() => leaveKey(x.key)} />
            ))}
          </div>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  index,
  open,
  dir,
  onLeave,
}: {
  item: Item;
  index: number;
  open: boolean;
  dir: number;
  onLeave: () => void;
}) {
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const press = useRef<number | null>(null);
  const behind = !open && index > 0;
  const pct = Number.isFinite(item.total) ? Math.max(0, Math.min(100, (item.left / item.total) * 100)) : undefined;

  const style: CSSProperties = {
    gridArea: open ? undefined : "1 / 1",
    zIndex: open ? undefined : 10 - index,
    transform: behind ? `translateY(${dir * index * PEEK}px) scale(${1 - index * 0.045})` : `translateX(${dx}px)`,
    opacity: item.gone ? 0 : behind && index > 1 ? 0.55 : 1,
    transition: drag ? "none" : "opacity 260ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    pointerEvents: behind ? "none" : undefined,
    touchAction: "pan-y",
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    press.current = e.clientX;
    setDrag(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (press.current !== null) setDx(e.clientX - press.current);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (press.current === null) return;
    const moved = e.clientX - press.current;
    press.current = null;
    setDrag(false);
    if (Math.abs(moved) > 96) onLeave();
    else setDx(0);
  };

  return (
    <div style={style} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <div className="animate-rise">
        <ToastFace
          tone={item.tone ?? "info"}
          title={item.title}
          body={item.body}
          action={item.action}
          count={item.count}
          progress={item.progress}
          pct={pct}
          onAction={() => {
            item.action?.run?.();
            onLeave();
          }}
          onDismiss={onLeave}
        />
      </div>
    </div>
  );
}

export function useToast(): ToastApi {
  const v = useContext(ToastContext);
  if (!v) throw new Error("useToast must be used inside ToastProvider");
  return v;
}
