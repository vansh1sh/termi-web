"use client";

import NeuralNet from "./NeuralNet";
import CursorGlow from "./CursorGlow";
import { usePointerFineDesktop } from "./usePointerFineDesktop";

/**
 * The ambient background effects (neural-net canvas + cursor glow), mounted ONLY on
 * desktop with a real pointer.
 *
 * Both effects are pointer-parallax driven: on a phone there's no cursor to follow, so
 * they read as unexplained visual noise — and the canvas keeps a requestAnimationFrame
 * loop running, which costs battery for nothing.
 *
 * Not mounting them (rather than CSS-hiding) means no canvas, no rAF loop, and no
 * pointer listeners on mobile at all.
 */
export default function AmbientBackdrop() {
  const enabled = usePointerFineDesktop();
  if (!enabled) return null;
  return (
    <>
      <NeuralNet />
      <CursorGlow />
    </>
  );
}
