import test from "node:test";
import assert from "node:assert/strict";

const { insertDemoRequest } = await import(process.env.DEMO_PERSISTENCE_PATH);

test("inserts a normalized request into the protected demo_requests table", async () => {
  const calls = [];
  const client = {
    from(table) {
      return {
        async insert(row) {
          calls.push({ table, row });
          return { error: null };
        },
      };
    },
  };

  await insertDemoRequest(client, {
    email: "buyer@example.com",
    phone: "",
    details: "We need SSO.",
  });

  assert.deepEqual(calls, [{
    table: "demo_requests",
    row: {
      email: "buyer@example.com",
      phone: null,
      details: "We need SSO.",
      source: "termi-web",
    },
  }]);
});

test("keeps database errors private", async () => {
  const client = {
    from() {
      return { async insert() { return { error: { message: "relation does not exist" } }; } };
    },
  };

  await assert.rejects(
    insertDemoRequest(client, { email: "buyer@example.com", phone: "", details: "" }),
    { message: "Unable to save demo request" },
  );
});
