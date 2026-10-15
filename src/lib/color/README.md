# Pure color modules

All modules are framework-free, deterministic, and leave inputs unchanged.
React components must consume these functions rather than duplicate their math.

- `types.ts`: readonly RGB, HSL, simulation, and adjustment types.
- `parse.ts`: `parseHex`, `rgbToHex`, RGB bounds and validation.
- `luminance.ts`: normalized transfer functions and relative luminance.
- `contrast.ts`: unrounded ratio, named thresholds and five pass/fail results.
- `hsl.ts`: RGB/HSL conversion used by suggestions.
- `simulate.ts`: exported Machado matrices, single-color and pair simulation.
- `suggest.ts`: nearest passing lightness search and explicit best-effort results.

## Contracts

RGB channels are integers in `[0, 255]`. Invalid RGB throws `RangeError` at
public calculation boundaries; `parseHex` instead returns `null` for invalid
user text. Parsing accepts three or six hex digits, an optional `#`, either
case, and surrounding whitespace. Serialization produces uppercase `#RRGGBB`.
Alpha, named colors, and other CSS notations are deliberately excluded.

`srgbToLinear` takes encoded channels in `[0, 1]`. `linearToSrgb` clips finite
linear input to `[0, 1]` before encoding; nonfinite values throw `RangeError`.
HSL hue is `[0, 360)` degrees, saturation and lightness are `[0, 1]`. Neutral
RGB colors use hue zero. Calculated saturation is clipped to one to absorb
floating-point cancellation near the lightness endpoints.

`evaluateContrast` accepts an unrounded finite ratio in `[1, 21]`. The returned
keys are `aaNormal`, `aaLarge`, `aaaNormal`, `aaaLarge`, and `aaNonText`.
Display formatting belongs in React and must never feed back into evaluation.

## Example

```ts
import { parseHex } from './parse';
import { contrastRatio, evaluateContrast } from './contrast';
import { simulatePair } from './simulate';
import { suggestColor } from './suggest';

const foreground = parseHex('#777')!;
const background = parseHex('FFFFFF')!;
const ratio = contrastRatio(foreground, background); // ~4.478; AA normal fails
const results = evaluateContrast(ratio);
const simulation = simulatePair(foreground, background, 'protanopia');
const suggestion = suggestColor(foreground, background);
// status: 'suggested', hex: '#767676', ratio >= 4.5
const backgroundSuggestion = suggestColor(foreground, background, {
  adjust: 'background',
  target: 'aaaNormal',
});
// This target is unreachable against fixed #777: status is 'best-effort'.
```

Use a null check after `parseHex` in UI code; assertions in this example only
serve literal known-valid inputs.

Suggestion status is `already-passing`, `suggested`, or `best-effort`.
`adjustment` names the color to replace; `color` and `hex` represent that
replacement. `ratio` is measured against the unchanged opposite color,
and `targetRatio` records the selected threshold. `lightnessChange` measures
the absolute change to the searched HSL lightness parameter, before rounding.
The search keeps hue and saturation fixed before 8-bit quantization.
The nearest boundary is located within `2^-40` in lightness. Equal valid
distances prefer the darker result. Best-effort ties prefer the closer
endpoint, then black.

Simulated pairs return both rounded RGB colors and their recalculated ratio.
Simulation approximates full-severity color vision deficiency; it is not a
diagnosis or a prediction of any individual's experience. Original WCAG
pair evaluation and simulated-pair evaluation should remain separately labeled.
