import { ContrastPlayground } from './components/ContrastPlayground';

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
        <a className="header-link" href="#playground">
          TRY A PAIR <span aria-hidden="true">↘</span>
        </a>
      </header>
      <main id="main" tabIndex={-1}>
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
        <ContrastPlayground />
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
        <span>ACCESSIBLE SUGGESTIONS / 05 OF 06</span>
      </footer>
    </>
  );
}
