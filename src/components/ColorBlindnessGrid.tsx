import { contrastRatio } from '../lib/color/contrast';
import { rgbToHex } from '../lib/color/parse';
import { simulatePair } from '../lib/color/simulate';
import type { ColorVisionType, RGB } from '../lib/color/types';

const simulations: readonly { type: ColorVisionType; label: string }[] = [
  { type: 'protanopia', label: 'Protanopia' },
  { type: 'deuteranopia', label: 'Deuteranopia' },
  { type: 'tritanopia', label: 'Tritanopia' },
];

interface ColorBlindnessGridProps {
  readonly foreground: RGB;
  readonly background: RGB;
}

export function ColorBlindnessGrid({
  foreground,
  background,
}: ColorBlindnessGridProps) {
  const pairs = [
    {
      key: 'original',
      label: 'Original',
      foreground,
      background,
      ratio: contrastRatio(foreground, background),
    },
    ...simulations.map(({ type, label }) => ({
      key: type,
      label,
      ...simulatePair(foreground, background, type),
    })),
  ];

  return (
    <section className="vision-panel" aria-labelledby="vision-title">
      <div className="panel-label">
        <h2 id="vision-title">05 / ANOTHER PERSPECTIVE</h2>
        <span aria-hidden="true">◐</span>
      </div>
      <div className="vision-intro">
        <h3>Same pair. Different perspectives.</h3>
        <p>Compare the original with three color vision simulations.</p>
      </div>
      <div className="vision-grid">
        {pairs.map((pair, index) => {
          const foregroundHex = rgbToHex(pair.foreground);
          const backgroundHex = rgbToHex(pair.background);
          return (
            <article
              className="vision-card"
              key={pair.key}
              aria-labelledby={`vision-${pair.key}`}
            >
              <div className="vision-card-header">
                <h4 id={`vision-${pair.key}`}>{pair.label}</h4>
                <span aria-hidden="true">0{index}</span>
              </div>
              <div
                className="vision-sample"
                style={{ color: foregroundHex, backgroundColor: backgroundHex }}
                aria-hidden="true"
              >
                <span className="vision-type">Aa</span>
                <span className="vision-shapes">
                  <span className="vision-circle" />
                  <span className="vision-square" />
                </span>
                <span className="vision-sample-copy">Everyone belongs.</span>
              </div>
              <div className="vision-details">
                <p className="vision-ratio">
                  <span>
                    {pair.key === 'original'
                      ? 'Original contrast'
                      : 'Simulated contrast'}
                  </span>
                  <strong>
                    {pair.ratio.toFixed(2)}
                    <span>:1</span>
                  </strong>
                </p>
                <dl>
                  <div>
                    <dt>Foreground</dt>
                    <dd>{foregroundHex}</dd>
                  </div>
                  <div>
                    <dt>Background</dt>
                    <dd>{backgroundHex}</dd>
                  </div>
                </dl>
              </div>
            </article>
          );
        })}
      </div>
      <div className="vision-note">
        <span aria-hidden="true">↳</span>
        <div>
          <p>
            These simulations are approximations, not a medical diagnosis.
            Individual experiences vary.
          </p>
          <p>
            Simulated ratios describe the rendered approximations. Use the
            original pair for WCAG checks.
          </p>
        </div>
      </div>
    </section>
  );
}
