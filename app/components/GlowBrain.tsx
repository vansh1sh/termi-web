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
      {/* the neural core — a glass orb with an internal node/synapse constellation */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="breathe relative grid place-items-center h-40 w-40 rounded-full">
          {/* glass sphere with radial sheen */}
          <div
            className="absolute inset-0 rounded-full border border-[--color-coral]/30"
            style={{
              background:
                "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.16), rgba(240,118,74,0.10) 42%, rgba(11,12,11,0.55) 78%)",
              boxShadow:
                "inset 0 0 40px rgba(240,118,74,0.25), 0 0 70px 12px rgba(240,118,74,0.28)",
              backdropFilter: "blur(2px)",
            }}
          />
          {/* internal constellation */}
          <svg viewBox="0 0 100 100" className="relative h-full w-full">
            <defs>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd9a8" />
                <stop offset="45%" stopColor="#f0764a" />
                <stop offset="100%" stopColor="#db5c30" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* synapse links */}
            <g stroke="#f0764a" strokeWidth="0.5" opacity="0.55">
              {CORE_LINKS.map(([a, b], i) => (
                <line key={i} x1={CORE_NODES[a][0]} y1={CORE_NODES[a][1]} x2={CORE_NODES[b][0]} y2={CORE_NODES[b][1]} />
              ))}
            </g>
            {/* satellite nodes */}
            <g fill="#f6b25a">
              {CORE_NODES.slice(1).map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={1.5}>
                  <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + (i % 4) * 0.6}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </g>
            {/* bright pulsing core */}
            <circle cx="50" cy="50" r="9" fill="url(#coreGlow)">
              <animate attributeName="r" values="8;11;8" dur="3.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="3.4" fill="#fff" opacity="0.95" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// A compact, deliberate node layout (not random) so the core reads as designed.
const CORE_NODES: [number, number][] = [
  [50, 50], // 0 = center
  [30, 32], [70, 30], [76, 58], [58, 74], [28, 64], [22, 46], [64, 46], [44, 28],
];
const CORE_LINKS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 8], [8, 2], [2, 7], [7, 3], [3, 4], [4, 5], [5, 6], [6, 1],
];
