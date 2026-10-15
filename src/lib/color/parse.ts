import type { RGB } from './types';

export const RGB_CHANNEL = { min: 0, max: 255 } as const;
const HEX_PATTERN = /^#?([\da-f]{3}|[\da-f]{6})$/i;

/**
 * Parse 3/6-digit hex (optional # and surrounding whitespace), or return null.
 * These opaque sRGB values feed WCAG luminance calculations:
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function parseHex(input: string): RGB | null {
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;
  const digits = match[1];
  const expanded =
    digits.length === 3
      ? [...digits].map((digit) => digit + digit).join('')
      : digits;
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

/**
 * Reject invalid opaque 8-bit sRGB input before WCAG math or serialization.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function assertRgb(color: RGB): void {
  if (
    ![color.r, color.g, color.b].every(
      (channel) =>
        Number.isInteger(channel) &&
        channel >= RGB_CHANNEL.min &&
        channel <= RGB_CHANNEL.max,
    )
  ) {
    throw new RangeError('RGB channels must be integers from 0 to 255.');
  }
}

/**
 * Serialize opaque sRGB as uppercase #RRGGBB, without rounding invalid input.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function rgbToHex(color: RGB): string {
  assertRgb(color);
  return (
    '#' +
    [color.r, color.g, color.b]
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}
