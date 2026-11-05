import { type ReactNode } from "react";
import { Check, AlertTriangle, Wrench, Sparkles } from "lucide-react";
import { clsx } from "clsx";

export type Verdict = "keep" | "polish" | "redesign";

const VERDICT: Record<Verdict, { label: string; icon: ReactNode; cls: string }> = {
  keep: { label: "Already strong · keep", icon: <Check size={12} />, cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30" },
  polish: { label: "Good · polish details", icon: <Wrench size={12} />, cls: "bg-amber-500/15 text-amber-800 ring-amber-500/30" },
  redesign: { label: "Rethink layout", icon: <Sparkles size={12} />, cls: "bg-rose-500/15 text-rose-700 ring-rose-500/30" },
};

export function VerdictBadge({ v }: { v: Verdict }) {
  const d = VERDICT[v];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1", d.cls)}>
      {d.icon}
      {d.label}
    </span>
  );
}

export function Section({ id, title, source, verdict, children, summary }: { id: string; title: string; source: string; verdict: Verdict; summary: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
          <VerdictBadge v={verdict} />
        </div>
        <p className="muted max-w-3xl text-[14px] leading-relaxed">{summary}</p>
        <p className="mono text-[11px] muted">source · {source}</p>
      </header>
      {children}
    </section>
  );
}

/** Two stages side by side: the recreation of what ships, and the proposal. */
export function Compare({ current, proposed, currentNote, proposedNote, tall }: { current: ReactNode; proposed: ReactNode; currentNote?: ReactNode; proposedNote?: ReactNode; tall?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Stage label="As shipped (recreated from source)" tone="current" tall={tall} note={currentNote}>{current}</Stage>
      <Stage label="Proposed" tone="proposed" tall={tall} note={proposedNote}>{proposed}</Stage>
    </div>
  );
}

export function Stage({ label, children, tone = "current", tall, note, className }: { label?: string; children: ReactNode; tone?: "current" | "proposed" | "plain"; tall?: boolean; note?: ReactNode; className?: string }) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider muted">
          <span className={clsx("h-1.5 w-1.5 rounded-full", tone === "current" ? "bg-[var(--muted)]" : tone === "proposed" ? "bg-[var(--accent)]" : "bg-transparent")} />
          {label}
        </div>
      )}
      <div className={clsx("grain relative overflow-hidden rounded-2xl border border-line", tall ? "min-h-[420px]" : "min-h-[280px]", className)}>
        {children}
      </div>
      {note && <div className="text-[13px] leading-relaxed muted">{note}</div>}
    </div>
  );
}

export function Finding({ kind, children }: { kind: "bug" | "idea" | "ok"; children: ReactNode }) {
  const map = {
    bug: { icon: <AlertTriangle size={14} className="text-[var(--danger)]" />, label: "Finding" },
    idea: { icon: <Sparkles size={14} className="text-[var(--accent)]" />, label: "Why" },
    ok: { icon: <Check size={14} className="text-emerald-600" />, label: "Works" },
  }[kind];
  return (
    <li className="flex gap-2.5 text-[13.5px] leading-relaxed">
      <span className="mt-0.5 shrink-0">{map.icon}</span>
      <span><span className="font-semibold">{map.label}: </span>{children}</span>
    </li>
  );
}

export function Findings({ children }: { children: ReactNode }) {
  return <ul className="max-w-3xl space-y-2 rounded-xl border border-line bg-card p-4">{children}</ul>;
}

/** Fake page text, in the book's serif at mareader's two-page spread feel. */
export function PageText({ className, hl }: { className?: string; hl?: boolean }) {
  return (
    <div className={clsx("serif select-none text-[12.5px] leading-[1.45] text-[var(--book-ink)]", className)}>
      <p className="mb-2 indent-4">It is a truth <Mark on={hl}>universally</Mark> <Mark on={hl} strong>acknowledged</Mark>, that a <Mark on={hl}>single</Mark> man in <Mark on={hl}>possession</Mark> of a <Mark on={hl}>good</Mark> fortune, must be in <Mark on={hl}>want</Mark> of a wife.</p>
      <p className="mb-2 indent-4">However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.</p>
      <p className="mb-2 indent-4">"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"</p>
      <p className="mb-2 indent-4">Mr. Bennet replied that he had not.</p>
      <p className="mb-2 indent-4">"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."</p>
    </div>
  );
}
function Mark({ children, on, strong }: { children: ReactNode; on?: boolean; strong?: boolean }) {
  if (!on) return <>{children}</>;
  return <span className={clsx("rounded-[2px] px-[1px]", strong ? "bg-rose-400/70" : "bg-rose-400/45")}>{children}</span>;
}

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="rounded-[5px] border border-line bg-[var(--paper)] px-1.5 py-[1px] text-[11px] font-medium text-[var(--muted)] shadow-[0_1px_0_var(--line)]">{children}</kbd>
);
