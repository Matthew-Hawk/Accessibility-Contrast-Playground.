import type { WcagTarget } from './color/contrast';

/** Shared presentation labels keep targets, verdicts and result rows aligned. */
export const WCAG_CRITERIA = {
  aaNormal: {
    label: 'Normal text',
    level: 'AA',
    targetLabel: 'AA normal text',
  },
  aaLarge: { label: 'Large text', level: 'AA', targetLabel: 'AA large text' },
  aaaNormal: {
    label: 'Normal text',
    level: 'AAA',
    targetLabel: 'AAA normal text',
  },
  aaaLarge: {
    label: 'Large text',
    level: 'AAA',
    targetLabel: 'AAA large text',
  },
  aaNonText: {
    label: 'UI components & graphics',
    level: 'AA',
    targetLabel: 'AA UI components & graphics',
  },
} as const satisfies Record<
  WcagTarget,
  { label: string; level: 'AA' | 'AAA'; targetLabel: string }
>;

export const WCAG_TARGETS = Object.keys(WCAG_CRITERIA) as WcagTarget[];
