"use client";

import { useRef, useState } from "react";
import Reveal from "./Reveal";
import GlowBrain from "./GlowBrain";
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
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: pitch */}
        <div className="max-w-xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.16em] uppercase text-[--color-coral]">
              <span className="w-1.5 h-1.5 rounded-full bg-[--color-coral] pip" /> 100× developer productivity
            </div>
          </Reveal>

          <Reveal>
            <h1 className="mt-6 text-[3rem] sm:text-[4.4rem] font-semibold tracking-[-0.035em] leading-[0.94]">
              One prompt.
              <br />
              <span className="text-[--color-muted]">Ten</span> <span className="text-[--color-coral]">prototypes.</span>
            </h1>
          </Reveal>

          <Reveal>
            <p className="mt-6 text-lg text-[--color-muted] max-w-lg leading-relaxed">
              Termi&apos;s brain fans one goal across many terminals — building rival prototypes,
              testing every strategy in parallel, and shipping the one that wins. Stop
              working one idea at a time.
            </p>
          </Reveal>

          {/* the goal bar — its run button zooms into the 4 terminals */}
          <Reveal className="mt-8 max-w-lg">
            <GoalPrompt onRun={run} running={running} />
            <p className="mt-2.5 font-mono text-xs text-[--color-faint]">
              {running ? "› 4 strategies live — scrolling to brain activity…" : "› hit run — zoom into four parallel terminals"}
            </p>
          </Reveal>

          {/* fancy download button, below the heading + run */}
          <Reveal className="mt-8">
            <DownloadButton large fancy />
          </Reveal>
        </div>

        {/* Right: run zooms from the brain INTO the four terminals */}
        <Reveal variant="reveal-scale">
          <div className="relative aspect-square w-full max-w-[520px] mx-auto" style={{ perspective: "1200px" }}>
            {/* brain — zooms out + blurs away on run */}
            <div className={`zoom-layer absolute inset-0 ${running ? "zoom-hidden zoom-brain-out" : ""}`}>
              <GlowBrain />
            </div>
            {/* terminals — zoom in from behind on run */}
            <div className={`zoom-layer absolute inset-0 ${running ? "zoom-terms-in" : "zoom-hidden zoom-terms-start"}`}>
              <div className="ticks glass-strong rounded-2xl h-full p-4">
                <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-mono text-[11px] text-[--color-coral]">4 prototypes · 1 goal</span>
                  <span className="font-mono text-[10px] text-[--color-faint] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 pip" /> live
                  </span>
                </div>
                <div className="h-[calc(100%-2rem)]">
                  <RunTerminals active={running} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
