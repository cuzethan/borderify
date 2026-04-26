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
          font-size: 0.875rem;
          font-weight: 400;
          padding: 0.55rem 1.25rem;
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
        .photo-card-land     { width: 190px; height: 100px; align-self: flex-end; }

        .photo-fill {
          position: absolute;
          inset: 0;
        }

        .sky   { background: linear-gradient(180deg, #9ab4c8 0%, #c4d4dc 100%); }
        .earth { background: linear-gradient(180deg, #8a9a7a 50%, #6a7a5a 100%); top: 50%; }

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
            <a
              href="/login"
              className="btn-lg"
              style={{ backgroundColor: "#10B981", color: "black", fontWeight: 600 }}
            >
              Login or Sign Up
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
          <span className="footer-logo">Borderify</span>
          <span className="footer-copy">Brendan Ly · Ethan Le · Jason Nguyen</span>
          <a href="https://github.com/cuzethan/sjhacks" className="footer-link">GitHub</a>
        </footer>
      </div>
    </>
  );
}
