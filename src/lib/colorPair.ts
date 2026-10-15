import { parseHex, rgbToHex } from './color/parse';
import type { ColorAdjustment, RGB } from './color/types';

export interface ColorFieldState {
  readonly input: string;
  /** Last valid color remains active while the user edits an invalid draft. */
  readonly color: RGB;
}

export type ColorPairState = Readonly<Record<ColorAdjustment, ColorFieldState>>;

export type ColorPairAction =
  | {
      readonly type: 'change';
      readonly field: ColorAdjustment;
      readonly value: string;
    }
  | { readonly type: 'normalize'; readonly field: ColorAdjustment }
  | { readonly type: 'swap' };

export const INITIAL_COLOR_PAIR: ColorPairState = {
  foreground: { input: '#20201D', color: { r: 32, g: 32, b: 29 } },
  background: { input: '#E4FF54', color: { r: 228, g: 255, b: 84 } },
};

/** Manage editable drafts separately from the valid colors used for results. */
export function colorPairReducer(
  state: ColorPairState,
  action: ColorPairAction,
): ColorPairState {
  if (action.type === 'swap') {
    return {
      foreground: {
        input: rgbToHex(state.background.color),
        color: state.background.color,
      },
      background: {
        input: rgbToHex(state.foreground.color),
        color: state.foreground.color,
      },
    };
  }
  const previous = state[action.field];
  if (action.type === 'normalize') {
    if (!parseHex(previous.input)) return state;
    return {
      ...state,
      [action.field]: { ...previous, input: rgbToHex(previous.color) },
    };
  }
  return {
    ...state,
    [action.field]: {
      input: action.value,
      color: parseHex(action.value) ?? previous.color,
    },
  };
}
