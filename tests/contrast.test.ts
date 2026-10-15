import { describe, expect, it } from 'vitest';
import { contrastRatio, evaluateContrast } from '../src/lib/color/contrast';
import type { WcagTarget } from '../src/lib/color/contrast';
import { parseHex } from '../src/lib/color/parse';

const black = { r: 0, g: 0, b: 0 };
const white = { r: 255, g: 255, b: 255 };

describe('contrast ratio', () => {
  it('is 21:1 for black and white, in either order', () => {
    expect(contrastRatio(black, white)).toBe(21);
    expect(contrastRatio(white, black)).toBe(21);
  });
  it.each(['#000', '#fff', '#777', '#a2e3c4'])(
    'is 1:1 for identical %s colors',
    (hex) => {
      const color = parseHex(hex)!;
      expect(contrastRatio(color, color)).toBe(1);
    },
  );
  it('matches reference grays on white and never rounds up the AA result', () => {
    const passing = contrastRatio(parseHex('#767676')!, white);
    const failing = contrastRatio(parseHex('#777777')!, white);
    expect(passing).toBeCloseTo(4.542224959605253, 12);
    expect(failing).toBeCloseTo(4.478089453577214, 12);
    expect(evaluateContrast(passing).aaNormal).toBe(true);
    expect(evaluateContrast(failing).aaNormal).toBe(false);
    expect(evaluateContrast(4.499).aaNormal).toBe(false);
  });
  it('returns symmetric bounded ratios for varied colors', () => {
    const colors = [
      '#000',
      '#fff',
      '#f00',
      '#0f0',
      '#00f',
      '#a73b9c',
      '#777',
    ].map((hex) => parseHex(hex)!);
    for (const first of colors)
      for (const second of colors) {
        const ratio = contrastRatio(first, second);
        expect(ratio).toBe(contrastRatio(second, first));
        expect(ratio).toBeGreaterThanOrEqual(1);
        expect(ratio).toBeLessThanOrEqual(21);
      }
  });
});

describe('WCAG evaluation', () => {
  // Literal spec values keep tests independent of the implementation constants.
  it.each<[WcagTarget, number]>([
    ['aaNormal', 4.5],
    ['aaLarge', 3],
    ['aaaNormal', 7],
    ['aaaLarge', 4.5],
    ['aaNonText', 3],
  ])('evaluates %s at and around %s without rounding', (target, threshold) => {
    expect(evaluateContrast(threshold - 0.000001)[target]).toBe(false);
    expect(evaluateContrast(threshold)[target]).toBe(true);
    expect(evaluateContrast(threshold + 0.000001)[target]).toBe(true);
  });
  it('returns all five results', () => {
    expect(evaluateContrast(3)).toEqual({
      aaNormal: false,
      aaLarge: true,
      aaaNormal: false,
      aaaLarge: false,
      aaNonText: true,
    });
  });
  it.each([NaN, Infinity, -Infinity, 0, 0.9999, 21.01])(
    'rejects invalid ratio %s',
    (ratio) => {
      expect(() => evaluateContrast(ratio)).toThrow(RangeError);
    },
  );
});
