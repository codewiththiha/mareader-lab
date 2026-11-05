import { useEffect, useRef, useState } from "react";
import { Check, AlertTriangle, X, Undo2, ChevronUp } from "lucide-react";
import { Compare, Finding, Findings, Section } from "../lib/ui";

type Tone = "info" | "error" | "warning";
interface T { id: number; tone: Tone; message: string; detail?: string; action?: string; lasts: number; born: number; times: number; }

const LAST = { info: 3.5, error: 6, action: 6 };
let nextId = 1;

function useToasts() {
  const [list, setList] = useState<T[]>([]);
  const [paused, setPaused] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => {
    const h = setInterval(() => {
      tick((n) => n + 1);
      if (paused) return;
      setList((l) => l.filter((t) => performance.now() - t.born < t.lasts * 1000));
    }, 1000 / 30);
    return () => clearInterval(h);
  }, [paused]);
  // Frozen clocks on hover: born shifts forward while paused (as `left` does in Live).
  useEffect(() => {
    if (!paused) return;
    const h = setInterval(() => setList((l) => l.map((t) => ({ ...t, born: t.born + 1000 / 30 }))), 1000 / 30);
    return () => clearInterval(h);
  }, [paused]);
  const push = (tone: Tone, message: string, detail?: string, action?: string) =>
    setList((l) => {
      // put(): the same words again count instead of stacking.
      const same = l.find((t) => t.tone === tone && t.message === message && !t.action && !action);
      if (same) return [...l.filter((t) => t !== same), { ...same, times: same.times + 1, born: performance.now() }];
      const lasts = action ? LAST.action : tone === "error" ? LAST.error : LAST.info;
      return [...l, { id: nextId++, tone, message, detail, action, lasts, born: performance.now(), times: 1 }].slice(-12);
    });
  const close = (id: number) => setList((l) => l.filter((t) => t.id !== id));
  return { list, push, close, setPaused };
}

const look = (tone: Tone) => ({
  info: { icon: <Check size={15} strokeWidth={2.5} />, tint: "var(--accent)", tintRgb: "var(--accent-rgb)", edge: "var(--line)" },
  error: { icon: <AlertTriangle size={15} strokeWidth={2.25} />, tint: "var(--danger)", tintRgb: "var(--danger-rgb)", edge: "rgb(var(--danger-rgb) / .5)" },
  warning: { icon: <AlertTriangle size={15} strokeWidth={2.25} />, tint: "var(--caution)", tintRgb: "var(--caution-rgb)", edge: "rgb(var(--caution-rgb) / .5)" },
})[tone];

/** As shipped: card.rs — PAD 12×10, MARK 26, CLOSE 24, radius_lg, 1pt edge, feathered wash. */
function CurrentCard({ t, left, onClose, behind }: { t: T; left: number; onClose: () => void; behind?: boolean }) {
  const l = look(t.tone);
  const FEATHER = 64; // pt
  const [dx, setDx] = useState(0);
  const drag = useRef<number | null>(null);
  const washPct = `${left * 100}%`;
  return (
    <div
      className="relative select-none overflow-hidden rounded-[12px] shadow-pop"
      style={{
        width: 360, background: behind ? "color-mix(in srgb, var(--surface) 93%, var(--ink))" : "var(--surface)",
        border: `1px solid ${l.edge}`, transform: `translateX(${dx}px)`, opacity: Math.max(0, 1 - Math.abs(dx) / 160),
        transition: drag.current == null ? "transform .22s, opacity .22s" : "none",
      }}
      onPointerDown={(e) => { drag.current = e.clientX; (e.target as Element).setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => { if (drag.current != null) { const d = e.clientX - drag.current; setDx(d > 0 ? d : d * 0.3); } }}
      onPointerUp={() => { if (dx > 96) onClose(); else setDx(0); drag.current = null; }}
    >
      {!behind && (
        <div className="pointer-events-none absolute inset-[1px] rounded-[11px]" style={{
          background: `linear-gradient(to right, rgb(${l.tintRgb} / ${t.tone === "error" ? 0.16 : 0.13}) calc(${washPct} - ${FEATHER / 2}px), transparent calc(${washPct} + ${FEATHER / 2}px))`,
        }} />
      )}
      <div className="relative flex items-center gap-[10px] py-[10px] pl-[12px] pr-[8px]">
        <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full" style={{ background: `rgb(${l.tintRgb} / .16)`, color: l.tint }}>{l.icon}</span>
        <span className="flex-1 text-[14px] leading-snug ink">{t.message}{t.times > 1 && <span className="ml-2 text-[12px] muted">×{t.times}</span>}</span>
        {t.action && <button className="h-[26px] rounded-[8px] px-[10px] text-[14px] font-semibold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{t.action}</button>}
        <button className="sb" onClick={onClose} aria-label="Dismiss"><X size={14} /></button>
      </div>
    </div>
  );
}

/** Proposal: a 2pt rail countdown, title/detail rows, pause ring, grouped count pill. */
function ProposedCard({ t, left, onClose, paused }: { t: T; left: number; onClose: () => void; paused: boolean }) {
  const l = look(t.tone);
  return (
    <div className="rise relative w-[360px] select-none overflow-hidden rounded-[12px] shadow-pop" style={{ background: "var(--surface)", border: `1px solid ${t.tone === "info" ? "var(--line)" : l.edge}` }}>
      <div className="flex items-start gap-[10px] py-[10px] pl-[12px] pr-[8px]">
        <span className="relative mt-[1px] grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full" style={{ background: `rgb(${l.tintRgb} / .14)`, color: l.tint }}>
          {l.icon}
          {t.times > 1 && <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold" style={{ background: l.tint, color: "var(--surface)" }}>{t.times}</span>}
        </span>
        <div className="flex-1 pt-[2px]">
          <div className="text-[14px] font-medium leading-snug ink">{t.message}</div>
          {t.detail && <div className="mt-0.5 text-[12.5px] leading-snug muted">{t.detail}</div>}
        </div>
        {t.action && (
          <button className="inline-flex h-[26px] items-center gap-1 rounded-[8px] px-[10px] text-[13px] font-semibold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            {t.action === "Undo" && <Undo2 size={13} />}{t.action}
          </button>
        )}
        <button className="sb" onClick={onClose} aria-label="Dismiss"><X size={14} /></button>
      </div>
      {/* rail: inside the corner radius, a hair above the bottom edge */}
      <div className="absolute inset-x-[12px] bottom-[5px] h-[2px] overflow-hidden rounded-full" style={{ background: "rgb(var(--ink-rgb) / .08)" }}>
        <div className="h-full rounded-full" style={{ width: `${left * 100}%`, background: paused ? "var(--muted)" : l.tint, transition: "background .2s" }} />
      </div>
    </div>
  );
}

export default function Toasts() {
  const cur = useToasts();
  const pro = useToasts();
  const now = performance.now();
  const remaining = (t: T) => Math.max(0, 1 - (now - t.born) / (t.lasts * 1000));
  const bothPush = (tone: Tone, m: string, d?: string, a?: string) => { cur.push(tone, m, undefined, a); pro.push(tone, m, d, a); };
  const Buttons = () => (
    <div className="flex flex-wrap gap-2 p-3">
      {[
        ["Note", () => bothPush("info", "Copied 42 words")],
        ["Undo", () => bothPush("info", "Highlight removed", "“universally acknowledged”, page 2", "Undo")],
        ["Warning", () => bothPush("warning", "Imported 7 of 9 books", "Two files were not PDF or EPUB")],
        ["Error", () => bothPush("error", "Kokoro could not load its voice", "The model file is missing. Re-download it in Read aloud settings.")],
        ["Same again ×", () => bothPush("info", "Copied 42 words")],
      ].map(([label, fn]) => (
        <button key={label as string} onClick={fn as () => void} className="rounded-[8px] border border-line bg-[var(--surface)] px-3 py-1.5 text-[13px] font-medium hover:bg-[var(--hover)]">{label as string}</button>
      ))}
    </div>
  );

  const stack = (list: T[], front: (t: T, i: number) => React.ReactNode, peeks = true) => {
    const up = list.slice(-3);
    const frontT = up[up.length - 1];
    return (
      <div className="absolute bottom-4 right-4 flex flex-col items-end">
        <div className="relative" style={{ paddingTop: peeks ? (up.length - 1) * 8 : 0 }}>
          {peeks && up.slice(0, -1).map((t, i) => {
            const depth = up.length - 1 - i;
            return (
              <div key={t.id} className="absolute left-0 right-0" style={{ top: (up.length - 1 - depth) * 8, paddingInline: depth * 10, zIndex: i }}>
                <CurrentCard t={t} left={0} behind onClose={() => {}} />
              </div>
            );
          })}
          {frontT && <div className="relative" style={{ zIndex: 10 }}>{front(frontT, up.length - 1)}</div>}
        </div>
        {list.length > (peeks ? 3 : 1) && <button className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-line bg-[var(--surface)] px-2 py-0.5 text-[11px] muted"><ChevronUp size={11} />{list.length - (peeks ? 3 : 1)} more</button>}
      </div>
    );
  };

  return (
    <Section id="toasts" title="Toasts" source="crates/ui/src/toast.rs · toast/card.rs · toast/stack.rs" verdict="polish"
      summary="This is the most engineered toast system I have read in a desktop app: timers freeze on hover with a 1.5 s grace, identical messages count up instead of stacking, cards swipe away with a 96 pt throw / 700 pt·s flick, the pile peeks 8 pt and narrows 10 pt per depth, and the stack steps aside for a page drag and gives way to menus. The behaviour needs no redesign. The visual countdown does.">
      <Compare
        current={<><Buttons />{stack(cur.list, (t) => <div onPointerEnter={() => cur.setPaused(true)} onPointerLeave={() => cur.setPaused(false)}><CurrentCard t={t} left={remaining(t)} onClose={() => cur.close(t.id)} /></div>)}</>}
        proposed={<><Buttons />{stack(pro.list, (t) => <div onPointerEnter={() => pro.setPaused(true)} onPointerLeave={() => pro.setPaused(false)}><ProposedCard t={t} left={remaining(t)} paused={false} onClose={() => pro.close(t.id)} /></div>, false)}</>}
        currentNote="Drag the front card right to throw it (RESIST 0.3 the other way). Hover to freeze. The time left is a feathered wash of the tone, 64 pt soft, drawn as a mesh."
        proposedNote="Same stack, same gestures. Countdown as a 2 pt rail inside the radius; a second muted line for the detail; the repeat count rides the mark as a pill rather than appending “×3” to the sentence."
      />
      <Findings>
        <Finding kind="ok">Pause-on-hover with HOVER_GRACE, dedupe by message, swipe exit with RESIST, `keep_clear` so a menu never opens under a toast — all correct and rare. Keep all of it.</Finding>
        <Finding kind="bug">The feathered wash (card.rs `countdown`, FEATHER 64) is a 64 pt soft edge sweeping over the message text. On a tinted paper (Sepia/Parchment) the wash colour is the tinted accent at 13 %, almost the same hue as the surface, so it reads as a smudge rather than a timer, and at the last second it overlaps the action button's `accent_soft` fill. A thin rail is unambiguous and costs no mesh.</Finding>
        <Finding kind="bug">`Toast` carries one `message: String`. Errors like “Kokoro could not load its voice” are read twice (ERROR_FOR 6 s) precisely because the why is missing; `control.rs` already has a `headline()` splitter for the player note. Give `Toast` an optional `detail` and let `error()` take `(headline, detail)`.</Finding>
        <Finding kind="idea">Peeking cards behind are `surface` lerped 7 % toward ink; in Black mode (surface #000, ink #d4d4d8) that is #0f0f0f on #000 — invisible. A “2 more” pill under the front card is legible in every look and is also the click target that `open` already offers.</Finding>
        <Finding kind="idea">Info toasts take `t.line` as their edge, error/warning take the tone at 50 %. Fine. But the Info mark is a checkmark for notes that are not successes (“Reading aloud paused”). Use `Icon::Info` for plain notes and keep `Done` for results of an action.</Finding>
      </Findings>
    </Section>
  );
}
