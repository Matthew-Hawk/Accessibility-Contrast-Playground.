# Accessibility Contrast Playground

A small React + TypeScript playground for exploring accessible color pairs,
with a Brutalist visual direction: oversized typography, heavy rules, warm
paper, lime, and coral.

**Current phase: 4 of 6 — live preview and color vision simulation, ready for review.**
The playground now has native color pickers, editable hex inputs, inline
validation, a swap button, and instant results for all five WCAG contrast
thresholds. A live sample shows normal and large text, a working button, and
an editable input in the selected pair. A responsive grid compares the original
with protanopia, deuteranopia, and tritanopia simulations, including each pair's
hex values and contrast ratio. Suggestion controls follow in phase five.

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

`npm test` runs seven test files (124 tests), covering color math and input state.
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
- `src/App.tsx`: page composition and landmarks.
- `src/lib/colorPair.ts`: editable drafts and last-valid colors; the ratio and
  results are derived rather than stored.
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
Contrast calculation and threshold evaluation are connected to the UI.
The simulation grid derives all three transformed pairs directly from the
last valid colors, without storing duplicate state or using CSS filters.
Each displayed ratio uses the same rounded RGB colors that render its sample.
The original ratio is the reference for WCAG evaluation; simulated ratios
describe the rendered approximations and do not predict an individual's vision.
Suggestion controls are planned for phase five.

## Accessibility

The app uses semantic landmarks, ordered headings, a skip link, visible focus
indicators, responsive layout, and reduced-motion rules. Each color has a
fieldset and legend, with visible labels for its native picker and hex input.
Invalid drafts have an inline error, `aria-invalid`, and an error description;
they leave the last valid color active. Valid shorthand normalizes on blur.
Swapping exchanges the last valid colors and clears unfinished drafts.

Application chrome uses dark ink on paper, lime, or coral independently of
the selected pair. Pass/fail badges include icons and text. A polite, atomic
status region announces the pair, ratio, and AA normal-text result, including
swaps where the numerical ratio stays unchanged.

Phase-three browser checks passed in the local in-app browser: #777 on white
displays 4.48 and fails AA normal; #767676 displays 4.54 and passes; black on
white is 21.00; identical colors are 1.00 and fail all thresholds. Invalid
drafts preserve the previous result. Native picker changes synchronize the
hex field. Keyboard Tab reaches the swap button from the foreground field,
and Enter activates it; visible focus was verified on both controls.
The narrow mobile viewport stacks the panels without horizontal overflow.

Phase-four browser checks passed: red-on-blue produced the expected matrix
fixtures in all three simulation cards, and the cards' actual CSS colors
matched their printed hex values. Invalid hex text left every preview and
simulation ratio unchanged. Swapping reversed every pair without clearing
the edited sample input. Tab reached the sample button and input; Enter
activated the button and its feedback stayed in the app's fixed colors.
The input's black-and-white focus ring remained visible against the selected
pair. The preview stacks and the simulation grid becomes one column on narrow
screens without overflowing controls; a wide desktop viewport displays four
simulation cards in one row.

Selected colors are intentionally restricted to the live sample and decorative
simulation samples. Sample text, labels, and controls may fail contrast because
testing that pair is the purpose of the preview. A warning precedes the sample;
section titles, input instructions, printed hex values, ratios, and button
feedback retain the app's own colors. Simulation specimens are hidden from
screen readers to avoid repeating decorative content; their headings, values,
and ratios remain available as text. No live announcements are added for all
four simulation cards, avoiding a burst of duplicate announcements per edit.

These are focused interaction checks, not a full keyboard or screen-reader
audit. The complete audit and assistive-technology limitations are recorded
in phase six.

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
