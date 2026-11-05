import { useEffect, useState } from "react";
import { GitFork as Github, Moon, Sun, Coffee, Camera } from "lucide-react";
import { PlayerSection } from "./sections/player";
import { DockSection } from "./sections/dock";
import { DictSection } from "./sections/dict";
import { AppearanceSection } from "./sections/appearance";
import { ToastSection } from "./sections/toasts";
import { MenuSection } from "./sections/menus";
import { MarksSection } from "./sections/marks";
import { Shots } from "./sections/shots";
import { cn } from "./kit/cn";

const NAV = [
  ["overview", "Overview"], ["player", "Read-aloud player"], ["dock", "Edge parking"], ["dict", "Dictionary cards"],
  ["appearance", "Appearance popover"], ["toasts", "Toasts"], ["menus", "Context menus"], ["marks", "Page marks & ask"], ["shots", "Reference captures"],
] as const;

const VERDICTS: [string, string, "great" | "good" | "work", string][] = [
  ["player", "Read-aloud player", "good", "Excellent motion and fitting logic; the default 300 pt width starves the track, and the full card wastes height."],
  ["dock", "Edge parking", "work", "Solid mechanics, poor leftovers: a 20 pt clipped slice with no state, and a parked player you can't pause."],
  ["dict", "Dictionary cards", "good", "Calm and legible; anonymous dots, an unexplained B1, and no save-to-word-list."],
  ["appearance", "Appearance popover", "work", "Correct but long: 13+ rows behind 5 folds, scrolling at 512 pt. A strong candidate for knobs and a tint wheel."],
  ["toasts", "Toasts", "great", "Best-in-class behaviour (dedupe, keep_clear, queueing). Only the visual weight and the extra strip need trimming."],
  ["menus", "Context menus", "good", "Consistent menu_row, except the library page menu, a leading chevron, and a preset in the keys column."],
  ["marks", "Page marks & ask", "work", "Flat red CEFR blocks and raw-yellow highlights fight the paper-first principle."],
];
const V = { great: ["Already great", "bg-emerald-500/12 text-emerald-700"], good: ["Good · refine", "bg-sky-500/12 text-sky-700"], work: ["Needs redesign", "bg-amber-500/15 text-amber-700"] } as const;

type Theme = "sepia" | "light" | "dark";
export default function App() {
  const [theme, setTheme] = useState<Theme>("sepia");
  const [at, setAt] = useState("overview");
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setAt(e.target.id)), { rootMargin: "-30% 0px -60% 0px" });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <div className="min-h-screen bg-sbg text-sink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-sline bg-spanel/80 px-4 py-6 backdrop-blur lg:flex">
        <div className="mb-1 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-[13px] font-bold text-on-accent">ma</div>
          <div className="leading-tight"><div className="text-[14px] font-semibold">mareader2 · UI Lab</div><div className="text-[11px] text-smuted">review & redesign kit</div></div>
        </div>
        <nav className="mt-6 space-y-0.5">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={cn("block rounded-lg px-3 py-1.5 text-[13.5px] transition-colors", at === id ? "bg-sink/8 font-medium text-sink" : "text-smuted hover:text-sink")}>{label}</a>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-smuted">Preview theme</div>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-sink/5 p-1">
            {([["sepia", Coffee], ["light", Sun], ["dark", Moon]] as const).map(([t, I]) => (
              <button key={t} onClick={() => setTheme(t)} className={cn("flex items-center justify-center gap-1 rounded-md py-1.5 text-[11.5px] capitalize", theme === t ? "bg-spanel font-medium shadow-sm" : "text-smuted")}><I size={12} />{t}</button>
            ))}
          </div>
          <a href="https://github.com/codewiththiha/mareader2" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[12px] text-smuted hover:text-sink"><Github size={14} /> codewiththiha/mareader2 @ aed46a6</a>
        </div>
      </aside>

      <main className="px-5 sm:px-8 lg:ml-[248px] lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <section id="overview" className="border-b border-sline pb-14 pt-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sline bg-spanel px-3 py-1 text-[12px] text-smuted"><Camera size={13} /> Reviewed from source · commit aed46a6 (2026-11-02)</div>
            <h1 className="max-w-4xl text-[40px] font-semibold leading-[1.1] tracking-tight sm:text-[48px]">mareader2's floating UI: <span className="text-accent">reviewed, then rebuilt</span> as a component kit.</h1>
            <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-smuted">
              Every “Current” specimen is rebuilt from the Rust/egui source, using its constants (<code>HEIGHT 44</code>, <code>PEEK 20</code>, <code>WIDTH 360</code>, <code>MAX_HEIGHT 512</code>…), its tokens (radius 8/12, Inter 14/12, Lucide icons), and colours sampled from headless renders of the repo's own <code>shot</code> tool at HEAD (README screenshots for states the tool couldn't reach). Each “Proposed” specimen is a working component that keeps the behaviour users rely on and changes form, density and feedback. Where something is already great, it says so and leaves it alone.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
              {(["sepia", "light", "dark"] as const).map((t) => <button key={t} onClick={() => setTheme(t)} className={cn("rounded-lg border border-sline px-3 py-1 text-[12px] capitalize", theme === t && "bg-sink text-sbg")}>{t}</button>)}
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {VERDICTS.map(([id, name, v, text]) => (
                <a key={id} href={`#${id}`} className="group rounded-2xl border border-sline bg-spanel p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2"><span className="text-[14.5px] font-medium">{name}</span><span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-semibold", V[v][1])}>{V[v][0]}</span></div>
                  <p className="mt-2 text-[13px] leading-relaxed text-smuted">{text}</p>
                </a>
              ))}
            </div>
            <div className="mt-8 grid gap-4 rounded-2xl border border-sline bg-spanel p-5 text-[13.5px] leading-relaxed text-smuted md:grid-cols-3">
              <div><b className="text-sink">Method.</b> Cloned the repo and read <code>park.rs</code>, <code>read_aloud/*</code>, <code>dict/*</code>, <code>toast/*</code>, <code>appearance_menu.rs</code>, <code>widgets.rs</code>, menus and <code>docs/design.md</code>. Built the headless <code>shot</code> example (egui_kittest + lavapipe) for live captures.</div>
              <div><b className="text-sink">Principles kept.</b> “The page is the app”, one token source, instant restyle, animate only what explains something. Every proposal uses the same tokens, so it would port to egui without new colours.</div>
              <div><b className="text-sink">How to read.</b> Grey tag = what ships today. Green = proposed replacement. Indigo = optional variant. Notes use <span className="text-emerald-600">Keep</span> / <span className="text-rose-600">Issue</span> / <span className="text-amber-600">Caution</span>. Use the theme switch to check sepia, light and dark.</div>
            </div>
          </section>
          <PlayerSection />
          <DockSection />
          <DictSection />
          <AppearanceSection />
          <ToastSection />
          <MenuSection />
          <MarksSection />
          <Shots />
          <footer className="py-12 text-center text-[12px] text-smuted">UI Lab for mareader2 · every component on this page is interactive</footer>
        </div>
      </main>
    </div>
  );
}
