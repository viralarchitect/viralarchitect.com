import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";

const base = process.argv[2] || "http://127.0.0.1:3003";
const html = await (await fetch(base)).text();
const paths = [
  ...new Set(
    [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((p) => p.startsWith("/_next/")),
  ),
];
let raw = 0,
  gzip = 0;
for (const path of paths) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200);
  const buffer = Buffer.from(await response.arrayBuffer());
  raw += buffer.length;
  gzip += gzipSync(buffer).length;
  assert.doesNotMatch(
    buffer.toString(),
    /GSAP 3\.|MorphSVGPlugin|GreenSock/,
    "Animation runtime leaked into initial script set",
  );
}
console.log(JSON.stringify({ base, initialScripts: paths.length, rawBytes: raw, gzipBytes: gzip }));
if (process.argv.includes("--local-chunks")) {
  const files = (await readdir(".next/static/chunks")).filter((f) => f.endsWith(".js"));
  const initial = new Set(paths.map((p) => p.split("/").pop()));
  let lazyRaw = 0,
    lazyGzip = 0;
  for (const file of files.filter((f) => !initial.has(f))) {
    const buffer = await readFile(".next/static/chunks/" + file);
    lazyRaw += buffer.length;
    lazyGzip += gzipSync(buffer).length;
  }
  console.log(
    JSON.stringify({
      nonInitialChunks: files.length - initial.size,
      rawBytes: lazyRaw,
      gzipBytes: lazyGzip,
    }),
  );
}
