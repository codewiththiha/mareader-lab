import { useRef } from "react";
import { Copy, Download } from "lucide-react";
import { ENGINES, type Engine } from "../data/registry";
import { IconView, copyText, downloadSvg, serializeFromNode, useReveal } from "../lib/kit";

function EngineCard({ engine, index, notify }: { engine: Engine; index: number; notify: (m: string) => void }) {
  const plate = useRef<HTMLDivElement | null>(null);
  const { ref, seen } = useReveal();
  const e = engine.entry;

  const grab = () => serializeFromNode(plate.current, 24, "#16130e");

  return (
    <article
      ref={ref}
      className={`reveal ${seen ? "seen" : ""} group flex flex-col overflow-hidden rounded-2xl border border-paper/10 bg-ink2/80 transition-colors hover:border-paper/25`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      {/* plate */}
      <div
        className="engine-plate relative flex h-48 items-center justify-center border-b border-paper/8"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, ${engine.hue} 14%, transparent), transparent 65%), linear-gradient(rgba(240,231,211,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(240,231,211,0.05) 1px, transparent 1px)`,
          backgroundSize: "auto, 16px 16px, 16px 16px",
        }}
      >
        <span className="absolute left-4 top-3.5 rounded-full border border-paper/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-cream/70">
          new mark
        </span>
        <span className="absolute right-4 top-3.5 font-mono text-[10px] text-cream/50">nº {index + 1}</span>
        <div ref={plate} style={{ color: engine.hue }} className="transition-transform duration-500 ease-out group-hover:scale-[1.14]">
          <IconView entry={e} size={88} />
        </div>
        {/* the mark small, as it would ship */}
        <span className="absolute bottom-3 right-4 flex items-center gap-1.5 font-mono text-[9px] text-cream/50">
          at 16 px <span style={{ color: engine.hue }}><IconView entry={e} size={16} /></span>
        </span>
      </div>

      {/* body */}
      <div className="flex grow flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[26px] font-semibold tracking-tight">{e.label}</h3>
          <code className="rounded bg-paper/8 px-2 py-0.5 font-mono text-[10.5px] text-cream/80">
            {e.id.replace("engine-", "speech::")}
          </code>
        </div>
        <p className="mt-1.5 text-[13px] font-medium leading-snug" style={{ color: engine.hue }}>
          {engine.tagline}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-cream/85">{engine.story}</p>

        <dl className="mt-4 space-y-1.5 border-t border-paper/8 pt-4 font-mono text-[10.5px]">
          {[
            ["model", engine.params],
            ["licence", engine.license],
            ["voices", engine.langs],
            ["builds", engine.builds],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-14 shrink-0 uppercase tracking-wider text-cream/45">{k}</dt>
              <dd className="text-cream/85">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex gap-2 pt-5">
          <button
            onClick={async () => {
              const svg = grab();
              if (svg && (await copyText(svg))) notify(`${e.label} mark copied as SVG`);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-paper/15 px-3 py-2 text-[12px] font-medium text-paper transition-colors hover:border-amber/60 hover:text-amber"
          >
            <Copy size={13} /> Copy SVG
          </button>
          <button
            onClick={() => {
              const svg = grab();
              if (svg) { downloadSvg(svg, `mareader-${e.id}`); notify(`${e.label} mark downloaded`); }
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
            style={{ background: engine.hue }}
          >
            <Download size={13} /> Download
          </button>
        </div>
      </div>
    </article>
  );
}

export function Engines({ notify }: { notify: (m: string) => void }) {
  const { ref, seen } = useReveal();
  return (
    <section id="engines" className="relative scroll-mt-14 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-[#12201c] to-ink" />
      <div className="aurora right-[-12%] top-[6%] h-[420px] w-[520px] bg-teal/14" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div ref={ref} className={`reveal ${seen ? "seen" : ""} max-w-3xl`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-teal">crates/speech · the voicers</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Six engines. <em className="font-light italic text-teal">Six new marks.</em>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-cream">
            In Settings → Read aloud, the engine rows are text-only: Kokoro, Piper,
            Kitten, Phonon, the System's own voices, and Silent for tests. The AI
            providers got bespoke SVGs; the voices got nothing. Each mark below is
            drawn from what the engine <span className="text-paper">is</span> — its name, its size, its physics —
            on the same grid the rest of the app speaks.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ENGINES.map((e, i) => (
            <EngineCard key={e.entry.id} engine={e} index={i} notify={notify} />
          ))}
        </div>
      </div>
    </section>
  );
}
