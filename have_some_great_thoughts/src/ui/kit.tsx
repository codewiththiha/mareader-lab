import { useId, type ReactNode, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

/* ───────── Tooltip — the app's `widgets::tip`: small surface chip, keys beside the words ───────── */
export function Tip({
  label,
  keys,
  side = "top",
  children,
  className,
}: {
  label: string;
  keys?: string;
  side?: "top" | "bottom";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-[12px] leading-none text-ink opacity-0 shadow-[0_2px_8px_var(--shadow-soft)] transition-opacity delay-0 group-hover/tip:opacity-100 group-hover/tip:delay-500 group-focus-within/tip:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        )}
      >
        {label}
        {keys && <span className="ml-2.5 text-muted">{keys}</span>}
      </span>
    </span>
  );
}

/* ───────── Icon button: 36 toolbar (r8, 18px icon) · 32 round (player) · 24 small (header) ───────── */
export function IconButton({
  icon: Icon,
  label,
  keys,
  size = "lg",
  round,
  active,
  disabled,
  onClick,
  tip = true,
  side,
  className,
  iconSize,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  keys?: string;
  size?: "lg" | "md" | "sm" | "xs";
  round?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  tip?: boolean;
  side?: "top" | "bottom";
  className?: string;
  iconSize?: number;
  danger?: boolean;
}) {
  const dim = { lg: 36, md: 32, sm: 26, xs: 22 }[size];
  const ic = iconSize ?? { lg: 18, md: 16, sm: 15, xs: 13 }[size];
  const btn = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      style={{ width: dim, height: dim }}
      className={cn(
        "grid shrink-0 place-items-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        round ? "rounded-full" : "rounded-lg",
        active ? "bg-accent-soft text-accent" : "text-ink hover:bg-hover active:bg-pressed",
        danger && "hover:text-danger",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      <Icon size={ic} strokeWidth={1.75} />
    </button>
  );
  return tip ? (
    <Tip label={label} keys={keys} side={side}>
      {btn}
    </Tip>
  ) : (
    btn
  );
}

/* ───────── Switch — `widgets::switch`: 36×20 track, white 16px knob ───────── */
export function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        on ? "bg-accent" : "bg-track hover:brightness-95"
      )}
    >
      <span
        className="absolute top-0.5 size-4 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.1),0_1px_2px_rgba(0,0,0,.25)] transition-[left] duration-150"
        style={{ left: on ? 18 : 2 }}
      />
    </button>
  );
}

/* ───────── Segmented — `widgets::segments`: outlined track, sliding soft thumb ───────── */
export type Seg<T extends string> = { value: T; label?: string; icon?: LucideIcon; tip?: string };
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  height = 24,
  iconOnly,
  className,
  ariaLabel,
}: {
  items: Seg<T>[];
  value: T;
  onChange: (v: T) => void;
  height?: number;
  iconOnly?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const i = Math.max(0, items.findIndex((s) => s.value === value));
  const n = items.length;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("relative flex rounded-md border border-line p-0.5", className)}
      style={{ height }}
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 rounded bg-accent-soft transition-[left] duration-150 ease-out"
        style={{ width: `calc((100% - 4px) / ${n})`, left: `calc(2px + (100% - 4px) / ${n} * ${i})` }}
      />
      {items.map((s) => {
        const on = s.value === value;
        const Icon = s.icon;
        const btn = (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={s.label ?? s.tip}
            onClick={() => onChange(s.value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
              on ? "text-accent" : "text-ink hover:bg-hover/60"
            )}
          >
            {Icon && <Icon size={14} strokeWidth={1.75} />}
            {!iconOnly && s.label}
          </button>
        );
        return iconOnly && (s.tip || s.label) ? (
          <Tip key={s.value} label={(s.tip ?? s.label)!} className="flex-1 [&>button]:w-full">
            {btn}
          </Tip>
        ) : (
          btn
        );
      })}
    </div>
  );
}

/* ───────── Chip ───────── */
export function Chip({
  children,
  tone = "soft",
  className,
  style,
}: {
  children: ReactNode;
  tone?: "soft" | "muted" | "outline" | "accent" | "danger" | "ok";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] leading-4 whitespace-nowrap",
        tone === "soft" && "bg-accent-soft text-ink",
        tone === "muted" && "bg-hover/70 text-muted",
        tone === "outline" && "border border-line text-muted",
        tone === "accent" && "bg-accent text-on-accent",
        tone === "danger" && "bg-danger/12 text-danger",
        tone === "ok" && "bg-[color-mix(in_oklab,#16a34a_18%,transparent)] text-[color-mix(in_oklab,#15803d_75%,var(--ink))]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-paper/60 px-1.5 py-px font-sans text-[11px] leading-4 text-muted">
      {children}
    </kbd>
  );
}

/* ───────── Progress ring ───────── */
export function Ring({
  value,
  size = 44,
  stroke = 2.5,
  children,
  className,
  track = "var(--track)",
  color = "var(--accent)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
  track?: string;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))}
          style={{ transition: "stroke-dashoffset .3s linear" }}
        />
      </svg>
      {children}
    </span>
  );
}

/* ───────── Equalizer bars (the card's `dance`) ───────── */
export function Eq({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex h-3.5 items-end gap-[2px]", className)} aria-hidden>
      {[0, 0.25, 0.1].map((d, i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-accent"
          style={{
            height: "100%",
            transform: playing ? undefined : `scaleY(${[0.5, 0.9, 0.65][i]})`,
            animation: playing ? `eq ${0.9 + i * 0.15}s ease-in-out ${d}s infinite` : undefined,
          }}
        />
      ))}
    </span>
  );
}

/* ───────── Menu parts — `widgets::menu_row`, `menu_note`, rule ───────── */
export function MenuRow({
  icon: Icon,
  label,
  keys,
  on,
  danger,
  onClick,
  trailing,
}: {
  icon?: LucideIcon;
  label: string;
  keys?: string;
  on?: boolean;
  danger?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
        on ? "bg-accent-soft text-accent" : "hover:bg-hover active:bg-pressed",
        danger ? "text-danger" : !on && "text-ink"
      )}
    >
      {Icon ? <Icon size={16} strokeWidth={1.75} className="shrink-0" /> : <span className="w-4 shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {trailing}
      {keys && <span className="text-[12px] text-muted">{keys}</span>}
    </button>
  );
}

export function MenuNote({ children }: { children: ReactNode }) {
  return <div className="px-2.5 py-0.5 text-[12px] text-muted">{children}</div>;
}

export function Rule({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-line", className)} />;
}

/* ───────── Popover / card surface — radius 12, 1px line, shadow 0 8 24 ───────── */
export function Surface({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-xl border border-line bg-surface text-ink shadow-[0_8px_24px_var(--shadow)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ───────── Labelled range (accent fill, white knob) ───────── */
export function Range({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const id = useId();
  return (
    <input
      id={id}
      aria-label={label}
      type="range"
      className="lab-range"
      min={min}
      max={max}
      step={step}
      value={value}
      style={{ ["--p" as string]: `${((value - min) / (max - min)) * 100}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
