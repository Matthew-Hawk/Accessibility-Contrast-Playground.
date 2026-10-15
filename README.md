# Accessibility Contrast Playground

A React + TypeScript playground for choosing foreground/background colors,
checking WCAG 2.x contrast, comparing color vision simulations, and finding
the nearest passing lightness adjustment. The interface uses a Brutalist
visual style with fixed, high-contrast app colors.

All six implementation phases are complete. Unit tests, strict TypeScript,
lint, formatting, and focused browser/keyboard checks pass. Accessibility
verification has the limits described below; this is not a conformance certification.

**Live demo:** _Add the verified Cloudflare URL after deployment._

**Screenshot:** _Add a desktop or mobile screenshot here after publication._

## Run locally

Requires Node.js 22.12+; Node 24 is selected by `.node-version`.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run lint
npm run format:check
npm run build
npm run preview
```

`npm test` runs 126 tests in seven files without React or a DOM.
`npm run test:watch` starts watch mode. `npm run format` applies Prettier.
The production output is `dist/`.

## Using the playground

- Pick or type foreground/background colors. Three- and six-digit hex work,
  with or without `#`. Invalid text shows an error and preserves the last
  valid pair; valid shorthand normalizes on blur.
- Read the ratio to two decimals and all five unrounded threshold results.
  Swapping exchanges the last valid colors and clears unfinished drafts.
- Choose a WCAG target and the color to adjust. Apply the suggestion to change
  only that color. Passing pairs need no adjustment. Unreachable targets
  explicitly show a best-effort result that still fails.
- Try the text, button, and editable-input preview. Compare the original and
  protanopia, deuteranopia, and tritanopia samples, including their hex values
  and recalculated ratios.

Suggestions cannot be applied while either color input is invalid. Applying
returns keyboard focus to the changed hex field and updates every preview
without erasing the sample input.

## How it works

**Contrast.** Normalize each sRGB channel to `c` in [0, 1], then linearize:

```text
c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
L = 0.2126 R + 0.7152 G + 0.0722 B
contrast = (Llighter + 0.05) / (Ldarker + 0.05)
```

The ratio ranges from 1:1 to 21:1. AA normal text requires 4.5, AA large text
requires 3, AAA normal text requires 7, AAA large text requires 4.5, and AA
non-text components require 3. Threshold checks never use display rounding:
4.499 fails a 4.5 target. See the
[WCAG contrast definition](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio)
and [threshold guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

**Simulation.** The [Machado et al. (2009)](https://doi.org/10.1109/TVCG.2009.113)
severity-one matrices transform linear RGB, followed by gamut clipping,
inverse sRGB transfer, and rounding to 8-bit channels. Values were verified
against the [Colorspacious severity-100 tables](https://github.com/njsmith/colorspacious/blob/master/colorspacious/cvd.py).
Each ratio is calculated from the exact colors displayed by its card.
Original-pair contrast is the WCAG reference; simulated ratios describe the
rendered approximation.

**Suggestions.** Hold HSL hue and saturation fixed and binary-search lightness
in both directions for 40 iterations. Round each candidate to 8-bit RGB before
testing contrast, then choose the smaller lightness change; ties prefer darker.
If neither endpoint reaches the target against the fixed color, return the
highest-contrast endpoint explicitly marked best-effort. Once that endpoint
is active, no redundant apply action is offered. Change the other color or
the target to continue.

## Architecture and tests

- `src/lib/color/`: framework-free parsing, luminance, contrast, HSL,
  simulation, suggestion functions, and types.
- `src/lib/colorPair.ts`: editable drafts and last-valid colors.
- `src/lib/wcagCriteria.ts`: shared labels for target options and verdicts.
- `src/components/`: controls, results, suggestions, previews, and simulation
  cards; `src/App.tsx` composes the landmarks and page.
- `tests/`: reference ratios, threshold boundaries, parser validation,
  transfer curves, HSL round trips, simulation fixtures, nearest-direction
  searches, impossible targets, and mirrored suggestion-application workflows.

Ratios, threshold results, simulations, and suggestions are derived from the
valid pair, rather than stored as duplicate state. React and React DOM are
the only runtime dependencies. No UI or color-math library is used.
See the [color API guide](src/lib/color/README.md) and
[test guide](tests/README.md).

GitHub CI uses a clean `npm ci` on Linux, then checks formatting, lint,
unit tests, and the production build for pushes and pull requests to `main`.
Actions are pinned to commit SHAs with read-only repository permissions.

## Accessibility verification

The finished interface was checked in the local in-app Chromium browser on
Windows on October 15, 2026:

- One main landmark and level-one heading, no heading skips or duplicate IDs,
  labeled inputs, valid ARIA references, and no positive tab indexes.
- Working skip link, forward/reverse keyboard navigation, native picker
  opening/dismissal, radio arrow keys, target selection, and suggestion
  application with focus restoration.
- Fixed app text exceeds 7:1 in the measured default, failure, and error
  states. The lowest measured failure-state ratio was approximately 7.52:1.
- No page or control overflow at requested viewport widths of 320, 768, and
  1440 pixels. Text inputs can grow with larger text.
- Polite, atomic original-pair status; described inline errors; Pass/Fail
  text and icons; visible focus indicators; reduced-motion rules.

The live specimen intentionally uses the selected pair, including failing
colors, and has a preceding warning. App chrome and numerical metadata retain
fixed colors. Sample controls use a white/dark focus ring. Decorative
simulation samples are hidden from screen readers; headings, hex values,
and ratios remain available as text.

See the [audit record and repeatable keyboard checks](docs/accessibility.md).
Markup and the accessibility tree were inspected, but spoken output was not
tested with NVDA, JAWS, or VoiceOver. Safari, Firefox, OS high-contrast mode,
text-only zoom, and mobile screen readers still need verification. These
checks do not establish whole-page WCAG conformance.

## Deploy to Cloudflare Workers

Connect this repository with production branch `main`:

- Root directory: `/`, containing `package.json`.
- Build command: `npm run build`.
- Deploy command: `npx wrangler deploy --assets ./dist`.

Keep automatic dependency installation enabled, including development
dependencies: Vite and TypeScript are needed during the build. The app uses
Workers static assets and needs no Worker script, application secrets, or
Cloudflare Vite plugin. If the build reports a missing `/src/main.tsx`, verify
it is using the latest commit and the exact case-sensitive source path.

Commit source, tests, configuration, and `package-lock.json`. Generated
`dist/`, `node_modules/`, `*.tsbuildinfo`, local environment files, and
Wrangler state are ignored.

References: [static assets](https://developers.cloudflare.com/workers/static-assets/get-started/)
and [build version files](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/).

## Limitations

WCAG 2.x ratios do not fully describe readability or perception. Simulations
are approximations, not medical diagnoses or individual vision predictions.
HSL lightness distance is not perceptually uniform, and 8-bit quantization
may slightly shift hue and saturation. The search locates a boundary within
`2^-40` in lightness rather than claiming an exact real-number minimum.

Only opaque three- and six-digit sRGB hex colors are supported; alpha and
other CSS color notations are excluded. Native picker/select behavior varies
by browser and OS. Google Fonts are optional enhancements; system fallbacks
keep the app usable when the font service is unavailable.
