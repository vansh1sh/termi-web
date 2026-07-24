// Serialize a value for embedding in a <script type="application/ld+json"> tag.
// JSON.stringify does NOT escape "<", so a "</script>" or "<!--" appearing in any
// string would break out of the script element (an HTML-injection vector). Escaping
// "<" to its < unicode form keeps the JSON valid while making tag-breakout
// impossible, regardless of what the content is.
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
