"use client";

import { useEffect, useRef, useState } from "react";

/// Adds `.in` to its child wrapper when scrolled into view — drives the CSS reveal/stagger.
export default function Reveal({
  children,
  className = "",
  variant = "reveal",
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "reveal" | "reveal-scale" | "stagger";
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setInView(true); if (once) io.disconnect(); }
        else if (!once) setInView(false);
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div ref={ref} className={`${variant} ${inView ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}
