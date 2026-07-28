"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tabbed product demo. "Prompt" shows the real fast-forwarded recording of the brain
 * driving agents from one sentence; "Output" shows the finished app running in Termi.
 * Videos are muted, loop, and only play while the active one is on screen.
 */
const TABS = [
  {
    id: "prompt",
    label: "Prompt",
    src: "/demo/coffee-3d.mp4",
    caption:
      "real recording, fast-forwarded: 'build a 3D coffee app with cart & checkout.' the brain asks what it needs, splits the work across Claude, Codex & Opus, and drives all four to a working build. no cuts.",
  },
  {
    id: "output",
    label: "Output",
    src: "/demo/kafene-result.mp4",
    caption:
      "the finished app running in Termi's browser, built from one sentence, no human code.",
  },
] as const;

export default function TabbedDemo() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("prompt");
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const tab = TABS.find((t) => t.id === active)!;

  // Play only while on screen (saves battery; autoplay policies want muted+inline).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  if (failed) return null; // video missing → section disappears rather than showing a broken box

  return (
    <figure className="mx-auto max-w-5xl px-5 sm:px-6">
      {/* Tab strip */}
      <div
        role="tablist"
        aria-label="Demo"
        className="flex items-center gap-1 mb-4 w-fit mx-auto rounded-full glass p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`px-5 py-1.5 rounded-full font-mono text-xs tracking-wide transition ${
              active === t.id
                ? "bg-[--color-coral] text-white"
                : "text-[--color-muted] hover:text-[--color-fg]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ticks relative">
        <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
        <video
          key={tab.id}
          ref={ref}
          src={tab.src}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          className="w-full rounded-2xl border border-[--color-line-2] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
        />
      </div>
      <figcaption className="mt-4 text-center font-mono text-xs text-[--color-faint]">
        {tab.caption}
      </figcaption>

      {/* The real thing: the Kafene app the agents built, served from /sample. */}
      <div className="mt-6 text-center">
        <a
          href="/sample"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[--color-line-2] glass text-sm font-medium text-[--color-fg] hover:border-[--color-coral] hover:text-[--color-coral] transition"
        >
          See sample output
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
        </a>
        <p className="mt-2 font-mono text-[11px] text-[--color-faint]">
          the actual coffee app the agents built, live, not a mock
        </p>
      </div>
    </figure>
  );
}
