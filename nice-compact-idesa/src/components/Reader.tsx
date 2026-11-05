import { Fragment, useCallback, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { BookA, Copy, Library, Menu, PanelLeft, Palette, Search, Sparkles } from "lucide-react";
import { DICT, HIGHLIGHTS, LEVELS, PAGE } from "../data/sample";
import { boxWithin, roomOf, useSize, type Box } from "../lib/geometry";
import { Anchored, useDismiss } from "./Floating";
import { AppearanceKnobs } from "./Appearance";
import { LookupCard } from "./Dictionary";
import { ContextMenu, SelectionMenuBody, ViewMenu, VIEW_START, type ViewState } from "./Menu";
import { PlayerBar, usePlayback } from "./Player";
import { useToast } from "./Toast";
import { IconButton, cx } from "./ui";

/**
 * The whole window at once: toolbar, page, the player docked with its own
 * space reserved, a lookup card anchored to a word, a selection bubble,
 * a right-click menu, and the two popovers from the toolbar. Toasts come from the actions.
 */
export function LiveReader() {
  const toast = useToast();
  const [frameRef, frame] = useSize<HTMLDivElement>();
  const pageRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const room = roomOf(frame);
  const pb = usePlayback(0.12);

  const [pop, setPop] = useState<"look" | "menu" | null>(null);
  const [popBox, setPopBox] = useState<Box | null>(null);
  const [lookup, setLookup] = useState<{ key: string; box: Box } | null>(null);
  const [sel, setSel] = useState<Box | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [view, setView] = useState<ViewState>(VIEW_START);

  const closePop = useCallback(() => setPop(null), []);
  useDismiss(pop !== null, closePop, popRef);

  const frameBox = (el: Element): Box | null => (frameRef.current ? boxWithin(el, frameRef.current) : null);

  const openPop = (kind: "look" | "menu", el: HTMLElement) => {
    if (pop === kind) {
      setPop(null);
      return;
    }
    const b = frameBox(el);
    if (!b) return;
    setPopBox(b);
    setPop(kind);
  };

  const lookUp = (key: string, el: HTMLElement) => {
    const b = frameBox(el);
    if (!b) return;
    setPop(null);
    setSel(null);
    setLookup({ key, box: b });
  };

  const onMouseUp = () => {
    const s = window.getSelection();
    if (!s || s.isCollapsed || !pageRef.current?.contains(s.anchorNode) || !frameRef.current) return;
    const r = s.getRangeAt(0).getBoundingClientRect();
    const f = frameRef.current.getBoundingClientRect();
    setSel({ x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height });
    setLookup(null);
  };

  const onContext = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = frameRef.current?.getBoundingClientRect();
    if (!f) return;
    setCtx({ x: e.clientX - f.left, y: e.clientY - f.top });
  };

  const act = (what: string) => {
    if (what === "copy") toast.notify({ tone: "success", title: "Copied 1 sentence", body: "Ready to paste" });
    if (what === "look") toast.notify({ title: "Looked up “acknowledged”", body: "Shown on the page" });
    if (what === "explain")
      toast.notify({ tone: "warning", title: "AI isn't set up", body: "Choose a provider in Settings › AI", action: { label: "Set up" } });
    if (what === "highlight")
      toast.notify({
        id: "highlight",
        title: "Highlight saved",
        action: { label: "Undo", run: () => toast.notify({ title: "Highlight removed" }) },
      });
    setSel(null);
    setCtx(null);
    window.getSelection()?.removeAllRanges();
  };

  const word = (tok: string, i: number): ReactNode => {
    const key = tok.replace(/[^a-z]/gi, "").toLowerCase();
    if (!LEVELS[key] || !DICT[key]) {
      return (
        <span key={i}>
          {tok}{" "}
        </span>
      );
    }
    return (
      <Fragment key={i}>
        <button
          type="button"
          onClick={(e) => lookUp(key, e.currentTarget)}
          className="rounded-[4px] bg-danger/15 px-[2px] text-ink underline decoration-danger/50 decoration-2 underline-offset-[5px] transition hover:bg-danger/25"
        >
          {tok.replace(/[^a-z]+$/i, "")}
        </button>
        {tok.slice(tok.replace(/[^a-z]+$/i, "").length)}{" "}
      </Fragment>
    );
  };

  const selectionBar = (
    <div className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1 shadow-float">
      {[
        { icon: Copy, label: "Copy", what: "copy" },
        { icon: BookA, label: "Look up", what: "look" },
        { icon: Sparkles, label: "Explain", what: "explain" },
      ].map((b) => (
        <button
          key={b.what}
          type="button"
          onClick={() => act(b.what)}
          className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium text-ink transition hover:bg-ink/10"
        >
          <b.icon size={14} strokeWidth={2} className="text-accent" />
          {b.label}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-line" />
      {HIGHLIGHTS.slice(0, 4).map((h) => (
        <button
          key={h.name}
          type="button"
          aria-label={`Highlight ${h.name}`}
          onClick={() => act("highlight")}
          className="grid size-7 place-items-center rounded-full transition hover:bg-ink/10"
        >
          <span className="size-3.5 rounded-full ring-1 ring-black/15" style={{ background: h.color }} />
        </button>
      ))}
    </div>
  );

  return (
    <div
      ref={frameRef}
      className="grain relative flex h-[620px] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-float"
    >
      <div className="relative z-10 flex h-12 shrink-0 items-center gap-1 border-b border-line bg-surface/90 px-2 backdrop-blur">
        <IconButton label="Sidebar" icon={PanelLeft} size={34} />
        <IconButton label="Library" icon={Library} size={34} />
        <p className="min-w-0 flex-1 truncate text-center text-[13px] font-medium text-ink">Pride and Prejudice, by Jane Austen</p>
        <IconButton label="Search" icon={Search} size={34} />
        <IconButton
          data-keep-open
          label="Appearance"
          icon={Palette}
          size={34}
          active={pop === "look"}
          onClick={(e) => openPop("look", e.currentTarget)}
        />
        <IconButton
          data-keep-open
          label="View & tools"
          icon={Menu}
          size={34}
          active={pop === "menu"}
          onClick={(e) => openPop("menu", e.currentTarget)}
        />
      </div>

      <div
        ref={pageRef}
        onScroll={() => setLookup(null)}
        onMouseUp={onMouseUp}
        onContextMenu={onContext}
        className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-40 pt-8"
      >
        <article className="reading mx-auto max-w-[560px] text-ink">
          <h3 className="mb-6 text-center font-reading text-[18px] font-semibold">Chapter 1</h3>
          {PAGE.map((para, pi) => (
            <p key={pi}>{para.split(" ").map((tok, i) => word(tok, i))}</p>
          ))}
        </article>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <PlayerBar pb={pb} />
      </div>
      <div className="pointer-events-none absolute bottom-[22px] right-4 z-10 rounded-full bg-surface/90 px-2.5 py-1 text-[12px] tabular-nums text-muted shadow-pop">
        14 / 234
      </div>

      {pop && popBox && (
        <Anchored anchor={popBox} room={room} align="end" caret={false} className="z-40" label={pop === "look" ? "Appearance" : "View and tools"}>
          <div ref={popRef}>
            {pop === "look" ? (
              <AppearanceKnobs />
            ) : (
              <div className="w-[300px] rounded-2xl border border-line bg-surface p-2.5 shadow-pop">
                <ViewMenu variant="grouped" value={view} onChange={(p) => setView((v) => ({ ...v, ...p }))} />
              </div>
            )}
          </div>
        </Anchored>
      )}

      {lookup && (
        <Anchored anchor={lookup.box} room={room} width={320} label="Dictionary">
          <LookupCard entry={DICT[lookup.key]} onClose={() => setLookup(null)} />
        </Anchored>
      )}

      {sel && (
        <Anchored anchor={sel} room={room} prefer="top" label="Selection">
          {selectionBar}
        </Anchored>
      )}

      <ContextMenu at={ctx} room={room} onClose={() => setCtx(null)} label="Page menu" width={260}>
        {ctx && <SelectionMenuBody onAct={() => act("copy")} />}
      </ContextMenu>
    </div>
  );
}

export { cx };
