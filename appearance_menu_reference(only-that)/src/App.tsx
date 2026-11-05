import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown, BookOpenText, Check, Code2, FileCode2, FlaskConical, MousePointerClick,
  MoveRight, Volume2, Wind, SlidersHorizontal, Layers, Paintbrush, ArrowUpRight,
} from "lucide-react";
import { cn } from "./utils/cn";
import { CiteTag, Panel, Section, Warn } from "./components/kit";
import ToastLab from "./components/ToastLab";
import PlayerLab from "./components/PlayerLab";
import EdgeParkLab from "./components/EdgeParkLab";
import DictLab from "./components/DictLab";
import AppearanceLab from "./components/AppearanceLab";
import MenuLab from "./components/MenuLab";
import { FILES_READ, NAV, SOURCES } from "./data/audit";

/* ---------------------------------- tokens --------------------------------- */

const TOKEN_ROWS = [
  { ship: "accent", val: "#f5b83d", use: "primary actions, lit words, focus" },
  { ship: "surface", val: "#211c16", use: "cards, menus, player bodies" },
  { ship: "ink / muted", val: "#ede8de / #8a7d64", use: "text tiers — never pure white/black" },
  { ship: "line", val: "#2c2620", use: "1px edges; errors get danger at 50%" },
  { ship: "info (ad-hoc)", val: "#7cc4ff", use: "AI surfaces, links, secondary progress" },
  { ship: "radius_lg / text", val: "12–16px / 13px", use: "cards; content reads 15% larger" },
];

const MOTION_ROWS = [
  { name: "Card entrance", spec: "0.16s · +4pt rise · ease-out", dur: 0.16, dy: -8 },
  { name: "Toast exit", spec: "0.20s fade · or sideways fling", dur: 0.2, dy: 0, x: 60 },
  { name: "Park hide / reveal", spec: "0.26s / 0.34s · cubic ease-out", dur: 0.34, dy: 0, x: 60 },
  { name: "Magnet pull", spec: "0.18s · 8px toward content", dur: 0.18, dy: 0, x: -24 },
  { name: "Lyrics glide", spec: "~10%/frame close · EYE 0.4", dur: 0.5, dy: -14 },
];

function MotionRow({ row }: { row: (typeof MOTION_ROWS)[number] }) {
  const [k, setK] = useState(0);
  return (
    <button
      onClick={() => setK((x) => x + 1)}
      onMouseEnter={() => setK((x) => x + 1)}
      className="group flex w-full items-center gap-3 rounded-xl border border-[#2c2620] bg-[#0d0b09] px-3.5 py-2.5 text-left hover:border-[#f5b83d]/40"
      title="Hover or click to replay"
    >
      <span className="relative h-8 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40">
        <motion.span
          key={k}
          initial={{ opacity: 0, x: (row.x ?? 0) > 0 ? -(row.x ?? 0) : 24, y: -(row.dy ?? 0) }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: row.dur, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 left-1/2 h-4 w-8 -translate-x-1/2 -translate-y-1/2 rounded bg-[#f5b83d]"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-stone-200">{row.name}</span>
        <span className="block font-mono text-[11px] text-stone-500">{row.spec}</span>
      </span>
      <span className="font-mono text-[10.5px] text-stone-600 group-hover:text-[#f5b83d]">replay ↻</span>
    </button>
  );
}

/* --------------------------------- scorecard -------------------------------- */

const SCORES = [
  { icon: <Wind size={15} />, name: "Toasts", from: "B+", to: "A", note: "lane + legible meter fix the only real sins" },
  { icon: <Volume2 size={15} />, name: "Read-aloud player", from: "A−", to: "A", note: "overflow dot + mini/rail complete a strong system" },
  { icon: <Layers size={15} />, name: "Edge parking", from: "C", to: "A−", note: "physics: A · resting face: anonymous sliver → labeled tabs" },
  { icon: <BookOpenText size={15} />, name: "Dictionary card", from: "B+", to: "A", note: "one paging language, chips, reading-size gloss" },
  { icon: <Paintbrush size={15} />, name: "Appearance", from: "B", to: "A", note: "knob console deletes the 512px tower" },
  { icon: <SlidersHorizontal size={15} />, name: "Menus", from: "B", to: "A−", note: "zoom slider + context header; toolbar kept" },
];

/* ----------------------------------- app ------------------------------------ */

export default function App() {
  return (
    <div className="min-h-screen bg-[#0d0b09]">
      {/* nav */}
      <header className="sticky top-0 z-50 border-b border-[#221d16] bg-[#0d0b09]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-5 md:px-8">
          <a href="#top" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5b83d] text-[#14100a]">
              <FlaskConical size={16} />
            </span>
            <span className="text-[14px] font-bold tracking-tight text-stone-100">
              MaReader <span className="font-normal text-stone-400">Redesign Lab</span>
            </span>
          </a>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="rounded-md px-2.5 py-1.5 text-[12.5px] text-stone-400 hover:bg-white/6 hover:text-stone-100">
                {n.label}
              </a>
            ))}
          </nav>
          <a href="https://github.com/codewiththiha/mareader2" target="_blank" rel="noreferrer"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#2c2620] px-2.5 py-1.5 text-[12.5px] text-stone-300 hover:border-[#f5b83d]/50 hover:text-white lg:ml-2">
            <ArrowUpRight size={14} /> <span className="hidden sm:inline">mareader2</span>
          </a>
        </div>
      </header>

      {/* hero */}
      <div id="top" className="dotgrid border-b border-[#221d16]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#f5b83d]/30 bg-[#f5b83d]/8 px-3 py-1 font-mono text-[11px] text-[#f5b83d]">
              <Code2 size={12} /> read from source · crates/ui/src · egui
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1 font-mono text-[11px] text-emerald-300">
              <MousePointerClick size={12} /> every proposal below is interactive
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-stone-50 md:text-6xl">
            MaReader, <span className="text-[#f5b83d]">re-examined.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-400 md:text-[17px]">
            I cloned <span className="font-mono text-[14px] text-stone-300">mareader2</span>, read the UI crate — toast stack,
            read-aloud player, edge parking, anchored bubbles, dictionary card, appearance menu, view menu —
            and rebuilt every suggestion as a <span className="text-stone-200">working component</span>.
            No audit PDFs. Fire the toasts, drag cards to edges, turn the knobs.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <a href="#toasts" className="flex items-center gap-2 rounded-xl bg-[#f5b83d] px-4 py-2.5 text-[14px] font-semibold text-[#14100a] hover:bg-[#ffc95c]">
              Start with toasts <ArrowDown size={15} />
            </a>
            <a href="#verdict" className="flex items-center gap-2 rounded-xl border border-[#2c2620] px-4 py-2.5 text-[14px] font-medium text-stone-200 hover:border-stone-500">
              Skip to the verdict <MoveRight size={15} />
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {[
              ["6", "component systems rebuilt"],
              ["~11k", "lines of UI source read"],
              ["40+", "shipped constants cited"],
              ["0", "static mockups — all live"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl border border-[#2c2620] bg-[#16130f]/80 px-4 py-3">
                <div className="font-mono text-2xl font-semibold text-[#f5b83d]">{n}</div>
                <div className="mt-0.5 text-[12px] text-stone-400">{l}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-stone-500">
            Method, briefly: replicas honor the shipped constants (a 360px toast is 360px here too);
            redesigns keep the shipped physics (0.16s entrances, 0.26/0.34s park timings, hover grace)
            and change only what the critique justifies. Each section carries its file citations —
            hover any <span className="font-mono text-[12px]">CONST</span> chip to see where it lives.
          </p>
        </div>
      </div>

      {/* labs */}
      <Section id="toasts" index="01" kicker="toast.rs · card · stack" title="Toasts that know their place"
        lede="The shipped stack is well-engineered — measured-first cards, swipe exits, a keep-clear contract with menus. Its failures are spatial (bottom-right pileups) and legibility (a countdown you can't read). Both are fixed live below.">
        <ToastLab />
      </Section>

      <Section id="player" index="02" kicker="read_aloud · card · control" title="A player for every context"
        lede="The lyrics-stream card is the soul of the app and the Fit cascade is the right instinct — it just goes quiet when parts don't fit. Same engine, four bodies: card, bar, mini, and an edge rail. Narrow the dock and watch both versions cope.">
        <PlayerLab />
      </Section>

      <Section id="edge" index="03" kicker="park.rs · the “edged” state" title="Parking you can recognize"
        lede="Edge docking is a lovely idea with an anonymous face: a 20px sliver that could be anything. The physics stay — hide 0.26s, reveal 0.34s, 8px magnet — but the resting state becomes a labeled, stateful tab. Drag the cards; compare with the shipped sliver.">
        <EdgeParkLab />
      </Section>

      <Section id="dict" index="04" kicker="dict · card · bubble" title="A dictionary card that reads like content"
        lede="The anchored bubble is genuinely excellent — caret on the midline, side-flip, never covers the word. The card inside it deserves better: chips instead of a crowded header, one paging language instead of dots-plus-count, and the gloss at reading size.">
        <DictLab />
      </Section>

      <Section id="appearance" index="05" kicker="appearance_menu.rs · 948 lines" title="The appearance tower, condensed to a console"
        lede="Five fold groups and full-width slider rows turn six numbers into a 512px scroll. The redesign tabs the groups and dials the numbers with knobs — drag, scroll, or arrow-key them — while a hue ring restores the topology a slider flattens. Both panels drive the same live page.">
        <AppearanceLab />
      </Section>

      <Section id="menus" index="06" kicker="view_menu · selection · context" title="Menus with groups, targets, and verbs"
        lede="The view menu's groups are sound but tall; the zoom row quantizes taste; right-click deserves a first-class menu; and the selection bar's icon row is already fixed upstream — kept here, refined, and made clickable.">
        <MenuLab />
      </Section>

      {/* tokens */}
      <Section id="tokens" index="07" kicker="theme.rs · motion.rs · bridge" title="Token & motion bridge"
        lede="Nothing here invents a new brand. Every value maps onto a shipped token or timing — this is the translation table an implementer would pin to the wall. Hover any motion row to replay its exact curve.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel label="color + type — shipped token → lab value">
            <div className="divide-y divide-white/6">
              {TOKEN_ROWS.map((r) => (
                <div key={r.ship} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="h-7 w-7 shrink-0 rounded-lg border border-white/15" style={{ background: r.val.split(" / ")[0] }} />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[12px] text-stone-200">{r.ship} <span className="text-stone-500">→ {r.val}</span></div>
                    <div className="truncate text-[12px] text-stone-500">{r.use}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#2c2620] px-4 py-3">
              <p className="text-[12.5px] leading-relaxed text-stone-400">
                Type: <span className="text-stone-200">Inter</span> for chrome at 13/11.5px,{" "}
                <span className="font-serif text-[14px] text-stone-200">Newsreader</span> for reading surfaces,{" "}
                <span className="font-mono text-[12px] text-stone-200">JetBrains Mono</span> for counts and meters.
                Content outranks chrome by 15% — the audit's rule, applied everywhere.
              </p>
            </div>
          </Panel>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <CiteTag cite={SOURCES.bubble} />
              <CiteTag cite={SOURCES.park} />
            </div>
            {MOTION_ROWS.map((r) => (
              <MotionRow key={r.name} row={r} />
            ))}
            <p className="px-1 font-mono text-[11px] leading-relaxed text-stone-500">
              all curves: cubic ease-out · all honors reduced-motion by collapsing to 0s (motion::secs)
            </p>
          </div>
        </div>
      </Section>

      {/* verdict */}
      <Section id="verdict" index="08" kicker="scorecard · ship order" title="The verdict: sharp bones, soft surfaces"
        lede="MaReader's UI engineering is unusually careful — measured layouts, anchored bubbles, physics with taste. The critique is never 'rewrite it'; it's 'finish it'. Here's the scorecard and the order I'd ship.">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SCORES.map((s) => (
            <div key={s.name} className="rounded-xl border border-[#2c2620] bg-[#16130f] p-4">
              <div className="flex items-center gap-2 text-stone-200">
                <span className="text-[#f5b83d]">{s.icon}</span>
                <span className="text-[14px] font-semibold">{s.name}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 font-mono">
                <span className="rounded bg-stone-700/60 px-2 py-0.5 text-[13px] text-stone-300 line-through">{s.from}</span>
                <MoveRight size={13} className="text-stone-500" />
                <span className="rounded bg-[#f5b83d] px-2 py-0.5 text-[13px] font-bold text-[#14100a]">{s.to}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-stone-400">{s.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel label="ship order — impact per line of rust">
            <ol className="space-y-2.5 p-4">
              {[
                ["Labeled edge tabs", "park.rs + call sites", "the only true discoverability bug; tabs reuse Bubble-adjacent styling"],
                ["Toast lane + meter", "toast.rs, toast/card.rs", "§10.1 made structural; hairline replaces the feather mesh"],
                ["Player overflow dot", "read_aloud/control.rs", "smallest diff here: route Fit losers into “more” with a badge"],
                ["Knob console (tabbed)", "appearance_menu.rs", "biggest win, biggest diff; ship tabs first, knobs second"],
                ["Dict tabs + chips", "dict/card.rs", "pure layout; paging model untouched"],
                ["View menu zoom slider", "view_menu.rs", "one row swapped; steppers stay as coarse jumps"],
              ].map(([t, f, w], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5b83d]/15 font-mono text-[12px] font-semibold text-[#f5b83d]">{i + 1}</span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-stone-100">{t} <span className="font-mono text-[11px] font-normal text-stone-500">· {f}</span></div>
                    <div className="text-[12.5px] text-stone-400">{w}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
          <div className="space-y-3">
            <Panel label="files read — the receipts">
              <ul className="space-y-1.5 p-4">
                {FILES_READ.map((f) => (
                  <li key={f} className="flex items-center gap-2 font-mono text-[12px] text-stone-300">
                    <FileCode2 size={13} className="shrink-0 text-stone-500" /> {f}
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#2c2620] px-4 py-3">
                <p className="text-[12.5px] leading-relaxed text-stone-400">
                  Plus <span className="font-mono text-[12px] text-stone-300">docs/ux-audit.md</span> (the repo's own §1–§10 audit, mostly fixed upstream —
                  this lab starts where it stops) and the <span className="font-mono text-[12px] text-stone-300">shot.rs</span> harness
                  to understand how behaviors were verified.
                </p>
              </div>
            </Panel>
            <Warn>
              <span className="font-semibold text-rose-300">Honesty box:</span> replicas match shipped <em>constants and behaviors</em>,
              re-skinned in web tech — pixel-parity with egui was never the goal. Timings, widths, counts, and state machines are the
              contract; paint is approximate. Where the source was ambiguous, the kinder interpretation was built.
            </Warn>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#f5b83d]/25 bg-[#f5b83d]/5 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5b83d] text-[#14100a]"><Check size={17} /></span>
            <div>
              <h3 className="text-[16px] font-bold text-stone-100">Bottom line</h3>
              <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-stone-300">
                If this lab could only ship one screen, it would be the <a href="#edge" className="text-[#f5b83d] underline decoration-[#f5b83d]/40 underline-offset-2">edge tabs</a> —
                the single change that turns a hidden feature into a visible system. Everything else is polish on already-good bones:
                lanes, meters, knobs, and tabs that respect the physics the codebase so carefully built. The highest compliment this
                critique can pay: <span className="text-stone-100">almost nothing here needed inventing — only finishing.</span>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* footer */}
      <footer className="border-t border-[#221d16]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-[12.5px] text-stone-500 md:flex-row md:items-center md:px-8">
          <span className={cn("flex items-center gap-2")}>
            <FlaskConical size={14} className="text-[#f5b83d]" />
            MaReader Redesign Lab — built from source, not screenshots.
          </span>
          <span className="md:ml-auto">
            Upstream:{" "}
            <a href="https://github.com/codewiththiha/mareader2" target="_blank" rel="noreferrer" className="text-stone-300 underline decoration-stone-600 underline-offset-2 hover:text-white">
              github.com/codewiththiha/mareader2
            </a>{" "}
            (MIT)
          </span>
        </div>
      </footer>
    </div>
  );
}
