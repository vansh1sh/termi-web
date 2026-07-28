// Runnable with: node --test  (Node 18+, no extra deps)
// The source is TS; we compile it to a temp .mjs first via `npm test` (see package.json),
// which points this file at the compiled output through the NORMALIZE_PATH env var.
import test from "node:test";
import assert from "node:assert/strict";

const mod = await import(process.env.NORMALIZE_PATH || "./normalize.js");
const { normalizeBrainStatus, normalizePresence } = mod;

test("brain: rejects non-objects", () => {
  for (const bad of [null, undefined, "x", 5, [1, 2, 3], true]) {
    assert.equal(normalizeBrainStatus(bad), null);
  }
});

test("brain: non-array terminals becomes empty array", () => {
  const b = normalizeBrainStatus({ terminals: "nope", isRunning: "true", pass: "3" });
  assert.ok(Array.isArray(b.terminals));
  assert.equal(b.terminals.length, 0);
  assert.equal(b.isRunning, true); // "true" coerced
  assert.equal(b.pass, 3); // "3" coerced
});

test("brain: garbage terminals are coerced/dropped", () => {
  const b = normalizeBrainStatus({ terminals: [{}, null, 5, { title: 123, progress: {} }] });
  // {} and {title:123,progress:{}} survive (coerced); null and 5 dropped
  assert.equal(b.terminals.length, 2);
  assert.equal(typeof b.terminals[0].title, "string");
  assert.equal(typeof b.terminals[0].progress, "string");
});

test("brain: caps terminals at 50", () => {
  const b = normalizeBrainStatus({ terminals: Array.from({ length: 9999 }, () => ({ title: "t" })) });
  assert.equal(b.terminals.length, 50);
});

test("brain: garbage tests coerced, bad ones handled", () => {
  const b = normalizeBrainStatus({ terminals: [{ title: "a", tests: "x" }, { title: "b", tests: [{}, { name: 1, passed: "true" }] }] });
  assert.equal(b.terminals[0].tests, undefined); // "x" not an array
  assert.equal(b.terminals[1].tests.length, 2);
  assert.equal(b.terminals[1].tests[1].passed, true); // "true" coerced
  assert.equal(typeof b.terminals[1].tests[1].name, "string"); // 1 coerced
});

test("brain: happy path preserved", () => {
  const b = normalizeBrainStatus({
    status: "working", isRunning: true, pass: 2,
    terminals: [{ title: "t1", progress: "building", complete: true, blocker: "", tests: [{ name: "unit", passed: true }] }],
  });
  assert.equal(b.status, "working");
  assert.equal(b.terminals[0].complete, true);
  assert.equal(b.terminals[0].blocker, undefined); // empty string not treated as a blocker
  assert.equal(b.terminals[0].tests[0].name, "unit");
});

test("brain: over-long strings are clamped", () => {
  const long = "x".repeat(5000);
  const b = normalizeBrainStatus({ status: long, terminals: [{ title: long, progress: long }] });
  assert.ok(b.status.length <= 2001);
  assert.ok(b.terminals[0].title.length <= 2001);
});

test("presence: rejects non-objects", () => {
  assert.equal(normalizePresence(null, 1000), null);
  assert.equal(normalizePresence("x", 1000), null);
});

test("presence: coerces and clamps", () => {
  const p = normalizePresence({ terminalCount: "-5", afkRunning: "true", activeTitle: 99, provider: null }, 1000);
  assert.equal(p.terminalCount, 0); // negative clamped
  assert.equal(p.afkRunning, true);
  assert.equal(p.activeTitle, "99");
  assert.equal(p.provider, "brain"); // null falls back
  assert.equal(p.at, 1000);
});

test("brain: parses tokens/cost/summary and per-terminal tokens", () => {
  const b = normalizeBrainStatus({
    status: "working", terminals: [{ title: "t1", progress: "p", tokens: "1200" }],
    tokens: "5000", costUSD: 0.12, summary: "halfway there",
  });
  assert.equal(b.tokens, 5000);
  assert.equal(b.costUSD, 0.12);
  assert.equal(b.summary, "halfway there");
  assert.equal(b.terminals[0].tokens, 1200);
});

test("brain: omits token/cost fields when absent or invalid", () => {
  const b = normalizeBrainStatus({ status: "x", terminals: [{ title: "t", progress: "p" }], tokens: "nope", costUSD: -3 });
  assert.equal(b.tokens, undefined);
  assert.equal(b.costUSD, undefined); // negative rejected
  assert.equal(b.summary, undefined);
  assert.equal(b.terminals[0].tokens, undefined);
});
