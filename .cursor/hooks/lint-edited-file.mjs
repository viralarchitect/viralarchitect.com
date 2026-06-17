#!/usr/bin/env node
/**
 * afterFileEdit hook — runs project linters/formatters and blocks until clean.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");

function emit(response) {
  console.log(JSON.stringify(response));
}

function block(filePath, messages) {
  const body = messages.join("\n\n---\n\n").trim();
  emit({
    continue: false,
    agent_message: `Lint/format checks failed for ${filePath}. Fix all reported issues before continuing.\n\n${body}`,
  });
  process.exit(1);
}

function blockInput(message) {
  emit({
    continue: false,
    agent_message: message,
  });
  process.exit(1);
}

function allow() {
  emit({ continue: true });
  process.exit(0);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function shouldSkip(filePath) {
  const normalized = normalizePath(filePath);

  if (/(^|\/)(node_modules|\.next|out|build|\.git)(\/|$)/.test(normalized)) {
    return true;
  }
  if (/(^|\/)package-lock\.json$/.test(normalized)) {
    return true;
  }
  if (/\.(svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot|pem|mp4|webm)$/i.test(normalized)) {
    return true;
  }
  if (/(^|\/)\.env(\.|$)|\.op\.env$/.test(normalized)) {
    return true;
  }

  return false;
}

function resolveEditedPath(filePath) {
  const absPath = isAbsolute(filePath) ? resolve(filePath) : resolve(projectRoot, filePath);
  const relToRoot = relative(projectRoot, absPath);

  if (relToRoot.startsWith("..") || isAbsolute(relToRoot)) {
    return null;
  }

  return absPath;
}

function resolvePackageBin(packageName) {
  const pkgJsonPath = join(projectRoot, "node_modules", packageName, "package.json");
  if (!existsSync(pkgJsonPath)) {
    return null;
  }

  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  let binRel = pkg.bin;
  if (!binRel) {
    return null;
  }
  if (typeof binRel === "object") {
    binRel = binRel[packageName] ?? Object.values(binRel)[0];
  }

  return join(projectRoot, "node_modules", packageName, binRel);
}

function runBin(packageName, args) {
  const scriptPath = resolvePackageBin(packageName);
  if (!scriptPath) {
    return {
      exitCode: 1,
      output: `Could not resolve local binary for ${packageName}. Run npm install in the project root.`,
    };
  }

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  const exitCode = result.error ? 1 : (result.status ?? 1);

  return { exitCode, output };
}

const inputJson = await readStdin();

if (!inputJson.trim()) {
  blockInput(
    "Lint hook received empty stdin. Cannot evaluate the edited file; blocking until hook input is valid.",
  );
}

let data;
try {
  data = JSON.parse(inputJson);
} catch {
  blockInput(
    "Lint hook received invalid JSON on stdin. Cannot evaluate the edited file; blocking until hook input is valid.",
  );
}

const filePath = data?.path;
if (typeof filePath !== "string" || !filePath.trim()) {
  blockInput(
    "Lint hook input is missing a valid `path`. Cannot evaluate the edited file; blocking until hook input is valid.",
  );
}

const absPath = resolveEditedPath(filePath);
if (!absPath) {
  blockInput(
    `Lint hook rejected path outside project root: \`${filePath}\`. Only files within the workspace can be linted.`,
  );
}

if (shouldSkip(normalizePath(relative(projectRoot, absPath)))) {
  allow();
}

if (!existsSync(absPath)) {
  blockInput(
    `Lint hook could not find edited file at \`${filePath}\`. Blocking until the file exists and can be checked.`,
  );
}

const failures = [];

if (/\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(filePath)) {
  const eslint = runBin("eslint", [absPath, "--max-warnings", "0"]);
  if (eslint.exitCode !== 0) {
    failures.push(`ESLint\n${eslint.output || `ESLint exited with code ${eslint.exitCode}.`}`);
  }
}

if (/\.css$/i.test(filePath)) {
  const stylelint = runBin("stylelint", [absPath]);
  if (stylelint.exitCode !== 0) {
    failures.push(
      `Stylelint\n${stylelint.output || `Stylelint exited with code ${stylelint.exitCode}.`}`,
    );
  }
}

if (/\.md$/i.test(filePath)) {
  const markdownlint = runBin("markdownlint-cli2", [absPath]);
  if (markdownlint.exitCode !== 0) {
    failures.push(
      `Markdownlint\n${markdownlint.output || `markdownlint-cli2 exited with code ${markdownlint.exitCode}.`}`,
    );
  }
}

if (/\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|yaml|yml|html)$/i.test(filePath)) {
  const prettier = runBin("prettier", ["--check", absPath]);
  if (prettier.exitCode !== 0) {
    failures.push(`Prettier\n${prettier.output || `Prettier exited with code ${prettier.exitCode}.`}`);
  }
}

if (failures.length > 0) {
  block(filePath, failures);
}

allow();
