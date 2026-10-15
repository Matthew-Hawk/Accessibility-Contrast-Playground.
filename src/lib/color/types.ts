/** Opaque sRGB color. Each channel is an integer in [0, 255]; no alpha. */
export interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Hue in degrees [0, 360); saturation and lightness in [0, 1]. */
export interface HSL {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export type ColorVisionType = 'protanopia' | 'deuteranopia' | 'tritanopia';
export type ColorAdjustment = 'foreground' | 'background';
export type Matrix3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];
