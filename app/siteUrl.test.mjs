import test from "node:test";
import assert from "node:assert/strict";

const { resolveSiteUrl, FALLBACK_SITE_URL } = await import(process.env.SITEURL_PATH || "./siteUrl.js");

test("falls back when nothing is set", () => {
  assert.equal(resolveSiteUrl({}), FALLBACK_SITE_URL);
});

test("VERCEL_URL (preview) wins over fallback", () => {
  assert.equal(resolveSiteUrl({ VERCEL_URL: "pr-42-termi.vercel.app" }), "https://pr-42-termi.vercel.app");
});

test("production URL wins over preview URL", () => {
  assert.equal(
    resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "termi.app", VERCEL_URL: "pr-42.vercel.app" }),
    "https://termi.app",
  );
});

test("explicit NEXT_PUBLIC_SITE_URL wins over everything", () => {
  assert.equal(
    resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://termi.dev", VERCEL_PROJECT_PRODUCTION_URL: "termi.app", VERCEL_URL: "x.vercel.app" }),
    "https://termi.dev",
  );
});

test("strips trailing slashes from explicit URL", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://termi.dev///" }), "https://termi.dev");
});

test("tolerates a full URL pasted into a Vercel host var (no double scheme)", () => {
  assert.equal(resolveSiteUrl({ VERCEL_URL: "https://x.vercel.app" }), "https://x.vercel.app");
});

test("ignores blank/whitespace values", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "   ", VERCEL_URL: "" }), FALLBACK_SITE_URL);
});

test("adds https:// to a bare host", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "termi.app" }), "https://termi.app");
});

test("falls through to the next candidate when a value is unparseable", () => {
  // A garbage explicit value must not win; fall back to the valid Vercel host.
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://", VERCEL_URL: "x.vercel.app" }), "https://x.vercel.app");
});

test("reduces a URL with a path to its origin", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://termi.dev/some/path" }), "https://termi.dev");
});

test("rejects non-http schemes, falling back", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "ftp://termi.dev" }), FALLBACK_SITE_URL);
});
