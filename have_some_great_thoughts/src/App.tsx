import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Link2 } from "lucide-react";
import { LOOKS, tokenVars, type LookId } from "./theme";
import { VerdictBadge, type Verdict } from "./ui/Block";
import { cn } from "./utils/cn";
import PlayerSection from "./sections/Player";
import DockLab from "./sections/DockLab";
import DictionarySection from "./sections/Dictionary";
import AppearanceSection from "./sections/Appearance";
import MenusSection from "./sections/Menus";
import ToastSection from "./sections/Toasts";
import SettingsSection from "./sections/Settings";
import ChromeSection from "./sections/Chrome";
import KitSection from "./sections/Kit";

const OVERVIEW: { id: string; n: string; title: string; v: Verdict; line: string }[] = [
  { id: "player", n: "02", title: "Read-aloud player", v: "redesign", line: "Narrowest width tells you nothing. Ring on Play, chips for speed/sleep/voice." },
  { id: "dock", n: "03", title: "Edge-parking", v: "redesign", line: "A blank 20 pt sliver of paper on paper. Labelled tab; the player never hides." },
  { id: "dictionary", n: "04", title: "Dictionary & AI cards", v: "tweak", line: "Great surface. Name the senses, show CEFR as a meter, add Save." },
  { id: "appearance", n: "05", title: "Appearance popover", v: "redesign", line: "512 pt of scrolling sliders → a 300 pt dial deck: hue ring + knobs." },
  { id: "menus", n: "06", title: "View / context / selection", v: "redesign", line: "Three dialects. 13 rows → tiles; icons everywhere; colour-first selection bar." },
  { id: "toast", n: "07", title: "Toasts", v: "keep", line: "Already excellent. Only gap: a progress variant for downloads." },
  { id: "settings", n: "08", title: "Settings window", v: "tweak", line: "Engine rows show state; settings get search." },
  { id: "chrome", n: "09", title: "Counter, page bar, sidebar", v: "tweak", line: "Ring + chapter in the chip. Sidebar rail: keep." },
];

const NAV_LABEL: Record<string, string> = { player: "Player", dock: "Edge-parking", dictionary: "Dictionary", appearance: "Appearance", menus: "Menus", toast: "Toasts", settings: "Settings", chrome: "Page bar & sidebar" };

export default function App() {
  const [look, setLook] = useState<LookId>("parchment");
  const vars = useMemo(() => tokenVars(LOOKS[look].tok), [look]);
  const [active, setActive] = useState("overview");

  useEffect(() => {
    document.body.style.background = LOOKS[look].tok.paper;
  }, [look]);

  useEffect(() => {
    const ids = ["overview", ...OVERVIEW.map((o) => o.id), "kit"];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div style={vars} className={cn("min-h-screen bg-paper font-sans text-ink transition-colors duration-200", look === "parchment" && "grain")}>
      <div className="relative z-10">
        {/* top bar */}
        <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-4 px-5">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight">Mareader2</span>
              <span className="hidden text-[13px] text-muted sm:inline">UI review &amp; component lab</span>
            </div>
            <span className="flex-1" />
            <div className="flex items-center gap-1 rounded-full border border-line bg-paper/60 p-0.5" role="radiogroup" aria-label="Look">
              {(Object.keys(LOOKS) as LookId[]).map((k) => (
                <button
                  key={k}
                  role="radio"
                  aria-checked={look === k}
                  onClick={() => setLook(k)}
                  className={cn("flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50", look === k ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-ink")}
                >
                  <span className="size-3 rounded-full border border-black/15" style={{ background: LOOKS[k].tok.paper }}>
                    <span className="block size-full rounded-full" style={{ background: `linear-gradient(135deg, transparent 50%, ${LOOKS[k].tok.accent} 50%)` }} />
                  </span>
                  <span className="hidden sm:inline">{LOOKS[k].label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1320px] gap-10 px-5">
          {/* side nav */}
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-48 shrink-0 py-8 xl:block">
            <nav className="flex flex-col gap-0.5 text-[13px]">
              <a href="#overview" className={cn("rounded-lg px-3 py-1.5", active === "overview" ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover hover:text-ink")}>Overview</a>
              {OVERVIEW.map((o) => (
                <a key={o.id} href={`#${o.id}`} className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5", active === o.id ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover hover:text-ink")}>
                  <span className="w-4 text-[11px] tabular-nums opacity-60">{o.n}</span>
                  {NAV_LABEL[o.id]}
                  <span className={cn("ml-auto size-1.5 rounded-full", o.v === "keep" ? "bg-[#16a34a]" : o.v === "tweak" ? "bg-[#d97706]" : "bg-accent")} />
                </a>
              ))}
              <a href="#kit" className={cn("rounded-lg px-3 py-1.5", active === "kit" ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover hover:text-ink")}>
                <span className="mr-2 text-[11px] opacity-60">10</span>Kit
              </a>
            </nav>
          </aside>

          <main className="min-w-0 flex-1 pb-24">
            {/* hero / overview */}
            <section id="overview" className="scroll-mt-20 pt-12 pb-10">
              <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-accent">Review · redesign · component library</div>
              <h1 className="max-w-3xl text-[40px] leading-[1.08] font-semibold tracking-tight sm:text-[52px]">
                Mareader2's UI is already calm. Here's where it can be <span className="text-accent">denser, clearer and a bit more delightful.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-muted">
                I read the Rust/egui source (<code className="font-mono text-[13px] text-ink/80">crates/ui/src</code>, commit <code className="font-mono text-[13px] text-ink/80">aed46a6</code>) and compared it against the project's own README screenshots. Every “Today” specimen below is rebuilt from the real metrics in code — pt sizes, radii, timings, thresholds — not eyeballed. Everything marked “Proposed” is a working component. Flip the look at the top; all of it follows.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
                <a href="https://github.com/codewiththiha/mareader2" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink hover:text-accent"><Link2 size={14} />codewiththiha/mareader2<ArrowUpRight size={12} /></a>
                <span>Icons: Lucide (the app's own, ADR 0004)</span>
                <span>Type: Inter</span>
                <span>Parchment tokens sampled from the README screenshots</span>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {OVERVIEW.map((o) => (
                  <a key={o.id} href={`#${o.id}`} className="group flex flex-col gap-2 rounded-2xl border border-line bg-card/70 p-4 transition-colors hover:border-accent/50 hover:bg-card">
                    <div className="flex items-center justify-between"><span className="text-[11px] tabular-nums text-muted">{o.n}</span><VerdictBadge v={o.v} /></div>
                    <div className="text-[15px] font-medium leading-tight">{o.title}</div>
                    <p className="text-[12.5px] leading-snug text-muted">{o.line}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[12px] text-accent opacity-0 transition-opacity group-hover:opacity-100">See it <ArrowUpRight size={12} /></span>
                  </a>
                ))}
                <div className="flex flex-col justify-center gap-1.5 rounded-2xl border border-dashed border-line p-4 text-[12.5px] leading-snug text-muted">
                  <span className="font-medium text-ink">What I didn't redesign</span>
                  The title bar's reveal/hide, sidebar rail, pane lifting, theme token pipeline and window controls. They're good, and the screenshots confirm it.
                </div>
              </div>
            </section>

            <PlayerSection />
            <DockLab />
            <DictionarySection />
            <AppearanceSection />
            <MenusSection />
            <ToastSection />
            <SettingsSection />
            <ChromeSection />
            <KitSection />

            <footer className="mt-10 border-t border-line pt-6 text-[12.5px] leading-relaxed text-muted">
              <p>
                Limits of this review: I couldn't build or run the native app here (no Rust toolchain), so “Today” = source metrics + the repo's own README screenshots, not a fresh capture. Sample data beyond what the screenshots show is flagged where it appears. Shortcut hints in the library menu are placeholders.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
