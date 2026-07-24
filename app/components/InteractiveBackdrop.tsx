"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed, full-viewport backdrop that reacts to input:
 *  - a soft coral glow follows the pointer (--px/--py),
 *  - the dotted grid parallax-shifts slightly with the pointer and on scroll,
 *  - all driven via CSS custom properties on refs (no per-frame React renders).
 * Respects prefers-reduced-motion (stays static) and pauses when tab hidden.
 */
export default function InteractiveBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const grid = gridRef.current;
    const glow = glowRef.current;
    if (!root) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Target vs. rendered values, eased each frame for smoothness.
    let tx = 0.5, ty = 0.3; // pointer position 0..1
    let rx = 0.5, ry = 0.3;
    let scrollY = 0, rScroll = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
    };
    const onScroll = () => { scrollY = window.scrollY || 0; };

    const tick = () => {
      // ease toward targets
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      rScroll += (scrollY - rScroll) * 0.1;

      if (glow) {
        glow.style.setProperty("--px", `${rx * 100}%`);
        glow.style.setProperty("--py", `${ry * 100}%`);
      }
      if (grid) {
        // pointer parallax (a few px) + scroll parallax (slow drift)
        const gx = (rx - 0.5) * 18;
        const gy = (ry - 0.5) * 18 - rScroll * 0.03;
        grid.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    const onVis = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Parallax dotted grid — slightly oversized so the transform never reveals an edge. */}
      <div
        ref={gridRef}
        className="absolute -inset-12 dotgrid opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black,transparent_78%)] will-change-transform"
      />
      {/* Static top wash for depth. */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-[--color-coral]/[0.06] blur-[120px]" />
      {/* Pointer-following glow. */}
      <div
        ref={glowRef}
        className="absolute inset-0 will-change-[background]"
        style={{
          background:
            "radial-gradient(480px circle at var(--px,50%) var(--py,30%), color-mix(in srgb, var(--color-coral) 12%, transparent), transparent 60%)",
        }}
      />
    </div>
  );
}
