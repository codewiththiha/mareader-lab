import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Palette } from "lucide-react";
import { clsx } from "clsx";
import { cssVars, hex, PRESETS, tokens, type Appearance } from "./theme";
import { Ctx } from "./lib/appearance";
import { VerdictBadge } from "./lib/ui";
import Toasts from "./components/Toasts";
import Player from "./components/Player";
import DictCard from "./components/DictCard";
import AppearanceMenu from "./components/AppearanceMenu";
import Menus from "./components/Menus";

const NAV = [
  { id: "toasts", label: "Toasts", v: "polish" },
  { id: "player", label: "Read-aloud player", v: "polish" },
  { id: "dict", label: "Lookup card & parking", v: "polish" },
  { id: "appearance", label: "Appearance popover", v: "redesign" },
  { id: "menus", label: "View & tools menu", v: "polish" },
  { id: "selection", label: "Selection bar", v: "redesign" },
  { id: "context", label: "Context menu · switch · pill", v: "keep" },
  { id: "settings", label: "Settings rows", v: "polish" },
] as const;

export default function App() {
  const [a, setA] = useState<Appearance>(PRESETS[1].a); // Sepia, as the README shots
  const [texture, setTexture] = useState<"none" | "paper" | "canvas">("paper");
  const [textureOpacity, setTextureOpacity] = useState(40);
  const [grain, setGrain] = useState<"off" | "static" | "animated">("static");
  const [grainIntensity, setGrainIntensity] = useState(25);
  const [ink, setInk] = useState(100);
  const t = useMemo(() => tokens(a), [a]);

  useEffect(() => {
    const vars = cssVars(t);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    root.style.setProperty("--grain-alpha", String(texture === "none" ? 0 : (textureOpacity / 100) * 0.9 + (grain === "off" ? 0 : grainIntensity / 400)));
    root.classList.toggle("dark", t.dark);
  }, [t, texture, textureOpacity, grain, grainIntensity]);

  const [active, setActive] = useState("toasts");
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-30% 0px -60% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.id); el && obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const ctx = { a, set: setA, texture, setTexture, textureOpacity, setTextureOpacity, grain, setGrain, grainIntensity, setGrainIntensity, ink, setInk };

  return (
    <Ctx.Provider value={ctx}>
      <style>{`.grain::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--grain-alpha,.4);background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");mix-blend-mode:${t.dark ? "screen" : "multiply"}}.grain{background-image:none}`}</style>
      <div className="min-h-screen" style={{ background: "var(--paper)", color: "var(--ink)" }}>
        {/* Title bar: 48 pt glass, as the app's */}
        <header className="sticky top-0 z-40 h-[48px] border-b border-line backdrop-blur-md" style={{ background: "var(--frost)" }}>
          <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4">
            <span className="grid h-7 w-7 place-items-center rounded-[8px] text-[13px] font-bold" style={{ background: "var(--accent)", color: "var(--ink-on-accent)" }}>M</span>
            <span className="text-[13px] font-medium">mareader2 · UI review & redesign lab</span>
            <span className="hidden text-[12px] muted md:inline">components recreated from <code className="mono">crates/ui/src</code>, not from memory</span>
            <div className="ml-auto flex items-center gap-1">
              <Palette size={14} className="muted mr-1" />
              {PRESETS.map((p) => {
                const on = p.a.base === a.base && p.a.tintHue === a.tintHue && p.a.tintStrength === a.tintStrength;
                return <button key={p.name} onClick={() => setA(p.a)} className={clsx("h-7 rounded-[7px] px-2 text-[12px] font-medium transition-colors", on ? "bg-[var(--selected)] text-[var(--accent)]" : "hover:bg-[var(--hover)]")}>{p.name}</button>;
              })}
              <a href="https://github.com/codewiththiha/mareader2" target="_blank" rel="noreferrer" className="tb ml-1" aria-label="Repository"><ExternalLink size={18} /></a>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:block">
            <div className="sticky top-[64px] space-y-1">
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider muted">Components</div>
              {NAV.map((n) => (
                <a key={n.id} href={`#${n.id}`} className={clsx("flex items-center justify-between rounded-[8px] px-2.5 py-1.5 text-[13px] transition-colors", active === n.id ? "bg-[var(--selected)] font-medium text-[var(--accent)]" : "hover:bg-[var(--hover)]")}>
                  {n.label}
                  <span className={clsx("h-1.5 w-1.5 rounded-full", n.v === "keep" ? "bg-emerald-500" : n.v === "polish" ? "bg-amber-500" : "bg-rose-500")} />
                </a>
              ))}
              <div className="mt-4 space-y-1.5 px-2 text-[11px] muted">
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />keep as is</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />polish details</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />rethink layout</div>
              </div>
            </div>
          </nav>

          <main className="min-w-0 space-y-20">
            <section className="space-y-5">
              <h1 className="max-w-3xl text-[34px] font-semibold leading-[1.1] tracking-tight">A component-by-component review of mareader2's chrome, with working redesigns where they earn their place.</h1>
              <p className="max-w-3xl text-[15px] leading-relaxed muted">
                mareader2 is a Rust/egui reader, so there is no DOM to inspect. Every "as shipped" stage on this page was rebuilt from the source: constants (toast `WIDTH 360`, player `HEIGHT 44`, card `COVER 70×105`, `PEEK 20`), the token derivation in <code className="mono">tokens.rs</code> (ported to TypeScript, including the OKLCH tint, chroma ceilings and the `SURFACE_GAP`/`LINE_GAP` contrast floors), and the eleven screenshots in <code className="mono">docs/screenshots/readme</code>. Switch presets in the title bar — the whole page restyles from the same seven tokens the app uses.
              </p>
              <div className="flex flex-wrap gap-2">
                {(["paper", "surface", "line", "hover", "selected", "card", "accentSoft", "accent", "muted", "ink", "track", "danger", "caution"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-2 rounded-full border border-line bg-[var(--surface)] py-1 pl-1 pr-2.5 text-[11px]">
                    <span className="h-4 w-4 rounded-full border border-line" style={{ background: hex(t[k]) }} /><span className="ink">{k}</span><span className="mono muted">{hex(t[k])}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ["What is genuinely good", "The theme engine, the toast behaviour, the bubble anchoring, the one-helper-per-control discipline, and the park mechanism. Those are marked keep and left alone."],
                  ["What this page proposes", "Fewer identical rows (knobs, a hue puck), labelled actions where the audit already asked for them, a parked panel that still tells you what it is, one lookup card instead of two, and switches for toggles in menus."],
                  ["What it does not do", "It does not touch the page pass, pane model, EPUB layout or anything parity-bound. Every proposal reads from the same `Tokens` and keeps the same metrics (36 pt controls, radius 8/12, 14/12 pt type)."],
                ].map(([h, p]) => <div key={h} className="rounded-xl border border-line bg-card p-4"><div className="text-[13px] font-semibold">{h}</div><p className="mt-1 text-[13px] leading-relaxed muted">{p}</p></div>)}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[12px] muted">Verdicts used: <VerdictBadge v="keep" /><VerdictBadge v="polish" /><VerdictBadge v="redesign" /></div>
            </section>

            <Toasts />
            <Player />
            <DictCard />
            <AppearanceMenu />
            <Menus />

            <section className="space-y-4 border-t border-line pt-10">
              <h2 className="text-[22px] font-semibold tracking-tight">Reviewed and left alone</h2>
              <p className="max-w-3xl text-[14px] leading-relaxed muted">Not everything needs a proposal. These were read and judged fine:</p>
              <ul className="grid gap-2 text-[13.5px] md:grid-cols-2">
                {[
                  ["Title bar", "48 pt glass at FROST 150 over a 12 pt blur, 400 ms hide + 200 ms fade, `Sides` layout, no pin button since the audit. Correct."],
                  ["Sidebar tabs", "Thumbnails · Outline · Notes · Library, labelled under their icons (audit 4.1 done). The docked rail hosting the traffic lights is a nice touch."],
                  ["Notes panel", "Page caption, a yellow spine for the highlight, note under with its icon; All · 3 / Notes · 3 chips. Readable at a glance."],
                  ["Four panes", "Running title top-left per pane, page pill bottom-right per pane, 8 pt divider band. The 2 pt accent outline on the active pane is heavy but the audit already lists it (5.2)."],
                  ["Library card", "Cover with a 6 % ribbon, title + shelf under, 'Add books' tile as a dashed page. The ribbon is a good progress mark; keep."],
                  ["Empty states", "`panel_empty`: icon, title, wrapped hint a third of the way down. One helper, used everywhere."],
                ].map(([h, p]) => <li key={h} className="rounded-xl border border-line p-3"><span className="font-semibold">{h}. </span><span className="muted">{p}</span></li>)}
              </ul>
              <p className="pt-4 text-[12px] muted">All metrics cited are from the mareader2 source at clone time. Icons here are Lucide, as in the app (ADR 0004). Inter via rsms.me.</p>
            </section>
          </main>
        </div>
      </div>
    </Ctx.Provider>
  );
}
