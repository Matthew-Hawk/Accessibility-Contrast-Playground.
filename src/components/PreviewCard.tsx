import { useId, useState } from 'react';
import { rgbToHex } from '../lib/color/parse';
import type { RGB } from '../lib/color/types';

interface PreviewCardProps {
  readonly foreground: RGB;
  readonly background: RGB;
}

export function PreviewCard({ foreground, background }: PreviewCardProps) {
  const inputId = useId();
  const [clickCount, setClickCount] = useState(0);

  return (
    <section className="preview-panel" aria-labelledby="preview-title">
      <div className="panel-label">
        <h2 id="preview-title">04 / IN THE WILD</h2>
        <span aria-hidden="true">↳</span>
      </div>
      <div className="preview-intro">
        <div>
          <h3>Put your colors to work.</h3>
          <p>Real words. Familiar controls. One color pair.</p>
        </div>
        <span className="pill">LIVE PREVIEW</span>
      </div>
      <p className="preview-warning" id="preview-warning">
        This sample uses your selected colors and may be hard to read. App
        controls and results keep their own accessible colors.
      </p>
      <div
        className="preview-stage"
        style={{
          color: rgbToHex(foreground),
          backgroundColor: rgbToHex(background),
        }}
        role="group"
        aria-label="Selected color preview"
        aria-describedby="preview-warning"
      >
        <div className="preview-copy">
          <span className="sample-kicker">A WEB WITH ROOM FOR EVERYONE.</span>
          <h3>
            Readable
            <br />
            by design.
          </h3>
          <p>
            Good contrast helps your words do their job. This is normal-sized
            text, just like the everyday content your readers come for.
          </p>
        </div>
        <div className="preview-components">
          <span className="sample-kicker">SMALL DETAILS. BIG DIFFERENCE.</span>
          <button
            type="button"
            className="sample-button"
            onClick={() => setClickCount((count) => count + 1)}
          >
            Try this button <span aria-hidden="true">↗</span>
          </button>
          <div className="sample-field">
            <label htmlFor={inputId}>Sample input</label>
            <input
              id={inputId}
              type="text"
              defaultValue="Everyone belongs here."
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <p className="sample-caption">
            Type in the field. Tab through the controls.
          </p>
        </div>
      </div>
      <div className="preview-caption">
        <p>Normal text: 16px. Large heading: 40px or larger.</p>
        <p role="status" aria-live="polite" aria-atomic="true">
          {clickCount === 0
            ? 'The sample controls are interactive.'
            : `Button clicked ${clickCount} ${clickCount === 1 ? 'time' : 'times'}.`}
        </p>
      </div>
    </section>
  );
}
