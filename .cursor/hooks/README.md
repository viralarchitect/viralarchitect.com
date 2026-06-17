# Cursor Hooks

Project hooks gate agent file edits with lint and format checks before the agent can continue.

## Hooks

| Hook | Script | Behavior |
|------|--------|----------|
| `afterFileEdit` | `lint-edited-file.mjs` | Runs the appropriate checks for the edited file type (see below). Returns `continue: false` until all checks pass. Invalid or missing hook input also blocks (fail-closed). |

## Checks by file type

| Extensions | Tools |
|------------|-------|
| `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` | ESLint (`--max-warnings 0`) + Prettier (`--check`) |
| `.css` | Stylelint + Prettier |
| `.md` | markdownlint-cli2 + Prettier |
| `.json`, `.yaml`, `.yml`, `.html` | Prettier |

Skipped paths and files: `node_modules/`, `.next/`, `out/`, `build/`, `.git/`, `package-lock.json`, env/op.env files, and binary assets (images, fonts, SVG, etc.).

## npm scripts

- `npm run lint` — ESLint
- `npm run lint:css` — Stylelint (respects `.stylelintignore`)
- `npm run lint:md` — markdownlint-cli2
- `npm run format:check` — Prettier check
- `npm run format` — Prettier write

## Cross-platform entrypoint

The hook runs via `node .cursor/hooks/lint-edited-file.mjs`, which resolves local `node_modules/.bin` shims on Windows and POSIX hosts.

## Configuration

Hooks are registered in `.cursor/hooks.json`. Cursor reloads that file on save; restart Cursor if hooks do not appear in **Settings → Hooks**.
