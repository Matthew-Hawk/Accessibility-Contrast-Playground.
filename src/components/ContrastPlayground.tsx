import { useReducer, useRef, useState } from 'react';
import { contrastRatio, DEFAULT_TARGET } from '../lib/color/contrast';
import type { WcagTarget } from '../lib/color/contrast';
import { parseHex, rgbToHex } from '../lib/color/parse';
import { suggestColor } from '../lib/color/suggest';
import type { ColorAdjustment } from '../lib/color/types';
import { colorPairReducer, INITIAL_COLOR_PAIR } from '../lib/colorPair';
import { ColorInput } from './ColorInput';
import { ContrastResult } from './ContrastResult';
import { PreviewCard } from './PreviewCard';
import { ColorBlindnessGrid } from './ColorBlindnessGrid';
import { Suggestion } from './Suggestion';

export function ContrastPlayground() {
  const [pair, dispatch] = useReducer(colorPairReducer, INITIAL_COLOR_PAIR);
  const [target, setTarget] = useState<WcagTarget>(DEFAULT_TARGET);
  const [adjustment, setAdjustment] = useState<ColorAdjustment>('foreground');
  const foregroundInput = useRef<HTMLInputElement>(null);
  const backgroundInput = useRef<HTMLInputElement>(null);
  const ratio = contrastRatio(pair.foreground.color, pair.background.color);
  const suggestion = suggestColor(
    pair.foreground.color,
    pair.background.color,
    { target, adjust: adjustment },
  );
  const invalidDraft =
    parseHex(pair.foreground.input) === null ||
    parseHex(pair.background.input) === null;

  function applySuggestion() {
    if (invalidDraft || suggestion.status === 'already-passing') return;
    dispatch({ type: 'change', field: adjustment, value: suggestion.hex });
    // The apply button disappears once the pair passes. Keep keyboard focus
    // on the changed field rather than losing it when that button unmounts.
    (adjustment === 'foreground'
      ? foregroundInput
      : backgroundInput
    ).current?.focus();
  }

  return (
    <div id="playground" tabIndex={-1}>
      <div className="workspace">
        <section className="color-controls" aria-labelledby="controls-title">
          <div className="panel-label">
            <h2 id="controls-title">01 / YOUR COLOR PAIR</h2>
            <span aria-hidden="true">✳</span>
          </div>
          <div className="controls-body">
            <span className="pill">CHANGE A COLOR. SEE THE DIFFERENCE.</span>
            <h3>Pick your pair.</h3>
            <p className="controls-intro">
              A little adjustment can make a big difference. Start with your
              text and background colors.
            </p>
            <ColorInput
              inputRef={foregroundInput}
              label="Foreground"
              description="TEXT & ICONS"
              value={pair.foreground}
              onChange={(value) =>
                dispatch({ type: 'change', field: 'foreground', value })
              }
              onBlur={() =>
                dispatch({ type: 'normalize', field: 'foreground' })
              }
            />
            <div className="swap-row">
              <span />
              <button
                type="button"
                className="swap-button"
                onClick={() => dispatch({ type: 'swap' })}
              >
                <span aria-hidden="true">⇅</span> Swap colors
              </button>
              <span />
            </div>
            <ColorInput
              inputRef={backgroundInput}
              label="Background"
              description="THE CANVAS"
              value={pair.background}
              onChange={(value) =>
                dispatch({ type: 'change', field: 'background', value })
              }
              onBlur={() =>
                dispatch({ type: 'normalize', field: 'background' })
              }
            />
            <p className="controls-footnote">
              <span aria-hidden="true">↳</span> Results update as you type. No
              submit button needed.
            </p>
          </div>
        </section>
        <ContrastResult
          target={target}
          ratio={ratio}
          foregroundHex={rgbToHex(pair.foreground.color)}
          backgroundHex={rgbToHex(pair.background.color)}
        />
      </div>
      <Suggestion
        suggestion={suggestion}
        originalHex={rgbToHex(pair[adjustment].color)}
        target={target}
        invalidDraft={invalidDraft}
        onTargetChange={setTarget}
        onAdjustmentChange={setAdjustment}
        onApply={applySuggestion}
      />
      <PreviewCard
        foreground={pair.foreground.color}
        background={pair.background.color}
      />
      <ColorBlindnessGrid
        foreground={pair.foreground.color}
        background={pair.background.color}
      />
    </div>
  );
}
