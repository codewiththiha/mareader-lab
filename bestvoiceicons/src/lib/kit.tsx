import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Entry } from "../data/registry";

/* ------------------------------------------------------------------ */
/*  IconView — renders any ledger entry (stroke glyph or raw fill      */
/*  logo) with live size / stroke / cap / tint / optical padding.      */
/* ------------------------------------------------------------------ */

export interface ViewOpts {
  size?: number;
  sw?: number;
  cap?: "round" | "square";
  pad?: number;
  tint?: string;
  which?: "new" | "old";
  className?: string;
  style?: CSSProperties;
}

export function IconView({
  entry, size = 24, sw = 2, cap = "round", pad = 0, tint, which = "new",
  className, style,
}: { entry: Entry } & ViewOpts) {
  const vb = pad ? `${-pad} ${-pad} ${24 + pad * 2} ${24 + pad * 2}` : "0 0 24 24";

  if (entry.raw) {
    const html = entry.raw
      .replace(/width="24"/, `width="${size}"`)
      .replace(/height="24"/, `height="${size}"`)
      .replace(/fill="white"/g, 'fill="currentColor"');
    const padFrac = pad / 24;
    return (
      <span
        className={`inline-flex items-center justify-center ${className ?? ""}`}
        style={{
          color: tint, lineHeight: 0,
          padding: size * padFrac,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const Comp = (which === "old" ? entry.Old : entry.Icon) ?? entry.Icon;
  if (!Comp) return null;
  return (
    <span className={`inline-flex ${className ?? ""}`} style={{ color: tint, lineHeight: 0, ...style }}>
      <Comp size={size} strokeWidth={sw} strokeLinecap={cap} viewBox={vb} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG export — serialise what is actually on screen                  */
/* ------------------------------------------------------------------ */

export function serializeFromNode(
  node: HTMLElement | null, size: number, tint: string,
): string | null {
  if (!node) return null;
  const svg = node.querySelector("svg");
  if (!svg) return null;
  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("width", String(size));
  clone.setAttribute("height", String(size));
  clone.removeAttribute("class");
  let out = clone.outerHTML;
  if (!out.includes("xmlns=")) {
    out = out.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return out.replace(/currentColor/g, tint);
}

export function downloadSvg(text: string, name: string) {
  const blob = new Blob([text], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Reveal on scroll                                                   */
/* ------------------------------------------------------------------ */

export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }),
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, seen };
}

/* Scroll-spy for the fixed nav */
export function useSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.1, 0.4] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids.join("|")]);
  return active;
}
