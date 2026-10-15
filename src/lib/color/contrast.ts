import { relativeLuminance } from './luminance';
import type { RGB } from './types';

export const WCAG_THRESHOLDS = {
  aaNormal: 4.5,
  aaLarge: 3,
  aaaNormal: 7,
  aaaLarge: 4.5,
  aaNonText: 3,
} as const;
export const CONTRAST_LIMITS = { min: 1, max: 21, flare: 0.05 } as const;
export const DEFAULT_TARGET = 'aaNormal' as const;
export type WcagTarget = keyof typeof WCAG_THRESHOLDS;
export type WcagResults = Readonly<Record<WcagTarget, boolean>>;

/**
 * Unrounded WCAG ratio (Llighter + 0.05) / (Ldarker + 0.05), in [1, 21].
 * https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */
export function contrastRatio(foreground: RGB, background: RGB): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (
    (Math.max(first, second) + CONTRAST_LIMITS.flare) /
    (Math.min(first, second) + CONTRAST_LIMITS.flare)
  );
}

/**
 * Test all five thresholds without display rounding. These are pair-level
 * results, not a declaration that the entire page conforms to WCAG.
 * https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
 * https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html
 * https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
 */
export function evaluateContrast(ratio: number): WcagResults {
  if (
    !Number.isFinite(ratio) ||
    ratio < CONTRAST_LIMITS.min ||
    ratio > CONTRAST_LIMITS.max
  ) {
    throw new RangeError('Contrast ratio must be finite and between 1 and 21.');
  }
  return {
    aaNormal: ratio >= WCAG_THRESHOLDS.aaNormal,
    aaLarge: ratio >= WCAG_THRESHOLDS.aaLarge,
    aaaNormal: ratio >= WCAG_THRESHOLDS.aaaNormal,
    aaaLarge: ratio >= WCAG_THRESHOLDS.aaaLarge,
    aaNonText: ratio >= WCAG_THRESHOLDS.aaNonText,
  };
}
