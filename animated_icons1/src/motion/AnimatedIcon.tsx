import { forwardRef, type PointerEvent, type SVGProps } from "react";
import type { IconDefinition, Trigger } from "./types";
import { useAnimatedIcon } from "./useAnimatedIcon";
import { triggerIncludes, useAnimationSettings } from "./settings";

export interface IconGlyphProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  icon: IconDefinition;
  size?: number | string;
  strokeWidth?: number;
}

/**
 * The resting glyph: a plain <svg> on Lucide's 24-unit grid. Stateless – pair
 * with `useAnimatedIcon` (pass its `scope` as ref) to make it move.
 */
export const IconGlyph = forwardRef<SVGSVGElement, IconGlyphProps>(function IconGlyph(
  { icon, size = 24, strokeWidth = 2, className, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-icon={icon.id}
      className={["mi", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon.glyph}
    </svg>
  );
});

export interface AnimatedIconProps extends IconGlyphProps {
  /** Override the global trigger setting for this instance. */
  trigger?: Trigger;
}

/**
 * Drop-in animated icon: plays on hover and/or click of the <svg> itself.
 * For buttons, prefer `useAnimatedIcon` + <IconGlyph> so the whole hit area
 * triggers the motion (see IconButton in the gallery).
 */
export function AnimatedIcon({ icon, trigger, onPointerEnter, onClick, ...rest }: AnimatedIconProps) {
  const { scope, play } = useAnimatedIcon(icon);
  const settings = useAnimationSettings();
  const t = trigger ?? settings.trigger;

  return (
    <IconGlyph
      ref={scope}
      icon={icon}
      onPointerEnter={(e: PointerEvent<SVGSVGElement>) => {
        if (e.pointerType !== "touch" && triggerIncludes(t, "hover")) play();
        onPointerEnter?.(e);
      }}
      onClick={(e) => {
        if (triggerIncludes(t, "click")) play();
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
