"use client";

import { useEffect, useRef } from "react";

/**
 * Translates its child on scroll for a subtle parallax float.
 * `speed` is px moved per 100px scrolled past the element's center
 * (positive = moves up as you scroll down). Uses rAF + refs, no re-renders.
 * Static under prefers-reduced-motion.
 */
export default function Parallax({
  children,
  speed = 6,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let current = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1..1 as the element travels through the viewport
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const target = -progress * speed * 10;
      current += (target - current) * 0.12;
      el.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
