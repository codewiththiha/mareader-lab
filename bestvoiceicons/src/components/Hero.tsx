import { ArrowDown, BookOpenText } from "lucide-react";
import { ENGINES, LEDGER, STATS } from "../data/registry";
import { IconView } from "../lib/kit";
import { REPO } from "./Chrome";

const MARQUEE_IDS = [
  "engine-kokoro", "ReadAloud", "engine-piper", "Dictionary", "engine-kitten",
  "Spread", "engine-phonon", "Ai", "engine-system", "Chromeless", "engine-silent",
  "Levels", "Highlight", "Motion", "Ollama", "Simplify", "Gemini", "FitPage",
  "OpenAi", "AutoScroll", "VoiceModel", "PageNumber", "OpenRouter", "HalfHighlight",
  "LmStudio", "Bookmark", "Apple", "Outline",
];

export function Hero() {
  const byId = new Map([...ENGINES.map((e) => e.entry), ...LEDGER].map((e) => [e.id, e]));
  const strip = MARQUEE_IDS.map((id) => byId.get(id)!).filter(Boolean);

  return (
    <section id="top" className="relative overflow-hidden pt-14">
      {/* lamplight aurora */}
      <div className="aurora left-[-10%] top-[-15%] h-[420px] w-[560px] bg-amber/25" />
      <div className="aurora right-[-8%] top-[10%] h-[380px] w-[480px] bg-ember/16" style={{ animationDelay: "-6s" }} />
      <div className="aurora bottom-[-30%] left-[30%] h-[400px] w-[600px] bg-teal/12" style={{ animationDelay: "-11s" }} />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="rise font-mono text-[11px] uppercase tracking-[0.3em] text-amber" style={{ animationDelay: "0.05s" }}>
            mareader2 · crates/ui/icons.rs · an icon audit
          </p>
          <h1 className="rise mt-5 font-display text-[44px] font-semibold leading-[1.02] tracking-tight sm:text-[64px] lg:text-[72px]" style={{ animationDelay: "0.15s" }}>
            Every mark,
            <br />
            <em className="font-light italic text-amber">read closely.</em>
          </h1>
          <p className="rise mt-6 max-w-xl text-[15.5px] leading-relaxed text-cream" style={{ animationDelay: "0.28s" }}>
            Mareader gave its AI providers hand-picked logos — but its six voice
            engines read as bare text, and a few of its glyphs quietly lied
            about their job. This ledger names all six engines, draws the marks
            they never had, redraws the nine that missed their meaning, and
            keeps the ninety-four that were already right.
          </p>

          <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.4s" }}>
            <a
              href="#engines"
              className="group inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-[13.5px] font-semibold text-ink shadow-[0_0_36px_rgba(232,163,61,0.35)] transition-transform hover:-translate-y-0.5"
            >
              Meet the six voices
              <ArrowDown size={15} className="transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#ledger"
              className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-5 py-2.5 text-[13.5px] font-medium text-paper transition-colors hover:border-amber/70 hover:text-amber"
            >
              <BookOpenText size={15} />
              Open the ledger
            </a>
            <a href={`${REPO}/blob/main/crates/ui/src/icons.rs`} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-cream/60 underline decoration-cream/30 underline-offset-4 hover:text-amber">
              source: icons.rs
            </a>
          </div>

          <dl className="rise mt-12 grid max-w-xl grid-cols-3 gap-y-6 sm:grid-cols-5" style={{ animationDelay: "0.52s" }}>
            {[
              [STATS.audited, "icons audited", "text-paper"],
              [STATS.engines, "engine marks drawn", "text-teal"],
              [STATS.redrawn, "glyphs redrawn", "text-ember"],
              [STATS.kept, "kept as shipped", "text-moss"],
              [STATS.bespoke, "already bespoke", "text-iris"],
            ].map(([n, label, hue]) => (
              <div key={label as string} className="pr-3">
                <dt className={`font-display text-3xl font-semibold ${hue}`}>{n}</dt>
                <dd className="mt-1 text-[10.5px] uppercase tracking-[0.14em] text-cream/65">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* specimen plate */}
        <div className="rise lg:col-span-5" style={{ animationDelay: "0.45s" }}>
          <div className="floaty relative mx-auto max-w-md rounded-2xl border border-paper/12 bg-ink2/90 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-baseline justify-between border-b border-paper/10 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/70">Voice engines</span>
              <span className="font-mono text-[10px] text-amber">plate nº 1 — new</span>
            </div>
            <div className="grid grid-cols-3 gap-3 py-5">
              {ENGINES.map((e, i) => (
                <a
                  key={e.entry.id}
                  href="#engines"
                  className="group flex flex-col items-center gap-2.5 rounded-xl border border-paper/8 bg-ink/60 px-2 py-5 transition-colors hover:border-paper/25"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(240,231,211,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(240,231,211,0.045) 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                >
                  <span
                    className="transition-transform duration-300 group-hover:scale-110"
                    style={{ color: e.hue, animation: `pulse-soft ${3 + i * 0.4}s ease-in-out infinite` }}
                  >
                    <IconView entry={e.entry} size={44} />
                  </span>
                  <span className="font-mono text-[10px] tracking-wide text-cream/80">{e.entry.label}</span>
                </a>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-paper/10 pt-3 font-mono text-[10px] text-cream/55">
              <span>24 × 24 grid</span>
              <span>stroke 2</span>
              <span>round caps</span>
              <span className="text-teal">tintable</span>
            </div>
            <span className="absolute -right-2.5 -top-2.5 rounded-full bg-ember px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-ink shadow-lg">
              none existed
            </span>
          </div>
        </div>
      </div>

      {/* the marquee shelf */}
      <div className="relative border-y border-paper/10 bg-ink2/60 py-3.5">
        <div className="flex overflow-hidden" aria-hidden>
          <div className="marquee flex shrink-0 items-center gap-8 pr-8">
            {[...strip, ...strip].map((e, i) => (
              <span key={`${e.id}-${i}`} className="flex items-center gap-2.5 text-cream/70">
                <span className={e.verdict === "engine" ? "text-teal" : e.verdict === "redraw" ? "text-ember" : e.verdict === "bespoke" ? "text-iris" : "text-cream/70"}>
                  <IconView entry={e} size={19} />
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]">{e.label}</span>
                <span className="ml-4 h-1 w-1 rounded-full bg-paper/20" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
