import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Trigger } from "./types";

export interface AnimationSettings {
  /** Master switch. */
  enabled: boolean;
  /** Icons switched off individually (ids). */
  disabled: Record<string, true>;
  /** Playback rate multiplier, 1 = authored speed. */
  speed: number;
  trigger: Trigger;
  /** Respect the OS "reduce motion" preference. */
  respectReducedMotion: boolean;
}

interface AnimationSettingsApi extends AnimationSettings {
  setEnabled: (v: boolean) => void;
  toggleIcon: (id: string) => void;
  setIconEnabled: (id: string, on: boolean) => void;
  setAllIcons: (ids: string[], on: boolean) => void;
  setSpeed: (v: number) => void;
  setTrigger: (t: Trigger) => void;
  setRespectReducedMotion: (v: boolean) => void;
  /** Should this icon animate right now? (master + per-icon + OS preference) */
  isLive: (id: string) => boolean;
  reducedMotion: boolean;
}

const DEFAULTS: AnimationSettings = {
  enabled: true,
  disabled: {},
  speed: 1,
  trigger: "both",
  respectReducedMotion: true,
};

const STORAGE_KEY = "mareader.icon-motion.v1";

const load = (): AnimationSettings => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const Ctx = createContext<AnimationSettingsApi | null>(null);

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
};

export function AnimationSettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnimationSettings>(load);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode – fine */
    }
  }, [state]);

  const api = useMemo<AnimationSettingsApi>(() => {
    const patch = (p: Partial<AnimationSettings>) => setState((s) => ({ ...s, ...p }));
    const setIconEnabled = (id: string, on: boolean) =>
      setState((s) => {
        const disabled = { ...s.disabled };
        if (on) delete disabled[id];
        else disabled[id] = true;
        return { ...s, disabled };
      });
    return {
      ...state,
      reducedMotion,
      setEnabled: (enabled) => patch({ enabled }),
      toggleIcon: (id) => setIconEnabled(id, !!state.disabled[id]),
      setIconEnabled,
      setAllIcons: (ids, on) =>
        setState((s) => {
          const disabled = { ...s.disabled };
          ids.forEach((id) => (on ? delete disabled[id] : (disabled[id] = true)));
          return { ...s, disabled };
        }),
      setSpeed: (speed) => patch({ speed }),
      setTrigger: (trigger) => patch({ trigger }),
      setRespectReducedMotion: (respectReducedMotion) => patch({ respectReducedMotion }),
      isLive: (id) =>
        state.enabled && !state.disabled[id] && !(state.respectReducedMotion && reducedMotion),
    };
  }, [state, reducedMotion]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** Settings are optional: without a provider icons simply animate with defaults. */
export const useAnimationSettings = (): AnimationSettingsApi => {
  const ctx = useContext(Ctx);
  return ctx ?? FALLBACK;
};

const noop = () => {};
const FALLBACK: AnimationSettingsApi = {
  ...DEFAULTS,
  reducedMotion: false,
  setEnabled: noop,
  toggleIcon: noop,
  setIconEnabled: noop,
  setAllIcons: noop,
  setSpeed: noop,
  setTrigger: noop,
  setRespectReducedMotion: noop,
  isLive: () => true,
};

export const useIsLive = (id: string) => useAnimationSettings().isLive(id);

/** Convenience for the hook: which DOM events should start a play. */
export const triggerIncludes = (t: Trigger, kind: "hover" | "click") => t === "both" || t === kind;
