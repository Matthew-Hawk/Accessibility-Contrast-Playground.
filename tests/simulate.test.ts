import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/lib/color/contrast';
import { parseHex } from '../src/lib/color/parse';
import { simulateColor, simulatePair } from '../src/lib/color/simulate';
import type { ColorVisionType } from '../src/lib/color/types';

const types: ColorVisionType[] = ['protanopia', 'deuteranopia', 'tritanopia'];

describe.each(types)('%s simulation', (type) => {
  it('preserves black and white', () => {
    for (const channel of [0, 255]) {
      const color = { r: channel, g: channel, b: channel };
      expect(simulateColor(color, type)).toEqual(color);
    }
  });
  it('preserves all 256 neutral grays to within one channel step', () => {
    for (let channel = 0; channel <= 255; channel++) {
      const simulated = simulateColor(
        { r: channel, g: channel, b: channel },
        type,
      );
      for (const value of Object.values(simulated))
        expect(Math.abs(value - channel)).toBeLessThanOrEqual(1);
    }
  });
  it('derives the ratio from the displayed simulated colors', () => {
    const pair = simulatePair(parseHex('#ff3a70')!, parseHex('#203fc5')!, type);
    expect(pair.ratio).toBe(contrastRatio(pair.foreground, pair.background));
    expect(simulatePair(parseHex('#000')!, parseHex('#fff')!, type).ratio).toBe(
      21,
    );
  });
  it('does not mutate input colors', () => {
    const color = Object.freeze({ r: 150, g: 20, b: 225 });
    expect(() => simulateColor(color, type)).not.toThrow();
    expect(color).toEqual({ r: 150, g: 20, b: 225 });
  });
});

describe('linear-light reference fixtures', () => {
  // Pure-primary fixtures use the published matrix columns, inverse sRGB
  // transfer and 8-bit rounding. Applying the matrix to encoded RGB fails these.
  it.each<[ColorVisionType, string, string]>([
    ['protanopia', '#ff0000', '#6D5F00'],
    ['deuteranopia', '#ff0000', '#A39000'],
    ['tritanopia', '#ff0000', '#FF000F'],
    ['protanopia', '#00ff00', '#FFE500'],
    ['deuteranopia', '#00ff00', '#EFD63A'],
    ['tritanopia', '#00ff00', '#00F7D9'],
    ['protanopia', '#0000ff', '#0059FF'],
    ['deuteranopia', '#0000ff', '#003DFB'],
    ['tritanopia', '#0000ff', '#006B96'],
  ])('%s maps %s to %s', (type, input, output) => {
    expect(simulateColor(parseHex(input)!, type)).toEqual(parseHex(output));
  });
});
