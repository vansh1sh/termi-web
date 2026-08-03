"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import NavLinks from "./NavLinks";
import { shouldCompactHeader } from "./headerState";
import BookDemo from "./BookDemo";

export default function SiteHeader() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const next = shouldCompactHeader(window.scrollY);
      setCompact((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={`site-header ${compact ? "site-header--compact" : ""}`}
      data-compact={compact ? "true" : "false"}
    >
      <nav
        className="site-nav mx-auto max-w-6xl flex items-center justify-between px-5 sm:px-6"
        aria-label="Primary navigation"
      >
        <Link href="/" aria-label="Termi home">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-4 sm:gap-7 text-sm text-[--color-muted]">
          <NavLinks />
          <Link href="/login" className="hidden hover:text-[--color-fg] transition sm:inline">Sign in</Link>
          <BookDemo />
          <a
            href="/downloads/Termi.dmg"
            download="Termi.dmg"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-coral] px-3 py-1.5 font-medium text-white transition hover:bg-[--color-coral-600] sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:text-[--color-fg] sm:hover:bg-transparent sm:hover:text-[--color-coral]"
          >
            Download
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 15V3M7 10l5 5 5-5M4 21h16" />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}
