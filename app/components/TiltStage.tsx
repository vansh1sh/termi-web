"use client";

import { useEffect, useRef } from "react";

/**
 * Presents its child on a 3D "stage": a subtle resting tilt that eases toward
 * the pointer, with a coral floor glow behind it. Gives the app showcase a
 * premium, floating-in-space product-shot feel. Static under reduced-motion.
 */
export default function TiltStage({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      card.style.transform = "perspective(1400px) rotateX(4deg)";
      return;
    }
    // resting tilt + eased pointer influence
    let tx = 0, ty = 0, rx = 0, ry = 0, raf = 0;
    const REST_X = 5; // degrees leaning back at rest
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / r.width;   // -0.5..0.5
      ty = (e.clientY - (r.top + r.height / 2)) / r.height;
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const tick = () => {
      rx += (tx - rx) * 0.07; ry += (ty - ry) * 0.07;
      card.style.transform =
        `perspective(1400px) rotateX(${REST_X - ry * 6}deg) rotateY(${rx * 8}deg) translateZ(0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative" style={{ transformStyle: "preserve-3d" }}>
      {/* floor glow */}
      <div className="pointer-events-none absolute -inset-x-10 -bottom-10 top-1/3 -z-10 bg-[--color-coral]/10 blur-[80px] rounded-[50%]" />
      <div ref={cardRef} className="will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
