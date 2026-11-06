import { useRef, useState } from "react";
import { ArrowRight, Copy } from "lucide-react";
import { LEDGER, type Entry } from "../data/registry";
import { IconView, copyText, serializeFromNode, useReveal } from "../lib/kit";

const REDRAWS = LEDGER.filter((e) => e.verdict === "redraw");

function RedrawCard({ entry, size, index, notify }: { entry: Entry; size: number; index: number; notify: (m: string) => void }) {
  const newRef = useRef<HTMLDivElement | null>(null);
  const { ref, seen } = useReveal();

  return (
    <article
      ref={ref}
      className={`reveal ${seen ? "seen" : ""} flex flex-col rounded-2xl border border-paper/10 bg-ink2/80 p-5 transition-colors hover:border-ember/40`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      {/* before → after */}
      <div className="flex items-center justify-center gap-3">
        <figure className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-paper/10 bg-ink/70 text-cream/55">
            <IconView entry={entry} which="old" size={size} />
          </div>
          <figcaption className="font-mono text-[9px] uppercase tracking-[0.16em] text-ember/90">
            shipped
          </figcaption>
        </figure>
        <ArrowRight size={16} className="mb-6 shrink-0 text-cream/40" />
        <figure className="flex flex-col items-center gap-2">
          <div
            ref={newRef}
            className="flex h-24 w-24 items-center justify-center rounded-xl border border-moss/30 bg-ink/70 text-moss shadow-[inset_0_0_28px_rgba(143,183,95,0.08)]"
          >
            <IconView entry={entry} size={size} />
          </div>
          <figcaption className="font-mono text-[9px] uppercase tracking-[0.16em] text-moss">
            drawn
          </figcaption>
        </figure>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-semibold tracking-tight">{entry.label}</h3>
        <code className="truncate font-mono text-[9.5px] text-cream/50">{entry.glyph}</code>
      </div>
      <p className="mt-0.5 font-mono text-[10px] text-cream/55">{entry.where}</p>

      <div className="mt-3.5 space-y-3 text-[12.5px] leading-relaxed">
        <p className="border-l-2 border-ember/70 pl-3 text-cream/85">{entry.critique}</p>
        <p className="border-l-2 border-moss/70 pl-3 text-paper/90">{entry.fix}</p>
      </div>

      <button
        onClick={async () => {
          const svg = serializeFromNode(newRef.current, 24, "#16130e");
          if (svg && (await copyText(svg))) notify(`${entry.label} — new mark copied as SVG`);
        }}
        className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg border border-paper/15 px-3 py-1.5 text-[11.5px] font-medium text-paper/90 transition-colors hover:border-moss/70 hover:text-moss"
      >
        <Copy size={12} /> Copy new SVG
      </button>
    </article>
  );
}

export function Redraws({ notify }: { notify: (m: string) => void }) {
  const [size, setSize] = useState(24);
  const { ref, seen } = useReveal();

  return (
    <section id="redraws" className="relative scroll-mt-14 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-[#221410] to-ink" />
      <div className="aurora left-[-10%] top-[16%] h-[380px] w-[480px] bg-ember/14" style={{ animationDelay: "-4s" }} />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div ref={ref} className={`reveal ${seen ? "seen" : ""} flex flex-wrap items-end justify-between gap-6`}>
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember">the nine redraws</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Marks that <em className="font-light italic text-ember">missed their meaning.</em>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-cream">
              Nine glyphs name something other than what the control does — wind
              for animation, a chart for vocabulary levels, a masked eye for
              chromeless reading. Each replacement is drawn on the same 24-unit
              grid, so the fix is a one-line swap in <code className="font-mono text-[13px] text-paper">icons.rs</code>.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-paper/15 bg-ink2/80 p-1">
            <span className="pl-3 font-mono text-[10px] uppercase tracking-widest text-cream/60">proof at</span>
            {[16, 24, 48].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors ${
                  size === s ? "bg-ember text-ink font-semibold" : "text-cream/75 hover:text-paper"
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REDRAWS.map((e, i) => (
            <RedrawCard key={e.id} entry={e} size={size} index={i} notify={notify} />
          ))}
        </div>
      </div>
    </section>
  );
}
