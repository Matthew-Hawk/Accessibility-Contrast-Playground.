import { contrastRatio, DEFAULT_TARGET, WCAG_THRESHOLDS } from './contrast';
import type { WcagTarget } from './contrast';
import { hslToRgb, rgbToHsl } from './hsl';
import { assertRgb, rgbToHex } from './parse';
import type { ColorAdjustment, HSL, RGB } from './types';

export const SUGGESTION_SEARCH = {
  iterations: 40,
  darkest: 0,
  lightest: 1,
} as const;

export interface SuggestionOptions {
  readonly adjust?: ColorAdjustment;
  readonly target?: WcagTarget;
}

export interface ColorSuggestion {
  readonly status: 'already-passing' | 'suggested' | 'best-effort';
  readonly adjustment: ColorAdjustment;
  readonly color: RGB;
  readonly hex: string;
  readonly ratio: number;
  readonly targetRatio: number;
  /** Absolute change in the searched HSL lightness parameter, in [0, 1]. */
  readonly lightnessChange: number;
}

interface Candidate {
  readonly color: RGB;
  readonly ratio: number;
  readonly lightnessChange: number;
}

function candidateAt(hsl: HSL, lightness: number, fixed: RGB): Candidate {
  const color = hslToRgb({ ...hsl, l: lightness });
  return {
    color,
    ratio: contrastRatio(color, fixed),
    lightnessChange: Math.abs(lightness - hsl.l),
  };
}

function searchLightness(
  hsl: HSL,
  fixed: RGB,
  endpoint: number,
  targetRatio: number,
): Candidate | null {
  let passing = candidateAt(hsl, endpoint, fixed);
  if (passing.ratio < targetRatio) return null;
  let failingLightness = hsl.l;
  let passingLightness = endpoint;

  // Fixed hue and saturation make every RGB channel monotone in lightness.
  // Starting from a failing pair, each direction has at most one failing-to-
  // passing transition, even if contrast initially decreases toward 1:1.
  for (
    let iteration = 0;
    iteration < SUGGESTION_SEARCH.iterations;
    iteration++
  ) {
    const midpoint = (failingLightness + passingLightness) / 2;
    const candidate = candidateAt(hsl, midpoint, fixed);
    if (candidate.ratio >= targetRatio) {
      passingLightness = midpoint;
      passing = candidate;
    } else {
      failingLightness = midpoint;
    }
  }
  return passing;
}

/**
 * Find the smallest passing HSL lightness change in either direction (within
 * 2^-40), holding hue/saturation fixed before RGB quantization. Defaults to
 * foreground, AA normal text. All ratios use the final 8-bit color.
 * If neither endpoint passes, return the highest-contrast endpoint explicitly
 * marked best-effort. Already passing input is returned unchanged by value.
 * https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
 */
export function suggestColor(
  foreground: RGB,
  background: RGB,
  options: SuggestionOptions = {},
): ColorSuggestion {
  assertRgb(foreground);
  assertRgb(background);
  const adjustment = options.adjust ?? 'foreground';
  const targetRatio = WCAG_THRESHOLDS[options.target ?? DEFAULT_TARGET];
  const original = adjustment === 'foreground' ? foreground : background;
  const fixed = adjustment === 'foreground' ? background : foreground;
  const originalRatio = contrastRatio(original, fixed);
  const result = (
    candidate: Candidate,
    status: ColorSuggestion['status'],
  ): ColorSuggestion => ({
    ...candidate,
    color: { ...candidate.color },
    hex: rgbToHex(candidate.color),
    status,
    adjustment,
    targetRatio,
  });
  if (originalRatio >= targetRatio) {
    return result(
      { color: original, ratio: originalRatio, lightnessChange: 0 },
      'already-passing',
    );
  }

  const hsl = rgbToHsl(original);
  const darker = searchLightness(
    hsl,
    fixed,
    SUGGESTION_SEARCH.darkest,
    targetRatio,
  );
  const lighter = searchLightness(
    hsl,
    fixed,
    SUGGESTION_SEARCH.lightest,
    targetRatio,
  );
  if (darker || lighter) {
    const closest =
      darker && lighter
        ? darker.lightnessChange <= lighter.lightnessChange
          ? darker
          : lighter
        : (darker ?? lighter)!;
    return result(closest, 'suggested');
  }

  const black = candidateAt(hsl, SUGGESTION_SEARCH.darkest, fixed);
  const white = candidateAt(hsl, SUGGESTION_SEARCH.lightest, fixed);
  const best =
    black.ratio === white.ratio
      ? black.lightnessChange <= white.lightnessChange
        ? black
        : white
      : black.ratio > white.ratio
        ? black
        : white;
  return result(best, 'best-effort');
}
