import type { PointerEvent } from "react";
import type { IconDefinition } from "../motion/types";
import { IconGlyph } from "../motion/AnimatedIcon";
import { useAnimatedIcon } from "../motion/useAnimatedIcon";
import { triggerIncludes, useAnimationSettings } from "../motion/settings";

/**
 * How mareader would use an icon: a quiet toolbar button whose whole hit
 * area triggers the motion. Does nothing else yet – that's by design.
 */
export function IconButton({ icon, size = 22, label }: { icon: IconDefinition; size?: number; label?: string }) {
  const { scope, play, isLive } = useAnimatedIcon(icon);
  const { trigger } = useAnimationSettings();

  return (
    <button
      type="button"
      className="icon-btn"
      data-live={isLive}
      title={`${icon.name} · ${icon.uses.join(", ")}`}
      aria-label={label ?? icon.name}
      onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
        if (e.pointerType !== "touch" && triggerIncludes(trigger, "hover")) play();
      }}
      onClick={() => triggerIncludes(trigger, "click") && play()}
    >
      <IconGlyph ref={scope} icon={icon} size={size} />
      {label && <span className="icon-btn__label">{label}</span>}
    </button>
  );
}
