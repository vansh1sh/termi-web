"use client";

import { useRef, useState } from "react";
import Reveal from "./Reveal";
import GoalPrompt from "./GoalPrompt";
import RunTerminals from "./RunTerminals";
import DownloadButton from "./DownloadButton";

export default function Hero() {
  const [running, setRunning] = useState(false);
  const scrolledRef = useRef(false);

  const run = () => {
    const next = !running;
    setRunning(next);
    // After the four terminals finish, glide down to the live brain activity.
    if (next && !scrolledRef.current) {
      scrolledRef.current = true;
      window.setTimeout(() => {
        document.getElementById("brain-activity")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 3200);
    }
    if (!next) scrolledRef.current = false;
  };

  return (
    <section className="relative overflow-x-hidden">
      <div className="relative mx-auto max-w-6xl px-6 pt-20 sm:pt-24 pb-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left: pitch */}
        <div className="min-w-0 max-w-xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.16em] uppercase text-[--color-coral]">
              <span className="w-1.5 h-1.5 rounded-full bg-[--color-coral] pip" /> multi-agent orchestration
            </div>
          </Reveal>

          <Reveal>
            <h1 className="mt-6 text-[2.5rem] sm:text-[4.4rem] font-semibold tracking-[-0.035em] leading-[0.96]">
              Ship at
              <br />
              <span className="text-[--color-coral]">100× velocity.</span>
            </h1>
          </Reveal>

          <Reveal>
            <p className="mt-6 text-lg text-[--color-muted] max-w-lg leading-relaxed">
              Termi orchestrates a fleet of AI agents across parallel terminals — decomposing
              your goal, racing rival implementations, and benchmarking each until the winner
              ships. One engineer, the throughput of a team.
            </p>
          </Reveal>

          {/* the goal bar — its run button starts the four terminals */}
          <Reveal className="mt-8 w-full max-w-lg">
            <GoalPrompt onRun={run} running={running} />
            <p className="mt-2.5 font-mono text-[11px] sm:text-xs text-[--color-faint] break-words">
              {running ? "› 4 strategies live — scrolling to brain activity…" : "› hit run — split one goal into four bets"}
            </p>
          </Reveal>

          {/* fancy download button, below the heading + run */}
          <Reveal className="mt-8">
            <DownloadButton large fancy />
          </Reveal>
        </div>

        {/* Right: the four parallel terminals; run brings them to life */}
        <Reveal variant="reveal-scale">
          <div className={`ticks glass-strong rounded-2xl p-4 h-[360px] sm:h-auto sm:aspect-square w-full max-w-[520px] mx-auto transition-transform duration-500 ${running ? "scale-[1.01]" : ""}`}>
            <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-mono text-[11px] text-[--color-coral]">4 prototypes · 1 goal</span>
              <span className="font-mono text-[10px] text-[--color-faint] flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-green-500 pip" : "bg-[--color-faint]"}`} />
                {running ? "live" : "idle"}
              </span>
            </div>
            <div className="h-[calc(100%-2rem)]">
              <RunTerminals active={running} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
