"use client";

import { useEffect, useState } from "react";

/**
 * The "run" payoff: four terminals the brain drives in parallel — web, iOS,
 * Android, and a server. When `active`, each terminal reveals its lines on a
 * staggered timer so it looks like live, simultaneous work.
 */
type Term = { title: string; tag: string; hue: string; lines: string[]; win?: boolean };

// Four rival prototypes of the same goal, built + benchmarked in parallel.
const TERMS: Term[] = [
  { title: "proto A", tag: "SSR", hue: "#f0764a", lines: ["$ build --ssr", "▸ bench: 240ms", "▸ lighthouse 91", "✓ passing"] },
  { title: "proto B", tag: "edge", hue: "#6aa9ff", lines: ["$ build --edge", "▸ bench: 88ms", "▸ lighthouse 98", "★ winner"], win: true },
  { title: "proto C", tag: "static", hue: "#5ed6a4", lines: ["$ build --static", "▸ bench: 140ms", "▸ lighthouse 95", "✓ passing"] },
  { title: "proto D", tag: "spa", hue: "#e6a23c", lines: ["$ build --spa", "▸ bench: 310ms", "✗ cls too high", "— dropped"] },
];

export default function RunTerminals({ active }: { active: boolean }) {
  const [n, setN] = useState(0); // lines revealed per terminal

  useEffect(() => {
    if (!active) { setN(0); return; }
    setN(0);
    const iv = setInterval(() => setN((c) => (c >= 4 ? c : c + 1)), 550);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
      {TERMS.map((t) => {
        const done = n >= 4;
        return (
          <div
            key={t.title}
            className="rounded-lg border bg-[--color-ink]/80 p-2.5 font-mono text-[10px] leading-relaxed overflow-hidden transition-colors"
            style={{ borderColor: done && t.win ? t.hue : undefined }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.hue }} />
              <span className="text-[9px] uppercase tracking-wider" style={{ color: t.hue }}>{t.title}</span>
              <span className="ml-auto text-[8px] uppercase tracking-wider text-[--color-faint]">{t.tag}</span>
            </div>
            {t.lines.slice(0, n).map((l) => (
              <div
                key={l}
                className={
                  l.startsWith("★") ? "text-[--color-coral] font-semibold"
                  : l.startsWith("✓") ? "text-green-400"
                  : l.startsWith("✗") || l.startsWith("—") ? "text-[--color-faint]"
                  : l.startsWith("$") ? "text-[--color-fg]" : "text-[--color-muted]"
                }
              >
                {l}
              </div>
            ))}
            {active && n < 4 && <span className="caret text-[--color-coral]">▮</span>}
          </div>
        );
      })}
    </div>
  );
}
