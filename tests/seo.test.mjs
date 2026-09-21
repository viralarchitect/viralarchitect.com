import test from "node:test";
import assert from "node:assert/strict";
import { indexingPolicy } from "../lib/seo.ts";

test("only production permits indexing and following", () => {
  assert.deepEqual(indexingPolicy("production"), { index: true, follow: true });
  for (const environment of ["preview", "development", "staging", ""]) {
    assert.deepEqual(indexingPolicy(environment), { index: false, follow: false });
  }
});
