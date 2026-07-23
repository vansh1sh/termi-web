"use client";

// The DMG download URL — point at a GitHub Release asset (or wherever the DMG is hosted).
const DMG_URL = process.env.NEXT_PUBLIC_DMG_URL || "https://github.com/vansh1sh/SuperTerminalApp/releases/latest/download/Termi.dmg";

export default function DownloadButton({ large = false }: { large?: boolean }) {
  return (
    <a
      href={DMG_URL}
      className={`group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[--color-coral] to-[--color-coral-600] font-semibold text-white overflow-hidden transition-transform hover:scale-[1.03] active:scale-95 shadow-xl shadow-[--color-coral]/30 ${large ? "px-8 py-4 text-lg" : "px-6 py-3"}`}
    >
      {/* shine sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <svg width={large ? 22 : 18} height={large ? 22 : 18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.365 1.43c0 1.14-.42 2.2-1.13 3.02-.86.99-2.27 1.75-3.4 1.66-.14-1.12.44-2.29 1.1-3.03.78-.87 2.16-1.55 3.43-1.65zM20.5 17.1c-.55 1.27-.82 1.84-1.53 2.97-.99 1.57-2.39 3.53-4.13 3.55-1.54.02-1.94-1.01-4.03-1-2.09.01-2.53 1.02-4.07 1-1.74-.02-3.06-1.79-4.06-3.36C.02 17.9-.29 12.7 1.35 9.97c1.15-1.93 2.97-3.06 4.68-3.06 1.74 0 2.83 1.03 4.27 1.03 1.4 0 2.25-1.03 4.27-1.03 1.52 0 3.13.83 4.28 2.26-3.76 2.06-3.15 7.43.65 8.93z" />
      </svg>
      <span className="relative flex flex-col items-start leading-none">
        <span>Download for Mac</span>
        <span className="text-[11px] font-normal opacity-80 mt-0.5">Apple Silicon · .dmg</span>
      </span>
    </a>
  );
}
