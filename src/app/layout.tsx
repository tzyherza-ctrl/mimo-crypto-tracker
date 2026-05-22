import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'MiMo Crypto Intelligence',
  description: 'AI-powered crypto analysis terminal powered by Xiaomi MiMo-V2.5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--border)',
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)',
              }} />
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>
                MiMo Intelligence
              </span>
            </div>
            <Nav />
          </div>
        </header>

        {/* Main */}
        <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '24px', width: '100%' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          Powered by Xiaomi MiMo-V2.5 · Research Agent · Vision · TTS · Web Search
        </footer>
      </body>
    </html>
  );
}
