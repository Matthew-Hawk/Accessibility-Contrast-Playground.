import { assertRgb, RGB_CHANNEL } from './parse';
import type { RGB } from './types';

export const SRGB_TRANSFER = {
  encodedBreakpoint: 0.04045,
  linearBreakpoint: 0.0031308,
  slope: 12.92,
  offset: 0.055,
  scale: 1.055,
  gamma: 2.4,
} as const;
export const LUMINANCE_WEIGHTS = { r: 0.2126, g: 0.7152, b: 0.0722 } as const;

/**
 * Linearize an encoded sRGB channel in [0, 1] using WCAG's transfer curve.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function srgbToLinear(channel: number): number {
  if (!Number.isFinite(channel) || channel < 0 || channel > 1) {
    throw new RangeError('Encoded sRGB channels must be finite and in [0, 1].');
  }
  return channel <= SRGB_TRANSFER.encodedBreakpoint
    ? channel / SRGB_TRANSFER.slope
    : ((channel + SRGB_TRANSFER.offset) / SRGB_TRANSFER.scale) **
        SRGB_TRANSFER.gamma;
}

/**
 * Invert the WCAG sRGB transfer curve; clip finite out-of-gamut linear values.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function linearToSrgb(channel: number): number {
  if (!Number.isFinite(channel))
    throw new RangeError('Linear RGB channels must be finite.');
  const clipped = Math.max(0, Math.min(1, channel));
  return clipped <= SRGB_TRANSFER.linearBreakpoint
    ? clipped * SRGB_TRANSFER.slope
    : SRGB_TRANSFER.scale * clipped ** (1 / SRGB_TRANSFER.gamma) -
        SRGB_TRANSFER.offset;
}

/**
 * WCAG relative luminance: weighted linear RGB, from 0 (black) to 1 (white).
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function relativeLuminance(color: RGB): number {
  assertRgb(color);
  return (
    LUMINANCE_WEIGHTS.r * srgbToLinear(color.r / RGB_CHANNEL.max) +
    LUMINANCE_WEIGHTS.g * srgbToLinear(color.g / RGB_CHANNEL.max) +
    LUMINANCE_WEIGHTS.b * srgbToLinear(color.b / RGB_CHANNEL.max)
  );
}
