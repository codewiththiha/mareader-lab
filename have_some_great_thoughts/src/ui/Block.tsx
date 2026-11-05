import type { ReactNode } from "react";
import { AlertTriangle, Check, Lightbulb, FileCode2 } from "lucide-react";
import { cn } from "../utils/cn";

export type Verdict = "keep" | "tweak" | "redesign";

const V: Record<Verdict, { label: string; cls: string }> = {
  keep: { label: "Keep as is", cls: "bg-[color-mix(in_oklab,#16a34a_16%,transparent)] text-[color-mix(in_oklab,#15803d_70%,var(--ink))]" },
  tweak: { label: "Small tweaks", cls: "bg-[color-mix(in_oklab,#d97706_18%,transparent)] text-[color-mix(in_oklab,#b45309_70%,var(--ink))]" },
  redesign: { label: "Worth redesigning", cls: "bg-accent text-on-accent" },
};

export function VerdictBadge({ v }: { v: Verdict }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium", V[v].cls)}>
      {V[v].label}
    </span>
  );
}

export type NoteT = { kind: "warn" | "idea" | "ok"; text: ReactNode };

export function Block({
  id,
  n,
  title,
  verdict,
  source,
  lead,
  notes,
  children,
}: {
  id: string;
  n: string;
  title: string;
  verdict?: Verdict;
  source: string;
  lead: ReactNode;
  notes?: NoteT[];
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line pt-10 pb-6">
      <header className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[12px] tabular-nums text-muted">{n}</span>
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">{title}</h2>
          {verdict && <VerdictBadge v={verdict} />}
        </div>
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted">{lead}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
          <FileCode2 size={13} className="shrink-0" />
          {source.split(" · ").map((s) => (
            <code key={s} className="rounded bg-hover/60 px-1.5 py-px font-mono text-[11.5px] text-ink/80">
              {s}
            </code>
          ))}
        </div>
      </header>
      <div className="flex flex-col gap-8">{children}</div>
      {notes && notes.length > 0 && (
        <ul className="mt-7 grid gap-2.5 md:grid-cols-2">
          {notes.map((x, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed",
                x.kind === "warn" ? "border-[color-mix(in_oklab,#d97706_45%,var(--line))] bg-[color-mix(in_oklab,#d97706_8%,transparent)]" : "border-line bg-card/60"
              )}
            >
              {x.kind === "warn" ? (
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#b45309]" />
              ) : x.kind === "ok" ? (
                <Check size={15} className="mt-0.5 shrink-0 text-[#15803d]" />
              ) : (
                <Lightbulb size={15} className="mt-0.5 shrink-0 text-accent" />
              )}
              <span className="text-ink/90">{x.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** A labelled specimen tray. `today` is a faithful rebuild of the app; `proposed` is the redesign. */
export function Specimen({
  kind,
  title,
  caption,
  children,
  className,
  bodyClassName,
  bg = "paper",
}: {
  kind: "today" | "proposed" | "variant";
  title: string;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  bg?: "paper" | "page";
}) {
  return (
    <figure className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <figcaption className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
            kind === "today" ? "border border-line text-muted" : "bg-accent-soft text-accent"
          )}
        >
          {kind === "today" ? "Today" : kind === "proposed" ? "Proposed" : "Variant"}
        </span>
        <span className="text-[14px] font-medium text-ink">{title}</span>
        {caption && <span className="text-[12.5px] text-muted">{caption}</span>}
      </figcaption>
      <div
        className={cn(
          "relative min-w-0 overflow-hidden rounded-2xl border border-line",
          bg === "paper" ? "bg-paper" : "bg-paper",
          bodyClassName
        )}
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--line) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {children}
      </div>
    </figure>
  );
}
