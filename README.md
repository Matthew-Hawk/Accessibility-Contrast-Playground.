# Accessibility Contrast Playground

A small React + TypeScript playground for exploring accessible color pairs,
with a Brutalist visual direction: oversized typography, heavy rules, warm
paper, lime, and coral.

**Current phase: 1 of 6 — project foundation, ready for review.**
The page is a static visual foundation. Color inputs, calculations,
simulations, and suggestions will be implemented in later phases.

Live demo: _To be added after the reviewed implementation is deployed._

Screenshot: _To be added after the interactive playground is complete._

## Setup

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
npm run build
npm run lint
npm run format:check
```

`npm test` runs the color test suite starting in phase two. At phase one no
tests exist, so Vitest intentionally exits with “No test files found”.
`npm run test:watch` starts watch mode.

## Architecture

- `src/lib/color/`: framework-free color mathematics, added in phase two.
- `src/components/`: small presentation components.
- `src/App.tsx`: page composition and, in later phases, application state.
- `src/styles.css`: responsive CSS and design tokens.
- `tests/`: Vitest tests for the pure color functions.

TypeScript strict mode and unused-symbol checks are enabled. ESLint covers
TypeScript, React hooks, and React refresh; Prettier owns formatting.
React and React DOM are the only runtime dependencies.

## How it will work

WCAG 2.x contrast uses linearized sRGB relative luminance:
`L = 0.2126R + 0.7152G + 0.0722B`, followed by
`(Llighter + 0.05) / (Ldarker + 0.05)`. Evaluation will use the unrounded
ratio; display rounding will never turn a failing pair into a pass.

Simulation will apply Machado et al. (2009) severity-one matrices in linear
RGB before converting back to sRGB. Suggestions will hold HSL hue and
saturation constant, search both lightness directions, and verify the
quantized result against the selected target.

These are implementation plans, not completed features at phase one.

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
Google Fonts are optional visual enhancements with system-font fallbacks.

## Review phases

1. Project setup, lint configuration, folder structure, visual foundation.
2. Color math modules and unit tests.
3. Contrast inputs and results.
4. Live preview and color vision simulation.
5. Accessible color suggestions.
6. Accessibility audit, polish, and final documentation.
