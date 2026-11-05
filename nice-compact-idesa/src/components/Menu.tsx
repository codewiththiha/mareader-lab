import { useCallback, useEffect, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import {
  BookA,
  BookOpen,
  Check,
  ChevronRight,
  Columns2,
  Copy,
  CopyPlus,
  EyeOff,
  Folder,
  GalleryHorizontal,
  GalleryVertical,
  Headphones,
  Keyboard,
  Languages,
  Lightbulb,
  Maximize,
  Maximize2,
  MoveHorizontal,
  PenLine,
  Pin,
  Quote,
  Repeat,
  ScrollText,
  Settings,
  Sparkles,
  Square,
  Trash2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { HIGHLIGHTS } from "../data/sample";
import { placeAtPoint, roomOf, useSize, type Box } from "../lib/geometry";
import { useDismiss } from "./Floating";
import { IconButton, Kbd, Segmented, cx, type SegOption, Button } from "./ui";

/* ---------- The View & tools menu ---------- */

export type Layout = "single" | "spread" | "down" | "across";
export type Flag = "autoScroll" | "aloud" | "fullscreen" | "focus" | "keepBar";

export interface ViewState {
  layout: Layout;
  zoom: number;
  fit: "width" | "page";
  autoScroll: boolean;
  aloud: boolean;
  fullscreen: boolean;
  focus: boolean;
  keepBar: boolean;
}

export const VIEW_START: ViewState = {
  layout: "spread",
  zoom: 100,
  fit: "width",
  autoScroll: false,
  aloud: true,
  fullscreen: false,
  focus: false,
  keepBar: true,
};

const LAYOUTS: SegOption<Layout>[] = [
  { value: "single", label: "Single", icon: Square },
  { value: "spread", label: "Spread", icon: Columns2 },
  { value: "down", label: "Scroll", icon: GalleryVertical },
  { value: "across", label: "Across", icon: GalleryHorizontal },
];

const FITS: SegOption<"width" | "page">[] = [
  { value: "width", label: "Width", icon: MoveHorizontal },
  { value: "page", label: "Page", icon: Maximize2 },
];

const FLAGS: { key: Flag; label: string; short: string; sub: string; icon: LucideIcon; kbd?: string }[] = [
  { key: "autoScroll", label: "Auto-scroll", short: "Auto", sub: "Scrolls by itself", icon: ScrollText },
  { key: "aloud", label: "Read aloud", short: "Aloud", sub: "Keep the player open", icon: Headphones },
  { key: "fullscreen", label: "Full screen", short: "Full", sub: "Use the whole display", icon: Maximize, kbd: "F11" },
  { key: "focus", label: "Distraction-free", short: "Focus", sub: "Hide the title bar", icon: EyeOff },
  { key: "keepBar", label: "Keep title bar", short: "Bar", sub: "Don't wait for a hover", icon: Pin },
];

export function ViewMenu({
  variant,
  value,
  onChange,
}: {
  variant: "grouped" | "list" | "tiles";
  value: ViewState;
  onChange: (patch: Partial<ViewState>) => void;
}) {
  const flip = (k: Flag) => onChange({ [k]: !value[k] } as Partial<ViewState>);
  const zoomBy = (d: number) => onChange({ zoom: Math.min(300, Math.max(50, value.zoom + d * 10)) });

  if (variant === "list") {
    return (
      <div className="space-y-0.5">
        <Heading>Layout</Heading>
        {LAYOUTS.map((l) => (
          <Row key={l.value} icon={l.icon} label={l.label} check={value.layout === l.value} onClick={() => onChange({ layout: l.value })} />
        ))}
        <Heading>Zoom</Heading>
        <Row icon={ZoomIn} label="Zoom in" kbd="Ctrl +" onClick={() => zoomBy(1)} />
        <Row icon={ZoomOut} label="Zoom out" kbd="Ctrl −" onClick={() => zoomBy(-1)} />
        <Row icon={MoveHorizontal} label="Fit width" check={value.fit === "width"} onClick={() => onChange({ fit: "width" })} />
        <Row icon={Maximize2} label="Fit page" check={value.fit === "page"} onClick={() => onChange({ fit: "page" })} />
        <Heading>Reading</Heading>
        {FLAGS.map((f) => (
          <Row key={f.key} icon={f.icon} label={f.label} kbd={f.kbd} sw={value[f.key]} onClick={() => flip(f.key)} />
        ))}
        <div className="my-1 h-px bg-line" />
        <Row icon={Settings} label="Settings" kbd="Ctrl ," />
        <Row icon={Keyboard} label="Keyboard shortcuts" kbd="Ctrl /" />
      </div>
    );
  }

  if (variant === "tiles") {
    return (
      <div className="space-y-3.5">
        <Group title="Layout">
          <div className="grid grid-cols-4 gap-1.5">
            {LAYOUTS.map((l) => (
              <button
                key={l.value}
                type="button"
                aria-pressed={value.layout === l.value}
                onClick={() => onChange({ layout: l.value })}
                className={cx(
                  "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[11.5px] font-medium transition",
                  value.layout === l.value ? "border-accent/40 bg-accent-soft text-accent" : "border-line bg-paper text-muted hover:text-ink",
                )}
              >
                {l.icon && <l.icon size={20} strokeWidth={1.8} />}
                {l.label}
              </button>
            ))}
          </div>
        </Group>
        <Group title="Reading">
          <div className="grid grid-cols-4 gap-1.5">
            {FLAGS.slice(0, 4).map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={value[f.key]}
                onClick={() => flip(f.key)}
                className={cx(
                  "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[11.5px] font-medium transition",
                  value[f.key] ? "border-accent/40 bg-accent-soft text-accent" : "border-line bg-paper text-muted hover:text-ink",
                )}
              >
                <f.icon size={20} strokeWidth={1.8} />
                {f.short}
              </button>
            ))}
          </div>
        </Group>
        <div className="flex items-center gap-2">
          <Stepper value={value.zoom} onMinus={() => zoomBy(-1)} onPlus={() => zoomBy(1)} />
          <Segmented size="sm" full iconOnly label="Fit" options={FITS} value={value.fit} onChange={(fit) => onChange({ fit })} />
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="soft" icon={Settings} className="flex-1">
            Settings
          </Button>
          <Button size="sm" variant="ghost" icon={Keyboard} className="flex-1">
            Shortcuts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <Group title="Layout">
        <>
          <Segmented full iconOnly size="sm" label="Layout" options={LAYOUTS} value={value.layout} onChange={(layout) => onChange({ layout })} />
          <p className="mt-1.5 px-0.5 text-[11.5px] text-muted">
            {(
              {
                single: "Single: one page at a time",
                spread: "Spread: two pages side by side",
                down: "Scroll: pages stacked down",
                across: "Across: pages side by side, scrolled",
              } as Record<Layout, string>
            )[value.layout]}
          </p>
        </>
      </Group>
      <Group title="Zoom">
        <div className="flex items-center gap-2">
          <Stepper value={value.zoom} onMinus={() => zoomBy(-1)} onPlus={() => zoomBy(1)} />
          <Segmented size="sm" full label="Fit" options={FITS} value={value.fit} onChange={(fit) => onChange({ fit })} />
        </div>
      </Group>
      <Group title="Reading">
        <div className="grid grid-cols-2 gap-1.5">
          {FLAGS.slice(0, 4).map((f) => (
            <Tile key={f.key} icon={f.icon} label={f.label} sub={f.sub} on={value[f.key]} onClick={() => flip(f.key)} />
          ))}
        </div>
      </Group>
      <div className="space-y-0.5 border-t border-line pt-2.5">
        <Row icon={Pin} label="Keep title bar shown" sw={value.keepBar} onClick={() => flip("keepBar")} />
        <Row icon={Settings} label="Settings" kbd="Ctrl ," />
        <Row icon={Keyboard} label="Keyboard shortcuts" kbd="Ctrl /" />
      </div>
    </div>
  );
}

function Stepper({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex h-9 shrink-0 items-center rounded-xl bg-ink/10 p-0.5">
      <IconButton label="Zoom out" icon={ZoomOut} size={30} onClick={onMinus} />
      <span className="w-11 text-center text-[12.5px] font-semibold tabular-nums text-ink">{value}%</span>
      <IconButton label="Zoom in" icon={ZoomIn} size={30} onClick={onPlus} />
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h5 className="mb-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{title}</h5>
      {children}
    </section>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <p className="px-2.5 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{children}</p>;
}

function Tile({ icon: Icon, label, sub, on, onClick }: { icon: LucideIcon; label: string; sub?: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={on}
      onClick={onClick}
      className={cx(
        "flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition duration-150",
        on ? "border-accent/35 bg-accent-soft" : "border-line bg-paper hover:bg-ink/5",
      )}
    >
      <span className="flex w-full items-center justify-between">
        <Icon size={16} strokeWidth={1.9} className={on ? "text-accent" : "text-muted"} />
        <span className={cx("size-1.5 rounded-full transition-colors", on ? "bg-accent" : "bg-ink/25")} />
      </span>
      <span className="text-[12.5px] font-medium leading-tight text-ink">{label}</span>
      {sub && <span className="text-[11px] leading-tight text-muted">{sub}</span>}
    </button>
  );
}

/* ---------- Rows and menus ---------- */

interface RowProps {
  icon?: LucideIcon;
  label: string;
  kbd?: string;
  check?: boolean;
  sw?: boolean;
  danger?: boolean;
  submenu?: boolean;
  onClick?: () => void;
}

/** A menu row: icon, label, key hint, and either a check, a switch or a submenu chevron. */
export function Row({ icon: Icon, label, kbd, check, sw, danger, submenu, onClick }: RowProps) {
  const checkable = sw !== undefined || check !== undefined;
  return (
    <button
      type="button"
      role={checkable ? "menuitemcheckbox" : "menuitem"}
      aria-checked={checkable ? (sw ?? check) : undefined}
      onClick={onClick}
      className={cx(
        "flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] transition duration-100 hover:bg-ink/8 focus-visible:bg-ink/8 focus-visible:outline-none",
        danger ? "text-danger" : "text-ink",
      )}
    >
      {Icon && <Icon size={15} strokeWidth={1.9} className={danger ? "" : "text-muted"} />}
      <span className="flex-1 truncate">{label}</span>
      {kbd && <Kbd>{kbd}</Kbd>}
      {check && <Check size={15} strokeWidth={2.4} className="text-accent" />}
      {sw !== undefined && <MiniSwitch on={sw} />}
      {submenu && <ChevronRight size={15} className="text-muted" />}
    </button>
  );
}

function MiniSwitch({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={cx("relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors duration-200", on ? "bg-accent" : "bg-ink/25")}>
      <span
        className={cx(
          "absolute left-[2px] top-[2px] size-[14px] rounded-full bg-paper-base shadow transition-transform duration-200",
          on && "translate-x-[12px]",
        )}
      />
    </span>
  );
}

/** The selection's menu: four labelled actions, five highlight colours, then the rest. */
export function SelectionMenuBody({ onAct }: { onAct: () => void }) {
  const actions: { icon: LucideIcon; label: string }[] = [
    { icon: Copy, label: "Copy" },
    { icon: BookA, label: "Look up" },
    { icon: Sparkles, label: "Explain" },
    { icon: PenLine, label: "Note" },
  ];
  return (
    <>
      <div className="grid grid-cols-4 gap-1">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            role="menuitem"
            onClick={onAct}
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-[11.5px] font-medium text-ink transition hover:bg-ink/8 focus-visible:bg-ink/8 focus-visible:outline-none"
          >
            <a.icon size={17} strokeWidth={1.9} className="text-accent" />
            {a.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2.5 border-y border-line py-2.5">
        {HIGHLIGHTS.map((h) => (
          <button
            key={h.name}
            type="button"
            role="menuitem"
            aria-label={`Highlight ${h.name}`}
            title={`Highlight ${h.name}`}
            onClick={onAct}
            className="size-5 rounded-full ring-1 ring-black/15 transition hover:scale-110 focus-visible:outline-offset-4"
            style={{ background: h.color }}
          />
        ))}
      </div>
      <div className="pt-1">
        <Row icon={Headphones} label="Read aloud from here" kbd="Ctrl R" onClick={onAct} />
        <Row icon={Languages} label="Translate" submenu onClick={onAct} />
        <Row icon={Quote} label="Copy with citation" onClick={onAct} />
      </div>
    </>
  );
}

export function BookMenuBody() {
  return (
    <>
      <Row icon={BookOpen} label="Open" kbd="Enter" />
      <Row icon={Check} label="Select" />
      <Row icon={PenLine} label="Rename…" />
      <Row icon={CopyPlus} label="Duplicate" />
      <Row icon={Folder} label="Show in folder" />
      <div className="my-1 h-px bg-line" />
      <Row icon={Trash2} label="Remove from library" danger />
    </>
  );
}

export function AiMenuBody() {
  const [cont, setCont] = useState(false);
  const [remember, setRemember] = useState(true);
  return (
    <>
      <Row icon={Sparkles} label="Summarize this page" />
      <Row icon={Languages} label="Translate to…" submenu />
      <Row icon={Lightbulb} label="Simplify page" />
      <Row icon={Headphones} label="Read aloud from page start" />
      <div className="my-1 h-px bg-line" />
      <Row icon={Repeat} label="Continuous reading" sw={cont} onClick={() => setCont((c) => !c)} />
      <Row icon={Check} label="Remember my choice" check={remember} onClick={() => setRemember((r) => !r)} />
    </>
  );
}

/**
 * A pointer-opened menu. It is always mounted (so it can measure itself), flips
 * left or up at a stage edge, closes on Escape or an outside press, and moves
 * focus with the arrow keys.
 */
export function ContextMenu({
  at,
  room,
  onClose,
  label,
  width = 264,
  children,
}: {
  at: { x: number; y: number } | null;
  room: Box;
  onClose: () => void;
  label: string;
  width?: number;
  children: ReactNode;
}) {
  const [ref, size] = useSize<HTMLDivElement>();
  const open = at !== null;
  const p = at ? placeAtPoint(at, { w: size.w || width, h: size.h || 220 }, room) : { x: 0, y: 0 };

  useDismiss(open, onClose, ref);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, ref]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);
    if (!items.length) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next].focus();
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      onKeyDown={onKey}
      className={cx(
        "absolute z-40 rounded-2xl border border-line bg-surface p-1.5 shadow-float transition duration-150 origin-top-left",
        open ? "opacity-100 scale-100" : "pointer-events-none scale-[0.97] opacity-0",
      )}
      style={{ left: p.x, top: p.y, width }}
    >
      {children}
    </div>
  );
}

const BOOKS = [
  { title: "Pride and Prejudice", by: "Jane Austen", bg: "linear-gradient(160deg,#6b3f26,#c99a5c 58%,#f1e2c2)" },
  { title: "The Raven", by: "Edgar Allan Poe", bg: "linear-gradient(160deg,#1f2937,#4b5563 60%,#9ca3af)" },
  { title: "Field notes", by: "You", bg: "linear-gradient(160deg,#14532d,#4ade80 70%,#dcfce7)" },
];

/** Three surfaces, three menus: passage, book and AI. Right-click, or Shift+F10 on the focused item. */
export function ContextLab() {
  const [stageRef, size] = useSize<HTMLDivElement>();
  const [menu, setMenu] = useState<{ kind: "text" | "book" | "ai"; at: { x: number; y: number } } | null>(null);
  const room = roomOf(size);
  const close = useCallback(() => setMenu(null), []);

  const openAt = (kind: "text" | "book" | "ai") => (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const s = stage.getBoundingClientRect();
    let x = e.clientX - s.left;
    let y = e.clientY - s.top;
    if (e.clientX === 0 && e.clientY === 0) {
      const r = e.currentTarget.getBoundingClientRect();
      x = r.left - s.left + 16;
      y = r.bottom - s.top;
    }
    setMenu({ kind, at: { x, y } });
  };

  return (
    <div ref={stageRef} className="relative overflow-hidden rounded-2xl border border-line bg-paper p-6" style={{ minHeight: 420 }}>
      <p className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">Passage</p>
      <p
        onContextMenu={openAt("text")}
        tabIndex={0}
        className="reading max-w-[560px] rounded-lg p-1 outline-none focus-visible:bg-ink/5"
      >
        It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.
      </p>
      <p className="mb-2 mt-7 text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">Library</p>
      <div className="flex gap-3">
        {BOOKS.map((b) => (
          <div
            key={b.title}
            onContextMenu={openAt("book")}
            tabIndex={0}
            className="w-[108px] cursor-default rounded-xl p-1.5 outline-none hover:bg-ink/5 focus-visible:bg-ink/5"
          >
            <div className="h-[100px] rounded-lg shadow-md" style={{ background: b.bg }} />
            <p className="mt-1.5 truncate text-[12px] font-medium text-ink">{b.title}</p>
            <p className="text-[11px] text-muted">{b.by}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onContextMenu={openAt("ai")}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-[13px] font-medium text-accent"
      >
        <Sparkles size={15} />
        Summarize this page
        <span className="text-[11.5px] font-normal text-muted">right-click for more</span>
      </button>

      <ContextMenu at={menu?.at ?? null} room={room} onClose={close} label="Context menu" width={276}>
        {menu?.kind === "text" && <SelectionMenuBody onAct={close} />}
        {menu?.kind === "book" && <BookMenuBody />}
        {menu?.kind === "ai" && <AiMenuBody />}
      </ContextMenu>
    </div>
  );
}
