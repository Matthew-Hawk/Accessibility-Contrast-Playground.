/** Static visual specimen for phase-one design review. */
export function FoundationPreview() {
  return (
    <section className="specimen" aria-labelledby="specimen-title">
      <div className="panel-label">
        <span>THE COLOR SPECIMEN</span>
        <span aria-hidden="true">↗</span>
      </div>
      <div className="specimen-body">
        <span className="small-label">GOOD DESIGN INCLUDES EVERYONE.</span>
        <h2 id="specimen-title">
          Make it
          <br />
          stand out.
        </h2>
        <p>
          Big ideas deserve to be seen. Start with colors that make your message
          clear.
        </p>
        <div className="type-specimen" aria-label="Typography specimen">
          Aa<span>Bb Cc Dd Ee</span>
        </div>
      </div>
      <div className="swatch-strip">
        <div>
          <span className="swatch swatch-ink" />
          <span>
            FOREGROUND
            <br />
            <strong>#20201D</strong>
          </span>
        </div>
        <div>
          <span className="swatch swatch-lime" />
          <span>
            BACKGROUND
            <br />
            <strong>#E4FF54</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
