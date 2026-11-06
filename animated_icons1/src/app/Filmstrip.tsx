import { useState } from "react";
import type { IconDefinition } from "../motion/types";
import { IconGlyph } from "../motion/AnimatedIcon";
import { useScrubbedIcon } from "../motion/useAnimatedIcon";

function Frame({ icon, progress, size, onDuration }: { icon: IconDefinition; progress: number; size: number; onDuration?: (d: number) => void }) {
  const scope = useScrubbedIcon(icon, progress, onDuration);
  return <IconGlyph ref={scope} icon={icon} size={size} />;
}

/**
 * The critique view: one icon, `frames` evenly spaced stills from rest to
 * rest. Lets a reviewer (human or screenshot tool) check every pose for
 * crossing strokes, dead frames or an unmotivated move.
 */
export function Filmstrip({ icon, frames = 12, size = 56 }: { icon: IconDefinition; frames?: number; size?: number }) {
  const [duration, setDuration] = useState<number | null>(null);
  return (
    <div className="filmstrip" data-filmstrip={icon.id}>
      <div className="filmstrip__meta">
        <div className="filmstrip__title">
          <strong>{icon.name}</strong>
          <span className="muted">
            {icon.lucide} · {icon.uses.join(", ")}
          </span>
        </div>
        <div className="filmstrip__intent muted">{icon.intent}</div>
        <div className="filmstrip__dur muted">{duration !== null ? `${duration.toFixed(2)}s` : ""}</div>
      </div>
      <div className="filmstrip__frames">
        {Array.from({ length: frames }, (_, i) => {
          const p = i / (frames - 1);
          return (
            <div key={i} className="filmstrip__frame">
              <Frame icon={icon} progress={p} size={size} onDuration={i === 0 ? setDuration : undefined} />
              <span className="filmstrip__t">{Math.round(p * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
