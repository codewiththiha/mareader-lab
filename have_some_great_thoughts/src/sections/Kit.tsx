import { useState } from "react";
import { Circle, Columns2, Moon, Square, Sun, Volume2, Settings, X, Bookmark } from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { Chip, Eq, IconButton, Kbd, Range, Ring, Segmented, Switch, Tip } from "../ui/kit";
import { Knob } from "../ui/Knob";
import { Cefr } from "./Dictionary";

const TOKENS: [string, string, string][] = [
  ["paper", "var(--paper)", "page, panes, dictionary window"],
  ["surface", "var(--surface)", "chrome, title bar, popovers, toasts"],
  ["card", "var(--card)", "settings groups"],
  ["line", "var(--line)", "rules, hover fill"],
  ["accent-soft", "var(--accent-soft)", "selection wash"],
  ["accent", "var(--accent)", "selection, toggles, play"],
  ["ink", "var(--ink)", "text, icons"],
  ["muted", "var(--muted)", "secondary text"],
  ["danger", "var(--danger)", "errors, remove"],
];

export default function KitSection() {
  const [a, setA] = useState(62);
  const [b, setB] = useState(180);
  const [c, setC] = useState(1.5);
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState("two");
  const [r, setR] = useState(40);
  return (
    <Block
      id="kit"
      n="10"
      title="The kit"
      source="theme.rs · widgets.rs · crates/appearance/src/tokens.rs"
      lead="Everything above is built from these. The tokens are the real seven from tokens.rs (plus the derived card, hover, track); the primitives follow widgets.rs — 36 pt toolbar buttons, 36 × 20 switch, 24 pt segmented track, 12 pt radius surfaces. New: the knob, the ring, and the CEFR meter. Switch the look at the top of the page to see all of it re-tint."
    >
      <Specimen kind="today" title="Tokens" caption="current look" bodyClassName="p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TOKENS.map(([n, v, use]) => (
            <div key={n} className="flex flex-col gap-1.5">
              <div className="h-12 rounded-lg border border-line" style={{ background: v }} />
              <div className="text-[13px] font-medium leading-none">{n}</div>
              <div className="text-[11.5px] leading-tight text-muted">{use}</div>
            </div>
          ))}
        </div>
      </Specimen>
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="proposed" title="Knob" caption="drag · wheel · arrows · double-click resets" bodyClassName="p-5">
          <div className="flex flex-wrap items-start gap-4">
            <Knob label="Strength" value={a} def={50} format={(v) => `${v}%`} onChange={setA} />
            <Knob label="Hue" value={b} min={0} max={360} step={1} def={40} format={(v) => `${v}°`} onChange={setB} track="#e26d5c, #e0b94c, #7bc86c, #55c1c9, #5b7de0, #b86be0, #e26d5c" />
            <Knob label="Lines" value={c} min={1} max={2.4} step={0.1} def={1.5} format={(v) => `${v.toFixed(1)}×`} onChange={setC} />
            <Knob label="Disabled" value={30} disabled onChange={() => {}} />
            <Knob label="Large" value={a} size={76} def={50} format={(v) => `${v}%`} onChange={setA} />
          </div>
          <p className="mt-4 max-w-md text-[12.5px] leading-relaxed text-muted">Use for 3–4 related 0–100 values in a small panel. Don't use for: seek, page position, anything with units people type, or one-off settings in the Settings window (rows with a slider and a readout are clearer there).</p>
        </Specimen>
        <Specimen kind="today" title="Controls" caption="widgets.rs" bodyClassName="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1">
              <IconButton icon={Settings} label="Settings" keys="Ctrl+," /><IconButton icon={Volume2} label="Say" active /><IconButton icon={Bookmark} label="Bookmark" /><IconButton icon={X} label="Close" size="sm" />
              <IconButton icon={Volume2} label="Round 32" size="md" round />
              <span className="ml-3 text-[12px] text-muted">36 · 36 active · 26 · round 32</span>
            </div>
            <div className="flex items-center gap-4"><Switch on={on} onChange={setOn} label="Switch" /><span className="text-[13px] text-muted">{on ? "On" : "Off"}</span></div>
            <Segmented items={[{ value: "single", icon: Square, label: "Single" }, { value: "two", icon: Columns2, label: "Two" }]} value={seg} onChange={setSeg} className="w-60" />
            <Segmented iconOnly items={[{ value: "l", icon: Sun, tip: "Light" }, { value: "d", icon: Moon, tip: "Dark" }, { value: "k", icon: Circle, tip: "Black" }]} value="d" onChange={() => {}} className="w-40" />
            <div className="w-60"><Range label="Demo" value={r} min={0} max={100} onChange={setR} /></div>
          </div>
        </Specimen>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen kind="proposed" title="Ring · Equalizer · CEFR" bodyClassName="p-5">
          <div className="flex flex-wrap items-center gap-6">
            <Ring value={0.65} size={44}><span className="text-[11px] tabular-nums">65</span></Ring>
            <Ring value={0.3} size={20} stroke={2.5} />
            <Eq playing /><Eq playing={false} />
            <div className="flex flex-wrap gap-1.5">{["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => <Cefr key={l} level={l} />)}</div>
          </div>
        </Specimen>
        <Specimen kind="today" title="Chips · keys · tooltip" bodyClassName="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="soft">AI Dictionary</Chip><Chip tone="muted">English → French</Chip><Chip tone="outline">+3</Chip><Chip tone="ok">Installed</Chip><Chip tone="danger">Failed</Chip><Chip tone="accent">6%</Chip>
            <Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>U</Kbd>
            <Tip label="Read aloud" keys="Ctrl+Shift+U"><span className="rounded-md border border-dashed border-line px-2 py-1 text-[12px] text-muted">hover me</span></Tip>
          </div>
        </Specimen>
      </div>
    </Block>
  );
}
