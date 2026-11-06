import { useState } from "react";
import { CATEGORY_ORDER, ICONS, iconsInCategory } from "../icons";
import { useAnimationSettings } from "../motion/settings";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import type { IconDefinition, Trigger } from "../motion/types";
import { Filmstrip } from "./Filmstrip";

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" data-on={on} onClick={() => onChange(!on)}>
      <span className="switch__knob" />
    </button>
  );
}

function IconRow({ icon, onInspect }: { icon: IconDefinition; onInspect: () => void }) {
  const s = useAnimationSettings();
  const on = !s.disabled[icon.id];
  return (
    <div className="row" data-off={!on}>
      <button type="button" className="row__toggle" onClick={() => s.toggleIcon(icon.id)} aria-pressed={on} title={on ? "Turn off" : "Turn on"}>
        <AnimatedIcon icon={icon} size={22} trigger="hover" />
      </button>
      <div className="row__text" onClick={() => s.toggleIcon(icon.id)}>
        <div className="row__name">
          {icon.name} <span className="muted">· {icon.uses.join(", ")}</span>
        </div>
        <div className="row__intent muted">{icon.intent}</div>
      </div>
      <button type="button" className="link" onClick={onInspect}>
        Frames
      </button>
      <Switch on={on} onChange={(v) => s.setIconEnabled(icon.id, v)} label={`Animate ${icon.name}`} />
    </div>
  );
}

/** The Animation tab: master switch, trigger/speed, and one-click per icon. */
export function AnimationTab() {
  const s = useAnimationSettings();
  const [inspect, setInspect] = useState<IconDefinition | null>(null);
  const offCount = Object.keys(s.disabled).length;

  return (
    <div className="page">
      <header className="hero">
        <h1>Animation</h1>
        <p className="muted">
          Every icon's motion can be switched off individually, or all at once. Settings persist in this browser.
          {s.reducedMotion && s.respectReducedMotion && " Your system asks for reduced motion, so icons are currently still."}
        </p>
      </header>

      <section className="panel">
        <div className="panel__row">
          <div>
            <div className="panel__label">Animate icons</div>
            <div className="muted">Master switch. {offCount > 0 && `${offCount} icon${offCount > 1 ? "s" : ""} individually off.`}</div>
          </div>
          <Switch on={s.enabled} onChange={s.setEnabled} label="Animate icons" />
        </div>
        <div className="panel__row">
          <div>
            <div className="panel__label">Trigger</div>
            <div className="muted">When a button plays its motion.</div>
          </div>
          <div className="seg">
            {(["both", "hover", "click"] as Trigger[]).map((t) => (
              <button key={t} type="button" data-on={s.trigger === t} onClick={() => s.setTrigger(t)}>
                {t === "both" ? "Hover + click" : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="panel__row">
          <div>
            <div className="panel__label">Speed</div>
            <div className="muted">{s.speed.toFixed(2)}× — slow it down to study a pose.</div>
          </div>
          <input type="range" min={0.1} max={2} step={0.05} value={s.speed} onChange={(e) => s.setSpeed(parseFloat(e.target.value))} />
        </div>
        <div className="panel__row">
          <div>
            <div className="panel__label">Respect “reduce motion”</div>
            <div className="muted">Stay still when the OS asks for it.</div>
          </div>
          <Switch on={s.respectReducedMotion} onChange={s.setRespectReducedMotion} label="Respect reduced motion" />
        </div>
        <div className="panel__row panel__row--actions">
          <button type="button" className="btn" onClick={() => s.setAllIcons(ICONS.map((i) => i.id), true)}>
            All on
          </button>
          <button type="button" className="btn" onClick={() => s.setAllIcons(ICONS.map((i) => i.id), false)}>
            All off
          </button>
        </div>
      </section>

      {CATEGORY_ORDER.map((cat) => {
        const list = iconsInCategory(cat);
        const allOn = list.every((i) => !s.disabled[i.id]);
        return (
          <section key={cat} className="group">
            <h2 className="group__title">
              {cat} <span className="muted">{list.length}</span>
              <button type="button" className="link" onClick={() => s.setAllIcons(list.map((i) => i.id), !allOn)}>
                {allOn ? "Turn group off" : "Turn group on"}
              </button>
            </h2>
            <div className="rows">
              {list.map((icon) => (
                <IconRow key={icon.id} icon={icon} onInspect={() => setInspect(icon)} />
              ))}
            </div>
          </section>
        );
      })}

      {inspect && (
        <div className="sheet" onClick={() => setInspect(null)}>
          <div className="sheet__body" onClick={(e) => e.stopPropagation()}>
            <Filmstrip icon={inspect} frames={12} size={48} />
            <button type="button" className="btn" onClick={() => setInspect(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
