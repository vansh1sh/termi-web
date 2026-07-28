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
  // The sample output (the Kafene coffee app Termi's agents built) is a static
  // Vite build living in public/sample/. Redirect (not rewrite) the clean /sample
  // URL to the real index.html so the app's relative fetch("./content.json")
  // resolves inside /sample/ instead of the site root.
  async redirects() {
    return [
      { source: "/sample", destination: "/sample/index.html", permanent: false },
    ];
  },
};
module.exports = nextConfig;
