"use client";

import { useEffect, useRef } from "react";
import { useAnimationClock } from "./useAnimationClock";

/**
 * The showpiece: a breathing "brain" core in the center, four terminal
 * avatars riding an orbit ring around it, animated SVG beams connecting
 * brain → each terminal, and live status labels that cycle as if the
 * brain were dispatching work. Pure CSS/SVG animation — no deps.
 */

type Agent = { name: string; hue: string; tasks: string[] };

const AGENTS: Agent[] = [
  { name: "term-1", hue: "#f07a52", tasks: ["scaffolding app", "writing routes", "npm run build", "✓ 0 errors"] },
  { name: "term-2", hue: "#f5b544", tasks: ["writing tests", "jest --watch", "3/3 passing", "✓ verified"] },
  { name: "term-3", hue: "#5ed6a4", tasks: ["booting sim", "curl :3000 → 200", "screenshotting", "✓ live"] },
  { name: "term-4", hue: "#6aa9ff", tasks: ["git commit", "opening PR", "deploying", "✓ shipped"] },
];

export default function OrchestraHero() {
  const { tick } = useAnimationClock(1800);
  const wrapRef = useRef<HTMLDivElement>(null);

  // cursor-follow spotlight
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // orbit geometry (percentages within the square stage)
  const positions = [
    { top: "2%", left: "50%" },
    { top: "50%", left: "96%" },
    { top: "96%", left: "50%" },
    { top: "50%", left: "4%" },
  ];

  return (
    <div ref={wrapRef} className="spotlight relative aspect-square w-full max-w-[520px] mx-auto">
      {/* conic aurora sweep */}
      <div className="pointer-events-none absolute inset-6 rounded-full aurora-sweep blur-2xl opacity-70" />

      {/* connection beams */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {positions.map((p, i) => (
          <line
            key={i}
            x1="50" y1="50"
            x2={parseFloat(p.left)} y2={parseFloat(p.top)}
            stroke={AGENTS[i].hue}
            strokeWidth="0.5"
            className="beam"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </svg>

      {/* orbit ring holding avatars */}
      <div className="orbit-ring absolute inset-[8%]">
        {AGENTS.map((a, i) => (
          <div
            key={a.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: positions[i].top, left: positions[i].left }}
          >
            <TerminalAvatar agent={a} step={tick + i} />
          </div>
        ))}
      </div>

      {/* radar pings + breathing brain core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 m-auto h-24 w-24 rounded-full border border-[--color-coral]/40 ping-ring" />
        <span className="absolute inset-0 m-auto h-24 w-24 rounded-full border border-[--color-amber]/40 ping-ring" style={{ animationDelay: "1.3s" }} />
        <div className="breathe relative grid place-items-center h-24 w-24 rounded-full bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] text-white">
          <BrainGlyph />
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-neutral-300 whitespace-nowrap">
            Termi brain
          </span>
        </div>
      </div>
    </div>
  );
}

function TerminalAvatar({ agent, step }: { agent: Agent; step: number }) {
  const task = agent.tasks[step % agent.tasks.length];
  const done = task.startsWith("✓");
  return (
    <div className="group drift flex flex-col items-center gap-1.5 w-36" style={{ animationDelay: `${step % 4}s` }}>
      <div
        className="relative grid place-items-center h-12 w-12 rounded-2xl border bg-black/50 backdrop-blur transition-transform group-hover:scale-110"
        style={{ borderColor: `${agent.hue}66`, boxShadow: `0 0 22px ${agent.hue}33` }}
      >
        <span className="font-mono text-sm" style={{ color: agent.hue }}>›_</span>
        {/* status pip */}
        <span
          className="pip absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-black"
          style={{ background: done ? "#5ed6a4" : agent.hue }}
        />
      </div>
      <div className="text-center">
        <div className="text-[11px] font-semibold text-neutral-300">{agent.name}</div>
        <div
          className="pop-in text-[10px] font-mono leading-tight"
          key={task}
          style={{ color: done ? "#5ed6a4" : "#9aa0ad" }}
        >
          {task}
        </div>
      </div>
    </div>
  );
}

function BrainGlyph() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 2.5 2.5 0 0 0 2 4 3 3 0 0 0 3 1.5" />
      <path d="M12 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 2.5 2.5 0 0 1-2 4 3 3 0 0 1-3 1.5" />
      <path d="M12 5v14" />
    </svg>
  );
}
