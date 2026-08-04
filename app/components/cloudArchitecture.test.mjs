import test from "node:test";
import assert from "node:assert/strict";

const mod = await import(process.env.CLOUD_ARCH_PATH || "./cloudArchitecture.js");
const { CLOUD_PRINCIPLES, CLOUD_PROVIDERS } = mod;

test("names the supported enterprise cloud design targets precisely", () => {
  assert.deepEqual(CLOUD_PROVIDERS.map((provider) => provider.name), ["AWS", "Google Cloud"]);
  assert.match(CLOUD_PROVIDERS[0].identity, /IAM roles|AWS STS/);
  assert.match(CLOUD_PROVIDERS[1].identity, /Workload Identity Federation/);
});

test("keeps execution and credentials under customer control", () => {
  const copy = JSON.stringify({ CLOUD_PRINCIPLES, CLOUD_PROVIDERS });
  assert.match(copy, /customer-managed/i);
  assert.match(copy, /local-first/i);
  assert.match(copy, /short-lived/i);
  assert.doesNotMatch(copy, /Termi runner|hosted compute/i);
  assert.doesNotMatch(copy, /approved cloud workflows/i);
  assert.doesNotMatch(copy, /store(?:s|d)? (?:your )?(?:AWS|Google Cloud|GCP) (?:keys|credentials)/i);
});

test("distinguishes secrets, encryption keys, audit events, and operational logs", () => {
  for (const provider of CLOUD_PROVIDERS) {
    assert.doesNotMatch(provider.secrets, /KMS/);
    assert.match(provider.keys, /KMS/);
    assert.match(provider.audit, /CloudTrail|Cloud Audit Logs/);
    assert.match(provider.logs, /CloudWatch|Cloud Logging/);
  }
});

test("covers identity, secrets, networking, and auditability", () => {
  assert.deepEqual(
    CLOUD_PRINCIPLES.map((principle) => principle.id),
    ["execution", "identity", "network", "audit"],
  );
});
