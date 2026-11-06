import { useCallback, useEffect, useRef } from "react";
import { useAnimate, type AnimationPlaybackControls } from "motion/react";
import type { IconDefinition } from "./types";
import { useAnimationSettings } from "./settings";

/**
 * Drives one icon instance.
 *
 * `scope` goes on the <svg> (see <IconGlyph>). `play()` starts the timeline;
 * if it is already running it is completed first (every timeline ends at
 * rest), so a re-trigger is a clean restart rather than a jump.
 */
export function useAnimatedIcon(icon: IconDefinition) {
  const [scope, animate] = useAnimate<SVGSVGElement>();
  const settings = useAnimationSettings();
  const controls = useRef<AnimationPlaybackControls | null>(null);

  const play = useCallback(() => {
    if (!scope.current || !settings.isLive(icon.id)) return;
    controls.current?.complete();
    const c = animate(icon.timeline);
    c.speed = settings.speed;
    controls.current = c;
  }, [animate, icon, scope, settings]);

  useEffect(() => () => controls.current?.stop(), []);

  return { scope, play, isLive: settings.isLive(icon.id) };
}

/**
 * Critique/inspection helper: mounts the icon frozen at `time` seconds into
 * its timeline (or at a 0..1 `progress`). Used by the Filmstrip so every frame
 * of a choreography can be looked at, like onion-skinning in an animation app.
 */
export function useScrubbedIcon(icon: IconDefinition, progress: number, onDuration?: (d: number) => void) {
  const [scope, animate] = useAnimate<SVGSVGElement>();

  useEffect(() => {
    if (!scope.current) return;
    const c = animate(icon.timeline);
    c.pause();
    const d = c.duration;
    onDuration?.(d);
    // Two frames: let Motion resolve initial values before seeking.
    const raf = requestAnimationFrame(() => {
      c.time = Math.min(d, Math.max(0, progress * d));
    });
    return () => {
      cancelAnimationFrame(raf);
      c.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icon, progress]);

  return scope;
}

/** Total authored duration of an icon's timeline, in seconds. */
export function timelineDuration(icon: IconDefinition): number {
  let end = 0;
  let cursor = 0;
  for (const seg of icon.timeline) {
    if (!Array.isArray(seg)) continue;
    const opts = (seg[2] ?? {}) as { duration?: number; at?: number | string; delay?: number };
    const dur = (opts.duration ?? 0.3) + (opts.delay ?? 0);
    let start = cursor;
    if (typeof opts.at === "number") start = opts.at;
    else if (typeof opts.at === "string" && opts.at.startsWith("<")) start = cursor; // approximation
    else if (typeof opts.at === "string" && /^[+-]/.test(opts.at)) start = cursor + parseFloat(opts.at);
    end = Math.max(end, start + dur);
    cursor = start + dur;
  }
  return end;
}
