import { useEffect, useState } from "react";
import { AnimationSettingsProvider } from "./motion/settings";
import { Gallery } from "./app/Gallery";
import { AnimationTab } from "./app/AnimationTab";
import { CritiquePage } from "./app/CritiquePage";
import { AnimatedIcon } from "./motion/AnimatedIcon";
import { ICONS_BY_ID } from "./icons";

type Tab = "icons" | "animation";
type Mode = "light" | "dark";

const params = new URLSearchParams(window.location.search);
const critique = params.get("critique");

export default function App() {
  const [tab, setTab] = useState<Tab>((window.location.hash.slice(1) as Tab) || "icons");
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) || "light");

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  useEffect(() => {
    window.location.hash = tab;
  }, [tab]);

  if (critique) {
    return (
      <AnimationSettingsProvider>
        <CritiquePage ids={critique} />
      </AnimationSettingsProvider>
    );
  }

  return (
    <AnimationSettingsProvider>
      <div className="app">
        <nav className="topbar">
          <div className="topbar__brand">
            <AnimatedIcon icon={ICONS_BY_ID["library-big"]} size={20} />
            <span>mareader2 · icons</span>
          </div>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === "icons"} data-on={tab === "icons"} onClick={() => setTab("icons")}>
              Icons
            </button>
            <button role="tab" aria-selected={tab === "animation"} data-on={tab === "animation"} onClick={() => setTab("animation")}>
              Animation
            </button>
          </div>
          <button type="button" className="icon-btn icon-btn--plain" onClick={() => setMode(mode === "light" ? "dark" : "light")} aria-label="Toggle theme">
            <AnimatedIcon icon={ICONS_BY_ID[mode === "light" ? "moon" : "sun"]} size={20} trigger="hover" />
          </button>
        </nav>
        {tab === "icons" ? <Gallery /> : <AnimationTab />}
        <footer className="foot muted">
          Geometry: Lucide (ISC). Motion: authored per icon in <code>src/icons/*.tsx</code>; engine in <code>src/motion</code>. Critique any icon
          with <code>?critique=id,id</code> or <code>?critique=all</code>.
        </footer>
      </div>
    </AnimationSettingsProvider>
  );
}
