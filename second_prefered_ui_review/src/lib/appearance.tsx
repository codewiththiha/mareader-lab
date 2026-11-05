import { createContext, useContext } from "react";
import type { Appearance } from "../theme";

export interface AppearanceCtx {
  a: Appearance;
  set: (a: Appearance) => void;
  texture: "none" | "paper" | "canvas"; setTexture: (t: "none" | "paper" | "canvas") => void;
  textureOpacity: number; setTextureOpacity: (n: number) => void;
  grain: "off" | "static" | "animated"; setGrain: (g: "off" | "static" | "animated") => void;
  grainIntensity: number; setGrainIntensity: (n: number) => void;
  ink: number; setInk: (n: number) => void;
}

export const Ctx = createContext<AppearanceCtx | null>(null);
export const useAppearance = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("no appearance context");
  return c;
};
