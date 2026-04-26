export function LandingPage(): JSX.Element {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
          background: #111110;
          color: #e8e6e2;
          line-height: 1.6;
        }

        a { color: inherit; text-decoration: none; }

        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem 2.5rem;
          border-bottom: 1px solid #222220;
        }

        .logo {
          font-family: 'Lora', serif;
          font-size: 1.15rem;
          letter-spacing: -0.01em;
        }

        .logo-img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          margin-right: 10px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          font-size: 0.875rem;
          color: #666;
          transition: color 0.15s;
        }

        .nav-link:hover { color: #e8e6e2; }

        .btn {
          font-size: 0.9375rem;
          font-weight: 400;
          padding: 0.65rem 1.5rem;
          border-radius: 6px;
          background: #e8e6e2;
          color: #111110;
          transition: opacity 0.15s;
        }

        .btn:hover { opacity: 0.75; }

        .hero {
          max-width: 660px;
          margin: 0 auto;
          padding: 8rem 2rem 6rem;
          text-align: center;
        }

        h1 {
          font-family: 'Lora', serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }

        h1 em {
          font-style: italic;
          color: #555;
        }

        .hero-sub {
          font-size: 1rem;
          color: #777;
          max-width: 400px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
        }

        .btn-lg {
          font-size: 0.9375rem;
          padding: 0.75rem 1.75rem;
          border-radius: 8px;
          background: #e8e6e2;
          color: #111110;
          font-weight: 400;
          transition: opacity 0.15s;
        }

        .btn-lg:hover { opacity: 0.75; }

        .link-subtle {
          font-size: 0.875rem;
          color: #555;
          transition: color 0.15s;
        }

        .link-subtle:hover { color: #e8e6e2; }

        .preview {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 2rem 6rem;
        }

        .preview-inner {
          background: #1a1a18;
          border-radius: 16px;
          padding: 2.5rem;
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          justify-content: center;
        }

        .photo-card {
          flex-shrink: 0;
          position: relative;
          border-radius: 3px;
          overflow: hidden;
        }

        .photo-card-portrait { width: 140px; height: 175px; }
        .photo-card-square   { width: 160px; height: 160px; align-self: center; }
  .photo-card-land     { width: 190px; height: 100px; align-self: center; }

        .photo-fill {
          position: absolute;
          left: 0;
          right: 0;
        }

        /* Default: split the card vertically so sky occupies the top half and earth the bottom half.
           This preserves the original look for portrait and square cards. */
        .photo-fill.sky {
          top: 0;
          bottom: 50%;
          background: linear-gradient(180deg, #9ab4c8 0%, #c4d4dc 100%);
        }

        .photo-fill.earth {
          top: 50%;
          bottom: 0;
          background: linear-gradient(180deg, #8a9a7a 0%, #6a7a5a 100%);
        }

        /* Landscape cards: split evenly top (sky) and bottom (earth) */
        .photo-card-land .photo-fill.sky {
          top: 0;
          bottom: 50%;
        }
        .photo-card-land .photo-fill.earth {
          top: 50%;
          bottom: 0;
        }

        .border-frame {
          position: absolute;
          inset: 0;
          border: 14px solid #111110;
        }

        .border-sm { border-width: 10px; }
        .border-lg { border-width: 18px; }

        .steps {
          max-width: 640px;
          margin: 0 auto;
          padding: 4rem 2rem 6rem;
          border-top: 1px solid #222220;
        }

        .section-heading {
          font-family: 'Lora', serif;
          font-size: 1.5rem;
          font-weight: 400;
          letter-spacing: -0.01em;
          margin-bottom: 2.5rem;
        }

        .step {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 0 1.25rem;
          padding: 1.25rem 0;
          border-bottom: 1px solid #222220;
        }

        .step:last-child { border-bottom: none; }

        .step-n {
          font-size: 0.75rem;
          color: #444;
          padding-top: 2px;
        }

        .step h3 {
          font-size: 0.9375rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          letter-spacing: -0.01em;
        }

        .step p {
          font-size: 0.875rem;
          color: #666;
          line-height: 1.65;
        }

        .features {
          background: #1a1a18;
          padding: 4rem 2rem;
        }

        .features-inner {
          max-width: 640px;
          margin: 0 auto;
        }

        .feature-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #252523;
          border: 1px solid #252523;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 2rem;
        }

        .feature-item {
          background: #1a1a18;
          padding: 1.25rem 1.5rem;
        }

        .feature-item h4 {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.3rem;
        }

        .feature-item p {
          font-size: 0.8125rem;
          color: #666;
          line-height: 1.6;
        }

        footer {
          padding: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #222220;
        }

        .footer-logo {
          font-family: 'Lora', serif;
          font-size: 0.95rem;
          color: #444;
        }

        .footer-copy {
          font-size: 0.8rem;
          color: #444;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #6b6b6b; /* make left-side elements more muted */
        }

        .footer-brand-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: #6b6b6b; /* muted */
        }

        .footer-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-copy {
          font-size: 1rem; /* larger names */
          color: #dcdcdc;
          text-align: center;
          font-weight: 500;
        }

        .github-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          justify-content: center;
          padding: 0.45rem 1rem; /* rectangular */
          min-width: 96px;
          height: 44px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid #2a2a28;
          color: #e8e6e2;
          transition: background 0.12s, opacity 0.12s, transform 0.08s;
          font-size: 0.98rem;
          font-weight: 600;
        }

        .github-btn:hover { opacity: 0.98; transform: translateY(-1px); background: rgba(255,255,255,0.02); }

        .github-btn svg { width: 22px; height: 22px; fill: currentColor; }

        @media (max-width: 600px) {
          nav { padding: 1.25rem; }
          .nav-link { display: none; }
          .preview-inner { flex-direction: column; align-items: center; }
          .photo-card-land { width: 160px; height: 84px; align-self: auto; }
          .photo-card-square { align-self: auto; }
          .feature-list { grid-template-columns: 1fr; }
          footer { flex-direction: column; gap: 0.5rem; }
        }
      `}</style>

      <div style={{ background: "#111110", color: "#e8e6e2" }}>
        <nav>
          <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="Borderify logo" className="logo-img" style={{ marginRight: 8, width: 24, height: 24 }} />
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>
                  Borderify
                </span>
              </div>
          <div className="nav-right">
            <a href="/login" className="btn">Log in</a>
            <a href="/signup" className="btn" style={{ backgroundColor: "#10B981", color: "black" }}>Sign up</a>
          </div>
        </nav>

        <div className="hero">
          <h1>
            Clean borders for your
            <br />
            <em>Instagram photos</em>
          </h1>
          <p className="hero-sub">
            Upload, style, export. No account needed, no watermarks, runs entirely in your
            browser.
          </p>
          <div className="hero-actions">
            <a
              href="/app"
              className="btn-lg"
              style={{ backgroundColor: "#10B981", color: "black", fontWeight: 600 }}
            >
              Open app
            </a>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <a href="#how" className="link-subtle">
              How it works →
            </a>
          </div>
        </div>

        <div className="preview">
          <div className="preview-inner">
            <div className="photo-card photo-card-portrait">
              <div className="photo-fill sky" />
              <div className="photo-fill earth" />
              <div className="border-frame border-lg" />
            </div>
            <div className="photo-card photo-card-square">
              <div className="photo-fill sky" />
              <div className="photo-fill earth" />
              <div className="border-frame" />
            </div>
            <div className="photo-card photo-card-land">
              <div className="photo-fill sky" />
              <div className="photo-fill earth" />
              <div className="border-frame border-sm" />
            </div>
          </div>
        </div>

        <div className="steps" id="how">
          <div className="section-heading">How it works</div>

          <div className="step">
            <span className="step-n">1</span>
            <div>
              <h3>Upload your photos</h3>
              <p>Drag and drop or click to select. Works with any image format, any size.</p>
            </div>
          </div>

          <div className="step">
            <span className="step-n">2</span>
            <div>
              <h3>Choose your format and border</h3>
              <p>Pick portrait, square, or landscape. Set border parameters. Preview updates live.</p>
            </div>
          </div>

          <div className="step">
            <span className="step-n">3</span>
            <div>
              <h3>Export at full resolution</h3>
              <p>Download each photo or export them all as a zip. Hassle free.</p>
            </div>
          </div>
        </div>

        <div className="features">
          <div className="features-inner">
            <div className="section-heading">The details</div>
            <div className="feature-list">
              <div className="feature-item">
                <h4>All three Instagram formats</h4>
                <p>Portrait 4:5, square 1:1, landscape 1.91:1 — at exactly the right resolution.</p>
              </div>
              <div className="feature-item">
                <h4>No watermarks</h4>
                <p>Your photos leave exactly as they went in, just with a border.</p>
              </div>
              <div className="feature-item">
                <h4>Batch export</h4>
                <p>Handle multiple photos at once and download them all in one zip file.</p>
              </div>
              <div className="feature-item">
                <h4>Stays in your browser</h4>
                <p>Nothing is uploaded anywhere. Your photos never leave your device.</p>
              </div>
            </div>
          </div>
        </div>

        <footer>
          <div style={{ width: 120 }} />

          <div className="footer-center">
            <span className="footer-copy">Brendan Ly · Ethan Le · Jason Nguyen</span>
          </div>

          <div>
            <a href="https://github.com/cuzethan/sjhacks" className="github-btn" aria-label="View on GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.47-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.898-.015 3.293 0 .315.21.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
