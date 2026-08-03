import test from "node:test";
import assert from "node:assert/strict";

const { checkRateLimit } = await import(process.env.DEMO_RATE_LIMIT_PATH);

test("allows requests below the limit and returns a new timestamp list", () => {
  const prior = [100, 200];
  const result = checkRateLimit(prior, 300, 3, 1_000);
  assert.deepEqual(result, { allowed: true, timestamps: [100, 200, 300], retryAfterSeconds: 0 });
  assert.deepEqual(prior, [100, 200]);
});

test("blocks at the limit with a retry time", () => {
  const result = checkRateLimit([100, 200, 300], 400, 3, 1_000);
  assert.equal(result.allowed, false);
  assert.deepEqual(result.timestamps, [100, 200, 300]);
  assert.equal(result.retryAfterSeconds, 1);
});

test("drops timestamps outside the window", () => {
  const result = checkRateLimit([100, 900], 1_200, 2, 1_000);
  assert.deepEqual(result, { allowed: true, timestamps: [900, 1_200], retryAfterSeconds: 0 });
});

test("uses safe bounds for invalid configuration", () => {
  assert.equal(checkRateLimit([], 100, 0, 0).allowed, true);
});
