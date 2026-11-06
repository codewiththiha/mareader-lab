import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Download, Search, SlidersHorizontal, X } from "lucide-react";
import { ALL, CAT_LABEL, VERDICT_LABEL, type Cat, type Entry, type Verdict } from "../data/registry";
import { IconView, copyText, downloadSvg, serializeFromNode, useReveal } from "../lib/kit";

const VERDICT_COLOR: Record<Verdict, string> = {
  keep: "#8fb75f",
  redraw: "#e0653a",
  bespoke: "#8b95f2",
  engine: "#45b3a0",
};

const FILTERS: { id: Verdict | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "engine", label: "New engines" },
  { id: "redraw", label: "Redrawn" },
  { id: "keep", label: "Kept" },
  { id: "bespoke", label: "Bespoke" },
];

export function Ledger({ notify, openLab }: { notify: (m: string) => void; openLab: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [verdict, setVerdict] = useState<Verdict | "all">("all");
  const [cat, setCat] = useState<Cat | "all">("all");
  const [sort, setSort] = useState<"registry" | "az" | "verdict">("registry");
  const [tile, setTile] = useState(26);
  const [openId, setOpenId] = useState<string | null>(null);
  const { ref, seen } = useReveal();

  const filtered = useMemo(() => {
    let list = ALL.filter((e) => {
      if (verdict !== "all" && e.verdict !== verdict) return false;
      if (cat !== "all" && e.cat !== cat) return false;
      if (q) {
        const hay = `${e.label} ${e.glyph} ${e.where}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    if (sort === "az") list = [...list].sort((a, b) => a.label.localeCompare(b.label));
    if (sort === "verdict") {
      const order: Verdict[] = ["engine", "redraw", "bespoke", "keep"];
      list = [...list].sort((a, b) => order.indexOf(a.verdict) - order.indexOf(b.verdict));
    }
    return list;
  }, [q, verdict, cat, sort]);

  const open = openId ? ALL.find((e) => e.id === openId) ?? null : null;
  const openIdx = open ? filtered.findIndex((e) => e.id === open.id) : -1;

  const step = (d: number) => {
    if (openIdx < 0 || filtered.length === 0) return;
    const next = filtered[(openIdx + d + filtered.length) % filtered.length];
    setOpenId(next.id);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpenId(null);
      if (ev.key === "ArrowRight") step(1);
      if (ev.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, openIdx, filtered.length]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: ALL.length };
    ALL.forEach((e) => { c[e.verdict] = (c[e.verdict] ?? 0) + 1; });
    return c;
  }, []);

  return (
    <section id="ledger" className="relative scroll-mt-14 bg-paper text-ink">
      {/* torn-paper edge */}
      <div className="h-3 w-full bg-[repeating-linear-gradient(90deg,#16130e_0_14px,transparent_14px_22px)] opacity-20" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div ref={ref} className={`reveal ${seen ? "seen" : ""} max-w-3xl`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#8a6b2f]">the full ledger</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            All {ALL.length} marks, <em className="font-light italic text-[#b0521f]">accounted for.</em>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-ink/75">
            Every variant of <code className="rounded bg-ink/8 px-1.5 py-0.5 font-mono text-[13px]">Icon</code> in
            the app, plus the six new engine marks. Redrawn entries show their new glyph here — open any
            tile for the verdict, the critique, and the SVG itself.
          </p>
        </div>

        {/* toolbar */}
        <div className="sticky top-14 z-30 -mx-4 mt-10 border-y border-ink/12 bg-paper/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-xl sm:border sm:px-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="relative min-w-0 flex-1 basis-52">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search marks, glyphs, places…"
                className="w-full rounded-lg border border-ink/15 bg-paper2/70 py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-ink/40 focus:border-[#8a6b2f] focus:outline-none"
              />
            </label>
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-ink/15 bg-paper2/60 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setVerdict(f.id)}
                  className={`rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
                    verdict === f.id ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/8"
                  }`}
                >
                  {f.label}
                  <span className={`ml-1 font-mono text-[9.5px] ${verdict === f.id ? "text-paper/60" : "text-ink/40"}`}>
                    {counts[f.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as Cat | "all")}
              className="rounded-lg border border-ink/15 bg-paper2/70 px-2.5 py-2 text-[12px] font-medium text-ink/85 focus:border-[#8a6b2f] focus:outline-none"
            >
              <option value="all">All shelves</option>
              {(Object.keys(CAT_LABEL) as Cat[]).map((c) => (
                <option key={c} value={c}>{CAT_LABEL[c]}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-lg border border-ink/15 bg-paper2/70 px-2.5 py-2 text-[12px] font-medium text-ink/85 focus:border-[#8a6b2f] focus:outline-none"
            >
              <option value="registry">Registry order</option>
              <option value="az">A → Z</option>
              <option value="verdict">By verdict</option>
            </select>
            <div className="flex items-center gap-1 rounded-lg border border-ink/15 bg-paper2/60 p-1">
              {[20, 26, 34].map((s, i) => (
                <button
                  key={s}
                  onClick={() => setTile(s)}
                  title={["Small", "Medium", "Large"][i]}
                  className={`rounded-md px-2.5 py-1.5 font-mono text-[10.5px] transition-colors ${tile === s ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/8"}`}
                >
                  {["S", "M", "L"][i]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* grid */}
        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 pb-10 text-center">
            <Search size={28} className="text-ink/30" />
            <p className="font-display text-xl text-ink/70">Nothing on this shelf.</p>
            <p className="text-[13px] text-ink/50">Try another word, or clear the filters.</p>
            <button
              onClick={() => { setQ(""); setVerdict("all"); setCat("all"); }}
              className="mt-1 rounded-full border border-ink/25 px-4 py-1.5 text-[12px] font-medium hover:bg-ink hover:text-paper"
            >
              Clear everything
            </button>
          </div>
        ) : (
          <div
            className="mt-8 grid gap-2.5"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${tile === 34 ? 128 : tile === 26 ? 108 : 92}px, 1fr))` }}
          >
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => setOpenId(e.id)}
                className="group relative flex flex-col items-center gap-2.5 rounded-xl border border-ink/10 bg-paper2/45 px-2 pb-2.5 pt-5 transition-all hover:-translate-y-0.5 hover:border-ink/35 hover:bg-paper2 hover:shadow-[0_10px_24px_rgba(22,19,14,0.12)]"
                title={`${e.label} — ${VERDICT_LABEL[e.verdict]}`}
              >
                <span
                  className="dot absolute right-2 top-2"
                  style={{ background: VERDICT_COLOR[e.verdict] }}
                />
                <span className="text-ink/85 transition-colors group-hover:text-ink">
                  <IconView entry={e} size={tile} />
                </span>
                <span className="w-full truncate text-center font-mono text-[9.5px] tracking-tight text-ink/60 group-hover:text-ink/90">
                  {e.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* legend */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/10 pt-5 font-mono text-[10.5px] text-ink/60">
          <span className="uppercase tracking-[0.2em]">legend</span>
          {(Object.keys(VERDICT_COLOR) as Verdict[]).map((v) => (
            <span key={v} className="flex items-center gap-2">
              <span className="dot" style={{ background: VERDICT_COLOR[v] }} />
              {VERDICT_LABEL[v]}
            </span>
          ))}
          <span className="ml-auto">{filtered.length} shown · click a tile · ← → to browse</span>
        </div>
      </div>

      {open && (
        <Drawer
          entry={open}
          index={openIdx}
          total={filtered.length}
          close={() => setOpenId(null)}
          step={step}
          notify={notify}
          openLab={(id) => { setOpenId(null); openLab(id); }}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Drawer({ entry, index, total, close, step, notify, openLab }: {
  entry: Entry; index: number; total: number;
  close: () => void; step: (d: number) => void;
  notify: (m: string) => void; openLab: (id: string) => void;
}) {
  const [surface, setSurface] = useState<"ink" | "paper">("ink");
  const plateNew = useRef<HTMLDivElement | null>(null);
  const plateOld = useRef<HTMLDivElement | null>(null);

  const grab = (which: "new" | "old") =>
    serializeFromNode(which === "old" ? plateOld.current : plateNew.current, 24, surface === "ink" ? "#f0e7d3" : "#16130e");

  const plateBg = surface === "ink" ? "bg-ink text-paper" : "bg-paper text-ink";

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="fade-in absolute inset-0 bg-ink/70 backdrop-blur-[2px]" onClick={close} />
      <aside className="drawer-in absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col border-l border-paper/15 bg-ink2 text-paper shadow-[-30px_0_80px_rgba(0,0,0,0.5)]">
        <header className="flex items-center justify-between border-b border-paper/10 px-5 py-4">
          <div className="flex items-center gap-2 font-mono text-[10.5px] text-cream/60">
            <button onClick={() => step(-1)} className="rounded-md border border-paper/15 p-1.5 hover:border-amber/60 hover:text-amber" title="Previous (←)">
              <ArrowLeft size={13} />
            </button>
            <button onClick={() => step(1)} className="rounded-md border border-paper/15 p-1.5 hover:border-amber/60 hover:text-amber" title="Next (→)">
              <ArrowRight size={13} />
            </button>
            <span className="ml-1">{index >= 0 ? `${index + 1} / ${total}` : "—"}</span>
          </div>
          <button onClick={close} className="rounded-md border border-paper/15 p-1.5 hover:border-ember/70 hover:text-ember" title="Close (Esc)">
            <X size={14} />
          </button>
        </header>

        <div className="grow overflow-y-auto px-5 py-5">
          {/* plates */}
          <div className={`grid gap-3 ${entry.verdict === "redraw" ? "grid-cols-2" : "grid-cols-1"}`}>
            {entry.verdict === "redraw" && (
              <figure className="flex flex-col gap-2">
                <div ref={plateOld} className={`flex h-40 items-center justify-center rounded-xl border border-paper/12 ${plateBg} opacity-80`}>
                  <IconView entry={entry} which="old" size={64} />
                </div>
                <figcaption className="text-center font-mono text-[9.5px] uppercase tracking-[0.2em] text-ember">shipped</figcaption>
              </figure>
            )}
            <figure className="flex flex-col gap-2">
              <div
                ref={plateNew}
                className={`flex h-40 items-center justify-center rounded-xl border border-paper/12 ${plateBg}`}
                style={{
                  backgroundImage: "linear-gradient(rgba(128,118,95,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(128,118,95,0.12) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                <IconView entry={entry} size={entry.verdict === "redraw" ? 64 : 88} />
              </div>
              <figcaption className="text-center font-mono text-[9.5px] uppercase tracking-[0.2em] text-moss">
                {entry.verdict === "redraw" ? "drawn" : "canonical"}
              </figcaption>
            </figure>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-cream/50">plate</span>
            {(["ink", "paper"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSurface(s)}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] capitalize ${surface === s ? "bg-amber text-ink" : "border border-paper/20 text-cream/70 hover:text-paper"}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* meta */}
          <div className="mt-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-tight">{entry.label}</h3>
              <p className="mt-1 font-mono text-[11px] text-cream/60">{entry.glyph}</p>
            </div>
            <span
              className="mt-1.5 shrink-0 rounded-full px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-ink"
              style={{ background: VERDICT_COLOR[entry.verdict] }}
            >
              {VERDICT_LABEL[entry.verdict]}
            </span>
          </div>

          <dl className="mt-4 space-y-3 text-[13px] leading-relaxed">
            <div className="rounded-lg border border-paper/10 bg-ink/50 p-3.5">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-cream/50">lives at</dt>
              <dd className="mt-1 text-paper/90">{entry.where}</dd>
            </div>
            <div className="rounded-lg border border-paper/10 bg-ink/50 p-3.5">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-cream/50">shelf</dt>
              <dd className="mt-1 text-paper/90">{CAT_LABEL[entry.cat]}</dd>
            </div>
            {entry.critique && (
              <div className="rounded-lg border border-ember/25 bg-ember/8 p-3.5">
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ember">the critique</dt>
                <dd className="mt-1 text-cream">{entry.critique}</dd>
              </div>
            )}
            {entry.fix && (
              <div className="rounded-lg border border-moss/25 bg-moss/8 p-3.5">
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-moss">the fix</dt>
                <dd className="mt-1 text-cream">{entry.fix}</dd>
              </div>
            )}
            {entry.note && (
              <div className="rounded-lg border border-paper/10 bg-ink/50 p-3.5">
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-cream/50">verdict note</dt>
                <dd className="mt-1 text-cream">{entry.note}</dd>
              </div>
            )}
          </dl>
        </div>

        <footer className="border-t border-paper/10 p-4">
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const svg = grab("new");
                if (svg && (await copyText(svg))) notify(`${entry.label} copied as SVG`);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-paper/20 px-3 py-2.5 text-[12px] font-medium hover:border-amber/60 hover:text-amber"
            >
              <Copy size={13} /> Copy SVG
            </button>
            <button
              onClick={() => {
                const svg = grab("new");
                if (svg) { downloadSvg(svg, `mareader-${entry.id}`); notify(`${entry.label} downloaded`); }
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-paper/20 px-3 py-2.5 text-[12px] font-medium hover:border-amber/60 hover:text-amber"
            >
              <Download size={13} /> Download
            </button>
            <button
              onClick={() => openLab(entry.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber px-3 py-2.5 text-[12px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              <SlidersHorizontal size={13} /> Lab
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
