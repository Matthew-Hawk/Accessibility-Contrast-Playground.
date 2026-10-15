# Accessibility Contrast Playground

A small React + TypeScript playground for exploring accessible color pairs,
with a Brutalist visual direction: oversized typography, heavy rules, warm
paper, lime, and coral.

**Current phase: 2 of 6 — color math and unit tests, ready for review.**
The pure color engine is implemented and tested. The page remains a static
visual foundation; controls and integration begin in phase three.

Live demo: _To be added after the reviewed implementation is deployed._

Screenshot: _To be added after the interactive playground is complete._

## Setup

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
npm test
npm run build
npm run lint
npm run format:check
```

`npm test` runs the six color-module test files (116 tests).
`npm run test:watch` starts watch mode. Tests run in Node without React or a DOM.

Node 24 is selected by `.node-version` for Cloudflare Builds and GitHub Actions.
CI runs a clean `npm ci`, formatting, lint, unit tests, and the production build
on Linux for pushes and pull requests targeting `main`. Workflow actions are
pinned to commit SHAs and the workflow only has read access to repository content.

## Cloudflare Workers deployment

Connect this GitHub repository and use these Workers Builds settings:

- Production branch: `main`.
- Root directory: `/` (the directory containing `package.json`).
- Build command: `npm run build`.
- Deploy command: `npx wrangler deploy --assets ./dist`.

Cloudflare installs dependencies before building. Keep the automatic dependency
installation enabled and include development dependencies because Vite and
TypeScript are build tools. This app deploys as static assets; no Worker script,
Cloudflare Vite plugin, or application secrets are required.

Commit the complete `src/` and `tests/` directories, configuration, and
`package-lock.json`. Do not upload `dist/`, `node_modules/`, or
`*.tsbuildinfo`: these are generated locally or by the build service.
If an earlier build reported that `/src/main.tsx` could not be resolved,
retry against the latest `main` commit containing that exact case-sensitive path.

References: [Workers static assets](https://developers.cloudflare.com/workers/static-assets/get-started/)
and [build image version files](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/).

## Architecture

- `src/lib/color/`: framework-free color mathematics and documented input contracts.
- `src/components/`: small presentation components.
- `src/App.tsx`: page composition and, in later phases, application state.
- `src/styles.css`: responsive CSS and design tokens.
- `tests/`: Vitest tests for the pure color functions.

TypeScript strict mode and unused-symbol checks are enabled. ESLint covers
TypeScript, React hooks, and React refresh; Prettier owns formatting.
React and React DOM are the only runtime dependencies.

## How it works

WCAG 2.x contrast uses linearized sRGB relative luminance:
`L = 0.2126R + 0.7152G + 0.0722B`, followed by
`(Llighter + 0.05) / (Ldarker + 0.05)`. Evaluation will use the unrounded
ratio; display rounding must never turn a failing pair into a pass.

Simulation applies [Machado et al. (2009)](https://doi.org/10.1109/TVCG.2009.113)
severity-one matrices in linear RGB, clamps the transformed channels, then
converts back to 8-bit sRGB. Matrix values were verified against the
[Colorspacious severity-100 tables](https://github.com/njsmith/colorspacious/blob/master/colorspacious/cvd.py).
The reported simulated ratio is calculated from the returned 8-bit pair.

Suggestions hold HSL hue and saturation constant and binary-search both
lightness directions for 40 iterations. Each candidate is rounded to 8-bit
RGB **before** checking contrast, so its hex value actually meets the target.
The smaller lightness change wins; a tie favors the darker direction.
Already passing colors are returned unchanged by value. If neither black
nor white reaches the target against the fixed color, the result is marked
`best-effort` and contains the endpoint with the highest achievable ratio.
This can happen for AAA normal text against a mid-gray background.

The engine follows the [WCAG contrast definition](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio)
and [unrounded threshold guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
See [the color module guide](src/lib/color/README.md) for API contracts and examples.
UI integration of these functions is planned for phases three through five.

## Accessibility

The foundation uses semantic landmarks, ordered headings, a skip link,
visible focus indicators, responsive layout, and reduced-motion rules.
Application chrome uses dark ink on paper, lime, or coral. User-selected
colors will be isolated to preview content. Future controls will have
visible labels, inline validation, and polite announcements.

Keyboard-only verification: pending browser verification. A complete keyboard
audit and results will be recorded in phase six; no audit is claimed yet.

## Limitations

WCAG 2.x contrast ratios do not fully describe readability or perception.
Color vision simulation is an approximation and not a medical diagnosis.
HSL lightness distance is not a perceptually uniform measure of similarity.
Hue and saturation are held fixed before quantization; rounding to 8-bit hex
may shift them slightly. Suggestion search is bounded to 40 iterations rather
than claiming an exact real-number minimum. Pair-level threshold results do
not establish whole-page WCAG conformance. Alpha and CSS color formats other
than three- and six-digit hex are not supported.
Google Fonts are optional visual enhancements with system-font fallbacks.

## Review phases

1. Project setup, lint configuration, folder structure, visual foundation.
2. Color math modules and unit tests.
3. Contrast inputs and results.
4. Live preview and color vision simulation.
5. Accessible color suggestions.
6. Accessibility audit, polish, and final documentation.
