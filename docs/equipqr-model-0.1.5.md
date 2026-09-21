# EquipQR system model — v0.1.5

## Source and scope

Ported from EquipQR production `origin/main` at `f47eb04861dfc6600c811eff02a23b95145b9571` (v3.32.0). The source checkout is on preview with unrelated local changes; those changes and the checkout were preserved. No EquipQR source files were modified. The relevant working-copy animation files were also compared to production and matched.

Source modules under `src/components/landing/`: `HeroAnimation.tsx`, `QRScanPhase.tsx`, `StateMorphPhase.tsx`, `AssetDotsPhase.tsx`, `NationalMapPhase.tsx`, `PMChecklistPhase.tsx`, `stateVectors.ts`, `dotPositions.ts`, `heroGeometry.ts`, `featureCardsData.ts`, `pmChecklistData.ts`. Also reused `src/hooks/use-prefers-reduced-motion.tsx` and the twelve equipment SVGs under `public/images/equipment/`.

## Viral Architect files

- Changed `components/sections/Deployments.tsx` to insert the model below the existing stack and above product links. The other portfolio sections, personal hero/logo, and production-ownership copy are unchanged.
- Added the eleven source animation/data modules above under `components/equipqr/`.
- Added `components/equipqr/EquipQRModel.tsx`, `loadAnimation.tsx`, `gsap.ts`, `usePrefersReducedMotion.ts`, and `equipqr.css` for lifecycle, deferred loading, runtime registration, preferences, and scoped styling.
- Added `public/equipqr/static-composite.svg`, generated from the source Texas composite, and `public/equipqr/equipment/` with the original twelve SVGs: barrier, bulldozer, concrete-mixer-concrete, cone, crane (both variants), driller-maintenance, excavator, forklift, tractor, trolley-wheelbarrow, and truck-pickup (original filenames retained).
- Added `tests/equipqr-model.test.tsx`, `tests/equipqr-sequence.test.tsx`, `tests/equipqr-gsap.test.tsx`, and `vitest.config.mts`.
- Added `scripts/inspect-client-bundle.mjs` and `scripts/verify-equipqr.mjs`.
- Updated `package.json` and `package-lock.json` for dependencies, component tests, and release version.
- Added this report, `docs/equipqr-model-0.1.5.md`.

## Adaptations and dependencies

Production dependencies: GSAP 3.15, @gsap/react 2.1.2, and Lucide React 1.25. Test-only dependencies: Vitest 4, jsdom 26, and Testing Library React 16. No router, Tailwind runtime/toolchain, shadcn Button, authentication, product API, iframe, or shared-package architecture was introduced. Generated map vectors are reused directly without d3/us-atlas tooling at runtime. Original vector-source attribution and SVG headers are retained.

Removed the landing-page heading, signup CTA, routing, marketing wrapper, and background treatment. The animation retains its QR scan, state morph, equipment icons, work-order checklist, export targets, and every-third-cycle national map with rotating feature cards. Semantic CSS replaces the small set of Tailwind class combinations. Purple EquipQR artwork sits inside the portfolio's existing cyan console framing.

The wrapper begins loading within 300px of the viewport. All five phase imports must resolve before playback, so transitions cannot suspend into blank or Texas fallbacks. GSAP and map vectors are not imported by the initial wrapper. Scoped GSAP registration ensures the React context and phases share one runtime; real-context tests found and verified this cleanup requirement under mixed module resolution.

Animation unmounts when off-screen, the document is hidden, the user pauses it, or reduced motion is requested. Timers and GSAP contexts are cleaned up; returning to the section restarts at the QR scan. A cached loader avoids repeated downloads. Network failures retain useful static artwork.

## Accessibility and responsive behavior

Reduced-motion users receive the source static Texas/map-marker composite, including SSR fallback; they do not request the animated phases. Live preference changes are supported. A visible keyboard-accessible Pause/Play control is provided for other users. One stable screen-reader description explains the workflow; all animation primitives are hidden and the simulated export control is a decorative div rather than a focusable button. No live announcements or unnecessary tab stops were added.

The stage reserves a square footprint, up to 384px wide, to avoid layout shift. Existing desktop/tablet columns and mobile stacking remain. At 320px viewport width the stage is about 233px wide with no horizontal overflow. A small-stage container query reduces the national map's share and compacts the three feature cards so all remain inside the square. The static composite and animation share the same reserved area.

## Bundle inspection

Against deployed v0.1.4, initial same-origin script tags totaled 674,226 bytes raw / 201,801 bytes gzip. The new build totals 677,870 bytes raw / 203,173 bytes gzip: an increase of 3,644 raw / 1,372 gzip bytes (about 1.34 KiB gzip). Eight non-initial chunks total 271,461 raw / 104,479 gzip bytes. GSAP/MorphSVG signatures are absent from initial scripts. Equipment artwork totals approximately 35 KB raw and is requested by the deferred phases. These are build/HTTP bundle measurements, not a field Core Web Vitals claim.

## Robots investigation

The user clarified that Firecrawl normalized its crawl metadata into an array containing both `index, follow` and `noindex, nofollow`; duplicate literal HTML tags were not independently observed. Direct requests to apex and canonical production URLs resolve to the canonical homepage and expose one index/follow meta tag, no noindex/nofollow in the response body, and no restrictive X-Robots-Tag. Rendered production DOM also contains one index/follow tag. The existing production-build verifier passes, and development remains noindex/nofollow.

The extra Firecrawl value's origin remains unisolated; crawler normalization is a possibility, not a proven root cause. Per the user's clarification, no SEO policy change was made without reproduction. Existing strict robots regression tests remain in place.

## Validation

Passed ESLint, Stylelint, TypeScript/production build, two existing robots tests, and five new component/lifecycle tests. Tests cover reduced-motion static rendering without phase downloads, preference changes, off-screen and hidden-document cleanup, pause/resume, loader failure, six state/state/national cycles, and repeated real GSAP context/timer disposal.

Browser inspection covered desktop, 768px tablet, and 320px mobile; QR scan, state mapping, assets, checklist/export, national maps/cards, repeated loops, pause/resume, and scrolling out of view. No animation console errors were observed. The existing contact widget reports a Cloudflare Turnstile warning on localhost; no contact message was sent. The HTTP integration verifiers check indexing/canonical/social metadata plus model markup and all thirteen SVG assets. EquipQR, public status, and company GitHub each returned HTTP 200. No broad SRE content or identity changes were made.

## Future source updates

Compare the modules against the recorded EquipQR commit, port animation/data changes within `components/equipqr/`, and translate any new utility combinations into the scoped stylesheet. Keep wrapper lifecycle and loader readiness separate from product phases. If Texas geometry changes, regenerate the static SVG from STATE_VECTORS.TX and the source composite's marker coordinates. Rerun the sequence, real-GSAP cleanup, reduced-motion, browser, asset, and bundle checks before publishing.
