# Recruiter conversion follow-up — v0.1.4

## Changes

- `content/profile.ts`: single SRE identity, specialization copy, personal and company GitHub URLs, concise EquipQR ownership chain.
- `components/sections/Initialize.tsx`: specialization beneath the SRE role; LinkedIn then personal GitHub before optional social links.
- `components/sections/Deployments.tsx`: clearly labeled Columbia Cloudworks GitHub link in Selected Work.
- `app/globals.css`: professional-link emphasis and 44px social-link touch targets; existing focus styles retained.
- `app/layout.tsx`: SRE-only structured job title and social image description; personal GitHub included in Person.sameAs.
- `app/opengraph-image.tsx`: SRE-only title with infrastructure and automation as specializations.
- `scripts/verify-robots.mjs`: strict homepage indexing assertions.
- `scripts/verify-site.mjs`: enforce one robots tag, reject any restrictive production HTML/header directives, validate GitHub links and structured identity.
- `tests/seo.test.mjs`: regression cases for duplicate tags, conflicts, missing tags, restrictive headers, and environment policy.
- `package.json`, `package-lock.json`: release version 0.1.4.
- `docs/recruiter-conversion-0.1.4.md`: this implementation report.

## Robots investigation

The reported duplicate/conflicting directives could not be reproduced. Before changes, fresh production requests using Mozilla, Googlebot, and Twitterbot each returned exactly one `index, follow` meta tag, no `noindex` or `nofollow` in the response, and no X-Robots-Tag header. The root layout is the sole robots metadata producer, using `lib/seo.ts`; production is explicitly identified by VERCEL_ENV. No page override, legacy SEO component, middleware, proxy, or configured Vercel/Next HTTP robots header was found. robots.ts controls the crawl file separately and agrees with the same policy.

No evidence supports naming a root cause for the external crawl result. The previous verifier did have a coverage gap: it checked for the presence of the expected tag, but did not reject an additional conflicting tag. That gap is now fixed and regression-tested. This was a verification defect, not proof that the live site emitted duplicates.

The production-equivalent build passes with exactly one `index, follow` meta tag and no restrictive directives in HTML or headers. Development emits exactly one `noindex, nofollow` tag. Preview, development, staging, and unspecified environments remain non-indexable under the existing environment policy. Production robots.txt allows the homepage and references the canonical sitemap; non-production disallows crawling and emits an empty sitemap.

## Content and conversion

Title remains Nicholas King | Site Reliability Engineer. Production infrastructure is specialization copy, not an alternate professional title. Personal GitHub opens in a new tab beside LinkedIn; the organization GitHub opens in a new tab in the EquipQR section. Both use meaningful labels and existing focus styling.

EquipQR now concisely connects design, software, CI/CD, migrations, deployment, monitoring, incident response, customer communication, and reliability decisions. The detailed reliability evidence remains unchanged. The monthly 99.9% availability objective remains separate from the contractual customer credit; no formal error-budget process or unsupported qualifications were added. Logo, historical titles, and technical disclosures are unchanged.

No current résumé artifact was found, so the recommended Download Résumé CTA was not added.

## Validation

ESLint, Stylelint, two unit tests, production build, production/development HTTP verification, and desktop/mobile layout checks passed. Canonical, OpenGraph/Twitter metadata, Person data, robots, sitemap, and the 1200x630 social image were checked. Professional links are visible in the mobile first screen with no horizontal overflow; social targets are at least 44px high. Keyboard focus and existing disclosures remain accessible. No separate existing integration/E2E test suite is configured; the site verifier provides HTTP integration checks.

Both GitHub destinations returned HTTP 200. LinkedIn retains the correct URL but returns HTTP 999 to automated requests, so automated destination validation remains limited. The Gmail mailto and contact navigation remain intact; no test message was sent.

Unresolved: the origin of the externally reported conflicting crawl directives is unconfirmed because it was not reproducible in current production responses.
