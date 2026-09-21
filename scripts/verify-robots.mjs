import assert from "node:assert/strict";

export function verifyRobots(html, headers, production) {
  const tags = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi) || [];
  assert.equal(tags.length, 1, "Homepage must emit exactly one robots meta tag");
  const policy = tags[0].match(/\bcontent=["']([^"']*)["']/i)?.[1];
  assert.equal(policy, production ? "index, follow" : "noindex, nofollow");
  if (production) {
    assert.doesNotMatch(
      html,
      /\bnoindex\b|\bnofollow\b/i,
      "Production HTML contains restrictive indexing directives",
    );
    assert.doesNotMatch(headers.get("x-robots-tag") || "", /noindex|nofollow|none/i);
  }
}
