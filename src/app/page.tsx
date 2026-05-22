'use client';
import { useState, useEffect } from 'react';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    active_cryptocurrencies: number;
    market_cap_change_percentage_24h_usd: number;
  };
}

function formatNum(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke={positive ? 'var(--green)' : 'var(--red)'}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/prices').then(r => r.json()),
      fetch('/api/global').then(r => r.json()),
    ]).then(([c, g]) => {
      setCoins(c);
      setGlobal(g);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent)',
              animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Connecting to MiMo Intelligence...</span>
      </div>
    );
  }

  const g = global?.data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Crypto Intelligence Terminal
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          AI-driven market analysis powered by MiMo-V2.5 reasoning, web search, and vision
        </p>
      </div>

      {/* Stats Grid */}
      {g && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Market Cap', value: formatNum(g.total_market_cap?.usd), change: g.market_cap_change_percentage_24h_usd },
            { label: '24h Volume', value: formatNum(g.total_volume?.usd) },
            { label: 'BTC Dominance', value: `${g.market_cap_percentage?.btc?.toFixed(1)}%` },
            { label: 'Active Coins', value: g.active_cryptocurrencies?.toLocaleString() },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '16px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace' }}>
                {stat.value}
              </div>
              {stat.change !== undefined && (
                <div style={{ fontSize: 12, color: stat.change >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4, fontFamily: 'monospace' }}>
                  {stat.change >= 0 ? '+' : ''}{stat.change?.toFixed(2)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* Coins Table */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1.5fr 1fr 1fr 0.8fr 100px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>#</span>
          <span>Coin</span>
          <span style={{ textAlign: 'right' }}>Price</span>
          <span style={{ textAlign: 'right' }}>24h</span>
          <span style={{ textAlign: 'right' }}>Market Cap</span>
          <span style={{ textAlign: 'right' }}>7d Chart</span>
        </div>

        {/* Table Rows */}
        {filtered.slice(0, 20).map((coin, i) => (
          <a
            key={coin.id}
            href={`/research?coin=${coin.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1.5fr 1fr 1fr 0.8fr 100px',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              textDecoration: 'none',
              color: 'var(--text)',
              transition: 'background 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{i + 1}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
              }}>
                {coin.symbol.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{coin.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{coin.symbol.toUpperCase()}</div>
              </div>
            </div>
            <span style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 13 }}>
              ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
            <span style={{
              textAlign: 'right',
              fontFamily: 'monospace',
              fontSize: 13,
              color: coin.price_change_percentage_24h >= 0 ? 'var(--green)' : 'var(--red)',
            }}>
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}
              {coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>
              {formatNum(coin.market_cap)}
            </span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <MiniSparkline
                data={coin.sparkline_in_7d?.price || []}
                positive={(coin.price_change_percentage_7d_in_currency || 0) >= 0}
              />
            </div>
          </a>
        ))}
      </div>

      {/* AI Features Banner */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        {[
          { icon: '🔍', title: 'Research Agent', desc: 'Deep analysis via MiMo reasoning + web search', href: '/research' },
          { icon: '📊', title: 'Sentiment Scanner', desc: 'Real-time sentiment from news & social media', href: '/sentiment' },
          { icon: '💼', title: 'Portfolio Advisor', desc: 'AI-powered portfolio optimization', href: '/portfolio' },
          { icon: '👁', title: 'Chart Vision', desc: 'Upload charts for pattern recognition', href: '/vision' },
        ].map((feat, i) => (
          <a
            key={i}
            href={feat.href}
            style={{
              textDecoration: 'none',
              color: 'var(--text)',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'rgba(139,92,246,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>{feat.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{feat.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{feat.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
