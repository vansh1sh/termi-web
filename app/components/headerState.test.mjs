import assert from "node:assert/strict";
import test from "node:test";

const { shouldCompactHeader } = await import(
  process.env.HEADER_STATE_PATH ?? "./headerState.js"
);

test("header remains full size at the top of the page", () => {
  assert.equal(shouldCompactHeader(0), false);
  assert.equal(shouldCompactHeader(24), false);
});

test("header compacts after the scroll threshold", () => {
  assert.equal(shouldCompactHeader(25), true);
  assert.equal(shouldCompactHeader(400), true);
});

test("invalid and negative positions keep the full header", () => {
  assert.equal(shouldCompactHeader(-10), false);
  assert.equal(shouldCompactHeader(Number.NaN), false);
});
