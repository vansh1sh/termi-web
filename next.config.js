// Baseline security headers applied to every response. Conservative defaults
// that don't require per-route tuning and won't break the app.
const securityHeaders = [
  // Stop MIME-sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disallow being framed (clickjacking) — the site isn't meant to be embedded.
  { key: "X-Frame-Options", value: "DENY" },
  // Drop powerful features we never use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  // Pin the workspace root so a stray lockfile in a parent directory doesn't
  // confuse Turbopack's root inference.
  turbopack: { root: __dirname },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // The sample output (the Kafene coffee app Termi's agents built) is a static Vite
  // build in public/sample/, built with --base=/sample/.
  //
  // REWRITE (not redirect) so the browser URL stays exactly "/sample": the app's
  // router matches its home route on "/" after stripping the /sample base, so a
  // visible "/sample/index.html" used to render its 404 ("This cup is empty").
  // A redirect to "/sample/" is not an option — Next's default trailingSlash:false
  // immediately strips the slash back to "/sample", causing a redirect loop.
  // Assets resolve fine because the build uses --base=/sample/ (absolute paths).
  async rewrites() {
    return [
      { source: "/sample", destination: "/sample/index.html" },
    ];
  },
};
module.exports = nextConfig;
