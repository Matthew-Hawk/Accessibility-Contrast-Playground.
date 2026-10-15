import { describe, expect, it } from 'vitest';
import { contrastRatio, WCAG_THRESHOLDS } from '../src/lib/color/contrast';
import type { WcagTarget } from '../src/lib/color/contrast';
import { hslToRgb, rgbToHsl } from '../src/lib/color/hsl';
import { parseHex, rgbToHex } from '../src/lib/color/parse';
import { suggestColor } from '../src/lib/color/suggest';
import type { ColorAdjustment } from '../src/lib/color/types';

const rgb = (hex: string) => parseHex(hex)!;

describe('accessible suggestions', () => {
  it('defaults to foreground and AA normal, and fixes #777 on white', () => {
    const result = suggestColor(rgb('#777'), rgb('#fff'));
    expect(result.status).toBe('suggested');
    expect(result.adjustment).toBe('foreground');
    expect(result.targetRatio).toBe(4.5);
    expect(result.hex).toBe('#767676');
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });
  it('can adjust the background instead', () => {
    const result = suggestColor(rgb('#fff'), rgb('#777'), {
      adjust: 'background',
    });
    expect(result.adjustment).toBe('background');
    expect(result.hex).toBe('#767676');
    expect(result.ratio).toBe(contrastRatio(rgb('#fff'), result.color));
    expect(result.status).toBe('suggested');
  });
  it('returns passing colors unchanged by value', () => {
    const foreground = rgb('#123');
    const result = suggestColor(foreground, rgb('#fff'));
    expect(result.status).toBe('already-passing');
    expect(result.color).toEqual(foreground);
    expect(result.color).not.toBe(foreground);
    expect(result.lightnessChange).toBe(0);
  });
  it.each(['foreground', 'background'] as const)(
    'reports no same-hue solution for AAA on mid-gray (%s)',
    (adjust) => {
      const result = suggestColor(rgb('#777'), rgb('#777'), {
        adjust,
        target: 'aaaNormal',
      });
      expect(result.status).toBe('best-effort');
      expect(result.hex).toBe('#000000');
      expect(result.ratio).toBeLessThan(7);
      expect(result.ratio).toBeGreaterThan(4.5);
      expect(result.ratio).toBe(
        Math.max(
          contrastRatio(rgb('#000'), rgb('#777')),
          contrastRatio(rgb('#fff'), rgb('#777')),
        ),
      );
    },
  );
  it('returns white as the best effort on a darker fixed gray', () => {
    const result = suggestColor(rgb('#666'), rgb('#666'), {
      target: 'aaaNormal',
    });
    expect(result.status).toBe('best-effort');
    expect(result.hex).toBe('#FFFFFF');
  });
  it.each([
    ['#000', '#000'],
    ['#fff', '#fff'],
  ])(
    'handles an extreme initial lightness: %s on %s',
    (foreground, background) => {
      const result = suggestColor(rgb(foreground), rgb(background));
      expect(result.status).toBe('suggested');
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('checks quantized RGB against every target over a varied palette', () => {
    const colors = [
      '#000',
      '#fff',
      '#777',
      '#757575',
      '#f00',
      '#0f0',
      '#00f',
      '#fa7a21',
      '#23c1a2',
      '#d8c7ef',
    ].map(rgb);
    const targets: WcagTarget[] = [
      'aaNormal',
      'aaLarge',
      'aaaNormal',
      'aaaLarge',
      'aaNonText',
    ];
    const adjustments: ColorAdjustment[] = ['foreground', 'background'];
    for (const foreground of colors)
      for (const background of colors)
        for (const target of targets)
          for (const adjust of adjustments) {
            const result = suggestColor(foreground, background, {
              target,
              adjust,
            });
            const fixed = adjust === 'foreground' ? background : foreground;
            expect(parseHex(result.hex)).toEqual(result.color);
            expect(result.ratio).toBe(contrastRatio(result.color, fixed));
            expect(result.lightnessChange).toBeGreaterThanOrEqual(0);
            expect(result.lightnessChange).toBeLessThanOrEqual(1);
            if (result.status === 'best-effort') {
              expect(result.ratio).toBeLessThan(WCAG_THRESHOLDS[target]);
              expect(result.ratio).toBe(
                Math.max(
                  contrastRatio(rgb('#000'), fixed),
                  contrastRatio(rgb('#fff'), fixed),
                ),
              );
            } else {
              expect(result.ratio).toBeGreaterThanOrEqual(
                WCAG_THRESHOLDS[target],
              );
            }
          }
  });

  it.each([
    ['#777', '#fff'],
    ['#666', '#000'],
    ['#b04040', '#757575'],
    ['#40b0ad', '#777'],
    ['#a981d0', '#fafafa'],
    ['#e8c8a8', '#aaa'],
  ])(
    'chooses the nearest passing direction for %s on %s',
    (source, fixedHex) => {
      const original = rgb(source);
      const fixed = rgb(fixedHex);
      const hsl = rgbToHsl(original);
      const result = suggestColor(original, fixed);
      expect(result.status).toBe('suggested');
      // Independent exhaustive grid, rather than repeating binary search.
      // Every sampled same-hue/saturation passing color must be at least as far.
      for (let step = 0; step <= 4096; step++) {
        const l = step / 4096;
        const candidate = hslToRgb({ ...hsl, l });
        if (contrastRatio(candidate, fixed) >= 4.5) {
          expect(result.lightnessChange).toBeLessThanOrEqual(
            Math.abs(l - hsl.l) + 1e-10,
          );
        }
      }
    },
  );

  it('leaves both input colors unchanged and is deterministic', () => {
    const foreground = Object.freeze(rgb('#fc43a2'));
    const background = Object.freeze(rgb('#aabbcc'));
    expect(suggestColor(foreground, background)).toEqual(
      suggestColor(foreground, background),
    );
    expect(rgbToHex(foreground)).toBe('#FC43A2');
    expect(rgbToHex(background)).toBe('#AABBCC');
  });
  it('rejects invalid RGB before searching', () => {
    expect(() => suggestColor({ r: NaN, g: 0, b: 0 }, rgb('#fff'))).toThrow(
      RangeError,
    );
    expect(() => suggestColor(rgb('#000'), { r: 0, g: -1, b: 0 })).toThrow(
      RangeError,
    );
  });
});
