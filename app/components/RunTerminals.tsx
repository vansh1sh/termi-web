"use client";

import { useEffect, useState } from "react";

/**
 * The "run" payoff: four terminals the brain drives in parallel — web, iOS,
 * Android, and a server. When `active`, each terminal reveals its lines on a
 * staggered timer so it looks like live, simultaneous work.
 */
type Term = { title: string; hue: string; lines: string[] };

const TERMS: Term[] = [
  { title: "web", hue: "#f0764a", lines: ["$ npm run dev", "▸ vite build…", "✓ localhost:3000", "✓ deployed"] },
  { title: "ios", hue: "#6aa9ff", lines: ["$ xcodebuild", "▸ booting iPhone 15", "▸ installing app", "✓ running on sim"] },
  { title: "android", hue: "#5ed6a4", lines: ["$ ./gradlew assemble", "▸ starting emulator", "▸ adb install", "✓ launched"] },
  { title: "server", hue: "#e6a23c", lines: ["$ node create-api", "▸ scaffolding routes", "▸ db migrate", "✓ api :8080 live"] },
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
      {TERMS.map((t) => (
        <div key={t.title} className="rounded-lg border border-[--color-line-2] bg-[--color-ink]/80 p-2.5 font-mono text-[10px] leading-relaxed overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.hue }} />
            <span className="text-[9px] uppercase tracking-wider" style={{ color: t.hue }}>{t.title}</span>
          </div>
          {t.lines.slice(0, n).map((l) => (
            <div key={l} className={l.startsWith("✓") ? "text-green-400" : l.startsWith("$") ? "text-[--color-fg]" : "text-[--color-muted]"}>
              {l}
            </div>
          ))}
          {active && n < 4 && <span className="caret text-[--color-coral]">▮</span>}
        </div>
      ))}
    </div>
  );
}
