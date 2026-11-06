import type { IconCategory, IconDefinition } from "../motion/types";
import { chromeIcons } from "./chrome";
import { readingIcons } from "./reading";
import { navigationIcons } from "./navigation";
import { libraryIcons } from "./library";
import { playbackIcons } from "./playback";
import { appearanceIcons } from "./appearance";
import { editingIcons } from "./editing";
import { aiIcons } from "./ai";
import { statusIcons } from "./status";

/** Every animated icon, in gallery order. */
export const ICONS: IconDefinition[] = [
  ...chromeIcons,
  ...readingIcons,
  ...navigationIcons,
  ...libraryIcons,
  ...playbackIcons,
  ...appearanceIcons,
  ...editingIcons,
  ...aiIcons,
  ...statusIcons,
];

export const CATEGORY_ORDER: IconCategory[] = [
  "Chrome & panels",
  "Reading",
  "Navigation",
  "Library",
  "Playback & voice",
  "Appearance",
  "Editing & notes",
  "AI & models",
  "Status & controls",
];

export const ICONS_BY_ID: Record<string, IconDefinition> = Object.fromEntries(ICONS.map((i) => [i.id, i]));

export const iconsInCategory = (c: IconCategory) => ICONS.filter((i) => i.category === c);

/** Duplicate ids are a bug: fail loudly. */
{
  const seen = new Set<string>();
  for (const i of ICONS) {
    if (seen.has(i.id)) console.error(`Duplicate icon id: ${i.id}`);
    seen.add(i.id);
  }
}
