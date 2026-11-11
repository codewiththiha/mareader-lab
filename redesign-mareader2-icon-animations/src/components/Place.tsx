import { useState, type ReactNode } from "react";
import { measure, rustEasings, rustPack } from "../engine/rust";
import { IconButton, useIcon, useLab, useTrigger } from "../lab";
import { cn } from "../utils/cn";
import { Section } from "./Intro";

function Divider() {
  return <span className="mx-1 h-5 w-px flex-none bg-line" aria-hidden="true" />;
}

/** A menu row: `Act::Hover`, because the menu may be gone once it is answered. */
function MenuRow({ id, label, shipped }: { id: string; label: string; shipped: boolean }) {
  const { node, play } = useIcon({ id, size: 18, shipped });
  const { handlers, press } = useTrigger(play, 0, "Hover");
  return (
    <button
      type="button"
      {...handlers}
      onClick={press}
      className="focusable flex h-9 w-full items-center gap-3 rounded-[8px] px-2.5 text-left text-[13.5px] text-ink transition-colors hover:bg-line"
    >
      {node}
      <span className="truncate">{label}</span>
    </button>
  );
}

const MENU: [string, string][] = [
  ["folder-open", "Open…"],
  ["book-plus", "Import a book"],
  ["refresh-cw", "Rescan folders"],
  ["pencil", "Rename"],
  ["copy", "Copy path"],
  ["scroll-text", "Summarize"],
  ["languages", "Translate"],
  ["feather", "Simplify"],
  ["trash-2", "Remove"],
];

export function InPlace() {
  const [shipped, setShipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const tb = (id: string, label: string, extra?: Partial<Parameters<typeof IconButton>[0]>) => (
    <IconButton key={id} id={id} size={18} act="Click" shipped={shipped} label={label} {...extra} />
  );

  return (
    <Section
      id="in-place"
      n="04 — In place"
      title="At 18 points, where they live."
      lead="A sketch of the reader's chrome with the app's own metrics: a 48 pt title bar, 36 pt buttons, 18 pt glyphs. The title bar and the bars over the page answer a press; the menu moves as each row is reached. Swap the whole window between the two sets."
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5"
          role="group"
          aria-label="Icon set"
        >
          {[
            ["Quill", false],
            ["Shipped", true],
          ].map(([label, value]) => (
            <button
              key={String(label)}
              type="button"
              aria-pressed={shipped === value}
              onClick={() => setShipped(value as boolean)}
              className={cn(
                "focusable h-8 rounded-full px-3.5 text-[12.5px] transition-colors",
                shipped === value ? "bg-ink text-paper" : "text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[12.5px] text-muted">
          {shipped
            ? "Lucide 1.34.0 packs, played as lib.rs plays them."
            : "The redesign, under the current feel."}
        </span>
      </div>

      <div
        className="overflow-hidden rounded-[14px] border border-line bg-paper"
        style={{ boxShadow: "var(--shadow)" }}
      >
        {/* Title bar: 48 pt, surface. */}
        <div className="thin-scroll flex h-12 items-center gap-1 overflow-x-auto border-b border-line bg-surface px-3">
          <span className="mr-2 flex flex-none gap-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <i key={i} className="h-3 w-3 rounded-full bg-line" />
            ))}
          </span>
          {tb(sidebar ? "panel-left-close" : "panel-left", "Toggle sidebar", {
            onPress: () => setSidebar((s) => !s),
          })}
          {tb("layout-grid", "Thumbnails")}
          {tb("list-tree", "Outline")}
          {tb("book-a", "Dictionary")}
          <Divider />
          {tb("zoom-out", "Zoom out")}
          {tb("zoom-in", "Zoom in")}
          {tb("move-horizontal", "Fit width")}
          {tb("shrink", "Fit page")}
          <span className="mx-auto hidden truncate px-4 text-[13px] text-muted lg:block">
            Pride and Prejudice
          </span>
          <span className="ml-auto flex flex-none items-center gap-1 lg:ml-0">
            {tb("search", "Find")}
            {tb("palette", "Appearance")}
            {tb("columns-2", "Split right")}
            {tb("pin", "Pin title bar")}
            {tb("settings", "Settings")}
          </span>
        </div>

        <div className="flex min-h-[380px]">
          {sidebar && (
            <div className="hidden w-[232px] flex-none border-r border-line bg-surface p-2 sm:block">
              <div className="eyebrow px-2.5 pb-2 pt-1.5 !text-[9.5px]">Library</div>
              {MENU.map(([id, label]) => (
                <MenuRow key={id} id={id} label={label} shipped={shipped} />
              ))}
            </div>
          )}

          <div className="relative min-w-0 flex-1 px-6 pb-24 pt-10 sm:px-12">
            <div className="mx-auto max-w-[52ch] font-display text-[18px] leading-[1.7] text-ink">
              <div className="eyebrow mb-5 text-center">Chapter 1</div>
              <p>
                It is a truth universally acknowledged, that a single man in possession of a
                good fortune, must be in want of a wife.
              </p>
              <div className="mb-2 mt-6 flex">
                <div
                  className="flex items-center gap-0.5 rounded-[10px] border border-line bg-paper p-1 font-sans"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  {tb("highlighter", "Highlight")}
                  {tb("baseline", "Half highlight")}
                  {tb("underline", "Underline")}
                  {tb("sticky-note", "Add a note")}
                  <Divider />
                  {tb("book-search", "Look up")}
                  {tb("volume-2", "Say aloud")}
                  {tb("ai-mark", "Ask the AI")}
                </div>
              </div>
              <p>
                However little known the feelings or views of such a man may be on his first
                entering a neighbourhood,{" "}
                <mark className="rounded-[3px] bg-accent-soft px-0.5 text-ink">
                  this truth is so well fixed in the minds
                </mark>{" "}
                of the surrounding families, that he is considered as the rightful property of
                some one or other of their daughters.
              </p>
            </div>

            {/* The read-aloud bar. */}
            <div className="absolute inset-x-0 bottom-5 flex justify-center px-3">
              <div
                className="flex items-center gap-0.5 rounded-full border border-line bg-paper p-1 font-sans"
                style={{ boxShadow: "var(--shadow)" }}
              >
                {tb("headphones", "Read aloud")}
                <Divider />
                {tb("skip-back", "Previous sentence")}
                {tb(playing ? "pause" : "play", playing ? "Pause" : "Play", {
                  onPress: () => setPlaying((p) => !p),
                })}
                {tb("skip-forward", "Next sentence")}
                {tb("circle-stop", "Stop")}
                <Divider />
                {tb("repeat", "Continuous")}
                {tb("audio-waveform", "Voice")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-5">
      <h3 className="font-display text-[23px]">{title}</h3>
      <div className="mt-3 space-y-2.5 text-[14px] leading-[1.6] text-muted [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-ink">
        {children}
      </div>
    </div>
  );
}

export function Port() {
  const { feel, packs, defs } = useLab();
  const [note, setNote] = useState("");
  const table = rustEasings(feel);

  const download = () => {
    const body = defs
      .map((d) => {
        const pack = packs.get(d.id);
        return pack ? rustPack(pack, d.say, measure(pack)) : "";
      })
      .join("\n\n");
    const all = defs.map((d) => `    &${d.id.toUpperCase().replace(/-/g, "_")},`).join("\n");
    const file = `//! Build-only animated icon declarations: the Quill set.\n\nuse super::{Hole, Pack, Part, Prop, Seg};\n\n${table}\n\n${body}\n\n/// Every declaration, in generator order.\npub(crate) const ALL: [&Pack; ${defs.length}] = [\n${all}\n];\n`;
    const url = URL.createObjectURL(new Blob([file], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "source.rs";
    a.click();
    URL.revokeObjectURL(url);
    setNote(`source.rs written: ${defs.length} packs under the current feel.`);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(table);
      setNote("Easing table copied.");
    } catch {
      setNote("Copy was blocked; select the code below instead.");
    }
  };

  return (
    <Section
      id="port"
      n="05 — The port"
      title="Moving it into the crate."
      lead="The redesign is data. It is written in the crate's own vocabulary and evaluated here by a port of its own functions, so the Rust side has one small thing to learn and nothing to unlearn."
    >
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
        <Card title="What stays">
          <p>
            <code>Pack</code>, <code>Part</code>, <code>Seg</code> and all twelve{" "}
            <code>Prop</code>s. The 24-unit grid, the 8.5-unit pad, 60 Hz samples, the part
            atlas and both caches.
          </p>
          <p>
            <code>Act</code>, <code>announce</code> and the queued replay in{" "}
            <code>icons/anim.rs</code>. This page follows the same policy.
          </p>
        </Card>
        <Card title="What changes">
          <p>
            <code>EASINGS</code> becomes an enum with one new variant,{" "}
            <code>Spring(zeta)</code>, and <code>at</code> gains one match arm.
          </p>
          <p>
            <code>source.rs</code> is replaced by the declarations exported here. The six voice
            marks become packs, so <code>Icon::svg</code> is left serving provider logos only.
          </p>
        </Card>
        <Card title="What to keep as tests">
          <p>
            One segment per part and property. First key at rest; last key at rest or on a
            declared symmetric turn. A drawn part is exactly one stroke. A ghost's opacity
            starts and ends at zero. Under 0.9 s.
          </p>
          <p>These run on every pack each time a number above changes.</p>
        </Card>
      </div>

      <div className="mt-10 rounded-[16px] border border-line bg-raise p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="eyebrow mr-auto">Easings under the current feel</div>
          <button
            type="button"
            onClick={copy}
            className="focusable h-9 rounded-full border border-line px-4 text-[13px] text-ink hover:bg-paper"
          >
            Copy table
          </button>
          <button
            type="button"
            onClick={download}
            className="focusable h-9 rounded-full bg-ink px-4 text-[13px] font-medium text-paper transition-transform duration-150 active:scale-[0.97]"
          >
            Download source.rs
          </button>
        </div>
        <p className="mt-2 min-h-[18px] text-[12.5px] text-accent" role="status">
          {note}
        </p>
        <pre className="code thin-scroll mt-2 max-h-[420px] overflow-auto rounded-[12px] border border-line bg-sunk p-4 text-muted">
          {table}
        </pre>
        <p className="mt-4 max-w-[78ch] text-[13px] leading-[1.6] text-muted">
          Not verified here: the exported file has not been compiled against the crate. The
          markup uses only <code className="code text-ink">g</code> and{" "}
          <code className="code text-ink">path</code>, which{" "}
          <code className="code text-ink">build.rs</code> accepts, but run{" "}
          <code className="code text-ink">cargo test -p mareader-animated-icons</code> before
          relying on it.
        </p>
      </div>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1180px] px-5 pb-32 pt-6 sm:px-8">
      <div className="border-t border-line pt-6 text-[12.5px] leading-[1.6] text-muted">
        <p className="max-w-[80ch]">
          Shipped glyphs shown for comparison are Lucide 1.34.0 (ISC), as bundled in
          mareader2 and parsed from <code className="code">crates/animated-icons/src/source.rs</code>.
          Provider logos are left alone. The Quill geometry, choreography and formula on this
          page are new work for the project.
        </p>
      </div>
    </footer>
  );
}
