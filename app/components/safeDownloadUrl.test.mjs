import test from "node:test";
import assert from "node:assert/strict";

const { safeDownloadUrl, DEFAULT_DMG_URL } = await import(process.env.SAFEDL_PATH || "./safeDownloadUrl.js");

test("falls back on undefined/empty", () => {
  assert.equal(safeDownloadUrl(undefined), DEFAULT_DMG_URL);
  assert.equal(safeDownloadUrl(""), DEFAULT_DMG_URL);
});

test("passes valid http(s) URLs through", () => {
  assert.equal(safeDownloadUrl("https://x.com/Termi.dmg"), "https://x.com/Termi.dmg");
  assert.equal(safeDownloadUrl("http://x.com/a"), "http://x.com/a");
});

test("rejects unsafe schemes", () => {
  assert.equal(safeDownloadUrl("javascript:alert(1)"), DEFAULT_DMG_URL);
  assert.equal(safeDownloadUrl("data:text/html,x"), DEFAULT_DMG_URL);
  assert.equal(safeDownloadUrl("ftp://x.com/f"), DEFAULT_DMG_URL);
});

test("rejects unparseable values", () => {
  assert.equal(safeDownloadUrl("not a url"), DEFAULT_DMG_URL);
  assert.equal(safeDownloadUrl("://missing-scheme"), DEFAULT_DMG_URL);
});

test("accepts root-relative paths (same-origin assets)", () => {
  assert.equal(safeDownloadUrl("/downloads/Termi.dmg"), "/downloads/Termi.dmg");
});

test("rejects protocol-relative URLs (external in disguise)", () => {
  assert.equal(safeDownloadUrl("//evil.com/Termi.dmg"), DEFAULT_DMG_URL);
});
