import { assertRgb, RGB_CHANNEL } from './parse';
import type { HSL, RGB } from './types';

export const HSL_HUE = { fullTurn: 360, sector: 60 } as const;

/**
 * Convert encoded sRGB to HSL for fixed-hue/saturation lightness searches.
 * https://www.w3.org/TR/css-color-4/#the-hsl-notation
 */
export function rgbToHsl(color: RGB): HSL {
  assertRgb(color);
  const r = color.r / RGB_CHANNEL.max;
  const g = color.g / RGB_CHANNEL.max;
  const b = color.b / RGB_CHANNEL.max;
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const chroma = maximum - minimum;
  const l = (maximum + minimum) / 2;
  if (chroma === 0) return { h: 0, s: 0, l };

  let sector: number;
  if (maximum === r) sector = (g - b) / chroma;
  else if (maximum === g) sector = (b - r) / chroma + 2;
  else sector = (r - g) / chroma + 4;
  const h = (sector * HSL_HUE.sector + HSL_HUE.fullTurn) % HSL_HUE.fullTurn;
  // Floating-point cancellation near black/white can put saturation just
  // above 1 for valid RGB input (for example 1.0000000000000036).
  const s = Math.min(1, chroma / (1 - Math.abs(2 * l - 1)));
  return { h, s, l };
}

/**
 * Convert HSL to nearest 8-bit sRGB. Quantization can shift hue/saturation;
 * callers must evaluate contrast on the returned RGB, not ideal HSL values.
 * https://www.w3.org/TR/css-color-4/#hsl-to-rgb
 */
export function hslToRgb(color: HSL): RGB {
  const { h, s, l } = color;
  if (
    !Number.isFinite(h) ||
    h < 0 ||
    h >= HSL_HUE.fullTurn ||
    !Number.isFinite(s) ||
    s < 0 ||
    s > 1 ||
    !Number.isFinite(l) ||
    l < 0 ||
    l > 1
  ) {
    throw new RangeError(
      'HSL requires hue in [0, 360), saturation/lightness in [0, 1].',
    );
  }
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const sector = h / HSL_HUE.sector;
  const intermediate = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = l - chroma / 2;
  let channels: readonly [number, number, number];
  if (sector < 1) channels = [chroma, intermediate, 0];
  else if (sector < 2) channels = [intermediate, chroma, 0];
  else if (sector < 3) channels = [0, chroma, intermediate];
  else if (sector < 4) channels = [0, intermediate, chroma];
  else if (sector < 5) channels = [intermediate, 0, chroma];
  else channels = [chroma, 0, intermediate];
  const encode = (channel: number) =>
    Math.round((channel + offset) * RGB_CHANNEL.max);
  return {
    r: encode(channels[0]),
    g: encode(channels[1]),
    b: encode(channels[2]),
  };
}
