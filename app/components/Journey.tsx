"use client";

import { useScrollProgress } from "./useScrollProgress";

/**
 * A scroll-driven 3D journey through a Termi run. The section is tall; a sticky
 * stage stays pinned while you scroll, and scroll progress (0..1) flies the
 * camera through five stages — each panel recedes/advances in Z-depth as it
 * enters and leaves focus. A signal beam fills on the left to mark progress.
 */
const STAGES = [
  { tag: "01 · goal", title: "You give one goal", body: "“Prototype this checkout four ways and ship the fastest.” Plain English — no scripts.", glyph: "›_" },
  { tag: "02 · plan", title: "The brain plans", body: "It decomposes the goal into rival strategies and a test to judge them by.", glyph: "◇" },
  { tag: "03 · fan-out", title: "Four terminals fire", body: "Competing prototypes build in parallel — SSR, edge, static, SPA — all at once.", glyph: "⊞" },
  { tag: "04 · benchmark", title: "Real tests decide", body: "Each branch is built, load-tested, and scored. No vibes — measured results.", glyph: "✓" },
  { tag: "05 · ship", title: "The winner ships", body: "The fastest branch is promoted and deployed. The rest are dropped. Done.", glyph: "★" },
];

export default function Journey() {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const n = STAGES.length;
  // continuous position along the stages, e.g. 2.4 = between stage 2 and 3
  const pos = p * (n - 1);

  return (
    <section ref={ref} className="relative" style={{ height: `${n * 90}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* progress beam */}
        <div className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 h-[46vh] w-px bg-[--color-line]">
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[--color-coral] to-[--color-amber] rounded-full" style={{ height: `${p * 100}%` }} />
          {STAGES.map((_, i) => {
            const active = pos >= i - 0.5;
            return (
              <span
                key={i}
                className="absolute -left-[3px] w-[7px] h-[7px] rounded-full transition-colors"
                style={{ top: `${(i / (n - 1)) * 100}%`, background: active ? "var(--color-coral)" : "var(--color-line-2)" }}
              />
            );
          })}
        </div>

        {/* section label */}
        <div className="absolute top-[16vh] left-1/2 -translate-x-1/2 text-center">
          <div className="kicker">the journey</div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">One goal, end to end</h2>
        </div>

        {/* 3D stage */}
        <div className="mx-auto w-full max-w-xl px-6" style={{ perspective: "1200px" }}>
          <div className="relative h-[300px]" style={{ transformStyle: "preserve-3d" }}>
            {STAGES.map((s, i) => {
              const d = i - pos;                 // distance from focus (0 = centered)
              const abs = Math.abs(d);
              const z = -abs * 320;              // recede in Z
              const y = d * 60;                  // stack vertically
              const rotX = d * -14;              // tilt away from camera
              const opacity = abs > 1.6 ? 0 : 1 - abs * 0.5;
              const scale = 1 - abs * 0.08;
              const focused = abs < 0.5;
              return (
                <div
                  key={s.tag}
                  className="absolute inset-x-0 top-0"
                  style={{
                    transform: `translateY(${y}px) translateZ(${z}px) rotateX(${rotX}deg) scale(${scale})`,
                    opacity,
                    zIndex: 100 - Math.round(abs * 10),
                    transition: "opacity .2s linear",
                    pointerEvents: focused ? "auto" : "none",
                  }}
                >
                  <div className={`ticks glass-strong rounded-2xl p-7 ${focused ? "shadow-[0_30px_80px_-20px_rgba(240,118,74,0.35)]" : ""}`}>
                    {focused && <><span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" /></>}
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center h-11 w-11 rounded-xl bg-[--color-coral]/15 text-[--color-coral] font-mono text-lg">{s.glyph}</span>
                      <span className="font-mono text-xs uppercase tracking-[0.16em] text-[--color-faint]">{s.tag}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-2.5 text-[--color-muted] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
