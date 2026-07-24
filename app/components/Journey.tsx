"use client";

import { useScrollProgress } from "./useScrollProgress";

/**
 * Scroll-driven journey through a Termi run. The section is tall; a sticky
 * stage stays pinned while you scroll. Scroll progress advances an "active"
 * stage — the current card is centered and crisp, neighbors fade + slide with
 * a gentle 3D tilt. Kept deliberately simple so it always reads cleanly.
 */
const STAGES = [
  { tag: "01 · goal", title: "You give one goal", body: "“Prototype this checkout four ways and ship the fastest.” Plain English — no scripts." },
  { tag: "02 · plan", title: "The brain plans", body: "It splits the goal into rival strategies and picks the test that will judge them." },
  { tag: "03 · fan-out", title: "Terminals fire in parallel", body: "Competing prototypes build at once — SSR, edge, static, SPA — not one after another." },
  { tag: "04 · benchmark", title: "Real tests decide", body: "Each branch is built, load-tested, and scored. Measured results, not guesses." },
  { tag: "05 · ship", title: "The winner ships", body: "The fastest branch is promoted and deployed. The rest are dropped. Done." },
];

export default function Journey() {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const n = STAGES.length;
  // active stage index with a little easing headroom at the ends
  const pos = Math.min(n - 1, Math.max(0, p * n - 0.5));

  return (
    <section ref={ref} className="relative" style={{ height: `${n * 80}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="mx-auto w-full max-w-3xl px-6">
          {/* header */}
          <div className="text-center">
            <div className="kicker">the journey</div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">One goal, end to end</h2>
          </div>

          {/* progress rail */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {STAGES.map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: Math.round(pos) === i ? 32 : 12,
                  background: i <= pos ? "var(--color-coral)" : "var(--color-line-2)",
                }}
              />
            ))}
          </div>

          {/* stage stage */}
          <div className="relative mt-10 h-[240px]" style={{ perspective: "1000px" }}>
            {STAGES.map((s, i) => {
              const d = i - pos;             // 0 = active
              const abs = Math.abs(d);
              const visible = abs < 1;       // only active + immediate neighbors animate in
              return (
                <div
                  key={s.tag}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ease-out"
                  style={{
                    opacity: visible ? 1 - abs : 0,
                    transform: `translateY(${d * 40}px) rotateX(${d * -8}deg) scale(${1 - abs * 0.06})`,
                    pointerEvents: abs < 0.5 ? "auto" : "none",
                  }}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[--color-coral]">{s.tag}</span>
                  <h3 className="mt-4 text-3xl sm:text-[2.6rem] font-semibold tracking-tight leading-tight">{s.title}</h3>
                  <p className="mt-4 text-lg text-[--color-muted] max-w-xl leading-relaxed">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
