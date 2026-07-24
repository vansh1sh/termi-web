"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to the console for debugging; real telemetry would go here.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen grid place-items-center px-6 text-center relative overflow-hidden">
      <div className="blob1 pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-[--color-coral]/12 blur-[120px]" />
      <div className="relative max-w-md">
        <div className="text-6xl font-bold shimmer">Oops</div>
        <p className="mt-4 text-neutral-400">Something crashed while rendering this page.</p>
        {error.digest && <p className="mt-2 text-xs text-neutral-600 font-mono">ref: {error.digest}</p>}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-2xl bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Try again
          </button>
          <Link href="/" className="rounded-2xl border border-white/10 hover:border-white/25 px-6 py-3 font-semibold transition">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
