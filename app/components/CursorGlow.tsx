"use client";

import { useEffect } from "react";

/** Renders a page-wide blurred glow that eases toward the pointer. */
export default function CursorGlow() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = document.createElement("div");
    el.className = "cursor-glow";
    document.body.appendChild(el);

    let tx = 50, ty = 40, gx = 50, gy = 40, raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    };
    const tick = () => {
      gx += (tx - gx) * 0.1; gy += (ty - gy) * 0.1;
      el.style.setProperty("--gx", `${gx}%`);
      el.style.setProperty("--gy", `${gy}%`);
      raf = requestAnimationFrame(tick);
    };
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      el.remove();
    };
  }, []);
  return null;
}
