import test from "node:test";
import assert from "node:assert/strict";

const mod = await import(process.env.PROTOCOL_PATH || "./protocol.js");
const {
  createControlMessage,
  isMatchingControlResult,
  isPrivateRealtimeRoom,
  MAX_INSTRUCTION_LENGTH,
  shouldOpenRealtime,
} = mod;

test("creates a typed task-start message", () => {
  const message = createControlMessage("task_start", "  Build a reporting dashboard  ", "req-1", 1234);
  assert.deepEqual(message, {
    type: "task_start",
    instruction: "Build a reporting dashboard",
    requestId: "req-1",
    t: 1234,
  });
});

test("returns null for blank instructions", () => {
  assert.equal(createControlMessage("task_start", "   ", "req-1", 1234), null);
  assert.equal(createControlMessage("brain_instruct", "\n", "req-2", 1234), null);
});

test("clamps instructions and request ids at the browser boundary", () => {
  const message = createControlMessage(
    "task_start",
    "x".repeat(MAX_INSTRUCTION_LENGTH + 100),
    "r".repeat(300),
    1234,
  );
  assert.equal(message.instruction.length, MAX_INSTRUCTION_LENGTH);
  assert.equal(message.requestId.length, 120);
});

test("demo preview does not require Supabase configuration", () => {
  assert.equal(shouldOpenRealtime(true, false), false);
  assert.equal(shouldOpenRealtime(true, true), false);
  assert.equal(shouldOpenRealtime(false, false), false);
  assert.equal(shouldOpenRealtime(false, true), true);
});

test("only the current pending request can resolve a control action", () => {
  assert.equal(isMatchingControlResult("task-123", "task-123"), true);
  assert.equal(isMatchingControlResult("task-123", "task-456"), false);
  assert.equal(isMatchingControlResult(null, "task-123"), false);
});

test("real account rooms are private while the view-only demo remains public", () => {
  assert.equal(isPrivateRealtimeRoom(false), true);
  assert.equal(isPrivateRealtimeRoom(true), false);
});
