import test from "node:test";
import assert from "node:assert/strict";

const { backoffDelay } = await import(process.env.BACKOFF_PATH || "./backoff.js");

test("grows exponentially from ~1s", () => {
  assert.equal(backoffDelay(0), 1000);        // 1s + 0 jitter
  assert.equal(backoffDelay(1), 2000 + 250);  // 2s + jitter
  assert.equal(backoffDelay(2), 4000 + 500);  // 4s + jitter
  assert.equal(backoffDelay(3), 8000);        // 8s (jitter cycles back to 0)
});

test("caps the exponential base at 30s", () => {
  // attempt 5 hits the cap; further attempts only add cycling jitter, never exceed 30.5s.
  for (let a = 5; a < 50; a++) {
    assert.ok(backoffDelay(a) <= 30000 + 500, `attempt ${a} exceeded cap`);
    assert.ok(backoffDelay(a) >= 30000, `attempt ${a} below cap base`);
  }
});

test("handles negative/garbage attempts safely", () => {
  assert.equal(backoffDelay(-5), 1000);
  assert.equal(backoffDelay(2.9), backoffDelay(2)); // floored
});
