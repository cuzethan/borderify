import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import '../LandingPage.css';

export function LandingPage(): JSX.Element {
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);
  const user = useStore((s) => s.user);
  const logout = () => supabase.auth.signOut();
  const appHref = user ? '/app' : '/upload';

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY * 0.18;
        if (leftRef.current) leftRef.current.style.transform = `translateY(${y}px)`;
        if (rightRef.current) rightRef.current.style.transform = `translateY(${y}px)`;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div className="landing" style={{ background: "#111111", color: "#e8e8e8" }}>
        <div className="page-content">
        <nav>
          <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="Borderify logo" className="logo-img" style={{ marginRight: 10, width: 36, height: 36 }} />
                <span style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: '1.4rem', lineHeight: 1 }}>
                  Borderify
                </span>
              </div>
          <div className="nav-right">
            {user ? (
              <>
                <span className="nav-link">Logged in as {user.email}</span>
                <button className="btn" style={{ backgroundColor: '#ffffff', cursor: 'pointer', border: 'none' }} onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn" style={{ backgroundColor: '#ffffff', fontWeight: 700 }}>Log in</a>
                <a href="/signup" className="btn" style={{ backgroundColor: "#10B981", color: "black", fontWeight: 700 }}>Sign up</a>
              </>
            )}
          </div>
        </nav>

        <div className="sides-wrapper">
          <div className="side-photo side-photo-left">
            <img ref={leftRef} src="/DSCF3432.jpg" alt="" className="side-photo-img" />
          </div>
          <div className="side-photo side-photo-right">
            <img ref={rightRef} src="/DSCF4076.jpg" alt="" className="side-photo-img" />
          </div>

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
              href={appHref}
              className="btn-lg"
              style={{ backgroundColor: "#10B981", color: "black", fontWeight: 600 }}
            >
              Open app
            </a>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <a
              href="#how"
              className="link-subtle"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it works →
            </a>
          </div>
        </div>

        <div className="demo">
          <div className="demo-heading">See it in action</div>
          <div className="demo-video-placeholder">
            Demo video placeholder
          </div>
        </div>

        <div className="preview">
          <div className="preview-inner">
            <div className="photo-card-wrapper">
              <div className="photo-card photo-card-portrait">
                <img src="/DSC_0438.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="border-frame border-lg" />
              </div>
              <span className="card-label">Portrait (4:5)</span>
            </div>
            <div className="photo-card-wrapper">
              <div className="photo-card photo-card-land">
                <img src="/DSC_0694.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="border-frame border-sm" />
              </div>
              <span className="card-label">Landscape (1.91:1)</span>
            </div>
            <div className="photo-card-wrapper">
              <div className="photo-card photo-card-square">
                <img src="/DSCF4009.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="border-frame" />
              </div>
              <span className="card-label">Square (1:1)</span>
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

        </div>{/* sides-wrapper */}

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
          <a
            href="https://devpost.com/software/borderify"
            target="_blank"
            rel="noopener noreferrer"
            className="sjhacks-btn"
          >
            <img src="/sjhacks.svg" alt="SJHacks" style={{ width: 40, height: 40 }} />
            <span>SJHacks 2026</span>
          </a>

          <div className="footer-center">
            <span className="footer-copy">Brendan Ly · Ethan Le · Jason Nguyen</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="https://github.com/cuzethan/borderify" className="github-btn" aria-label="View on GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.47-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.898-.015 3.293 0 .315.21.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </footer>
        </div>
      </div>
    </>
  );
}
