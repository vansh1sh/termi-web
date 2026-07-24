"use client";

import { useAnimationClock } from "./useAnimationClock";

/**
 * An animated mock of the real /dashboard web console: a live brain-status
 * header, three terminal presence cards with progress bars that advance, and
 * a streaming activity log. Purely decorative — mirrors the product's look.
 */

const LOG = [
  "brain · planning goal into 4 milestones",
  "term-1 · scaffolding Next.js app",
  "term-2 · writing jest specs",
  "term-1 · npm run build → ✓ 0 errors",
  "term-3 · curl localhost:3000 → 200 OK",
  "term-2 · 3/3 tests passing",
  "brain · milestone 3/4 complete",
  "term-4 · git commit && open PR",
];

const CARDS = [
  { name: "term-1", job: "build", hue: "#f07a52" },
  { name: "term-2", job: "test", hue: "#5ed6a4" },
  { name: "term-3", job: "verify", hue: "#6aa9ff" },
];

// Deterministic progress per terminal at a given tick — a pure function so the
// reduced-motion frame is stable and the bars never need their own timer.
const START = [18, 42, 7];
function progressAt(tick: number, i: number): number {
  let v = START[i];
  for (let n = 0; n < tick; n++) {
    v += 7 + ((n + i) % 5) * 3;
    if (v > 100) v = 12 + i * 5;
  }
  return Math.min(100, v);
}

export default function ConsolePreview() {
  const { tick } = useAnimationClock(1500);
  const line = tick % LOG.length;
  const prog = [0, 1, 2].map((i) => progressAt(tick, i));

  const visible = [0, 1, 2, 3].map((o) => LOG[(line + o) % LOG.length]);

  return (
    <div aria-hidden className="rounded-3xl border border-[--color-line] bg-[--color-panel]/70 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* window bar */}
      <div className="flex items-center gap-2 px-5 h-11 border-b border-[--color-line]">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-neutral-500">termi-web.vercel.app / console</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pip" /> connected
        </span>
      </div>

      <div className="p-5 grid gap-5 md:grid-cols-5">
        {/* left: brain + presence */}
        <div className="md:col-span-3 space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="grid place-items-center h-6 w-6 rounded-lg bg-[--color-coral]/20 text-[--color-coral] text-xs">◉</span>
                Brain activity
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[--color-coral]/15 text-[--color-coral]">supervising</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[["3", "terminals"], ["2", "done"], ["0", "blocked"]].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-black/30 py-2">
                  <div className="text-lg font-bold">{n}</div>
                  <div className="text-[10px] text-neutral-500">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {CARDS.map((c, i) => (
              <div key={c.name} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: c.hue }}>{c.name}</span>
                  <span className="pip h-2 w-2 rounded-full" style={{ background: c.hue, animationDelay: `${i * 0.3}s` }} />
                </div>
                <div className="mt-1 text-[10px] text-neutral-500">{c.job}</div>
                <div className="mt-2 h-1.5 rounded-full bg-black/40 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, prog[i])}%`, background: c.hue }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right: streaming log */}
        <div className="md:col-span-2 rounded-2xl border border-white/8 bg-black/40 p-4 font-mono text-[11px] leading-relaxed">
          <div className="text-neutral-500 mb-2">live traffic</div>
          {visible.map((l, i) => (
            <div key={`${line}-${i}`} className="pop-in text-neutral-300" style={{ opacity: 1 - i * 0.22 }}>
              <span className="text-[--color-amber]">›</span> {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
