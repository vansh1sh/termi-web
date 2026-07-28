"use client";

import { safeDownloadUrl } from "./safeDownloadUrl";

const DMG_URL = safeDownloadUrl(process.env.NEXT_PUBLIC_DMG_URL);
// Same-origin file → use the download attribute so the browser saves it
// directly. External URL (releases page / CDN) → open in a new tab instead.
const IS_LOCAL_FILE = DMG_URL.startsWith("/");

export default function DownloadButton({ large = false, fancy = false }: { large?: boolean; fancy?: boolean }) {
  return (
    <a
      href={DMG_URL}
      {...(IS_LOCAL_FILE
        ? { download: "Termi.dmg" }
        : { target: "_blank", rel: "noopener noreferrer" })}
      aria-label="Download Termi for Mac (.dmg)"
      className={`group relative inline-flex items-center justify-center gap-3 rounded-xl bg-[--color-coral] hover:bg-[--color-coral-600] font-semibold text-white overflow-hidden ring-1 ring-white/20 border border-[--color-coral-600] transition-transform hover:scale-[1.02] active:scale-95 ${fancy ? "btn-download shadow-[0_18px_48px_-12px_rgba(240,118,74,0.75)]" : ""} ${large ? "px-9 py-5 text-lg" : "px-5 py-2.5 text-sm"}`}
    >
      <svg width={large ? 22 : 16} height={large ? 22 : 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.365 1.43c0 1.14-.42 2.2-1.13 3.02-.86.99-2.27 1.75-3.4 1.66-.14-1.12.44-2.29 1.1-3.03.78-.87 2.16-1.55 3.43-1.65zM20.5 17.1c-.55 1.27-.82 1.84-1.53 2.97-.99 1.57-2.39 3.53-4.13 3.55-1.54.02-1.94-1.01-4.03-1-2.09.01-2.53 1.02-4.07 1-1.74-.02-3.06-1.79-4.06-3.36C.02 17.9-.29 12.7 1.35 9.97c1.15-1.93 2.97-3.06 4.68-3.06 1.74 0 2.83 1.03 4.27 1.03 1.4 0 2.25-1.03 4.27-1.03 1.52 0 3.13.83 4.28 2.26-3.76 2.06-3.15 7.43.65 8.93z" />
      </svg>
      <span className="relative">Download for Mac</span>
    </a>
  );
}
