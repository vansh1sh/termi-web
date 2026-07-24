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
    <div ref={wrapRef} className="relative aspect-square w-full will-change-transform">
      {/* soft ambient bloom (no hard ring) */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-[60%] w-[60%] rounded-full bg-[--color-coral]/20 blur-[90px] breathe" />
      </div>
      {/* spark canvas */}
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />

      {/* organic neural cluster — dendrite branches + firing nodes, no orbit rings */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff2df" />
            <stop offset="40%" stopColor="#f0764a" />
            <stop offset="100%" stopColor="#db5c30" stopOpacity="0" />
          </radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="0.4" /></filter>
        </defs>

        {/* dendrites */}
        <g stroke="#f0764a" strokeWidth="0.4" fill="none" filter="url(#soft)">
          {NEURON_LINKS.map(([a, b], i) => (
            <line key={i} x1={NEURONS[a][0]} y1={NEURONS[a][1]} x2={NEURONS[b][0]} y2={NEURONS[b][1]} strokeOpacity={0.15 + (i % 4) * 0.12} />
          ))}
        </g>

        {/* firing nodes at branch tips */}
        {NEURONS.slice(1).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.9 + (i % 3) * 0.5} fill="#f6b25a">
            <animate attributeName="opacity" values="0.25;1;0.25" dur={`${2.4 + (i % 5) * 0.5}s`} repeatCount="indefinite" begin={`${(i % 6) * 0.3}s`} />
          </circle>
        ))}

        {/* traveling pulse along one dendrite */}
        <circle r="1.1" fill="#fff">
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M50,50 L26,22" />
          <animate attributeName="opacity" values="1;0" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle r="1.1" fill="#fff">
          <animateMotion dur="3.1s" repeatCount="indefinite" path="M50,50 L82,64" />
          <animate attributeName="opacity" values="1;0" dur="3.1s" repeatCount="indefinite" />
        </circle>

        {/* luminous core */}
        <circle cx="50" cy="50" r="12" fill="url(#coreGlow)">
          <animate attributeName="r" values="10;14;10" dur="3.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="3.6" fill="#fff" opacity="0.96" />
      </svg>
    </div>
  );
}

// An organic, asymmetric neuron layout radiating from the core (index 0).
const NEURONS: [number, number][] = [
  [50, 50],
  [26, 22], [38, 14], [16, 40], [22, 62], [12, 54],
  [72, 20], [84, 34], [82, 64], [68, 78], [54, 86],
  [34, 78], [62, 40], [40, 34], [60, 62], [30, 44],
];
const NEURON_LINKS: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [0, 3], [3, 4], [4, 5], [0, 4],
  [0, 6], [6, 7], [0, 12], [12, 7], [0, 8], [8, 9], [9, 10],
  [0, 11], [11, 4], [0, 13], [13, 2], [0, 14], [14, 8], [0, 15], [15, 5],
];
