import { describe, expect, it } from 'vitest';
import { hslToRgb, rgbToHsl } from '../src/lib/color/hsl';
import { parseHex } from '../src/lib/color/parse';

describe('HSL conversion', () => {
  it.each([
    ['#ff0000', { h: 0, s: 1, l: 0.5 }],
    ['#ffff00', { h: 60, s: 1, l: 0.5 }],
    ['#00ff00', { h: 120, s: 1, l: 0.5 }],
    ['#00ffff', { h: 180, s: 1, l: 0.5 }],
    ['#0000ff', { h: 240, s: 1, l: 0.5 }],
    ['#ff00ff', { h: 300, s: 1, l: 0.5 }],
    ['#000000', { h: 0, s: 0, l: 0 }],
    ['#ffffff', { h: 0, s: 0, l: 1 }],
  ])('matches reference HSL for %s', (hex, hsl) => {
    expect(rgbToHsl(parseHex(hex)!)).toEqual(hsl);
    expect(hslToRgb(hsl)).toEqual(parseHex(hex));
  });
  it('round trips neutral, asymmetric, dark and light colors', () => {
    for (const r of [0, 1, 63, 128, 192, 254, 255])
      for (const g of [0, 1, 63, 128, 192, 254, 255])
        for (const b of [0, 1, 63, 128, 192, 254, 255]) {
          const color = { r, g, b };
          expect(hslToRgb(rgbToHsl(color))).toEqual(color);
        }
  });
  it.each([
    { h: -1, s: 1, l: 0.5 },
    { h: 360, s: 1, l: 0.5 },
    { h: NaN, s: 1, l: 0.5 },
    { h: 0, s: Infinity, l: 0.5 },
    { h: 0, s: -0.1, l: 0.5 },
    { h: 0, s: 1.1, l: 0.5 },
    { h: 0, s: 1, l: NaN },
    { h: 0, s: 1, l: -0.1 },
    { h: 0, s: 1, l: 1.1 },
  ])('rejects invalid HSL %j', (color) => {
    expect(() => hslToRgb(color)).toThrow(RangeError);
  });
});
