/**
 * Local verification demo (NOT shipped). Renders every building block plus a swatch
 * of all colour tokens so the brand can be eyeballed — and asserted by Playwright —
 * in all five modes. It imports the library from src/ directly via Vite. See dev/README.md.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/index.css';
import {
  COLOR_ROLES,
  Footer,
  ModeProvider,
  Nav,
  Prose,
  SectionLabel,
  StatusTag,
  Wordmark,
} from '../src';

const NAV_LINKS = [
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Writing', href: '#writing' },
  { label: 'About', href: '#about' },
];

function TokenSwatches() {
  return (
    <div
      data-testid="swatches"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--wb-space-3)',
      }}
    >
      {COLOR_ROLES.map((role) => (
        <div
          key={role}
          data-token={role}
          style={{
            border: 'var(--wb-hairline) solid var(--wb-border)',
            borderRadius: 'var(--wb-radius-md)',
            overflow: 'hidden',
          }}
        >
          <div style={{ background: `var(--wb-${role})`, height: 'var(--wb-space-12)' }} />
          <div
            style={{
              fontFamily: 'var(--wb-font-mono)',
              fontSize: 'var(--wb-text-xs)',
              padding: 'var(--wb-space-2)',
              color: 'var(--wb-ink-soft)',
            }}
          >
            {role}
          </div>
        </div>
      ))}
    </div>
  );
}

function Demo() {
  return (
    <>
      <Nav links={NAV_LINKS} wordmarkHref="#top" />

      <main
        style={{
          maxInlineSize: '64rem',
          margin: '0 auto',
          padding: 'var(--wb-space-8) var(--wb-space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--wb-space-12)',
        }}
      >
        <section
          aria-labelledby="status-label"
          style={{ display: 'grid', gap: 'var(--wb-space-4)' }}
        >
          <SectionLabel id="status-label">Building blocks</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--wb-space-6)' }}>
            <StatusTag status="positive">Live</StatusTag>
            <StatusTag status="warning">Upcoming</StatusTag>
            <StatusTag status="accent">Beta</StatusTag>
            <StatusTag status="neutral">Archived</StatusTag>
          </div>
          <div>
            <Wordmark href="#top" />
          </div>
        </section>

        <section
          aria-labelledby="tokens-label"
          style={{ display: 'grid', gap: 'var(--wb-space-4)' }}
        >
          <SectionLabel id="tokens-label">Color tokens</SectionLabel>
          <TokenSwatches />
        </section>

        <section
          aria-labelledby="surface-label"
          style={{
            display: 'grid',
            gap: 'var(--wb-space-3)',
            background: 'var(--wb-surface)',
            border: 'var(--wb-hairline) solid var(--wb-border)',
            borderRadius: 'var(--wb-radius-md)',
            padding: 'var(--wb-space-6)',
          }}
        >
          <SectionLabel id="surface-label">Surface / text</SectionLabel>
          <p style={{ color: 'var(--wb-ink)', margin: 0 }}>Primary ink on a raised surface.</p>
          <p style={{ color: 'var(--wb-ink-soft)', margin: 0 }}>Secondary ink-soft text.</p>
          <p style={{ color: 'var(--wb-ink-faint)', margin: 0 }}>Faint ink-faint caption.</p>
        </section>

        <section
          aria-labelledby="prose-label"
          style={{ display: 'grid', gap: 'var(--wb-space-4)' }}
        >
          <SectionLabel id="prose-label">Prose</SectionLabel>
          <Prose>
            <h1>The quiet workshop</h1>
            <p>
              Weaverbit is built to feel <strong>calm, clean, and precise</strong> — like a
              well-organized workshop, not a flashy showroom. Body copy is set in Inter at a
              comfortable measure.
            </p>
            <h2>A second heading</h2>
            <p>
              Links use the <a href="#top">muted teal accent</a>, and inline technical bits like{' '}
              <code>weaverbit-core</code> wear the mono signature face.
            </p>
            <blockquote>Earn trust by being quiet and exact, not by shouting.</blockquote>
            <ul>
              <li>Tokens are the only source of color, font, and spacing.</li>
              <li>Every block works in all four looks.</li>
            </ul>
            <pre>
              <code>import &#123; Nav &#125; from &#39;weaverbit-core&#39;;</code>
            </pre>
          </Prose>
        </section>
      </main>

      <Footer
        copyright="© 2026 Weaverbit"
        links={[
          { label: 'GitHub', href: '#github' },
          { label: 'RSS', href: '#rss' },
        ]}
      />
    </>
  );
}

const container = document.getElementById('root');
if (container === null) {
  throw new Error('demo: #root not found');
}
// ModeProvider must wrap anything that uses the mode (ModeSwitcher / useMode).
createRoot(container).render(
  <StrictMode>
    <ModeProvider>
      <Demo />
    </ModeProvider>
  </StrictMode>,
);
