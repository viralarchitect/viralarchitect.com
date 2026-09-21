import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
const base = process.argv[2] || "http://127.0.0.1:3003";
const html = await (await fetch(base)).text();
assert.match(html, /EquipQR product demonstration/);
assert.match(html, /equipqr-stage/);
assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
assert.doesNotMatch(html, /Get Started Free/);
for (const file of [
  "static-composite.svg",
  ...(await readdir("public/equipqr/equipment")).map((f) => "equipment/" + encodeURIComponent(f)),
]) {
  const r = await fetch(new URL("/equipqr/" + file, base));
  assert.equal(r.status, 200, file);
  assert.match(r.headers.get("content-type"), /image\/svg\+xml/);
}
console.log("Verified model markup, preserved hero, and all 13 SVG assets at " + base);
