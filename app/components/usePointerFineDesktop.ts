"use client";

import { useEffect, useState } from "react";

/**
 * True only on a desktop-sized viewport with a real (fine) pointer.
 *
 * Used to gate the ambient background effects (the neural-net canvas and the
 * cursor glow). Both are driven by pointer parallax, so on a phone or tablet they
 * are visual noise that tracks nothing — and the canvas animation costs battery.
 *
 * Gating in JS rather than hiding with CSS matters: `hidden sm:block` would still
 * mount the component and run its requestAnimationFrame loop on mobile.
 *
 * Starts false so the server render and the first mobile paint have no effect —
 * it can only turn on after the media query is evaluated on the client.
 */
export const DESKTOP_POINTER_QUERY = "(min-width: 768px) and (pointer: fine)";

export function usePointerFineDesktop(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(DESKTOP_POINTER_QUERY);
    const apply = () => setOk(mq.matches);
    apply();
    // Keep in sync across resize / rotation / plugging in a mouse.
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return ok;
}
