import test from "node:test";
import assert from "node:assert/strict";

const { record, up, down } = await import(process.env.HISTORY_PATH || "./history.js");

const fresh = () => ({ history: [], idx: 0, draft: "", value: "" });

test("record: adds a command and parks cursor at the live prompt", () => {
  let s = record(fresh(), "ls");
  assert.deepEqual(s.history, ["ls"]);
  assert.equal(s.idx, 1); // === history.length → at prompt
  assert.equal(s.value, "");
});

test("record: skips consecutive duplicates", () => {
  let s = record(record(record(fresh(), "ls"), "ls"), "pwd");
  assert.deepEqual(s.history, ["ls", "pwd"]);
});

test("record: caps history at 100", () => {
  let s = fresh();
  for (let i = 0; i < 130; i++) s = record(s, `cmd${i}`);
  assert.equal(s.history.length, 100);
  assert.equal(s.history[0], "cmd30"); // oldest 30 dropped
  assert.equal(s.history[99], "cmd129");
});

test("up/down: walks history and restores the live draft", () => {
  let s = record(record(fresh(), "one"), "two");
  s = { ...s, value: "dr" }; // user has typed a draft "dr"
  s = up(s);   // → "two"
  assert.equal(s.value, "two");
  assert.equal(s.draft, "dr"); // draft stashed
  s = up(s);   // → "one"
  assert.equal(s.value, "one");
  s = down(s); // → "two"
  assert.equal(s.value, "two");
  s = down(s); // → back to prompt, draft restored
  assert.equal(s.value, "dr");
  assert.equal(s.idx, 2);
});

test("up: clamps at the oldest entry", () => {
  let s = record(record(fresh(), "a"), "b");
  s = up(up(up(up(s)))); // more ups than entries
  assert.equal(s.value, "a");
  assert.equal(s.idx, 0);
});

test("down: no-op at the live prompt", () => {
  const s = record(fresh(), "a");
  assert.equal(down(s), s); // referential no-op
});

test("up: no-op on empty history", () => {
  const s = fresh();
  assert.equal(up(s), s);
});
