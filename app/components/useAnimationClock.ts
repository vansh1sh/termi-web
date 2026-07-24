"use client";

import { useEffect, useState } from "react";

/**
 * A shared clock for the decorative demos. Returns an incrementing tick, but:
 *  - stops entirely when the user prefers reduced motion (returns a fixed frame),
 *  - pauses while the tab is hidden (saves battery / CPU),
 *  - reacts live to the reduced-motion setting changing.
 *
 * `active` tells callers whether the clock is advancing, so they can also skip
 * per-character typing loops etc. when motion is off.
 */
export function useAnimationClock(intervalMs: number, staticFrame = 0) {
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(staticFrame);

  // Track the reduced-motion preference (and updates to it).
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) { setTick(staticFrame); return; }

    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (id != null) return;
      id = setInterval(() => setTick((t) => t + 1), intervalMs);
    };
    const stop = () => {
      if (id != null) { clearInterval(id); id = undefined; }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [reduced, intervalMs, staticFrame]);

  return { tick, active: !reduced };
}
