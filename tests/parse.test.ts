import { describe, expect, it } from 'vitest';
import { assertRgb, parseHex, rgbToHex } from '../src/lib/color/parse';

describe('hex parsing', () => {
  it.each([
    ['#000000', { r: 0, g: 0, b: 0 }],
    ['FFFFFF', { r: 255, g: 255, b: 255 }],
    ['#aBc', { r: 170, g: 187, b: 204 }],
    ['09f', { r: 0, g: 153, b: 255 }],
    ['  #12aBcD\n', { r: 18, g: 171, b: 205 }],
  ])('parses %s', (input, expected) => {
    expect(parseHex(input)).toEqual(expected);
  });

  it.each([
    '',
    ' ',
    '#',
    '#12',
    '12345',
    '1234567',
    '#abcd',
    '#12345678',
    '##fff',
    '0xffeeaa',
    'red',
    'rgb(1,2,3)',
    '#fg0000',
    '#ff ff ff',
    '+12345',
  ])('rejects malformed or unsupported input %j', (input) => {
    expect(parseHex(input)).toBeNull();
  });

  it('normalizes shorthand and case through an RGB round trip', () => {
    expect(rgbToHex(parseHex('#aBc')!)).toBe('#AABBCC');
    expect(rgbToHex({ r: 0, g: 1, b: 15 })).toBe('#00010F');
  });

  it.each([-1, 256, 0.5, NaN, Infinity])(
    'rejects invalid RGB channel %s',
    (channel) => {
      for (const name of ['r', 'g', 'b'] as const) {
        const color = { r: 0, g: 0, b: 0, [name]: channel };
        expect(() => assertRgb(color)).toThrow(RangeError);
        expect(() => rgbToHex(color)).toThrow(RangeError);
      }
    },
  );
});
