import { WCAG_THRESHOLDS } from '../lib/color/contrast';
import type { WcagTarget } from '../lib/color/contrast';
import type { ColorSuggestion } from '../lib/color/suggest';
import type { ColorAdjustment } from '../lib/color/types';
import { WCAG_CRITERIA, WCAG_TARGETS } from '../lib/wcagCriteria';

interface SuggestionProps {
  readonly suggestion: ColorSuggestion;
  readonly originalHex: string;
  readonly target: WcagTarget;
  readonly invalidDraft: boolean;
  readonly onTargetChange: (target: WcagTarget) => void;
  readonly onAdjustmentChange: (adjustment: ColorAdjustment) => void;
  readonly onApply: () => void;
}

export function Suggestion({
  suggestion,
  originalHex,
  target,
  invalidDraft,
  onTargetChange,
  onAdjustmentChange,
  onApply,
}: SuggestionProps) {
  const { adjustment, status, hex, ratio, targetRatio } = suggestion;
  const passing = status !== 'best-effort';
  const alreadyBest = status === 'best-effort' && hex === originalHex;
  const needsChange = status !== 'already-passing' && !alreadyBest;
  const opposite = adjustment === 'foreground' ? 'background' : 'foreground';

  return (
    <section className="suggestion-panel" aria-labelledby="suggestion-title">
      <div className="panel-label">
        <h2 id="suggestion-title">03 / A BETTER PAIR</h2>
        <span aria-hidden="true">↗</span>
      </div>
      <div className="suggestion-body">
        <div className="suggestion-controls">
          <h3>
            Keep the color.
            <br />
            Find the contrast.
          </h3>
          <p className="suggestion-intro">
            Pick a target. Adjust one color. We’ll find the smallest lightness
            change that gets you there.
          </p>
          <div className="target-control">
            <label htmlFor="contrast-target">Contrast target</label>
            <select
              id="contrast-target"
              value={target}
              onChange={(event) =>
                onTargetChange(event.target.value as WcagTarget)
              }
            >
              {WCAG_TARGETS.map((key) => (
                <option key={key} value={key}>
                  {WCAG_CRITERIA[key].targetLabel} · {WCAG_THRESHOLDS[key]}:1
                </option>
              ))}
            </select>
          </div>
          <fieldset className="adjustment-control">
            <legend>Color to adjust</legend>
            <div className="adjustment-options">
              {(['foreground', 'background'] as const).map((field) => (
                <label key={field}>
                  <input
                    type="radio"
                    name="adjustment"
                    value={field}
                    checked={adjustment === field}
                    onChange={() => onAdjustmentChange(field)}
                  />
                  <span>
                    {field === 'foreground' ? 'Foreground' : 'Background'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="suggestion-method">
            Hue and saturation stay fixed before hex rounding. “Nearest” means
            the smallest HSL lightness change.
          </p>
        </div>
        <div className="suggestion-result">
          <div className="suggestion-status">
            <span
              className={`result-badge ${passing ? 'badge-pass' : 'badge-fail'}`}
            >
              <span aria-hidden="true">{passing ? '✓' : '×'}</span>
              {passing ? 'Pass' : 'Fail'}
            </span>
            <span>
              {status === 'already-passing'
                ? 'YOUR PAIR MEETS THE TARGET'
                : status === 'best-effort'
                  ? 'BEST ACHIEVABLE · STILL BELOW TARGET'
                  : 'NEAREST PASSING COLOR'}
            </span>
          </div>
          <h4>
            {status === 'already-passing'
              ? 'You’re good to go.'
              : status === 'best-effort'
                ? 'This target needs another change.'
                : `A more readable ${adjustment}.`}
          </h4>
          <div className="suggested-color" id="suggested-color">
            <span
              className="suggested-swatch"
              style={{ backgroundColor: hex }}
              aria-hidden="true"
            />
            <div>
              <span className="suggested-color-label">
                {status === 'already-passing' ? 'Current' : 'Suggested'}{' '}
                {adjustment}
              </span>
              <strong>{hex}</strong>
              {needsChange && (
                <span className="suggested-from">From {originalHex}</span>
              )}
            </div>
          </div>
          <p className="suggested-ratio" id="suggested-ratio">
            <strong>
              {ratio.toFixed(2)}
              <span>:1</span>
            </strong>
            <span>
              Target: at least {targetRatio}:1
              <br />
              {WCAG_CRITERIA[target].targetLabel}
            </span>
          </p>
          <p className="suggestion-explanation" id="suggestion-explanation">
            {status === 'already-passing'
              ? 'No adjustment needed. Your current pair already passes the selected target.'
              : status === 'best-effort'
                ? `Changing only the ${adjustment} can’t reach this target against the current ${opposite}. This is the highest achievable contrast and still fails. Try adjusting the ${opposite} or choosing another target.`
                : `This color passes the selected target. Apply it to update your ${adjustment}, live preview, and simulations.`}
          </p>
          {alreadyBest && (
            <p className="already-best">
              Your {adjustment} is already the best achievable color for this
              fixed {opposite}.
            </p>
          )}
          {invalidDraft && (
            <p id="suggestion-input-note" className="suggestion-input-note">
              Based on the last valid pair. Fix the hex input before applying a
              suggestion.
            </p>
          )}
          {needsChange && (
            <button
              type="button"
              className="apply-button"
              onClick={onApply}
              disabled={invalidDraft}
              aria-describedby={`suggested-color suggested-ratio suggestion-explanation${invalidDraft ? ' suggestion-input-note' : ''}`}
            >
              Apply suggestion <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
