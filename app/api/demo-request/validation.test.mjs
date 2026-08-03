import test from "node:test";
import assert from "node:assert/strict";

const { validateDemoRequest } = await import(process.env.DEMO_VALIDATION_PATH);

test("accepts a valid email with optional fields omitted", () => {
  assert.deepEqual(validateDemoRequest({ email: "buyer@example.com" }), {
    ok: true,
    value: { email: "buyer@example.com", phone: "", details: "" },
  });
});

test("normalizes optional phone and details", () => {
  assert.deepEqual(validateDemoRequest({
    email: "  LEAD@Example.com ",
    phone: "  +1 415 555 0199 ",
    details: "  We need SSO and audit controls.  ",
  }), {
    ok: true,
    value: {
      email: "lead@example.com",
      phone: "+1 415 555 0199",
      details: "We need SSO and audit controls.",
    },
  });
});

test("rejects missing or malformed email", () => {
  assert.equal(validateDemoRequest({}).ok, false);
  assert.equal(validateDemoRequest({ email: "not-an-email" }).ok, false);
  assert.equal(validateDemoRequest({ email: "a@b" }).ok, false);
});

test("rejects oversized fields", () => {
  assert.equal(validateDemoRequest({ email: `${"a".repeat(250)}@example.com` }).ok, false);
  assert.equal(validateDemoRequest({ email: "a@example.com", phone: "1".repeat(41) }).ok, false);
  assert.equal(validateDemoRequest({ email: "a@example.com", details: "x".repeat(2001) }).ok, false);
});

test("marks a filled honeypot as spam", () => {
  assert.deepEqual(validateDemoRequest({
    email: "bot@example.com",
    companyWebsite: "https://spam.example",
  }), { ok: false, spam: true, error: "Unable to submit this request." });
});

test("rejects non-object input", () => {
  assert.equal(validateDemoRequest(null).ok, false);
  assert.equal(validateDemoRequest("buyer@example.com").ok, false);
});
