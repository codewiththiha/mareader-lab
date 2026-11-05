import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { BookA, ChevronLeft, ChevronRight, Maximize2, Minus, Search, X, Volume2, ArrowRightFromLine, GripVertical } from "lucide-react";
import { Block, Specimen } from "../ui/Block";
import { Chip, IconButton, Segmented } from "../ui/kit";
import { cn } from "../utils/cn";
import { usePlayback } from "../lab/usePlayback";
import { Capsule, TodayPill } from "./Player";

/* Constants straight from park.rs / dict/window.rs / read_aloud/mod.rs */
const PEEK = 20; // park::PEEK
const MAGNET = 8; // park::MAGNET
const HIDE_THRESHOLD = 0.5; // window.rs: left.max(right) > shape.width() * 0.5
const HEAD = 38; // dict/window.rs HEAD
const WIN_W = 340;
const WIN_H = 292; // the real window opens 380 × 520; shortened to fit a docs stage
const STAGE_H = 460;

/* Proposed constants */
const TAB_W = 40;
const TAB_H = 168;
const SNAP_OVER = 0.22; // fraction of the window past the edge …
const SNAP_NEAR = 72; // … or pointer within this many pt of the edge

function PageText() {
  const para =
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.";
  return (
    <div className="pointer-events-none absolute inset-0 columns-2 gap-14 px-10 pt-10 font-serif text-[12.5px] leading-[1.55] text-ink/75 select-none">
      {[0, 1, 2, 3].map((i) => (
        <p key={i} className="mb-3 text-justify indent-4">
          {i === 0 ? (
            <>
              It is a truth universally{" "}
              <mark className="rounded-[2px] bg-[#e58a8a]/70 px-px text-ink">acknowledged</mark>
              {para.slice(para.indexOf(", that"))}
            </>
          ) : (
            para
          )}
        </p>
      ))}
    </div>
  );
}

function WindowBody() {
  return (
    <div className="flex flex-col gap-2.5 px-3 py-2.5">
      <div className="flex h-8 items-center gap-2 rounded-lg border border-line px-2.5 text-[14px]">
        <Search size={15} className="text-muted" />
        <span>acknowledged</span>
      </div>
      <div className="text-[12px] text-muted">English → French</div>
      <div className="border-t border-line pt-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-medium">acknowledge</span>
          <span className="text-[13px] italic text-muted">verb</span>
          <span className="text-[12px] text-muted">B1</span>
        </div>
        <div className="mt-1 text-[16px]">reconnaître</div>
        <div className="text-[13px] italic text-muted">to admit the knowledge of</div>
      </div>
      <div className="border-t border-line pt-2.5 text-[13px] text-muted">
        <div className="text-[14px] text-ink">avouer · admettre</div>
        to accept or admit the truth of
      </div>
    </div>
  );
}

type Edge = "left" | "right" | null;

export default function DockLab() {
  const [mode, setMode] = useState<"today" | "proposed">("today");
  const stage = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(760);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const [pos, setPos] = useState({ x: 70, y: 70 }); // window top-left while open
  const [edge, setEdge] = useState<Edge>(null);
  const [tabY, setTabY] = useState(150);
  const [dragging, setDragging] = useState(false);
  const [near, setNear] = useState<Edge>(null); // proposed: drop zone being approached
  const [hoverDock, setHoverDock] = useState(false);
  const [priority, setPriority] = useState(false); // player asked to be seen (today)
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const tabDrag = useRef<{ dy: number; moved: boolean } | null>(null);
  const [log, setLog] = useState("Drag the dictionary by its header toward either side.");

  const pb = usePlayback(true);

  const clampIn = (x: number, y: number) => ({
    x: Math.min(W - WIN_W - 12, Math.max(12, x)),
    y: Math.min(STAGE_H - WIN_H - 8, Math.max(8, y)),
  });

  /* ── player geometry ── */
  const playerW = mode === "today" ? 304 : 360;
  const playerRect = { x: (W - playerW) / 2, y: STAGE_H - 16 - (mode === "today" ? 44 : 48), w: playerW, h: mode === "today" ? 44 : 48 };
  const winRect = { x: pos.x, y: pos.y, w: WIN_W, h: WIN_H };
  const hit = (a: typeof winRect, b: typeof winRect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const dictOpen = edge === null;
  const covered = dictOpen && hit(winRect, playerRect);

  // TODAY: covered ⇒ the player tucks to a blank 20 pt sliver at the bottom, until clicked (player_priority)
  const playerParked = mode === "today" && covered && !priority;
  // when the player has priority, the dictionary steps aside (window.rs `aside`)
  const dodgeY = mode === "today" && dictOpen && priority && !dragging && hit(winRect, playerRect) ? playerRect.y - 10 - WIN_H : null;
  // PROPOSED: the player never hides; it condenses to a puck that keeps Play/Pause reachable
  const micro = mode === "proposed" && covered;

  /* ── window position ── */
  const dockedX = edge === "left" ? -WIN_W + (mode === "today" ? PEEK : 0) : edge === "right" ? W - (mode === "today" ? PEEK : 0) : pos.x;
  const magnet = mode === "today" && edge && hoverDock ? (edge === "left" ? MAGNET : -MAGNET) : 0;
  const winX = edge ? dockedX + magnet : pos.x;
  const winY = dodgeY !== null ? Math.max(8, dodgeY) : edge ? (mode === "today" ? pos.y : tabY) : pos.y;

  const onDown = (e: RPE) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    // use stage-relative coordinates
    const r = stage.current!.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left - pos.x, dy: e.clientY - r.top - pos.y };
    setDragging(true);
    setPriority(false);
    setLog("Dragging…");
  };
  const onMove = (e: RPE) => {
    if (!drag.current) return;
    const r = stage.current!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const x = px - drag.current.dx;
    const y = Math.min(STAGE_H - HEAD, Math.max(0, e.clientY - r.top - drag.current.dy));
    setPos({ x, y });
    if (mode === "proposed") {
      const overL = -x > WIN_W * SNAP_OVER || px < SNAP_NEAR;
      const overR = x + WIN_W - W > WIN_W * SNAP_OVER || px > W - SNAP_NEAR;
      setNear(overL ? "left" : overR ? "right" : null);
    }
  };
  const onUp = (e: RPE) => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    const r = stage.current!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const overL = Math.max(0, -pos.x);
    const overR = Math.max(0, pos.x + WIN_W - W);
    if (mode === "today") {
      const o = Math.max(overL, overR);
      if (o > WIN_W * HIDE_THRESHOLD) {
        setEdge(overL >= overR ? "left" : "right");
        setLog(`Parked: ${Math.round(o)} pt past the edge is more than 50% of ${WIN_W} pt. Only a blank ${PEEK} pt sliver is left.`);
      } else {
        setPos(clampIn(pos.x, pos.y));
        setLog(o > 0 ? `Not parked: ${Math.round(o)} pt past the edge is under the 50% threshold (${WIN_W / 2} pt), so it just snaps back.` : "Dropped inside the stage.");
      }
    } else {
      const toL = overL > WIN_W * SNAP_OVER || px < SNAP_NEAR;
      const toR = overR > WIN_W * SNAP_OVER || px > W - SNAP_NEAR;
      if (toL || toR) {
        setEdge(toL ? "left" : "right");
        setTabY(Math.min(STAGE_H - TAB_H - 10, Math.max(10, pos.y)));
        setLog("Docked to a labelled tab. It keeps its place and can slide along the edge.");
      } else {
        setPos(clampIn(pos.x, pos.y));
        setLog("Dropped inside the stage.");
      }
    }
    setNear(null);
  };

  const reveal = () => {
    if (tabDrag.current?.moved) return;
    setPos(clampIn(edge === "left" ? 24 : W - WIN_W - 24, mode === "today" ? pos.y : tabY));
    setEdge(null);
    setHoverDock(false);
    setLog("Revealed.");
  };

  const switchMode = (m: "today" | "proposed") => {
    setMode(m);
    setEdge(null);
    setPos({ x: 70, y: 70 });
    setPriority(false);
    setLog("Drag the dictionary by its header toward either side.");
  };

  const ease = "cubic-bezier(.22,1,.36,1)";
  const slide = dragging ? "none" : `left .32s ${ease}, top .32s ${ease}, opacity .2s`;
  const sliverShown = mode === "today" && edge !== null;
  const tabShown = mode === "proposed" && edge !== null;

  return (
    <Block
      id="dock"
      n="03"
      title="Edge-parking: dictionary window & player"
      verdict="redesign"
      source="park.rs · dict/window.rs · read_aloud/mod.rs (parking) · read_aloud/edges.rs"
      lead="Parking is a great idea, and the motion code is lovely (cubic ease-out, reversal-safe, magnetic 8 pt pull). The problem is what you're left holding: a blank 20 pt strip of the window's own paper — on a paper-coloured page — with no label, no state, and no way to even pause the player. Try both below."
      notes={[
        { kind: "warn", text: <>The window fills with <code className="font-mono text-[12px]">paper</code> (window.rs <code className="font-mono text-[12px]">paint</code>), the same colour as the page. Parked, it's a hairline and a shadow. Dark themes make it nearly invisible.</> },
        { kind: "warn", text: "Parking needs a drag more than 50% past the edge, with no cue while you drag. It is easy to never discover, and easy to trigger by accident when you only wanted to move it aside." },
        { kind: "idea", text: "Proposed: edge zones light up while you drag; the parked thing becomes a 40 pt tab that names what's inside (word + level) and slides along the edge; the player is never hidden — it condenses to a puck that still plays and pauses." },
        { kind: "ok", text: "Keep: click-only reveal (no accidental hover pop-outs), the magnet pull, and sliding back from the same dock position." },
      ]}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<"today" | "proposed">
          items={[
            { value: "today", label: "Today (as shipped)" },
            { value: "proposed", label: "Proposed" },
          ]}
          value={mode}
          onChange={switchMode}
          height={32}
          className="w-[300px]"
          ariaLabel="Docking behaviour"
        />
        <div className="flex items-center gap-1.5 text-[12px] text-muted">
          {mode === "today" ? (
            <>
              <Chip tone="outline">PEEK {PEEK} pt</Chip>
              <Chip tone="outline">park &gt; 50 %</Chip>
              <Chip tone="outline">magnet {MAGNET} pt</Chip>
            </>
          ) : (
            <>
              <Chip tone="soft">Tab {TAB_W} pt</Chip>
              <Chip tone="soft">snap &gt; 22 % or ≤ {SNAP_NEAR} pt</Chip>
              <Chip tone="soft">player never hides</Chip>
            </>
          )}
        </div>
      </div>

      <Specimen kind={mode === "today" ? "today" : "proposed"} title={mode === "today" ? "Reader stage — as shipped" : "Reader stage — redesigned"} caption="drag the window · click what's left at the edge" bodyClassName="p-0">
        <div ref={stage} className="relative select-none overflow-hidden bg-paper" style={{ height: STAGE_H, touchAction: "none" }}>
          <PageText />

          {/* drop zones (proposed) */}
          {mode === "proposed" &&
            (["left", "right"] as const).map((s) => (
              <div
                key={s}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 z-10 transition-opacity duration-200"
                style={{
                  [s]: 0,
                  width: 92,
                  opacity: dragging ? (near === s ? 1 : 0.45) : 0,
                  background: `linear-gradient(to ${s === "left" ? "right" : "left"}, color-mix(in oklab, var(--accent) ${near === s ? 38 : 20}%, transparent), transparent)`,
                  borderInline: "0",
                }}
              >
                <div
                  className={cn("absolute top-1/2 grid -translate-y-1/2 place-items-center gap-1 text-accent transition-transform", s === "left" ? "left-3" : "right-3")}
                  style={{ transform: `translateY(-50%) scale(${near === s ? 1.12 : 1})` }}
                >
                  <ArrowRightFromLine size={18} className={s === "left" ? "rotate-180" : ""} />
                  <span className="text-[11px] font-medium [writing-mode:vertical-rl]">{near === s ? "Release to dock" : "Dock here"}</span>
                </div>
              </div>
            ))}

          {/* the dictionary window */}
          <div
            className="absolute z-20 flex flex-col overflow-hidden rounded-xl border border-line bg-paper text-ink"
            style={{
              left: winX,
              top: winY,
              width: WIN_W,
              height: WIN_H,
              boxShadow: "0 6px 24px var(--shadow)",
              transition: slide,
              opacity: tabShown ? 0 : 1,
              pointerEvents: edge ? "none" : "auto",
            }}
          >
            <div
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              className={cn("flex shrink-0 items-center gap-1 border-b border-line px-2.5", dragging ? "cursor-grabbing" : "cursor-grab")}
              style={{ height: HEAD, opacity: sliverShown ? 0 : 1, transition: "opacity .18s" }}
            >
              <BookA size={16} className="text-accent" />
              <span className="ml-1 flex-1 text-[13px] font-medium">Dictionary</span>
              <IconButton icon={Maximize2} label="Open as a page" size="sm" iconSize={14} />
              <IconButton icon={Minus} label="Minimize the dictionary" size="sm" iconSize={14} />
              <IconButton icon={X} label="Close the dictionary" size="sm" iconSize={14} />
            </div>
            <div style={{ opacity: sliverShown ? 0 : 1, transition: "opacity .18s" }}>
              <WindowBody />
            </div>
          </div>

          {/* TODAY: click-only hit area over the exposed sliver (park::reveal) */}
          {sliverShown && (
            <button
              type="button"
              aria-label="Show the dictionary"
              onClick={reveal}
              onPointerEnter={() => setHoverDock(true)}
              onPointerLeave={() => setHoverDock(false)}
              className="absolute z-30 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{
                top: pos.y,
                height: WIN_H,
                width: PEEK + MAGNET,
                [edge === "left" ? "left" : "right"]: 0,
              }}
            />
          )}

          {/* PROPOSED: the labelled dock tab */}
          {tabShown && edge && (
            <div
              className={cn("absolute z-30 transition-[transform,opacity] duration-300", edge === "left" ? "left-0" : "right-0")}
              style={{
                top: tabY,
                height: TAB_H,
                width: TAB_W + 8,
                transform: `translateX(${hoverDock ? 0 : edge === "left" ? -6 : 6}px)`,
                transition: dragging ? "none" : `top .25s ${ease}, transform .2s ${ease}`,
              }}
              onPointerEnter={() => setHoverDock(true)}
              onPointerLeave={() => setHoverDock(false)}
            >
              <button
                type="button"
                aria-label="Show the dictionary: acknowledged, B1. Drag to slide along the edge."
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  tabDrag.current = { dy: e.clientY - tabY, moved: false };
                }}
                onPointerMove={(e) => {
                  if (!tabDrag.current) return;
                  const ny = e.clientY - tabDrag.current.dy;
                  if (Math.abs(ny - tabY) > 3) tabDrag.current.moved = true;
                  setTabY(Math.min(STAGE_H - TAB_H - 10, Math.max(10, ny)));
                }}
                onPointerUp={() => setTimeout(() => (tabDrag.current = null), 0)}
                onClick={reveal}
                className={cn(
                  "group flex h-full w-full flex-col items-center justify-between border border-line bg-surface py-2.5 text-ink shadow-[0_6px_20px_var(--shadow)] outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  edge === "left" ? "rounded-r-2xl border-l-0 pr-[8px]" : "rounded-l-2xl border-r-0 pl-[8px]"
                )}
                style={{ cursor: "pointer" }}
              >
                <span className="relative grid size-7 place-items-center rounded-full bg-accent-soft text-accent">
                  <BookA size={15} />
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-surface" />
                </span>
                <span className="flex flex-1 items-center py-1.5 text-[13px] font-medium tracking-wide [writing-mode:vertical-rl]" style={{ transform: edge === "right" ? "rotate(180deg)" : undefined }}>
                  acknowledged
                </span>
                <span className="text-[10.5px] font-semibold text-accent">B1</span>
                {edge === "left" ? <ChevronRight size={14} className="mt-1 text-muted group-hover:text-ink" /> : <ChevronLeft size={14} className="mt-1 text-muted group-hover:text-ink" />}
              </button>
              <span className="pointer-events-none absolute top-1 left-1/2 hidden">
                <GripVertical size={10} />
              </span>
            </div>
          )}

          {/* the player */}
          {mode === "today" ? (
            <div
              className="absolute z-20"
              style={{
                left: playerRect.x,
                top: playerParked ? STAGE_H - PEEK : playerRect.y,
                transition: `top .28s ${ease}`,
              }}
            >
              <div style={{ opacity: playerParked ? 0 : 1, transition: "opacity .15s" }} className={playerParked ? "pointer-events-none" : ""}>
                <TodayPill pb={pb} />
              </div>
              {playerParked && (
                <button
                  type="button"
                  aria-label="Show the read-aloud player"
                  onClick={() => {
                    setPriority(true);
                    setLog("Player revealed — and the dictionary had to step aside to make room.");
                  }}
                  className="absolute inset-x-0 top-0 h-5 cursor-pointer rounded-t-[22px] border border-b-0 border-line bg-surface"
                  style={{ boxShadow: "0 -4px 14px var(--shadow-soft)" }}
                />
              )}
            </div>
          ) : (
            <div
              className="absolute z-20"
              style={{ left: (W - (micro ? 232 : 360)) / 2, top: playerRect.y, transition: `left .3s ${ease}` }}
            >
              <div style={{ transition: "width .3s", width: micro ? 232 : 360 }}>
                <Capsule pb={pb} width={micro ? 232 : 360} />
              </div>
            </div>
          )}

          {/* pointer hint */}
          {!dragging && edge === null && (
            <div className="pointer-events-none absolute right-4 top-4 z-0 rounded-full border border-line bg-surface/80 px-3 py-1 text-[12px] text-muted backdrop-blur">
              {mode === "today" ? "Drag the header past 50% of an edge to park" : "Drag the header toward an edge — zones light up"}
            </div>
          )}
        </div>
      </Specimen>

      <div className="flex items-start gap-2 rounded-xl border border-line bg-card/60 px-3.5 py-2.5 text-[13px] text-ink/90" aria-live="polite">
        <Volume2 size={14} className="mt-0.5 shrink-0 text-muted" />
        <span>{log}</span>
        {mode === "today" && covered && !priority && <span className="ml-auto text-muted">· player auto-tucked (the dictionary covers it)</span>}
        {mode === "proposed" && covered && <span className="ml-auto text-muted">· player condensed, still playable</span>}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { t: "Parked today", note: "20 pt of paper on paper — a hairline. No label, no state, can't pause.", el: <TodaySliver /> },
          { t: "Parked, proposed", note: "40 pt tab: icon, word, level. Slides along the edge. Same click-to-open.", el: <ProposedTab /> },
          { t: "Player, proposed", note: "Condensed puck keeps Play/Pause reachable while a window sits above.", el: <PuckDemo /> },
        ].map((c) => (
          <Specimen key={c.t} kind={c.t.includes("today") ? "today" : "proposed"} title={c.t} caption={undefined} bodyClassName="grid h-[190px] place-items-center">
            <div className="flex flex-col items-center gap-3">
              {c.el}
              <p className="max-w-[210px] text-center text-[12px] leading-snug text-muted">{c.note}</p>
            </div>
          </Specimen>
        ))}
      </div>
    </Block>
  );
}

function TodaySliver() {
  return (
    <div className="relative h-[84px] w-[170px] overflow-hidden rounded-md bg-card/50">
      <div className="absolute top-2 right-[-320px] h-[68px] w-[340px] rounded-xl border border-line bg-paper shadow-[0_6px_24px_var(--shadow)]" />
    </div>
  );
}
function ProposedTab() {
  return (
    <div className="relative h-[84px] w-[170px] overflow-hidden rounded-md bg-card/50">
      <div className="absolute top-0 right-0 flex h-[84px] w-10 flex-col items-center justify-between rounded-l-2xl border border-r-0 border-line bg-surface py-1.5 shadow-[0_6px_20px_var(--shadow)]">
        <BookA size={13} className="text-accent" />
        <span className="text-[9px] font-medium [writing-mode:vertical-rl] rotate-180">acknowledged</span>
      </div>
    </div>
  );
}
function PuckDemo() {
  const pb = usePlayback(true);
  return <Capsule pb={pb} width={232} />;
}
