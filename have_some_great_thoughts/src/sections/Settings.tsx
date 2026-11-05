import { useEffect, useState, type ReactNode } from "react";
import {
  Brush,
  ChevronDown,
  Download,
  Check,
  Cpu,
  Headphones,
  Highlighter,
  LayoutPanelLeft,
  Search,
  Sparkles,
  BookA,
  BarChart3,
  Wind,
  Columns2,
  X,
  Languages,
  LayoutGrid,
} from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { Chip, IconButton, Ring } from "../ui/kit";
import { cn } from "../utils/cn";

/* ═════════ voice engines — from the README's local-voice-settings.jpg ═════════ */
type Engine = { id: string; name: string; sub: string; size: number; variants?: { id: string; size: number }[]; builtIn?: boolean };
const ENGINES: Engine[] = [
  { id: "system", name: "System voices", sub: "Built into your system", size: 0, builtIn: true },
  { id: "kokoro", name: "Kokoro", sub: "7 languages · 49 voices", size: 347.9, variants: [{ id: "Full", size: 347.9 }, { id: "Light", size: 98.4 }] },
  { id: "piper", name: "Piper", sub: "English · 8 voices", size: 83.7 },
  { id: "kitten", name: "Kitten", sub: "English · 8 voices", size: 92.2, variants: [{ id: "Mini", size: 92.2 }, { id: "Nano", size: 24.6 }] },
  { id: "phonon", name: "Phonon", sub: "English · 26 voices", size: 65.1 },
];

function Radio({ on }: { on: boolean }) {
  return (
    <span className={cn("grid size-[22px] place-items-center rounded-full border-2", on ? "border-accent" : "border-line")}>
      {on && <span className="size-2.5 rounded-full bg-accent" />}
    </span>
  );
}

export function TodayEngines() {
  const [v, setV] = useState({ kokoro: "Full", kitten: "Mini" } as Record<string, string>);
  return (
    <div className="w-full max-w-[540px]">
      <div className="mb-2 text-[13px] text-muted">Engine</div>
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        {ENGINES.map((e, i) => (
          <div key={e.id} className={cn("flex min-h-[53px] items-center gap-3 px-3.5 py-2", i > 0 && "border-t border-line")}>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[16px]">{e.name}</div>
              <div className="text-[14px] text-muted">{e.sub}</div>
            </div>
            {e.variants && (
              <button className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[15px] hover:bg-hover" onClick={() => setV({ ...v, [e.id]: e.variants![(e.variants!.findIndex((x) => x.id === v[e.id]) + 1) % e.variants!.length].id })}>
                {v[e.id]}
                <ChevronDown size={14} />
              </button>
            )}
            {e.builtIn ? (
              <Radio on />
            ) : (
              <>
                <span className="w-[72px] text-right text-[14px] tabular-nums text-muted">{(e.variants?.find((x) => x.id === v[e.id])?.size ?? e.size).toFixed(1)} MB</span>
                <IconButton icon={Download} label={`Download ${e.name}`} size="md" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type St = { state: "none" | "downloading" | "installed"; p: number };
export function ProposedEngines() {
  const [active, setActive] = useState("system");
  const [v, setV] = useState({ kokoro: "Full", kitten: "Mini" } as Record<string, string>);
  const [st, setSt] = useState<Record<string, St>>({ system: { state: "installed", p: 1 } });
  useEffect(() => {
    const i = setInterval(() => {
      setSt((s) => {
        let ch = false;
        const n = { ...s };
        for (const k of Object.keys(n)) {
          if (n[k].state === "downloading") {
            ch = true;
            const p = Math.min(1, n[k].p + 0.05 + Math.random() * 0.05);
            n[k] = p >= 1 ? { state: "installed", p: 1 } : { state: "downloading", p };
          }
        }
        return ch ? n : s;
      });
    }, 160);
    return () => clearInterval(i);
  }, []);
  const get = (id: string): St => st[id] ?? { state: "none", p: 0 };
  return (
    <div className="w-full max-w-[540px]">
      <div className="mb-2 flex items-baseline justify-between"><span className="text-[13px] text-muted">Engine</span><span className="text-[12px] text-muted">Active: {ENGINES.find((e) => e.id === active)?.name}</span></div>
      <div role="radiogroup" aria-label="Read-aloud engine" className="flex flex-col gap-2">
        {ENGINES.map((e) => {
          const s = get(e.id);
          const on = active === e.id;
          const size = e.variants?.find((x) => x.id === v[e.id])?.size ?? e.size;
          const usable = s.state === "installed";
          return (
            <div
              key={e.id}
              role="radio"
              aria-checked={on}
              aria-disabled={!usable}
              tabIndex={0}
              onClick={() => usable && setActive(e.id)}
              onKeyDown={(k) => (k.key === " " || k.key === "Enter") && usable && setActive(e.id)}
              className={cn("flex min-h-[56px] items-center gap-3 rounded-xl border px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50", on ? "border-accent/60 bg-accent-soft/60" : "border-line bg-card", usable ? "cursor-pointer hover:border-accent/40" : "cursor-default")}
            >
              <span className={cn(!usable && "opacity-35")}><Radio on={on} /></span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2 text-[15px] font-medium">
                  {e.name}
                  {e.builtIn ? <Chip tone="muted">Built in</Chip> : s.state === "installed" ? <Chip tone="ok"><Check size={11} />Installed</Chip> : null}
                </div>
                <div className="text-[13px] text-muted">{e.sub}</div>
              </div>
              {e.variants && s.state !== "installed" && (
                <div className="flex rounded-md border border-line p-0.5" onClick={(x) => x.stopPropagation()}>
                  {e.variants.map((x) => (
                    <button key={x.id} aria-pressed={v[e.id] === x.id} onClick={() => setV({ ...v, [e.id]: x.id })} className={cn("h-6 rounded px-2 text-[12.5px]", v[e.id] === x.id ? "bg-accent-soft text-accent" : "text-muted hover:bg-hover")}>{x.id}</button>
                  ))}
                </div>
              )}
              {!e.builtIn && (
                <div className="flex w-[116px] items-center justify-end gap-2" onClick={(x) => x.stopPropagation()}>
                  <span className="text-[13px] tabular-nums text-muted">{s.state === "downloading" ? `${Math.round(s.p * 100)}%` : `${size.toFixed(1)} MB`}</span>
                  {s.state === "none" && <button aria-label={`Download ${e.name}`} onClick={() => setSt({ ...st, [e.id]: { state: "downloading", p: 0.02 } })} className="grid size-8 place-items-center rounded-full border border-line hover:border-accent hover:bg-accent-soft hover:text-accent"><Download size={15} /></button>}
                  {s.state === "downloading" && <Ring value={s.p} size={32} stroke={2.5}><button aria-label="Cancel download" onClick={() => setSt({ ...st, [e.id]: { state: "none", p: 0 } })} className="grid size-6 place-items-center rounded-full hover:bg-hover"><X size={12} /></button></Ring>}
                  {s.state === "installed" && <span className="size-8" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═════════ settings navigation (settings_window.rs tabs) ═════════ */
const NAV: { group: string; items: { id: string; label: string; icon: typeof Brush; kw: string }[] }[] = [
  { group: "Reading", items: [
    { id: "appearance", label: "Appearance", icon: Brush, kw: "theme colour tint texture grain dark mode font size" },
    { id: "layout", label: "Layout", icon: LayoutPanelLeft, kw: "spread page scroll zoom fit margins column" },
    { id: "aloud", label: "Read aloud", icon: Headphones, kw: "voice speed engine kokoro piper download narrate tts" },
  ] },
  { group: "Study", items: [
    { id: "highlights", label: "Highlights", icon: Highlighter, kw: "pen colour underline selection bar notes" },
    { id: "vocab", label: "Vocabulary", icon: BarChart3, kw: "cefr level words saved a1 b2" },
    { id: "dict", label: "Dictionary", icon: BookA, kw: "language translate pack lookup" },
    { id: "ai", label: "AI", icon: Sparkles, kw: "assistant tasks summarize explain" },
  ] },
  { group: "App", items: [
    { id: "models", label: "AI models", icon: Cpu, kw: "openai provider key api model endpoint" },
    { id: "panes", label: "Panes", icon: Columns2, kw: "split gap corners shadow outline" },
    { id: "motion", label: "Motion", icon: Wind, kw: "animation reduce transitions" },
  ] },
];

function TodayNav({ sel, setSel }: { sel: string; setSel: (s: string) => void }) {
  return (
    <nav className="w-[226px] shrink-0 overflow-y-auto border-r border-line p-3">
      {NAV.map((g) => (
        <div key={g.group} className="mb-3">
          <div className="px-3 py-1.5 text-[13px] text-muted">{g.group}</div>
          {g.items.map((it) => (
            <button key={it.id} onClick={() => setSel(it.id)} className={cn("flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px]", sel === it.id ? "bg-accent-soft" : "hover:bg-hover")}>
              <it.icon size={17} strokeWidth={1.6} />{it.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

function ProposedNav({ sel, setSel }: { sel: string; setSel: (s: string) => void }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const hit = (it: (typeof NAV)[number]["items"][number]) => !needle || it.label.toLowerCase().includes(needle) || it.kw.includes(needle);
  const groups = NAV.map((g) => ({ ...g, items: g.items.filter(hit) })).filter((g) => g.items.length);
  return (
    <nav className="flex w-[226px] shrink-0 flex-col overflow-y-auto border-r border-line p-3">
      <label className="mb-2 flex h-8 items-center gap-2 rounded-lg border border-line bg-paper/60 px-2.5 text-[14px] focus-within:border-accent">
        <Search size={14} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search settings" aria-label="Search settings" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" />
        {q && <button aria-label="Clear" onClick={() => setQ("")} className="text-muted hover:text-ink"><X size={13} /></button>}
      </label>
      <div>
        {groups.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-1 px-3 text-center">
            <Search size={20} className="text-muted" />
            <div className="text-[14px] font-medium">Nothing matches “{q}”</div>
            <div className="text-[12px] text-muted">Try “voice”, “colour” or “key”.</div>
          </div>
        )}
        {groups.map((g) => (
          <div key={g.group} className="mb-2">
            {!needle && <div className="px-3 py-1 text-[12px] text-muted">{g.group}</div>}
            {g.items.map((it) => {
              const viaKeyword = needle && !it.label.toLowerCase().includes(needle);
              return (
                <button key={it.id} onClick={() => setSel(it.id)} className={cn("flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px]", sel === it.id ? "bg-accent-soft text-accent" : "hover:bg-hover")}>
                  <it.icon size={17} strokeWidth={1.6} />
                  <span className="flex-1">{it.label}</span>
                  {viaKeyword && <span className="text-[11px] text-muted">has “{needle}”</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}

function Shell({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-[470px] w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_24px_var(--shadow)]">
      {nav}
      <div className="min-w-0 flex-1 overflow-auto p-5">{children}</div>
    </div>
  );
}

export default function SettingsSection() {
  const [s1, setS1] = useState("aloud");
  const [s2, setS2] = useState("aloud");
  return (
    <Block
      id="settings"
      n="08"
      title="Settings window"
      verdict="tweak"
      source="settings_window.rs · settings_window/voice_model.rs · settings_window/models.rs"
      lead="The shell is good: left rail, grouped, rows with label-left / control-right, and cards that take their tint from the page. Two things bite as it grows: eleven tabs with no search, and the voice-engine list, where every row looks identical whether it's installed, downloading, or the one in use."
      notes={[
        { kind: "ok", text: "Keep: the AI-models accordion (task chips on the collapsed header are great), the “Shows once the AI service runs” hints, and Delete in the danger colour." },
        { kind: "idea", text: "Engines get a state you can read: radio for the active engine, an Installed chip, a ring while downloading, and a visible Full / Light switch where today a dropdown hides its options. Download progress belongs in the row (and, from the previous section, in a toast)." },
        { kind: "idea", text: "Settings search matches keywords, not only titles (“speed” finds Read aloud). It shows why it matched." },
        { kind: "warn", text: "Variants other than the ones in the README screenshot (Kokoro Light, Kitten Nano) and their sizes are sample data — I didn't find the real option list." },
      ]}
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <Specimen kind="today" title="Read-aloud engine" caption="from local-voice-settings.jpg" bodyClassName="p-5">
          <TodayEngines />
        </Specimen>
        <Specimen kind="proposed" title="Read-aloud engine" caption="state, progress and variants in the row · try Download" bodyClassName="p-5">
          <ProposedEngines />
        </Specimen>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <Specimen kind="today" title="Navigation" bodyClassName="p-4">
          <Shell nav={<TodayNav sel={s1} setSel={setS1} />}>
            <div className="text-[20px]">{NAV.flatMap((g) => g.items).find((i) => i.id === s1)?.label}</div>
            <div className="mt-2 text-[13px] text-muted">11 tabs, found by scanning.</div>
          </Shell>
        </Specimen>
        <Specimen kind="proposed" title="Navigation with search" caption="try “voice”, “key”, “grain”" bodyClassName="p-4">
          <Shell nav={<ProposedNav sel={s2} setSel={setS2} />}>
            <div className="text-[20px]">{NAV.flatMap((g) => g.items).find((i) => i.id === s2)?.label}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] text-muted"><Languages size={14} /><LayoutGrid size={14} />Search jumps here.</div>
          </Shell>
        </Specimen>
      </div>
    </Block>
  );
}
