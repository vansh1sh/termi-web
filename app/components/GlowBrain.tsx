"use client";

import { useEffect, useRef } from "react";

/**
 * An illuminating "brain" core with sparks orbiting it. The brain breathes
 * (pulsing glow), sparks fly outward on a canvas, and the whole thing tilts
 * toward the pointer for a 3D feel. Reduced-motion → static glow, no sparks.
 */
export default function GlowBrain() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // pointer tilt
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / r.width;
      ty = (e.clientY - (r.top + r.height / 2)) / r.height;
    };
    const tick = () => {
      rx += (tx - rx) * 0.06; ry += (ty - ry) * 0.06;
      el.style.transform = `perspective(800px) rotateY(${rx * 14}deg) rotateX(${-ry * 14}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); };
  }, []);

  // spark particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0, w = 0, h = 0, dpr = 1;
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };
    let sparks: Spark[] = [];

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const emit = () => {
      const cx = w / 2, cy = h / 2;
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.4 + Math.random() * 1.1;
      sparks.push({
        x: cx + Math.cos(ang) * 30, y: cy + Math.sin(ang) * 30,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        life: 0, max: 60 + Math.random() * 50, r: 0.8 + Math.random() * 1.6,
      });
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      if (sparks.length < 60 && Math.random() < 0.6) emit();
      sparks = sparks.filter((s) => {
        s.life++; s.x += s.vx; s.y += s.vy; s.vx *= 0.99; s.vy *= 0.99;
        const p = s.life / s.max;
        if (p >= 1) return false;
        const a = (1 - p) * 0.9;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        g.addColorStop(0, `rgba(245,181,68,${a})`);
        g.addColorStop(1, "rgba(240,118,74,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2); ctx.fill();
        return true;
      });
      raf = requestAnimationFrame(tick);
    };
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <div ref={wrapRef} className="relative aspect-square w-full max-w-[460px] mx-auto will-change-transform">
      {/* radiant halo */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-[70%] w-[70%] rounded-full bg-[--color-coral]/25 blur-[70px] breathe" />
      </div>
      {/* spark canvas */}
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      {/* orbit rings */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="spin-slow h-[78%] w-[78%] rounded-full border border-[--color-coral]/20" />
        <div className="spin-rev absolute h-[56%] w-[56%] rounded-full border border-[--color-amber]/20" />
      </div>
      {/* the brain */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="breathe grid place-items-center h-32 w-32 rounded-full bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] shadow-[0_0_80px_20px_rgba(240,118,74,0.35)]">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4a3 3 0 0 0-3 3 3 3 0 0 0-2.5 4.5A2.5 2.5 0 0 0 7 16.5 3 3 0 0 0 12 19" />
            <path d="M12 4a3 3 0 0 1 3 3 3 3 0 0 1 2.5 4.5A2.5 2.5 0 0 1 17 16.5 3 3 0 0 1 12 19" />
            <path d="M12 4v15M9 9h6M8 13h8" />
          </svg>
        </div>
      </div>
    </div>
  );
}
