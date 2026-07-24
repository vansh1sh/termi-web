"use client";

import { useEffect, useRef } from "react";

/**
 * "Second Brain" concept: a living neural network on a canvas.
 * - Nodes (neurons) drift slowly in 3 depth layers → parallax.
 * - Nearby nodes link with synapses; pulses travel the links (firing).
 * - The whole field parallax-shifts toward the pointer, per depth layer.
 * - Fully static under prefers-reduced-motion; pauses when tab hidden.
 * Sits fixed behind content; content uses glass blur over it.
 */
type Node = { x: number; y: number; vx: number; vy: number; z: number; r: number };
type Pulse = { a: number; b: number; t: number; speed: number };

const CORAL = [240, 118, 74];
const MESH = [150, 160, 172]; // cool neutral grey for a professional network look

export default function NeuralNet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    // pointer parallax (eased)
    let tpx = 0, tpy = 0, px = 0, py = 0;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const build = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // density scales with area, capped for perf
      const count = Math.min(90, Math.max(36, Math.round((w * h) / 22000)));
      nodes = Array.from({ length: count }, () => {
        const z = rand(0, 1); // depth 0=far, 1=near
        return {
          x: rand(0, w), y: rand(0, h),
          vx: rand(-0.12, 0.12) * (0.4 + z), vy: rand(-0.12, 0.12) * (0.4 + z),
          z, r: 0.8 + z * 1.8,
        };
      });
      pulses = [];
    };

    const LINK = 150; // px link distance
    const step = () => {
      px += (tpx - px) * 0.05;
      py += (tpy - py) * 0.05;
      ctx.clearRect(0, 0, w, h);

      // move nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
      }

      // draw links + spawn pulses
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = a.x + px * (0.3 + a.z) * 40;
        const ay = a.y + py * (0.3 + a.z) * 40;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const bx = b.x + px * (0.3 + b.z) * 40;
          const by = b.y + py * (0.3 + b.z) * 40;
          const dx = ax - bx, dy = ay - by;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const o = (1 - d / LINK) * 0.10 * (0.4 + (a.z + b.z) / 2);
            ctx.strokeStyle = `rgba(${MESH[0]},${MESH[1]},${MESH[2]},${o})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
            if (!reduce && Math.random() < 0.0004) pulses.push({ a: i, b: j, t: 0, speed: rand(0.015, 0.035) });
          }
        }
        // node — mostly neutral, an occasional coral accent
        const accent = i % 7 === 0;
        const c = accent ? CORAL : MESH;
        const g = (accent ? 0.5 : 0.28) + a.z * 0.35;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${g})`;
        ctx.beginPath(); ctx.arc(ax, ay, a.r, 0, Math.PI * 2); ctx.fill();
      }

      // draw + advance pulses (synapses firing)
      pulses = pulses.filter((p) => {
        const a = nodes[p.a], b = nodes[p.b];
        if (!a || !b) return false;
        p.t += p.speed;
        if (p.t >= 1) return false;
        const ax = a.x + px * (0.3 + a.z) * 40, ay = a.y + py * (0.3 + a.z) * 40;
        const bx = b.x + px * (0.3 + b.z) * 40, by = b.y + py * (0.3 + b.z) * 40;
        const x = ax + (bx - ax) * p.t, y = ay + (by - ay) * p.t;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 5);
        glow.addColorStop(0, `rgba(${CORAL[0]},${CORAL[1]},${CORAL[2]},0.5)`);
        glow.addColorStop(1, `rgba(${CORAL[0]},${CORAL[1]},${CORAL[2]},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(step);
    };

    const renderStatic = () => {
      // one frame, no motion — for reduced-motion users
      step();
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      tpx = (e.clientX / window.innerWidth - 0.5) * -1;
      tpy = (e.clientY / window.innerHeight - 0.5) * -1;
    };
    const onResize = () => { build(); if (reduce) renderStatic(); };
    const onVis = () => {
      if (reduce) return;
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) raf = requestAnimationFrame(step);
    };

    build();
    if (reduce) renderStatic();
    else raf = requestAnimationFrame(step);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full [mask-image:radial-gradient(ellipse_at_center,black,transparent_92%)]"
    />
  );
}
