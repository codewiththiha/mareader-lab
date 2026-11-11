import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Glyph, OriginalGlyph, type GlyphHandle, type OriginalPack } from "./components/Glyph";
import type { Ease } from "./engine/core";
import { FEELS, build, easingsFor, type Feel, type IconDef, type Pack } from "./engine/motion";
import originalData from "./data/original.json";
import { ICONS } from "./icons";
import { cn } from "./utils/cn";

export const ORIGINALS = originalData as unknown as OriginalPack[];
export const ORIGINAL_BY_ID = new Map(ORIGINALS.map((p) => [p.id, p]));

/** The app's four base modes, from docs/design.md § Colour. */
export const THEMES = ["Light", "Dark", "Dim", "Black"] as const;
export type Theme = (typeof THEMES)[number];

/** When a glyph moves: `Act::Hover` or `Act::Click` in icons/anim.rs. */
export type Act = "Hover" | "Click";

interface Lab {
  feel: Feel;
  setFeel: (f: Feel) => void;
  easings: Ease[];
  packs: Map<string, Pack>;
  defs: IconDef[];
  theme: Theme;
  setTheme: (t: Theme) => void;
  act: Act;
  setAct: (a: Act) => void;
  /** Bumps to make every visible glyph play, in a wave. */
  wave: number;
  playAll: () => void;
  selected: string | null;
  select: (id: string | null) => void;
}

const Ctx = createContext<Lab | null>(null);

export function useLab(): Lab {
  const lab = useContext(Ctx);
  if (!lab) throw new Error("useLab outside LabProvider");
  return lab;
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [feel, setFeel] = useState<Feel>(FEELS.Crisp);
  const [theme, setTheme] = useState<Theme>("Dark");
  const [act, setAct] = useState<Act>("Hover");
  const [wave, setWave] = useState(0);
  const [selected, select] = useState<string | null>(null);

  const easings = useMemo(() => easingsFor(feel), [feel]);
  const packs = useMemo(() => new Map(ICONS.map((d) => [d.id, build(d, feel)])), [feel]);
  const playAll = useCallback(() => setWave((w) => w + 1), []);

  const value = useMemo<Lab>(
    () => ({
      feel,
      setFeel,
      easings,
      packs,
      defs: ICONS,
      theme,
      setTheme,
      act,
      setAct,
      wave,
      playAll,
      selected,
      select,
    }),
    [feel, easings, packs, theme, act, wave, playAll, selected],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

interface IconProps {
  id: string;
  size?: number;
  className?: string;
  /** Draw the shipped Lucide pack instead of the redesign. */
  shipped?: boolean;
}

/** A bare glyph by id, with a handle for whoever wants to drive it. */
export function useIcon({ id, size = 18, className, shipped }: IconProps) {
  const { packs, easings } = useLab();
  const handle = useRef<GlyphHandle | null>(null);
  const pack = packs.get(id);
  const original = ORIGINAL_BY_ID.get(id);
  let node: ReactNode = null;
  if (shipped && original) {
    node = <OriginalGlyph ref={handle} pack={original} size={size} className={className} />;
  } else if (!shipped && pack) {
    node = <Glyph ref={handle} pack={pack} easings={easings} size={size} className={className} />;
  }
  return { node, play: () => handle.current?.play() };
}

interface IconButtonProps extends IconProps {
  /** Overrides the lab-wide trigger. */
  act?: Act;
  /** Position in a wave, for the play-all stagger. */
  order?: number;
  label?: string;
  onPress?: () => void;
  children?: ReactNode;
  pressed?: boolean;
}

/**
 * When a glyph moves is its surroundings' business: a region `announce`s an
 * `Act` in the app. Hover fires on entry, click on press, and a lab-wide wave
 * plays everything in order.
 */
export function useTrigger(play: () => void, order = 0, override?: Act) {
  const lab = useLab();
  const mode = override ?? lab.act;
  const seen = useRef(lab.wave);
  const touch = useRef(false);
  const playRef = useRef(play);
  playRef.current = play;

  useEffect(() => {
    if (seen.current === lab.wave) return;
    seen.current = lab.wave;
    const id = window.setTimeout(() => playRef.current(), Math.min(order, 70) * 20);
    return () => window.clearTimeout(id);
  }, [lab.wave, order]);

  return {
    handlers: {
      onPointerEnter: (e: PointerEvent<HTMLElement>) => {
        if (mode === "Hover" && e.pointerType !== "touch") playRef.current();
      },
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        touch.current = e.pointerType === "touch";
      },
      onFocus: (e: FocusEvent<HTMLElement>) => {
        if (mode === "Hover" && e.target.matches(":focus-visible")) playRef.current();
      },
    },
    /** Hover regions fire on entry only; a touch has no entry, so a tap answers. */
    press: () => {
      if (mode === "Click" || touch.current) playRef.current();
    },
  };
}

/** A toolbar button that owns one glyph. */
export function IconButton({
  act,
  order = 0,
  label,
  onPress,
  children,
  className,
  pressed,
  ...icon
}: IconButtonProps) {
  const { node, play } = useIcon(icon);
  const { handlers, press } = useTrigger(play, order, act);
  return (
    <button
      type="button"
      aria-label={label ?? icon.id}
      aria-pressed={pressed}
      {...handlers}
      onClick={() => {
        press();
        onPress?.();
      }}
      className={cn("icon-btn", className)}
    >
      {node}
      {children}
    </button>
  );
}
