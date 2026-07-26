"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The real product demo: an actual fast-forwarded screen recording of Termi taking a
 * goal 0 → 1 (plan → agents building → checks passing). Muted, loops, plays when
 * scrolled into view. No mock UI — this is the app.
 */
export default function DemoVideo({
  src,
  caption,
}: {
  src: string;
  caption?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

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
  }, []);

  if (failed) return null; // video missing → section disappears rather than showing a broken box

  return (
    <figure className="mx-auto max-w-5xl px-6">
      <div className="ticks relative">
        <span className="t tl" /><span className="t tr" /><span className="t bl" /><span className="t br" />
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          className="w-full rounded-2xl border border-[--color-line-2] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
        />
      </div>
      {caption && (
        <figcaption className="mt-4 text-center font-mono text-xs text-[--color-faint]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
