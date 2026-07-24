// Restrict post-login redirects to same-site relative paths. Anything else
// (absolute URLs, protocol-relative //host, javascript:, etc.) falls back to
// /dashboard — this is an open-redirect guard, so keep it strict.
export function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Must be a plain relative path: single leading slash, not "//" (protocol-relative).
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  // Reject backslash tricks and control chars that browsers may normalize.
  if (/[\\\x00-\x1f]/.test(raw)) return "/dashboard";
  return raw;
}
