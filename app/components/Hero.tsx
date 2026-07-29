"use client";

import { useRef, useState } from "react";
import Reveal from "./Reveal";
import GoalPrompt from "./GoalPrompt";
import RunTerminals from "./RunTerminals";
import DownloadButton from "./DownloadButton";
import GlowBrain from "./GlowBrain";
import { usePointerFineDesktop } from "./usePointerFineDesktop";

export default function Hero() {
  const [running, setRunning] = useState(false);
  const scrolledRef = useRef(false);
  // The glow orb is a desktop-only flourish (same gate as the ambient backdrop).
  const showOrb = usePointerFineDesktop();

  const run = () => {
    const next = !running;
    setRunning(next);
    // After the four terminals finish, glide down to the demo video.
    // Respect reduced-motion: jump instantly instead of smooth-scrolling.
    if (next && !scrolledRef.current) {
      scrolledRef.current = true;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => {
        document.getElementById("demo")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }, 3200);
    }
    if (!next) scrolledRef.current = false;
  };

  // The four-terminal panel — shared by the desktop flip-card back and the mobile
  // post-run view, so the two paths can't drift apart.
  const terminalsPanel = (
    <div className="ticks glass-strong rounded-2xl p-4 h-full">
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
  );

  return (
    <section className="relative overflow-x-hidden">
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 pt-12 sm:pt-24 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
        {/* Left: pitch */}
        <div className="min-w-0 max-w-xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.16em] uppercase text-[--color-coral]">
              <span className="w-1.5 h-1.5 rounded-full bg-[--color-coral] pip" /> the brain for agentic development
            </div>
          </Reveal>

          <Reveal>
            <h1 className="mt-5 sm:mt-6 text-[2.25rem] sm:text-[4.2rem] font-semibold tracking-[-0.03em] sm:tracking-[-0.035em] leading-[1.05] sm:leading-[0.98]">
              From zero to one.
              <br />
              <span className="text-[--color-coral]">On the correct path.</span>
            </h1>
          </Reveal>

          <Reveal>
            <p className="mt-6 text-lg text-[--color-muted] max-w-lg leading-relaxed">
              Agents are super helpful but they still need your supervision. Termi is the AI brain above them. It
              defines the right path from your goal, drives your agents (Claude, Codex,
              Gemini) down it, and course-corrects the moment one strays. Idea in, working
              product out.
            </p>
          </Reveal>

          {/* the goal bar — its run button starts the supervised demo */}
          <Reveal className="mt-8 w-full max-w-lg">
            <GoalPrompt onRun={run} running={running} />
            <p className="mt-2.5 font-mono text-[11px] sm:text-xs text-[--color-faint] break-words">
              {running ? "› brain driving. agents on the path, checked every step…" : "› hit run, watch the brain take it 0 → 1"}
            </p>
          </Reveal>

          {/* fancy download button, below the heading + run */}
          <Reveal className="mt-8">
            <DownloadButton large fancy />
          </Reveal>
        </div>

        {/* Right: the glowing core flips to the four terminals on run.
            The glow orb is DESKTOP ONLY — on a phone it stacks under the copy as an
            unexplained floating light ball, and its canvas + pointer-tilt animation
            costs battery for decoration. Mobile keeps the useful half: hitting run
            still reveals the terminals. */}
        {showOrb ? (
          <Reveal variant="reveal-scale">
            <div className={`flip h-[360px] sm:h-auto sm:aspect-square w-full max-w-[520px] mx-auto ${running ? "flipped" : ""}`}>
              <div className="flip-inner">
                {/* front — the light / neural core */}
                <div className="flip-face">
                  <GlowBrain />
                </div>
                {/* back — four parallel terminals */}
                <div className="flip-face flip-back">
                  {terminalsPanel}
                </div>
              </div>
            </div>
          </Reveal>
        ) : running ? (
          // Mobile, after run: show the terminals directly (no flip, no orb).
          <Reveal variant="reveal-scale">
            <div className="h-[320px] w-full max-w-[520px] mx-auto">
              {terminalsPanel}
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
