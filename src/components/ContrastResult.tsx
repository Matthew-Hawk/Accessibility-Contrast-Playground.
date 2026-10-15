import { evaluateContrast, WCAG_THRESHOLDS } from '../lib/color/contrast';
import type { WcagTarget } from '../lib/color/contrast';
import { WCAG_CRITERIA, WCAG_TARGETS } from '../lib/wcagCriteria';

interface ContrastResultProps {
  readonly target: WcagTarget;
  readonly ratio: number;
  readonly foregroundHex: string;
  readonly backgroundHex: string;
}

export function ContrastResult({
  target,
  ratio,
  foregroundHex,
  backgroundHex,
}: ContrastResultProps) {
  const results = evaluateContrast(ratio);
  const displayedRatio = ratio.toFixed(2);
  const passesTarget = results[target];
  const targetLabel = WCAG_CRITERIA[target].targetLabel;

  return (
    <section className="contrast-result" aria-labelledby="result-title">
      <div className="panel-label">
        <h2 id="result-title">02 / THE VERDICT</h2>
        <span aria-hidden="true">↗</span>
      </div>
      <div
        className={`ratio-summary ${passesTarget ? 'is-passing' : 'is-failing'}`}
      >
        <span className="small-label">WCAG 2.x CONTRAST RATIO</span>
        <div className="ratio-value">
          {displayedRatio}
          <span>:1</span>
        </div>
        <p className="ratio-verdict">
          <span aria-hidden="true">{passesTarget ? '✓' : '×'}</span>{' '}
          {passesTarget ? 'Passes' : 'Fails'} {targetLabel}
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
        {passesTarget ? ' Passes' : ' Fails'} {targetLabel}.
      </p>
      <div className="criteria-list">
        <div className="criteria-header" aria-hidden="true">
          <span>THE STANDARD</span>
          <span>RESULT</span>
        </div>
        <ul role="list" aria-label="WCAG contrast results">
          {WCAG_TARGETS.map((key) => (
            <li
              key={key}
              className={key === target ? 'selected-criterion' : undefined}
            >
              <span className="criterion-copy">
                <span className="criterion-label">
                  {WCAG_CRITERIA[key].label}{' '}
                  <span className="level-label">
                    {WCAG_CRITERIA[key].level}
                  </span>
                  {key === target && (
                    <span className="target-marker">Target</span>
                  )}
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
