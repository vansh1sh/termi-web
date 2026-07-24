// The releases page always resolves (a `latest/download/Termi.dmg` link 404s until
// an asset with that exact name exists), so it's the safe default.
export const DEFAULT_DMG_URL = "https://github.com/vansh1sh/SuperTerminalApp/releases/latest";

// Only accept a configured URL if it's a valid http(s) link — a typo or an unsafe
// scheme (javascript:, data:, …) must never reach the rendered href.
export function safeDownloadUrl(raw: string | undefined): string {
  if (!raw) return DEFAULT_DMG_URL;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : DEFAULT_DMG_URL;
  } catch {
    return DEFAULT_DMG_URL;
  }
}
