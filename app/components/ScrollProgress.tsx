"use client";

import { useEffect, useState } from "react";

/** A thin coral→amber bar at the very top that fills with scroll depth. */
export default function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
      <div
        className="h-full scrollbar-fill bg-gradient-to-r from-[--color-coral] via-[--color-amber] to-[--color-coral]"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}
