"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns 0..1 for how far a tall element has scrolled through the viewport:
 * 0 when its top reaches the top of the viewport, 1 when its bottom does.
 * rAF-throttled. Used to drive the 3D journey scene.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) { setP(0); return; }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setP(scrolled / total);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, p };
}
