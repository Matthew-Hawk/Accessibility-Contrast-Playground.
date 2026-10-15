# Color module tests

Run `npm test` from the project root. Seven Vitest files contain 126 tests:

- `parse.test.ts`: supported syntax, normalization and invalid input.
- `luminance.test.ts`: transfer breakpoints, channel round trips, known
  primary/neutral luminance values, clipping and invalid values.
- `contrast.test.ts`: 21:1 and 1:1, reference grays, ratio symmetry/range,
  and all five thresholds just below, at, and above each boundary.
- `hsl.test.ts`: six hue sectors, neutrals, 343 RGB round trips and bounds.
- `simulate.test.ts`: all neutral grays, primary-color reference fixtures
  that detect applying matrices in encoded RGB, input immutability, and
  recalculation of the returned simulated pair's contrast.
- `suggest.test.ts`: defaults, both adjustable colors, passing inputs,
  impossible AAA targets, endpoint starts and deterministic output. A varied
  palette checks 1,000 combinations of colors, targets, and adjustments;
  independent exhaustive lightness grids check the nearest direction.
- `colorPair.test.ts`: incomplete/invalid draft preservation, immediate valid
  updates, shorthand normalization, picker recovery, and swaps after invalid
  input. Mirrored foreground/background suggestion-application workflows verify
  the opposite color stays unchanged and the applied pair reaches AAA. The
  input reducer is separate from the pure color mathematics.

This suite does not automate the rendered UI. Focused manual browser checks
are documented in the main README; the complete accessibility audit remains
part of phase six.
