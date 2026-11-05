import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Info, TriangleAlert, type LucideIcon } from "lucide-react";

export const cx = (...args: ClassValue[]) => twMerge(clsx(args));

/* ---------- Buttons ---------- */

type Variant = "primary" | "soft" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent shadow-sm hover:brightness-110",
  soft: "bg-accent-soft text-accent hover:brightness-95",
  ghost: "text-ink hover:bg-ink/10",
  danger: "bg-danger/12 text-danger hover:bg-danger/20",
};

export function Button({
  variant = "soft",
  size = "md",
  icon: Icon,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md"; icon?: LucideIcon }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2} />}
      {children}
    </button>
  );
}

/** A round, frameless icon button. Toolbars use 34–36 px; small dense rows use 28. */
export function IconButton({
  label,
  icon: Icon,
  active = false,
  size = 34,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: LucideIcon; active?: boolean; size?: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={cx(
        "grid shrink-0 place-items-center rounded-lg text-ink/75 transition duration-150 hover:bg-ink/10 hover:text-ink active:scale-95 disabled:opacity-40",
        active && "bg-accent-soft text-accent",
        className,
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon size={size >= 32 ? 18 : 15} strokeWidth={1.9} />
    </button>
  );
}

/* ---------- Choices ---------- */

export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

/** A segmented track: one choice of several, labelled, icon-led or icon-only. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  full = false,
  iconOnly = false,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
  full?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("inline-flex rounded-xl bg-ink/10 p-0.5", full && "flex w-full")}>
      {options.map((o) => {
        const on = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.label}
            title={o.label}
            onClick={() => onChange(o.value)}
            className={cx(
              "flex flex-1 items-center justify-center gap-1.5 rounded-[9px] font-medium transition-all duration-150",
              size === "sm" ? "h-7 px-2 text-[12px]" : "h-8 px-3 text-[13px]",
              on ? "bg-paper-base text-ink shadow-seg" : "text-muted hover:text-ink",
            )}
          >
            {Icon && <Icon size={15} strokeWidth={1.9} />}
            {!iconOnly && <span className="whitespace-nowrap">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-5 w-[34px] shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40",
        checked ? "bg-accent" : "bg-ink/25",
      )}
    >
      <span
        className={cx(
          "absolute left-[2px] top-[2px] size-4 rounded-full bg-paper-base shadow transition-transform duration-200",
          checked && "translate-x-[14px]",
        )}
      />
    </button>
  );
}

/** A labelled range: name, track, value. `track` replaces the fill with any gradient. */
export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  format = String,
  track,
  className,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  format?: (v: number) => string;
  track?: string;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const style = { "--p": `${pct}%`, "--track": track } as CSSProperties;
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <span className="w-[68px] shrink-0 text-[12.5px] text-muted">{label}</span>
      <input
        type="range"
        className={cx("range min-w-0 flex-1", track && "rainbow")}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        style={style}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-14 shrink-0 text-right text-[12px] tabular-nums text-ink">{format(value)}</span>
    </div>
  );
}

/* ---------- Small labels ---------- */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-line bg-paper-base px-1 font-ui text-[10.5px] font-medium text-muted shadow-key">
      {children}
    </kbd>
  );
}

/** A CEFR level, as on the lookup card. */
export function Level({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[18px] items-center rounded-md bg-accent-soft px-1.5 text-[11px] font-semibold tabular-nums text-accent">
      {children}
    </span>
  );
}

export type Verdict = "keep" | "refine" | "rebuild";

const VERDICTS: Record<Verdict, { label: string; cls: string }> = {
  keep: { label: "Keep", cls: "bg-success/15 text-success" },
  refine: { label: "Refine", cls: "bg-warning/15 text-warning" },
  rebuild: { label: "Rebuild", cls: "bg-danger/12 text-danger" },
};

export function VerdictPill({ kind }: { kind: Verdict }) {
  return (
    <span className={cx("inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold tracking-wide", VERDICTS[kind].cls)}>
      {VERDICTS[kind].label}
    </span>
  );
}

/** A genuine problem, stated once, with what to do about it. */
export function Note({ children, tone = "warn" }: { children: ReactNode; tone?: "warn" | "info" }) {
  const Icon = tone === "warn" ? TriangleAlert : Info;
  return (
    <div
      className={cx(
        "flex gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] leading-relaxed",
        tone === "warn" ? "border-warning/30 bg-warning/10" : "border-accent/25 bg-accent-soft",
      )}
    >
      <Icon size={16} className={cx("mt-0.5 shrink-0", tone === "warn" ? "text-warning" : "text-accent")} />
      <div className="min-w-0 text-ink/90">{children}</div>
    </div>
  );
}

/** A framed showcase cell with a caption bar. */
export function Stage({
  label,
  meta,
  children,
  className,
  padded = true,
  paper = false,
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
  paper?: boolean;
}) {
  return (
    <figure className={cx("flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line", paper ? "bg-paper" : "bg-surface/50", className)}>
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="text-[12.5px] font-medium text-ink">{label}</span>
        {meta && <span className="text-right text-[11.5px] text-muted">{meta}</span>}
      </figcaption>
      <div className={cx("relative min-w-0 flex-1", padded && "p-5")}>{children}</div>
    </figure>
  );
}
