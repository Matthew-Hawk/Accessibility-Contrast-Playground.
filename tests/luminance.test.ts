import { describe, expect, it } from 'vitest';
import {
  linearToSrgb,
  relativeLuminance,
  srgbToLinear,
} from '../src/lib/color/luminance';

describe('sRGB transfer', () => {
  it('uses both sides of the WCAG transfer breakpoint', () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(1)).toBe(1);
    expect(srgbToLinear(0.04045)).toBeCloseTo(0.0031308049535603713, 15);
    expect(srgbToLinear(0.04046)).toBeCloseTo(0.003131594552688991, 15);
    expect(srgbToLinear(0.5)).toBeCloseTo(0.21404114048223255, 14);
    expect(linearToSrgb(0.0031308)).toBeCloseTo(0.040449936, 14);
    expect(linearToSrgb(0.21404114048223255)).toBeCloseTo(0.5, 14);
  });

  it('round trips every 8-bit channel', () => {
    for (let channel = 0; channel <= 255; channel++) {
      expect(Math.round(linearToSrgb(srgbToLinear(channel / 255)) * 255)).toBe(
        channel,
      );
    }
  });

  it('clips out-of-gamut linear results before encoding', () => {
    expect(linearToSrgb(-0.2)).toBe(0);
    expect(linearToSrgb(1.2)).toBeCloseTo(1, 14);
  });

  it.each([NaN, Infinity, -Infinity])(
    'rejects nonfinite transfer input %s',
    (value) => {
      expect(() => srgbToLinear(value)).toThrow(RangeError);
      expect(() => linearToSrgb(value)).toThrow(RangeError);
    },
  );
  it.each([-0.1, 1.1])('rejects encoded input outside [0, 1]: %s', (value) => {
    expect(() => srgbToLinear(value)).toThrow(RangeError);
  });
});

describe('relative luminance', () => {
  it.each([
    [{ r: 0, g: 0, b: 0 }, 0],
    [{ r: 255, g: 255, b: 255 }, 1],
    [{ r: 255, g: 0, b: 0 }, 0.2126],
    [{ r: 0, g: 255, b: 0 }, 0.7152],
    [{ r: 0, g: 0, b: 255 }, 0.0722],
    [{ r: 128, g: 128, b: 128 }, 0.21586050011389926],
  ])('matches reference luminance for %j', (color, expected) => {
    expect(relativeLuminance(color)).toBeCloseTo(expected, 14);
  });
  it('rejects invalid RGB', () => {
    expect(() => relativeLuminance({ r: 256, g: 0, b: 0 })).toThrow(RangeError);
  });
});
