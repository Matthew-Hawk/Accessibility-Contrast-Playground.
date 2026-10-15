import { evaluateContrast, WCAG_THRESHOLDS } from '../lib/color/contrast';
import type { WcagTarget } from '../lib/color/contrast';

const criteria: readonly { key: WcagTarget; label: string; level: string }[] = [
  { key: 'aaNormal', label: 'Normal text', level: 'AA' },
  { key: 'aaLarge', label: 'Large text', level: 'AA' },
  { key: 'aaaNormal', label: 'Normal text', level: 'AAA' },
  { key: 'aaaLarge', label: 'Large text', level: 'AAA' },
  { key: 'aaNonText', label: 'UI components & graphics', level: 'AA' },
];

interface ContrastResultProps {
  readonly ratio: number;
  readonly foregroundHex: string;
  readonly backgroundHex: string;
}

export function ContrastResult({
  ratio,
  foregroundHex,
  backgroundHex,
}: ContrastResultProps) {
  const results = evaluateContrast(ratio);
  const displayedRatio = ratio.toFixed(2);

  return (
    <section className="contrast-result" aria-labelledby="result-title">
      <div className="panel-label">
        <h2 id="result-title">02 / THE VERDICT</h2>
        <span aria-hidden="true">↗</span>
      </div>
      <div
        className={`ratio-summary ${results.aaNormal ? 'is-passing' : 'is-failing'}`}
      >
        <span className="small-label">WCAG 2.x CONTRAST RATIO</span>
        <div className="ratio-value">
          {displayedRatio}
          <span>:1</span>
        </div>
        <p className="ratio-verdict">
          <span aria-hidden="true">{results.aaNormal ? '✓' : '×'}</span>{' '}
          {results.aaNormal
            ? 'Passes AA for normal text'
            : 'Fails AA for normal text'}
        </p>
      </div>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Foreground {foregroundHex}, background {backgroundHex}. Contrast ratio{' '}
        {displayedRatio} to 1.
        {results.aaNormal ? ' Passes' : ' Fails'} AA normal text.
      </p>
      <div className="criteria-list">
        <div className="criteria-header" aria-hidden="true">
          <span>THE STANDARD</span>
          <span>RESULT</span>
        </div>
        <ul aria-label="WCAG contrast results">
          {criteria.map(({ key, label, level }) => (
            <li key={key}>
              <span className="criterion-copy">
                <span className="criterion-label">
                  {label} <span className="level-label">{level}</span>
                </span>
                <span className="criterion-threshold">
                  At least {WCAG_THRESHOLDS[key]}:1
                </span>
              </span>
              <span
                className={`result-badge ${results[key] ? 'badge-pass' : 'badge-fail'}`}
              >
                <span aria-hidden="true">{results[key] ? '✓' : '×'}</span>{' '}
                {results[key] ? 'Pass' : 'Fail'}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="result-notes">
        <p>Large text: at least 24px, or 18.67px bold.</p>
        <p>
          Results use the unrounded ratio. The displayed ratio is rounded to two
          decimals.
        </p>
      </div>
    </section>
  );
}
