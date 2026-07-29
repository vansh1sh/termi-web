"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The cost / quality / time comparison: one flagship model working alone vs. the brain
 * routing work across several agents.
 *
 * Interactive by metric — pick Time, Quality, or Cost and the bars, delta, and explanation
 * all change. Bars animate from zero when the section scrolls into view.
 *
 * NOTE ON THE NUMBERS: these are illustrative figures from our own runs, not a published
 * benchmark. They're labelled as such in the UI (see `DISCLAIMER`) so the section doesn't
 * read as an independent measurement.
 */

type MetricKey = "time" | "quality" | "cost";

type Metric = {
  key: MetricKey;
  label: string;
  /** Short axis caption. */
  unit: string;
  /** Single flagship model working alone. */
  solo: number;
  /** The brain routing across agents. */
  brain: number;
  /** How to render a raw value. */
  fmt: (n: number) => string;
  /** True when a LOWER number is better (time, cost). */
  lowerIsBetter: boolean;
  /** One line explaining WHY the brain differs. */
  why: string;
};

const METRICS: Metric[] = [
  {
    key: "time",
    label: "Time",
    unit: "wall-clock to finish a task",
    solo: 24,
    brain: 18,
    fmt: (n) => `${n} min`,
    lowerIsBetter: true,
    why: "Independent workstreams run in parallel instead of one after another, so the slowest chain sets the pace — not the sum of every step.",
  },
  {
    key: "quality",
    label: "Quality",
    unit: "how close the result is to the goal",
    solo: 72,
    brain: 91,
    fmt: (n) => `${n}%`,
    lowerIsBetter: false,
    why: "Every pass is checked against the plan with real acceptance tests, so drift is caught and corrected rather than shipped.",
  },
  {
    key: "cost",
    label: "Cost",
    unit: "spend per task",
    solo: 4.8,
    brain: 1.7,
    fmt: (n) => `$${n.toFixed(2)}`,
    lowerIsBetter: true,
    why: "Only the hardest reasoning goes to the flagship tier. Fast, cheaper models handle iteration — so you don't pay top rate for every token.",
  },
];

const DISCLAIMER =
  "Illustrative figures from our own runs on a mid-size web build — not an independent benchmark. Your numbers will vary with the task.";

/** Percentage improvement, phrased in the right direction for the metric. */
function delta(m: Metric): { pct: number; word: string } {
  const pct = m.lowerIsBetter
    ? ((m.solo - m.brain) / m.solo) * 100
    : ((m.brain - m.solo) / m.solo) * 100;
  return { pct: Math.round(pct), word: m.lowerIsBetter ? "lower" : "higher" };
}

export default function TradeoffChart() {
  const [active, setActive] = useState<MetricKey>("time");
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Animate the bars in once, when the section is actually looked at.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const metric = METRICS.find((m) => m.key === active)!;
  const d = delta(metric);
  // Bars are scaled against the larger of the two values so both always fit.
  const max = Math.max(metric.solo, metric.brain);
  const soloPct = (metric.solo / max) * 100;
  const brainPct = (metric.brain / max) * 100;

  return (
    <section id="tradeoffs" className="scroll-mt-20 mx-auto max-w-5xl px-5 sm:px-6 py-14 sm:py-20">
      <div className="text-center">
        <p className="kicker mb-3">// cost · quality · time</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          You usually pick two. The brain gets you all three.
        </h2>
        <p className="mt-3 text-[--color-muted] max-w-xl mx-auto text-sm sm:text-base">
          One flagship model working alone is fast to start and expensive to finish. Routing the
          work changes the shape of the trade-off.
        </p>
      </div>

      {/* Metric picker */}
      <div role="tablist" aria-label="Comparison metric"
           className="mt-8 flex items-center gap-1 w-fit mx-auto rounded-full glass p-1">
        {METRICS.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={active === m.key}
            onClick={() => setActive(m.key)}
            className={`px-4 sm:px-5 py-1.5 rounded-full font-mono text-xs tracking-wide transition ${
              active === m.key
                ? "bg-[--color-coral] text-white"
                : "text-[--color-muted] hover:text-[--color-fg]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div ref={ref} className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* Bars */}
        <div className="ticks glass rounded-2xl p-6">
          <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-sm font-semibold">{metric.label}</span>
            <span className="font-mono text-[11px] text-[--color-faint]">{metric.unit}</span>
          </div>

          <Bar
            name="One flagship model"
            sub="working alone"
            value={metric.fmt(metric.solo)}
            pct={shown ? soloPct : 0}
            tone="neutral"
          />
          <div className="h-5" />
          <Bar
            name="Termi's brain"
            sub="routing across agents"
            value={metric.fmt(metric.brain)}
            pct={shown ? brainPct : 0}
            tone="coral"
          />

          {/* Delta */}
          <div className="mt-7 pt-5 border-t border-[--color-line] flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-[--color-coral]">
              {d.pct}%
            </span>
            <span className="text-sm text-[--color-muted]">
              {d.word} with the brain
            </span>
          </div>
        </div>

        {/* Why */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <p className="kicker mb-3">// why</p>
          <p className="text-sm text-[--color-fg]/85 leading-relaxed">{metric.why}</p>

          <div className="mt-6 space-y-2.5">
            {METRICS.map((m) => {
              const md = delta(m);
              return (
                <button
                  key={m.key}
                  onClick={() => setActive(m.key)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                    active === m.key
                      ? "bg-[--color-coral]/10 border border-[--color-coral]/30"
                      : "border border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="text-xs text-[--color-muted]">{m.label}</span>
                  <span className="font-mono text-xs">
                    <span className="text-[--color-faint]">{m.fmt(m.solo)}</span>
                    <span className="text-[--color-faint] mx-1.5">→</span>
                    <span className="text-[--color-coral]">{m.fmt(m.brain)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-auto pt-6 text-[10.5px] leading-relaxed text-[--color-faint]">
            {DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  );
}

/** One horizontal bar with an animated fill. */
function Bar({
  name, sub, value, pct, tone,
}: {
  name: string; sub: string; value: string; pct: number; tone: "coral" | "neutral";
}) {
  // Colors are set via inline style with explicit var(): the arbitrary `bg-[--token]` form
  // resolved to transparent for these theme tokens (and for gradient stops), so the bars
  // rendered invisible even though their widths were correct.
  const fillStyle =
    tone === "coral"
      ? { backgroundImage: "linear-gradient(90deg, var(--color-coral), var(--color-amber))" }
      : { backgroundColor: "var(--color-line-2)" };
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm">
          {name} <span className="text-[--color-faint] text-xs">· {sub}</span>
        </span>
        <span className={`font-mono text-sm tabular-nums ${tone === "coral" ? "text-[--color-coral]" : "text-[--color-muted]"}`}>
          {value}
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full"
          style={{ ...fillStyle, width: `${pct}%`, transition: "width 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </div>
    </div>
  );
}
