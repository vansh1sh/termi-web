import test from "node:test";
import assert from "node:assert/strict";

const { jsonLd } = await import(process.env.JSONLD_PATH || "./jsonLd.js");

test("produces valid JSON that round-trips", () => {
  const obj = { "@type": "Thing", name: "Termi", n: 1, ok: true };
  assert.deepEqual(JSON.parse(jsonLd(obj)), obj);
});

test("escapes < so it can't break out of a <script> tag", () => {
  const out = jsonLd({ text: "</script><script>alert(1)</script>" });
  assert.ok(!out.includes("</script>"), "raw </script> must not appear");
  assert.ok(out.includes("\\u003c"), "< should be escaped to \\u003c");
  // Still valid JSON with the original value preserved.
  assert.equal(JSON.parse(out).text, "</script><script>alert(1)</script>");
});

test("escapes <!-- (HTML comment breakout) too", () => {
  const out = jsonLd({ text: "<!-- x -->" });
  assert.ok(!out.includes("<!--"));
  assert.equal(JSON.parse(out).text, "<!-- x -->");
});

test("leaves ordinary content readable", () => {
  const out = jsonLd({ q: "Is Termi free?" });
  assert.equal(JSON.parse(out).q, "Is Termi free?");
});
