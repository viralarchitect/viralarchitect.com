import assert from "node:assert/strict";

const base = process.argv[2] || "http://127.0.0.1:3001";
const production = process.argv[3] !== "preview";
const response = await fetch(base);
assert.equal(response.status, 200);
const html = await response.text();
assert.match(html, /Nicholas King \| Site Reliability Engineer/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.viralarchitect\.com\/?"/);
assert.match(
  html,
  production
    ? /name="robots" content="index, follow"/
    : /name="robots" content="noindex, nofollow"/,
);
if (production)
  assert.doesNotMatch(response.headers.get("x-robots-tag") || "", /noindex|nofollow/i);
assert.match(html, /name="twitter:card" content="summary_large_image"/);
assert.match(html, /property="og:image"/);
assert.doesNotMatch(html, /placehold\.co/);
const person = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
assert.equal(person["@type"], "Person");
assert.equal(person.name, "Nicholas King");
assert.equal((html.match(/<summary/g) || []).length, 20);
assert.match(html, /mailto:viral\.architect@gmail\.com/);
assert.match(html, /monthly availability objective/);
assert.match(html, /Specification-driven compliance with PowerShell/);
for (const route of ["robots.txt", "sitemap.xml"]) {
  const result = await fetch(new URL(route, base));
  assert.equal(result.status, 200);
  const body = await result.text();
  if (production) assert.match(body, /https:\/\/www\.viralarchitect\.com\//);
  else if (route === "robots.txt") assert.match(body, /Disallow: \/\s*$/);
  else assert.doesNotMatch(body, /<loc>/);
}
const og = await fetch(new URL("opengraph-image", base));
assert.equal(og.status, 200);
assert.match(og.headers.get("content-type"), /image\/png/);
const bytes = Buffer.from(await og.arrayBuffer());
assert.equal(bytes.readUInt32BE(16), 1200);
assert.equal(bytes.readUInt32BE(20), 630);
console.log(
  `Verified ${base}: ${production ? "production" : "preview"} indexing, metadata, content, 20 disclosures, robots, sitemap, 1200x630 social image.`,
);
