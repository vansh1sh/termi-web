// Canonical site origin, resolved once. Priority:
//  1. NEXT_PUBLIC_SITE_URL — explicit override (custom domain).
//  2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain on Vercel.
//  3. VERCEL_URL — the per-deploy URL (preview deploys).
//  4. Fallback to the known production domain.
// Used for metadataBase, sitemap, and robots so links are correct on every deploy.
export const FALLBACK_SITE_URL = "https://termi-web.vercel.app";

// Normalize a candidate to a valid http(s) origin+path with no trailing slash,
// or return null if it can't be parsed / isn't http(s). This is the guard that
// keeps a bad env value from throwing in `new URL(SITE_URL)` at module load.
function normalizeOrigin(candidate: string): string | null {
  const raw = candidate.trim();
  if (!raw) return null;
  // Add https:// only when there's no scheme at all (bare host like "termi.app").
  // A value with a non-http scheme (e.g. "ftp://…") is left as-is so the protocol
  // check below rejects it rather than being mangled into "https://ftp…".
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
  const withScheme = hasScheme ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname) return null;
    return u.origin.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/** Pure resolver (exported for testing) — takes an env-like bag.
 *  Always returns a valid, parseable absolute http(s) origin. */
export function resolveSiteUrl(env: Record<string, string | undefined>): string {
  const candidates = [
    env.NEXT_PUBLIC_SITE_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
    env.VERCEL_URL,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const origin = normalizeOrigin(c);
    if (origin) return origin;
  }
  return FALLBACK_SITE_URL;
}

export const SITE_URL = resolveSiteUrl(process.env);

// Pre-validated URL object for `metadataBase`. resolveSiteUrl always returns a
// parseable origin, but guard construction anyway so metadata can never throw.
export const SITE_URL_OBJECT: URL = (() => {
  try {
    return new URL(SITE_URL);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
})();
