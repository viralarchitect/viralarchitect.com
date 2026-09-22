<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- When editing the hero (`Initialize`), keep the TypedText sub-headline; put social or external links in the hexline telemetry row, not in place of the sub-headline.
- New hero links should use the same hexline telemetry styling as the RELAY/STATUS rows (including HexCode readouts where appropriate).
- Preserve the console/telemetry aesthetic when changing hero or section UI.
- Interactive Hardware is decorative only — keep it collapsed by default at the bottom of the page and out of primary navigation.

## Learned Workspace Facts

- Next.js 16.2.9 (Turbopack) single-page portfolio with a retro console/telemetry theme.
- Site copy and URLs (including `SOCIAL_LINKS`) live in `content/profile.ts`; static assets live in `public/`.
- Hero section is `components/sections/Initialize.tsx`; prefer profile data over hardcoded JSX for editable copy and link targets.
- Cloudflare is tied to the personal account `viral.architect@gmail.com` (account ID `b38e5d6536f4208b8eff37a85180058e`). API token lives in 1Password vault **ViralArchitect.com Agents** (`phqzta7t7exkddtreg5o35jdxy`), item **cloudflare-write** (`cpa7fdjbmdezsvoj2nunq2zzpq`) — fields `credential` or `CLOUDFLARE_API_TOKEN`. Load via `scripts/cloudflare-env.ps1` or `op run --env-file=scripts/cloudflare.op.env -- <command>`. Never commit plaintext tokens.
- Uplink contact form env vars: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`. Gmail app password in 1Password item **gmail-app-password** (`ndq3qzvdspc6y5rmvsbvpgzp2m`). Create Turnstile widget via `scripts/setup-uplink.ps1` (Cloudflare token needs `Account.Turnstile:Edit`).

## Cursor Cloud specific instructions

- Runs on Node 22 with npm (uses `package-lock.json`). Scripts live in `package.json`: `dev`, `build`, `start`, `lint`, `lint:css`, `lint:md`, `format`.
- Dev server: `npm run dev` serves the single page on `http://localhost:3000` (Next.js 16 Turbopack). Prefer this over `npm run build`/`start` for development.
- The Uplink contact form (`app/api/uplink/route.ts`) needs the Turnstile + Gmail env vars above. Without them the form renders and accepts input but shows `WARN :: TURNSTILE SITE KEY UNCONFIGURED` and cannot submit — this is expected in a bare dev environment; the rest of the site is fully functional without any secrets.
- Lint gotchas (pre-existing on `main`, not environment problems): `npm run lint` fails under `--max-warnings 0` due to an `import/no-anonymous-default-export` warning in `stylelint.config.mjs`, and `npm run lint:md` globs into `node_modules` and reports errors from dependency READMEs. `npm run lint:css` passes clean.
- The `scripts/*.ps1` helpers are Windows PowerShell + 1Password tooling for the site owner's machine; they are not needed to run or test the app in this Linux VM.
