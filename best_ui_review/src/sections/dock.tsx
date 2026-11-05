import { useEffect, useRef, useState, type ReactNode } from "react";
import { BookA, Maximize, Minus, X, Search, Volume2, ChevronRight, ChevronLeft, GripVertical } from "lucide-react";
import { BookText, Notes, Section } from "../kit/frame";
import { IconBtn, Ring, Segmented } from "../kit/primitives";
import { usePlayback, type Playback, WORDS } from "../kit/playback";
import { PillCurrent } from "./player";
import { cn } from "../kit/cn";

/* Constants from crates/ui/src/park.rs */
const PEEK = 20, MAGNET = 8, HIDE = 260, REVEAL = 340;
type Edge = "left" | "right" | null;
type Mode = "current" | "proposed";
type R = { x: number; y: number; w: number; h: number };

const DW = 270, DH = 300; // dictionary window scaled ~0.7 of START 380×520
const PW = 300, PH = 44;
const hit = (a: R, b: R) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function DictWindow({ grabProps }: { grabProps: React.HTMLAttributes<HTMLDivElement> }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[12px] border border-line bg-surface pop-lg">
      <div {...grabProps} className="flex h-[38px] shrink-0 cursor-grab items-center gap-2 border-b border-line px-3 active:cursor-grabbing">
        <BookA size={16} className="text-accent" />
        <span className="text-[13px] font-medium text-ink">Dictionary</span>
        <span className="flex-1" />
        <IconBtn icon={Maximize} label="Open as a page" size={24} icon_size={14} />
        <IconBtn icon={Minus} label="Minimize the dictionary" size={24} icon_size={14} />
        <IconBtn icon={X} label="Close the dictionary" size={24} icon_size={14} />
      </div>
      <div className="p-3">
        <div className="flex h-[34px] items-center gap-2 rounded-full border border-line bg-paper px-3 text-[13px] text-ink"><Search size={14} className="text-muted" /> acknowledged</div>
        <div className="mt-3 flex items-baseline gap-2"><span className="text-[20px] text-ink">acknowledged</span><Volume2 size={15} className="text-muted" /></div>
        <div className="mt-2 rounded-lg border border-line bg-card p-2.5">
          <div className="text-[11px] text-muted">verb · B1</div>
          <div className="text-[16px] text-ink">reconnaître</div>
          <div className="text-[12px] italic text-muted">to admit the knowledge of</div>
        </div>
        <div className="mt-2 rounded-lg border border-line bg-card p-2.5">
          <div className="text-[16px] text-ink">admettre</div>
          <div className="text-[12px] italic text-muted">to accept as true</div>
        </div>
      </div>
    </div>
  );
}

/** Proposed edge tab: a live handle instead of a clipped slice. */
function DictTab({ edge, onOpen }: { edge: "left" | "right"; onOpen: () => void }) {
  const [peek, setPeek] = useState(false);
  return (
    <div className={cn("absolute top-0 flex items-start", edge === "left" ? "left-0 flex-row" : "right-0 flex-row-reverse")} onMouseEnter={() => setPeek(true)} onMouseLeave={() => setPeek(false)}>
      <button onClick={onOpen} title="Restore the dictionary"
        className={cn("flex w-[30px] flex-col items-center gap-2 border border-line bg-surface py-2.5 text-ink pop transition-colors hover:bg-card", edge === "left" ? "rounded-r-xl border-l-0" : "rounded-l-xl border-r-0")}>
        <BookA size={15} className="text-accent" />
        <span className="text-[11.5px] font-medium [writing-mode:vertical-rl]" style={{ transform: edge === "left" ? "rotate(180deg)" : undefined }}>acknowledged</span>
        <span className="rounded-full bg-accent-soft px-1 text-[10px] font-semibold text-accent">3</span>
        {edge === "left" ? <ChevronRight size={13} className="text-muted" /> : <ChevronLeft size={13} className="text-muted" />}
      </button>
      <div className={cn("mt-1 w-[210px] origin-left rounded-xl border border-line bg-surface p-3 pop transition-all duration-200", edge === "left" ? "ml-1.5" : "mr-1.5 origin-right", peek ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0")}>
        <div className="text-[11px] text-muted">Peek · click the tab to restore</div>
        <div className="text-[15px] text-ink">acknowledged <span className="text-[11px] italic text-muted">verb</span></div>
        <div className="text-[14px] text-accent">reconnaître</div>
      </div>
    </div>
  );
}

function PlayerOrbTab({ p }: { p: Playback }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-surface py-[3px] pl-[3px] pr-3 pop">
      <button onClick={p.toggle} className="relative grid h-[38px] w-[38px] place-items-center">
        <Ring size={38} value={p.progress} className="absolute inset-0" />
        <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-accent text-on-accent text-[10px]">{p.playing ? "❚❚" : "▶"}</span>
      </button>
      <span className="max-w-[110px] truncate text-[12px] text-muted"><span className="font-medium text-ink">{WORDS[p.word]}</span> {WORDS[p.word + 1] ?? ""}</span>
    </div>
  );
}

function Stage({ mode, children }: { mode: Mode; children: ReactNode }) {
  return (
    <div className="grain relative h-[460px] w-full overflow-hidden rounded-xl border border-line" data-mode={mode}>
      <div className="absolute inset-x-[12%] top-10"><BookText lines={22} /></div>
      {children}
    </div>
  );
}

export function DockLab() {
  const [mode, setMode] = useState<Mode>("current");
  const p = usePlayback();
  const stage = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(760);
  const H = 460;
  const [d, setD] = useState<R>({ x: 60, y: 60, w: DW, h: DH });
  const [edge, setEdge] = useState<Edge>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [hover, setHover] = useState(false);
  const [revealUntil, setRevealUntil] = useState(0);
  const [, tick] = useState(0);

  useEffect(() => {
    const el = stage.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { if (revealUntil) { const t = setTimeout(() => tick((n) => n + 1), revealUntil - Date.now() + 10); return () => clearTimeout(t); } }, [revealUntil]);
  useEffect(() => { setEdge(null); setD({ x: 60, y: 60, w: DW, h: DH }); }, [mode]);

  const over = Math.max(-d.x, d.x + d.w - W, 0) / d.w;
  const willDock: Edge = over > 0.5 ? (-d.x > d.x + d.w - W ? "left" : "right") : null;
  const near: Edge = drag && over > 0.18 ? (-d.x > d.x + d.w - W ? "left" : "right") : null;

  // Where the dictionary is drawn.
  let shown: R = d;
  if (edge && mode === "current") {
    const y = Math.min(Math.max(d.y, 0), H - d.h);
    shown = { ...d, y, x: edge === "left" ? PEEK - d.w + (hover ? MAGNET : 0) : W - PEEK - (hover ? MAGNET : 0) };
  }
  const player: R = { x: (W - PW) / 2, y: H - PH - 16, w: PW, h: PH };
  const dictRect: R | null = edge ? null : shown;
  const covered = !!dictRect && hit(dictRect, player);
  const revealed = Date.now() < revealUntil;
  const parkPlayer = covered && !revealed && !drag;

  const grab = {
    onPointerDown: (e: React.PointerEvent) => { (e.target as Element).setPointerCapture(e.pointerId); setDrag({ dx: e.clientX - d.x, dy: e.clientY - d.y }); },
    onPointerMove: (e: React.PointerEvent) => { if (drag) setD((r) => ({ ...r, x: e.clientX - drag.dx, y: Math.min(Math.max(e.clientY - drag.dy, -10), H - 38) })); },
    onPointerUp: () => {
      setDrag(null);
      if (willDock) setEdge(willDock);
      else setD((r) => ({ ...r, x: Math.min(Math.max(r.x, 0), W - r.w), y: Math.min(Math.max(r.y, 0), H - r.h) }));
    },
  };
  const restore = () => { setEdge(null); setHover(false); setD((r) => ({ ...r, x: r.x < 0 ? 12 : W - r.w - 12 })); };
  const ease = "cubic-bezier(.22,.9,.3,1)";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[300px]" data-theme-scope>
          <Segmented value={mode} onChange={setMode} options={[{ v: "current", label: "Current (park.rs)" }, { v: "proposed", label: "Proposed (edge tabs)" }]} />
        </div>
        <span className="text-[13px] text-smuted">Drag the dictionary by its header past a side (over 50 %), or over the player.</span>
        <button className="ml-auto rounded-lg border border-sline px-3 py-1.5 text-[12.5px] text-sink hover:bg-sink/5" onClick={() => { setEdge(null); setD({ x: (W - DW) / 2 + 40, y: H - DH - 30, w: DW, h: DH }); }}>Put dictionary over player</button>
      </div>
      <div ref={stage}>
        <Stage mode={mode}>
          {/* proposed: pre-release dock affordance */}
          {mode === "proposed" && near && (
            <div className={cn("pointer-events-none absolute inset-y-3 w-[6px] rounded-full bg-accent", near === "left" ? "left-1" : "right-1", willDock ? "opacity-90" : "edge-pulse")}>
              <span className={cn("absolute top-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-paper", near === "left" ? "left-4" : "right-4")}>{willDock ? "Release to tuck" : "Keep going to tuck"}</span>
            </div>
          )}

          {/* the dictionary */}
          {!(edge && mode === "proposed") && (
            <div
              className="absolute"
              style={{ left: shown.x, top: shown.y, width: shown.w, height: shown.h, transition: drag ? "none" : `left ${edge ? HIDE : REVEAL}ms ${ease}, top ${REVEAL}ms ${ease}`, zIndex: 20 }}
              onMouseEnter={() => edge && setHover(true)} onMouseLeave={() => setHover(false)}
            >
              <DictWindow grabProps={grab} />
              {edge && mode === "current" && <button aria-label="Show the dictionary" className="absolute inset-0 cursor-pointer" onClick={restore} />}
            </div>
          )}
          {edge && mode === "proposed" && (
            <div className="absolute z-20" style={{ top: Math.min(Math.max(d.y, 8), H - 220), left: edge === "left" ? 0 : undefined, right: edge === "right" ? 0 : undefined }}>
              <div className="relative h-[200px] w-[260px]"><DictTab edge={edge} onOpen={restore} /></div>
            </div>
          )}

          {/* the player */}
          {mode === "current" ? (
            <div className="absolute z-10" style={{ left: player.x, top: parkPlayer ? H - PEEK : player.y, transition: `top ${parkPlayer ? HIDE : REVEAL}ms ${ease}` }}>
              <PillCurrent p={p} />
              {parkPlayer && <button aria-label="Show the player" className="absolute inset-0" onClick={() => setRevealUntil(Date.now() + 4000)} />}
            </div>
          ) : (
            <div className="absolute z-30 transition-all duration-300" style={{
              left: parkPlayer ? (dictRect && dictRect.x + dictRect.w / 2 > W / 2 ? 16 : W - 200) : player.x,
              top: parkPlayer ? H - 60 : player.y,
            }}>
              {parkPlayer ? <PlayerOrbTab p={p} /> : <PillCurrent p={p} />}
            </div>
          )}
          <div className="absolute left-3 top-3 z-40 flex items-center gap-1.5 rounded-md bg-ink/80 px-2 py-1 text-[11px] text-paper">
            <GripVertical size={12} /> {edge ? `tucked ${edge}` : drag ? `over edge ${(over * 100).toFixed(0)}%` : "floating"} {parkPlayer && "· player parked"}
          </div>
        </Stage>
      </div>
    </div>
  );
}

export function DockSection() {
  return (
    <Section id="dock" kicker="park.rs · dict/window.rs · read_aloud/mod.rs" title="Resting at the edge (parking)"
      intro={<>From the source: <code>park::Edge::dock</code> keeps a panel at <b>full size</b> and slides it off the stage until only <code>PEEK = 20</code> pt shows. Hovering nudges it in by <code>MAGNET = 8</code> pt, and a click reveals it (0.34 s). The dictionary tucks when released more than 50 % past a side. The player tucks to the <b>bottom</b> whenever the dictionary covers it, with a 4 s reveal grace (<code>unparked_until</code>). The motion is nice; the leftovers are not. Try both modes below.</>}>
      <DockLab />
      <Notes title="Review" items={[
        ["keep", "Same-size docking (no reflow when it comes back), cubic ease-out, the reveal grace for the covered player, and placing toasts and summoned panels around each other. The engineering is solid."],
        ["issue", "A tucked panel leaves a 20 pt slice of whatever its edge happened to contain: a header fragment, a border, half an icon. It does not say what is parked (which word? is audio playing?), and a raw slice reads as a layout bug."],
        ["issue", "The parked player loses every control. Read-aloud keeps talking under a sliver showing the top 20 pt of a 44 pt pill. You cannot pause without first revealing it, and it re-parks 4 s later if it is still covered."],
        ["issue", "No feedback before release: whether a drag will tuck is decided only on pointer-up at an invisible 50 % line."],
        ["idea", "Proposed: a tucked panel becomes a purpose-built edge tab showing its state (the word plus an entry count; play/pause plus a progress ring). Hover shows a peek card without committing. While dragging, an edge glow says 'keep going', then 'release to tuck'. The covered player slides to the free corner as an orb that still plays and pauses, instead of hiding."],
        ["warn", "Edge tabs need keyboard reach: give each a focus stop in the F6 pane cycle and announce 'Dictionary tucked at right'. Hover peeks need a 150 ms intent delay so passing the pointer doesn't flash them."],
      ]} />
    </Section>
  );
}
