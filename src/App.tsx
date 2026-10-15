import { FoundationPreview } from './components/FoundationPreview';

const phases = [
  'Project foundation',
  'Color math + tests',
  'Contrast controls',
  'Preview + simulation',
  'Accessible suggestions',
  'Audit + final polish',
];

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Contrast Playground home">
          <span className="brand-icon" aria-hidden="true">
            ◐
          </span>
          <span>
            CONTRAST
            <br />
            PLAYGROUND<span className="brand-dot">®</span>
          </span>
        </a>
        <span className="header-note">
          A LITTLE COLOR.
          <br />A BIG DIFFERENCE.
        </span>
        <a className="header-link" href="#build-status">
          THE BUILD <span aria-hidden="true">↘</span>
        </a>
      </header>
      <main id="main">
        <div className="eyebrow">
          <span className="status-dot" /> ACCESSIBILITY IS A DESIGN CHOICE.{' '}
          <span className="edition">VOL. 01 / COLOR & CONTRAST</span>
        </div>
        <section className="intro" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">
              Less guesswork.
              <br />
              More <span className="highlight">contrast.</span>
            </h1>
            <p>
              Play with color. Find the balance.
              <br />
              Build a web that everyone can see.
            </p>
          </div>
          <div className="hero-mark" aria-hidden="true">
            Aa<span>MAKE IT READABLE.</span>
          </div>
        </section>
        <div className="workspace">
          <section className="foundation" aria-labelledby="foundation-title">
            <div className="panel-label">
              <span>01 / THE FOUNDATION</span>
              <span aria-hidden="true">✳</span>
            </div>
            <div className="foundation-body">
              <span className="pill">WORK IN PROGRESS</span>
              <h2 id="foundation-title">
                Bold by design.
                <br />
                Accessible by default.
              </h2>
              <p>
                A playground for testing color pairs against WCAG 2.x. Built in
                small, reviewable steps, with the math at its core.
              </p>
              <div className="build-status" id="build-status">
                <h3>ON THE WORKBENCH</h3>
                <ol>
                  {phases.map((phase, index) => (
                    <li key={phase} className={index === 0 ? 'current' : ''}>
                      <span className="phase-number">0{index + 1}</span>
                      <span>{phase}</span>
                      <span className="phase-state">
                        {index === 0 ? 'IN REVIEW' : 'UP NEXT'}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
          <FoundationPreview />
        </div>
        <aside className="manifesto">
          <span aria-hidden="true">↳</span>
          <p>
            Accessibility isn’t an extra.
            <br />
            <strong>It’s where good design starts.</strong>
          </p>
          <span className="manifesto-star" aria-hidden="true">
            ✳
          </span>
        </aside>
      </main>
      <footer>
        <span>CONTRAST PLAYGROUND © 2026</span>
        <span>BUILT WITH INTENTION. OPEN TO EVERYONE.</span>
        <span>FOUNDATION / 01 OF 06</span>
      </footer>
    </>
  );
}
