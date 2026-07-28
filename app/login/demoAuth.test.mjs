import test from "node:test";
import assert from "node:assert/strict";

const { isDemoCredentials } = await import(process.env.DEMO_PATH || "./demoAuth.js");

test("matches the exact demo/demo pair", () => {
  assert.equal(isDemoCredentials("demo", "demo"), true);
  assert.equal(isDemoCredentials("  demo  ", "demo"), true); // email is trimmed
});

test("rejects anything else", () => {
  assert.equal(isDemoCredentials("demo", "Demo"), false);   // password is case-sensitive, not trimmed
  assert.equal(isDemoCredentials("Demo", "demo"), false);   // email case matters
  assert.equal(isDemoCredentials("demo@x.com", "demo"), false);
  assert.equal(isDemoCredentials("demo", "demo1"), false);
  assert.equal(isDemoCredentials("demonstrate", "demonstrate"), false); // no prefix match
  assert.equal(isDemoCredentials("", ""), false);
  assert.equal(isDemoCredentials("demo", " demo"), false);  // password whitespace matters
});
