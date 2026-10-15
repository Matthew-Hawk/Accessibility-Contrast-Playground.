import { contrastRatio } from './contrast';
import { linearToSrgb, srgbToLinear } from './luminance';
import { assertRgb, RGB_CHANNEL } from './parse';
import type { ColorVisionType, Matrix3, RGB } from './types';

// Machado, Oliveira & Fernandes (2009), severity 1.0 (100 in Colorspacious).
// Original supplementary data: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
// Verified against the three severity-100 tables in Colorspacious:
// https://github.com/njsmith/colorspacious/blob/master/colorspacious/cvd.py
// Paper: https://doi.org/10.1109/TVCG.2009.113
export const MACHADO_MATRICES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
} as const satisfies Record<ColorVisionType, Matrix3>;

export interface SimulatedPair {
  readonly foreground: RGB;
  readonly background: RGB;
  readonly ratio: number;
}

/**
 * Approximate full-severity color vision deficiency in linear RGB, then clip
 * and encode to 8-bit sRGB. Not a diagnosis or an individual vision prediction.
 * Luminance transfer: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * Model: https://doi.org/10.1109/TVCG.2009.113
 */
export function simulateColor(color: RGB, type: ColorVisionType): RGB {
  assertRgb(color);
  const linear = [color.r, color.g, color.b].map((channel) =>
    srgbToLinear(channel / RGB_CHANNEL.max),
  );
  const matrix = MACHADO_MATRICES[type];
  const transform = (row: readonly [number, number, number]) =>
    Math.round(
      linearToSrgb(
        row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2],
      ) * RGB_CHANNEL.max,
    );
  return {
    r: transform(matrix[0]),
    g: transform(matrix[1]),
    b: transform(matrix[2]),
  };
}

/**
 * Simulate both colors and evaluate the exact returned pair's WCAG ratio.
 * https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */
export function simulatePair(
  foreground: RGB,
  background: RGB,
  type: ColorVisionType,
): SimulatedPair {
  const simulatedForeground = simulateColor(foreground, type);
  const simulatedBackground = simulateColor(background, type);
  return {
    foreground: simulatedForeground,
    background: simulatedBackground,
    ratio: contrastRatio(simulatedForeground, simulatedBackground),
  };
}
