import { useMemo, useState } from "react";
import { CATEGORY_ORDER, ICONS, iconsInCategory } from "../icons";
import { IconButton } from "./IconButton";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { useAnimationSettings } from "../motion/settings";

/** The home page: every icon as the kind of button mareader will use it in. */
export function Gallery() {
  const [query, setQuery] = useState("");
  const { enabled } = useAnimationSettings();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      ICONS.filter((i) => [i.id, i.name, i.lucide, ...i.uses, i.intent].join(" ").toLowerCase().includes(q)).map((i) => i.id),
    );
  }, [query]);

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__row">
          <AnimatedIcon icon={ICONS.find((i) => i.id === "book-open")!} size={40} className="hero__mark" />
          <div>
            <h1>Mareader icon motion</h1>
            <p className="muted">
              {ICONS.length} Lucide glyphs from <code>crates/ui/src/icons.rs</code>, each with its own choreography.
              Hover or click a button. Nothing is wired up yet; this is the motion library mareader2 will draw from.
            </p>
          </div>
        </div>
        <div className="hero__tools">
          <input
            className="search"
            placeholder="Search icons, meanings, Lucide names…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {!enabled && <span className="pill pill--warn">Animations are off — see the Animation tab</span>}
        </div>
      </header>

      {CATEGORY_ORDER.map((cat) => {
        const list = iconsInCategory(cat).filter((i) => !matches || matches.has(i.id));
        if (!list.length) return null;
        return (
          <section key={cat} className="group">
            <h2 className="group__title">
              {cat} <span className="muted">{list.length}</span>
            </h2>
            <div className="toolbar">
              {list.map((icon) => (
                <IconButton key={icon.id} icon={icon} label={icon.uses[0]} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
