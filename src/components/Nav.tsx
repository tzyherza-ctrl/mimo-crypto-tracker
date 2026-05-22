'use client';

export default function Nav() {
  return (
    <nav style={{ display: 'flex', gap: 4 }}>
      {[
        { href: '/', label: 'Dashboard' },
        { href: '/research', label: 'Research' },
        { href: '/sentiment', label: 'Sentiment' },
        { href: '/portfolio', label: 'Portfolio' },
        { href: '/vision', label: 'Vision' },
      ].map(link => (
        <a
          key={link.href}
          href={link.href}
          style={{
            padding: '6px 12px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            borderRadius: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.background = 'var(--border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
