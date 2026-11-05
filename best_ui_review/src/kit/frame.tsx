import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleDot, Lightbulb, FileCode2 } from "lucide-react";
import { cn } from "./cn";

export function Section({ id, kicker, title, intro, children }: { id: string; kicker: string; title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-sline py-14 first:pt-8">
      <div className="mb-8 max-w-3xl">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-smuted">{kicker}</div>
        <h2 className="text-[28px] font-semibold tracking-tight text-sink">{title}</h2>
        <div className="mt-3 text-[15px] leading-relaxed text-smuted">{intro}</div>
      </div>
      <div className="space-y-10">{children}</div>
    </section>
  );
}

/** One labelled specimen: "Current" (faithful to the Rust source) or "Proposed". */
export function Specimen({ tag, title, src, children, className, stageClass, note, grain = true }: {
  tag: "current" | "proposed" | "variant"; title: string; src?: string; children: ReactNode; className?: string; stageClass?: string; note?: ReactNode; grain?: boolean;
}) {
  const tone = {
    current: "bg-sink/5 text-smuted ring-sline",
    proposed: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-400",
    variant: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20",
  }[tag];
  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-sline bg-spanel", className)}>
      <figcaption className="flex flex-wrap items-center gap-2 border-b border-sline px-4 py-2.5">
        <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ring-1", tone)}>
          {tag === "current" ? "Current · mareader2" : tag === "proposed" ? "Proposed" : "Variant"}
        </span>
        <span className="text-[13.5px] font-medium text-sink">{title}</span>
        {src && (
          <code className="ml-auto inline-flex items-center gap-1 rounded-md bg-sink/5 px-1.5 py-0.5 text-[11px] text-smuted">
            <FileCode2 size={11} /> {src}
          </code>
        )}
      </figcaption>
      <div className={cn(grain && "grain", "relative flex min-h-[180px] items-center justify-center p-8", stageClass)}>{children}</div>
      {note && <div className="border-t border-sline px-4 py-3 text-[13px] leading-relaxed text-smuted">{note}</div>}
    </figure>
  );
}

type Kind = "issue" | "keep" | "warn" | "idea";
const KINDS: Record<Kind, { icon: typeof AlertTriangle; cls: string; label: string }> = {
  issue: { icon: CircleDot, cls: "text-rose-600", label: "Issue" },
  keep: { icon: CheckCircle2, cls: "text-emerald-600", label: "Keep" },
  warn: { icon: AlertTriangle, cls: "text-amber-600", label: "Caution" },
  idea: { icon: Lightbulb, cls: "text-indigo-600", label: "Why" },
};

export function Notes({ items, title }: { items: [Kind, ReactNode][]; title?: string }) {
  return (
    <div className="rounded-2xl border border-sline bg-spanel p-5">
      {title && <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-smuted">{title}</div>}
      <ul className="space-y-2.5">
        {items.map(([k, t], i) => {
          const K = KINDS[k];
          return (
            <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-sink">
              <K.icon size={15} className={cn("mt-[3px] shrink-0", K.cls)} />
              <span><b className={cn("mr-1 font-semibold", K.cls)}>{K.label}.</b>{t}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  return <div className={cn("grid gap-6", cols === 2 && "xl:grid-cols-2", cols === 3 && "lg:grid-cols-2 2xl:grid-cols-3")}>{children}</div>;
}

/** Faux book text lines for stages. */
export function BookText({ lines = 12, className }: { lines?: number; className?: string }) {
  const w = [96, 100, 92, 100, 64, 100, 98, 88, 100, 72, 100, 94, 100, 58, 97, 100];
  return (
    <div className={cn("space-y-[9px]", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-[6px] rounded-full bg-ink/12" style={{ width: `${w[i % w.length]}%` }} />
      ))}
    </div>
  );
}
