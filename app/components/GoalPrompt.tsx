"use client";

import { useEffect, useState } from "react";

/**
 * Signature hero element: a glass "goal" bar that mimics Termi's actual
 * interaction — you type a goal, not commands. It self-types a rotating list of
 * example goals with a blinking caret and a coral run button. Decorative.
 */
const GOALS = [
  "build a 3D coffee app with cart & checkout",
  "prototype this UI 4 ways, ship the fastest",
  "try 3 caching strategies, keep the winner",
  "build web, iOS & Android in parallel",
];

export default function GoalPrompt({ onRun, running }: { onRun?: () => void; running?: boolean }) {
  const [text, setText] = useState("");
  const [gi, setGi] = useState(0);
  const [phase, setPhase] = useState<"typing" | "hold" | "deleting">("typing");

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setText(GOALS[0]);
      return;
    }
    const goal = GOALS[gi % GOALS.length];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < goal.length) t = setTimeout(() => setText(goal.slice(0, text.length + 1)), 42);
      else t = setTimeout(() => setPhase("hold"), 1600);
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("deleting"), 900);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(goal.slice(0, text.length - 1)), 22);
      else { setPhase("typing"); setGi((n) => n + 1); }
    }
    return () => clearTimeout(t);
  }, [text, phase, gi]);

  return (
    <div className="glass-strong rounded-2xl p-2 pl-4 flex items-center gap-3 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)]">
      <span className="font-mono text-sm text-[--color-coral] select-none">termi&nbsp;›</span>
      <div className="flex-1 min-w-0 text-left font-mono text-sm sm:text-[15px] text-[--color-fg] truncate">
        {text}
        <span className="caret text-[--color-coral]">▮</span>
      </div>
      <button
        type="button"
        onClick={onRun}
        aria-pressed={running}
        className="flex items-center gap-1.5 rounded-xl bg-[--color-coral] hover:bg-[--color-coral-600] active:scale-95 text-white font-medium text-sm px-4 py-2.5 shrink-0 transition"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        {running ? "running" : "run"}
      </button>
    </div>
  );
}
