import test from "node:test";
import assert from "node:assert/strict";
import { indexingPolicy } from "../lib/seo.ts";

test("only production permits indexing and following", () => {
  assert.deepEqual(indexingPolicy("production"), { index: true, follow: true });
  for (const environment of ["preview", "development", "staging", ""]) {
    assert.deepEqual(indexingPolicy(environment), { index: false, follow: false });
  }
});
import { verifyRobots } from "../scripts/verify-robots.mjs";

test("production validation rejects duplicate, conflicting, and header directives", () => {
  const good = '<meta name="robots" content="index, follow">';
  const bad = '<meta name="robots" content="noindex, nofollow">';
  verifyRobots(good, new Headers(), true);
  verifyRobots(bad, new Headers(), false);
  for (const html of [good + good, good + bad, bad, ""]) {
    assert.throws(() => verifyRobots(html, new Headers(), true));
  }
  assert.throws(() => verifyRobots(good, new Headers({ "x-robots-tag": "noindex" }), true));
  assert.throws(() => verifyRobots(good, new Headers(), false));
});
