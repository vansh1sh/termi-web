// The packaged DMG ships with the site itself (public/downloads/Termi.dmg,
// built by flowterm-app/package-dmg.sh), so the default is a same-origin path
// that always resolves. NEXT_PUBLIC_DMG_URL can still point at a CDN/releases
// asset when one exists.
export const DEFAULT_DMG_URL = "/downloads/Termi.dmg";

// Only accept a configured URL if it's a valid http(s) link or a root-relative
// path — a typo or an unsafe scheme (javascript:, data:, …) must never reach
// the rendered href.
export function safeDownloadUrl(raw: string | undefined): string {
  if (!raw) return DEFAULT_DMG_URL;
  // Root-relative path (same-origin asset). "//host/…" is protocol-relative —
  // an external URL in disguise — so it must NOT match here.
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : DEFAULT_DMG_URL;
  } catch {
    return DEFAULT_DMG_URL;
  }
}
