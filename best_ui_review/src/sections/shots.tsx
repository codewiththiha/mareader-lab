import { useState } from "react";
import { X } from "lucide-react";
import { Section } from "../kit/frame";

/** Screenshots shipped in the repo (docs/screenshots/readme). */
const REF: [string, string][] = [
  ["read-aloud-playing", "Reader with the compact player at its default width"],
  ["read-aloud-library", "The full player card over the library"],
  ["cefr-word-lookup", "Dictionary hover card over CEFR-marked text"],
  ["cefr-ai-lookup", "AI word card"],
  ["notes-panel", "Notes panel, highlights and margin markers"],
  ["reader-default", "Reader with the thumbnails sidebar"],
  ["four-panes", "Four panes"],
  ["themes-comparison", "Themes"],
  ["local-voice-settings", "Voice settings"],
  ["ai-model-setup", "AI model setup"],
];

/** Captures from `cargo run -p mareader-ui --example shot` (headless, lavapipe). Filled in when the build ran. */
export const SHOTS: [string, string][] = [
  ["appearance.png", "Appearance popover at HEAD · preset=sepia open=appearance"],
  ["player.png", "Player with no voice: the link clips to “Voice settir” · epub=sample read_aloud=true"],
  ["toast.png", "Info toast · toast=Moved Dune to Science fiction"],
  ["menu.png", "View & tools menu · open=menu"],
];

export function Shots() {
  const [open, setOpen] = useState<string | null>(null);
  const all = [...SHOTS.map(([f, t]) => [`shots/${f}`, t, "shot tool"] as const), ...REF.map(([f, t]) => [`ref/${f}.jpg`, t, "repo screenshot"] as const)];
  return (
    <Section id="shots" kicker="docs/screenshots · examples/shot.rs" title="Reference captures"
      intro={<>The ground truth the “Current” specimens were matched against. Click to enlarge. {SHOTS.length > 0 ? "Captures marked “shot tool” were rendered headlessly from the repo's own example at the reviewed commit." : "Repo screenshots ship with the repository at the reviewed commit."}</>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {all.map(([src, title, kind]) => (
          <button key={src} onClick={() => setOpen(src)} className="group overflow-hidden rounded-2xl border border-sline bg-spanel text-left">
            <div className="aspect-[3/2] overflow-hidden bg-sink/5"><img src={src} alt={title} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]" /></div>
            <div className="flex items-center gap-2 px-3 py-2.5"><span className="text-[13px] text-sink">{title}</span><span className="ml-auto rounded-full bg-sink/5 px-2 py-0.5 text-[10.5px] text-smuted">{kind}</span></div>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6" onClick={() => setOpen(null)}>
          <img src={open} alt="" className="max-h-full max-w-full rounded-xl shadow-2xl" />
          <button className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-black" aria-label="Close"><X size={18} /></button>
        </div>
      )}
    </Section>
  );
}
