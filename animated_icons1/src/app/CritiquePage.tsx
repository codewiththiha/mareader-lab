import { useEffect } from "react";
import { ICONS, ICONS_BY_ID } from "../icons";
import { Filmstrip } from "./Filmstrip";

/**
 * `?critique=all` or `?critique=id,id,…` – a contact sheet of filmstrips the
 * screenshot tool (tools/critique.mjs) captures. Also handy in a browser.
 * `&frames=16&size=64` tune density. `&from=20&count=10` page through `all`.
 */
export function CritiquePage({ ids }: { ids: string }) {
  const params = new URLSearchParams(window.location.search);
  const frames = Number(params.get("frames") ?? 12);
  const size = Number(params.get("size") ?? 56);
  const from = Number(params.get("from") ?? 0);
  const count = Number(params.get("count") ?? 10);

  const list = ids === "all" ? ICONS.slice(from, from + count) : ids.split(",").map((id) => ICONS_BY_ID[id.trim()]).filter(Boolean);

  useEffect(() => {
    // Let every frame mount and seek before the tool takes its picture.
    const t = setTimeout(() => {
      document.body.dataset.ready = "true";
    }, 400);
    return () => clearTimeout(t);
  }, [ids]);

  return (
    <div className="critique" id="critique">
      {list.map((icon) => (
        <Filmstrip key={icon.id} icon={icon} frames={frames} size={size} />
      ))}
      {list.length === 0 && <p className="muted">No icons matched “{ids}”.</p>}
    </div>
  );
}
