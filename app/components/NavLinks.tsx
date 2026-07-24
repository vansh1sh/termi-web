"use client";

import { useEffect, useState } from "react";

// Section ids to track, in document order.
const SECTIONS = [
  { id: "features", label: "Features" },
  { id: "how", label: "How it works" },
];

/**
 * Nav anchor links that highlight the section currently in view. Uses one
 * IntersectionObserver across the tracked sections and picks the topmost
 * intersecting one. Degrades gracefully (no highlight) if IO is unavailable.
 */
export default function NavLinks() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    // Track visibility ratios; the topmost sufficiently-visible section wins.
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        let best: string | null = null;
        for (const s of SECTIONS) {
          if ((ratios.get(s.id) ?? 0) > 0.25) { best = s.id; break; }
        }
        setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 1], rootMargin: "-64px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "true" : undefined}
          className={`hidden sm:block transition ${
            active === s.id ? "text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          {s.label}
        </a>
      ))}
    </>
  );
}
