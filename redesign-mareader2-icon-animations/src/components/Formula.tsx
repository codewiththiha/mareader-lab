import { useState, type ReactNode } from "react";
import { FEELS, zeta, type Feel } from "../engine/motion";
import { IconButton, useLab, type Act } from "../lab";
import { cn } from "../utils/cn";
import { CurvePlot, Section } from "./Intro";

const KNOBS: {
  key: keyof Feel;
  label: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  show: (f: Feel) => string;
}[] = [
  {
    key: "tempo",
    label: "Tempo",
    min: 0.6,
    max: 1.6,
    step: 0.02,
    hint: "Divides every time.",
    show: (f) => `${f.tempo.toFixed(2)}×`,
  },
  {
    key: "bounce",
    label: "Bounce",
    min: 0,
    max: 1,
    step: 0.02,
    hint: "The spring's damping.",
    show: (f) => `ζ ${zeta(f.bounce).toFixed(2)}`,
  },
  {
    key: "travel",
    label: "Travel",
    min: 0.4,
    max: 1.6,
    step: 0.02,
    hint: "Distance, angle, squash.",
    show: (f) => `${Math.round(f.travel * 100)} %`,
  },
  {
    key: "ink",
    label: "Ink",
    min: 0,
    max: 2,
    step: 0.05,
    hint: "Pressure swell on impact.",
    show: (f) => `+${(0.5 * f.ink).toFixed(2)} u`,
  },
  {
    key: "cue",
    label: "Cue",
    min: 0,
    max: 1.6,
    step: 0.05,
    hint: "Wind-up before a move.",
    show: (f) => (f.cue < 0.01 ? "off" : `${Math.round(16 * f.cue)} %`),
  },
  {
    key: "lift",
    label: "Pen-lift",
    min: 0,
    max: 1.5,
    step: 0.05,
    hint: "The gap in a container.",
    show: (f) => (f.lift < 0.02 ? "closed" : `${(3.7 * f.lift).toFixed(1)} u`),
  },
  {
    key: "weight",
    label: "Weight",
    min: 1.5,
    max: 2.5,
    step: 0.05,
    hint: "Stroke width.",
    show: (f) => `${f.weight.toFixed(2)} u`,
  },
];

const presetOf = (feel: Feel) =>
  Object.keys(FEELS).find((name) =>
    (Object.keys(feel) as (keyof Feel)[]).every((k) => Math.abs(FEELS[name][k] - feel[k]) < 1e-6),
  ) ?? "Custom";

function Presets({ small }: { small?: boolean }) {
  const { feel, setFeel, playAll } = useLab();
  const current = presetOf(feel);
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5"
      role="group"
      aria-label="Feel preset"
    >
      {Object.keys(FEELS).map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={current === name}
          onClick={() => {
            setFeel(FEELS[name]);
            window.setTimeout(playAll, 30);
          }}
          className={cn(
            "focusable rounded-full px-3 text-[12.5px] transition-colors",
            small ? "h-7" : "h-8",
            current === name ? "bg-ink text-paper" : "text-muted hover:text-ink",
          )}
        >
          {name}
        </button>
      ))}
      {current === "Custom" && <span className="px-2.5 text-[12.5px] text-accent">Custom</span>}
    </div>
  );
}

/** The seven numbers the whole family is tuned by. */
export function FeelSliders({ dense }: { dense?: boolean }) {
  const { feel, setFeel, playAll } = useLab();
  return (
    <div className={cn("grid gap-x-7", dense ? "grid-cols-2 gap-y-3" : "gap-y-4 sm:grid-cols-2")}>
      {KNOBS.map((k) => (
        <label key={k.key} className="block">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-ink">{k.label}</span>
            <span className="code text-[11px] text-muted tabular-nums">{k.show(feel)}</span>
          </span>
          <input
            type="range"
            className="slider mt-1"
            min={k.min}
            max={k.max}
            step={k.step}
            value={feel[k.key]}
            onChange={(e) => setFeel({ ...feel, [k.key]: Number(e.target.value) })}
            onPointerUp={playAll}
            onKeyUp={playAll}
            aria-label={k.label}
          />
          {!dense && <span className="block text-[11.5px] text-muted">{k.hint}</span>}
        </label>
      ))}
    </div>
  );
}

function ActToggle() {
  const { act, setAct } = useLab();
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5"
      role="group"
      aria-label="When icons move"
    >
      {(["Hover", "Click"] as Act[]).map((a) => (
        <button
          key={a}
          type="button"
          aria-pressed={act === a}
          onClick={() => setAct(a)}
          title={a === "Hover" ? "Act::Hover: moves as it is reached" : "Act::Click: answers a press"}
          className={cn(
            "focusable h-7 rounded-full px-3 text-[12.5px] transition-colors",
            act === a ? "bg-ink text-paper" : "text-muted hover:text-ink",
          )}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

/** The floating controls: always in reach, never in the way. */
export function Dock() {
  const { playAll, selected } = useLab();
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-3 transition-[padding] duration-200",
        selected && "lg:pr-[468px]",
      )}
    >
      <div className="pointer-events-auto max-w-full">
        {open && (
          <div
            className="rise mb-2 w-[min(440px,calc(100vw-24px))] rounded-[16px] border border-line bg-paper p-4"
            style={{ boxShadow: "var(--shadow)", animationDuration: "220ms" }}
          >
            <FeelSliders dense />
          </div>
        )}
        <div
          className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-line bg-paper/95 p-1.5 backdrop-blur-md"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <Presets small />
          {/* A touch has no hover, so the trigger choice is for pointers. */}
          <div className="hidden flex-none sm:block">
            <ActToggle />
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={cn(
              "focusable h-8 shrink-0 rounded-full border px-3.5 text-[12.5px] transition-colors",
              open ? "border-accent text-accent" : "border-line text-ink hover:bg-raise",
            )}
          >
            Tune
          </button>
          <button
            type="button"
            onClick={playAll}
            className="focusable inline-flex h-8 shrink-0 items-center gap-2 rounded-full bg-ink px-3.5 text-[12.5px] font-medium text-paper transition-transform duration-150 active:scale-[0.96]"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 1.6v8.8L10 6z" fill="currentColor" />
            </svg>
            Play all
          </button>
        </div>
      </div>
    </div>
  );
}

function Rule({
  tag,
  name,
  children,
  ids,
}: {
  tag: string;
  name: string;
  children: ReactNode;
  ids: string[];
}) {
  const { select } = useLab();
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-t border-line py-5">
      <div>
        <div className="flex items-baseline gap-2.5">
          <span className="code text-[11px] text-accent">{tag}</span>
          <h4 className="text-[15px] font-medium text-ink">{name}</h4>
        </div>
        <p className="mt-1.5 max-w-[46ch] text-[13.5px] leading-[1.6] text-muted">{children}</p>
      </div>
      <div className="flex gap-1.5">
        {ids.map((id) => (
          <IconButton
            key={id}
            id={id}
            size={30}
            onPress={() => select(id)}
            className="stage-grid !h-[58px] !w-[58px] !rounded-[14px] border border-line bg-paper"
          />
        ))}
      </div>
    </li>
  );
}

export function Formula() {
  return (
    <Section
      id="formula"
      n="02 — The formula"
      title="One hand, one tempo."
      lead="A family holds together when every member is drawn by the same hand and moves to the same beat. Both halves are small enough to write down: five stroke rules, five verbs, and seven numbers that tune them all at once. Change a number and all 104 glyphs follow."
    >
      <div className="grid gap-x-14 gap-y-14 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-[26px]">Stroke</h3>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-[1.6] text-muted">
            Same 24-unit grid and round 2-unit stroke as today, so sizes, tinting and the
            atlas stay as they are. What changes is how a glyph is put together.
          </p>
          <ul className="mt-6">
            <Rule tag="S1" name="Soft frames" ids={["square", "layout-grid"]}>
              A container's corner radius is a quarter of its side: 4.5 on the 18-unit frame,
              2.2 on a 7-unit tile.
            </Rule>
            <Rule tag="S2" name="The pen-lift" ids={["circle-check", "panel-left"]}>
              A container is one open stroke. It starts and ends at a 3.7-unit lift, where the
              pen left the paper, and that is where its motion begins.
            </Rule>
            <Rule tag="S3" name="Nothing touches" ids={["search", "arrow-down"]}>
              Inner strokes float clear of their container and of each other, so any part can
              move without tearing a joint.
            </Rule>
            <Rule tag="S4" name="Ink drops" ids={["list", "sliders-horizontal"]}>
              Small things are solid: bullets, pupils, knobs, lights. They are the lightest
              parts, so they move first and furthest.
            </Rule>
            <Rule tag="S5" name="One stroke, one direction" ids={["check", "wind"]}>
              Anything that is re-inked is a single open path, written in the direction a hand
              would draw it.
            </Rule>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-[26px]">Motion</h3>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-[1.6] text-muted">
            Every move is built from the same three beats. The lightest part leads; each
            follower starts 35–70 ms later, travels less and skips the cue.
          </p>
          <div className="mt-6 rounded-[16px] border border-line bg-raise p-4">
            <CurvePlot />
          </div>
          <ul className="mt-6">
            <Rule tag="go" name="Cue · Act · Rest" ids={["minus", "play"]}>
              Winds up a touch the wrong way for 45 ms, flicks to its mark in 120 ms, and is
              carried home by a spring. Light parts ring; heavy parts get more damping.
            </Rule>
            <Rule tag="to" name="A turn that lands on itself" ids={["settings", "x"]}>
              A one-way move to a pose identical to rest: a quarter turn of a cross, one tooth
              of a cog, one lap of a clock hand.
            </Rule>
            <Rule tag="draw" name="Re-ink" ids={["undo-2", "table"]}>
              The stroke is pulled back to a nub of ink and laid down again, as one
              continuous segment. The nub stays on the paper, so no frame is ever blank.
            </Rule>
            <Rule tag="ink" name="Pressure" ids={["underline", "highlighter"]}>
              The stroke swells as it lands and thins back on the spring. It still reads at
              15 pt, where a one-pixel shift does not.
            </Rule>
            <Rule tag="ghost" name="Echo" ids={["chevron-right", "bookmark"]}>
              A part that is invisible at rest: an echo, a flash, a spark. Its opacity is a
              segment, never an attribute, so the generator cannot drop it.
            </Rule>
          </ul>
        </div>
      </div>

      <div className="mt-14 rounded-[20px] border border-line bg-raise p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-[26px]">Feel</h3>
            <p className="mt-1 text-[14px] text-muted">
              Seven numbers. The whole set re-tunes as you drag.
            </p>
          </div>
          <Presets />
        </div>
        <div className="mt-6">
          <FeelSliders />
        </div>
      </div>
    </Section>
  );
}
