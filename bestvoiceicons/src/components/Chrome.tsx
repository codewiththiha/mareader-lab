import { GitBranch, ArrowUpRight } from "lucide-react";
import { LogoMark } from "../icons/glyphs";
import { useSpy } from "../lib/kit";

const LINKS = [
  { id: "engines", label: "The six voices" },
  { id: "redraws", label: "Nine redraws" },
  { id: "ledger", label: "The ledger" },
  { id: "lab", label: "Icon lab" },
];

export const REPO = "https://github.com/codewiththiha/mareader2";

export function Nav() {
  const active = useSpy(["top", ...LINKS.map((l) => l.id)]);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-paper/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <span className="text-amber"><LogoMark size={26} /></span>
          <span className="font-display text-[17px] font-semibold tracking-tight">
            Mareader
            <span className="ml-2 hidden font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-cream/70 sm:inline">
              Icon Ledger
            </span>
          </span>
        </a>
        <nav className="ml-auto flex min-w-0 items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                active === l.id
                  ? "bg-amber/15 text-amber"
                  : "text-cream/80 hover:bg-paper/5 hover:text-paper"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="ml-1 flex shrink-0 items-center gap-1.5 rounded-full border border-paper/15 px-3 py-1.5 text-[12.5px] font-medium text-paper/90 transition-colors hover:border-amber/60 hover:text-amber"
          >
            <GitBranch size={14} />
            <span className="hidden sm:inline">mareader2</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-[#12100b]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-amber"><LogoMark size={28} /></span>
            <span className="font-display text-lg font-semibold">The Icon Ledger</span>
          </div>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-cream/75">
            An audit of every glyph in Mareader — a reader for PDFs and EPUBs,
            shaped around the way you read — with six new marks for the voices
            that never had one.
          </p>
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">Method</h3>
          <p className="mt-3 text-[13px] leading-relaxed text-cream/75">
            Every new mark is drawn on Lucide's 24-unit grid — stroke 2, round
            caps, round joins — so it can ship beside the glyphs the app already
            uses. Verdicts come from one question: does the mark name the thing
            the control actually does?
          </p>
          <p className="mt-3 font-mono text-[11px] text-cream/50">
            110 audited · 94 kept · 9 redrawn · 7 bespoke · 6 drawn new
          </p>
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">Sources &amp; licences</h3>
          <ul className="mt-3 space-y-2 text-[13px] text-cream/75">
            <li>
              <a href={REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-amber">
                codewiththiha/mareader2 <ArrowUpRight size={13} />
              </a>
              <span className="text-cream/50"> — engines, icons.rs, provider logos</span>
            </li>
            <li>Lucide glyphs · ISC licence</li>
            <li>Provider marks · Simple Icons v16.35.0, CC0 1.0</li>
            <li className="text-cream/50">
              Provider marks remain their owners' trademarks, shown only to name
              the service a model runs on.
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/5 py-5 text-center font-mono text-[11px] text-cream/45">
        set in Fraunces &amp; Inter · drawn on the 24-unit grid · lamplight extra
      </div>
    </footer>
  );
}
