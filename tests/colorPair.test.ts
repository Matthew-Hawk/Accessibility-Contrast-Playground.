import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/lib/color/contrast';
import { colorPairReducer, INITIAL_COLOR_PAIR } from '../src/lib/colorPair';

describe('color input state', () => {
  it('keeps the last valid pair while preserving invalid input for correction', () => {
    const state = colorPairReducer(INITIAL_COLOR_PAIR, {
      type: 'change',
      field: 'foreground',
      value: '#12',
    });
    expect(state.foreground.input).toBe('#12');
    expect(state.foreground.color).toEqual(INITIAL_COLOR_PAIR.foreground.color);
    expect(state.background).toBe(INITIAL_COLOR_PAIR.background);
    expect(contrastRatio(state.foreground.color, state.background.color)).toBe(
      contrastRatio(
        INITIAL_COLOR_PAIR.foreground.color,
        INITIAL_COLOR_PAIR.background.color,
      ),
    );
  });
  it('updates results immediately when an incomplete draft becomes valid', () => {
    const incomplete = colorPairReducer(INITIAL_COLOR_PAIR, {
      type: 'change',
      field: 'foreground',
      value: '#f',
    });
    const valid = colorPairReducer(incomplete, {
      type: 'change',
      field: 'foreground',
      value: '#fff',
    });
    expect(valid.foreground).toEqual({
      input: '#fff',
      color: { r: 255, g: 255, b: 255 },
    });
  });
  it.each(['foreground', 'background'] as const)(
    'accepts shorthand without # in %s and normalizes on blur',
    (field) => {
      const changed = colorPairReducer(INITIAL_COLOR_PAIR, {
        type: 'change',
        field,
        value: 'aBc',
      });
      expect(changed[field].color).toEqual({ r: 170, g: 187, b: 204 });
      expect(changed[field].input).toBe('aBc');
      const normalized = colorPairReducer(changed, {
        type: 'normalize',
        field,
      });
      expect(normalized[field].input).toBe('#AABBCC');
    },
  );
  it('does not discard an invalid draft on blur', () => {
    const invalid = colorPairReducer(INITIAL_COLOR_PAIR, {
      type: 'change',
      field: 'background',
      value: 'oops',
    });
    expect(
      colorPairReducer(invalid, { type: 'normalize', field: 'background' }),
    ).toBe(invalid);
  });
  it('recovers from invalid text when the native picker supplies a color', () => {
    const invalid = colorPairReducer(INITIAL_COLOR_PAIR, {
      type: 'change',
      field: 'foreground',
      value: '',
    });
    const picked = colorPairReducer(invalid, {
      type: 'change',
      field: 'foreground',
      value: '#FF0000',
    });
    expect(picked.foreground).toEqual({
      input: '#FF0000',
      color: { r: 255, g: 0, b: 0 },
    });
  });
  it('swaps valid colors and clears stale invalid drafts', () => {
    const invalid = colorPairReducer(INITIAL_COLOR_PAIR, {
      type: 'change',
      field: 'foreground',
      value: 'nope',
    });
    const swapped = colorPairReducer(invalid, { type: 'swap' });
    expect(swapped.foreground).toEqual(INITIAL_COLOR_PAIR.background);
    expect(swapped.background).toEqual(INITIAL_COLOR_PAIR.foreground);
    expect(
      contrastRatio(swapped.foreground.color, swapped.background.color),
    ).toBe(
      contrastRatio(
        INITIAL_COLOR_PAIR.foreground.color,
        INITIAL_COLOR_PAIR.background.color,
      ),
    );
  });
  it('returns to the same valid pair after two swaps', () => {
    const once = colorPairReducer(INITIAL_COLOR_PAIR, { type: 'swap' });
    expect(colorPairReducer(once, { type: 'swap' })).toEqual(
      INITIAL_COLOR_PAIR,
    );
  });
});
