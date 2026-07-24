import test from "node:test";
import assert from "node:assert/strict";

const { safeNext } = await import(process.env.SAFENEXT_PATH || "./safeNext.js");

test("allows plain relative paths", () => {
  assert.equal(safeNext("/dashboard"), "/dashboard");
  assert.equal(safeNext("/settings/profile"), "/settings/profile");
  assert.equal(safeNext("/a?b=1#c"), "/a?b=1#c");
});

test("falls back on null/empty", () => {
  assert.equal(safeNext(null), "/dashboard");
  assert.equal(safeNext(""), "/dashboard");
});

test("blocks absolute URLs", () => {
  assert.equal(safeNext("https://evil.com"), "/dashboard");
  assert.equal(safeNext("http://evil.com/path"), "/dashboard");
});

test("blocks protocol-relative //host (open-redirect vector)", () => {
  assert.equal(safeNext("//evil.com"), "/dashboard");
  assert.equal(safeNext("//evil.com/dashboard"), "/dashboard");
});

test("blocks backslash and control-char tricks", () => {
  assert.equal(safeNext("/\\evil.com"), "/dashboard");
  assert.equal(safeNext("/foo\nbar"), "/dashboard");
  assert.equal(safeNext("/foo\tbar"), "/dashboard");
});

test("blocks scheme-only values that don't start with /", () => {
  assert.equal(safeNext("javascript:alert(1)"), "/dashboard");
  assert.equal(safeNext("dashboard"), "/dashboard");
});
