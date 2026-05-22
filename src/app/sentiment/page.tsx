'use client';
import { useState } from 'react';

export default function SentimentPage() {
  const [selected, setSelected] = useState<string[]>(['bitcoin', 'ethereum', 'solana']);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const allCoins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'xrp', 'dogecoin', 'avalanche-2', 'chainlink', 'polkadot', 'polygon'];

  function toggle(coin: string) {
    setSelected(prev => 
      prev.includes(coin) ? prev.filter(c => c !== coin) : [...prev, coin]
    );
  }

  async function scan() {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: selected }),
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setResults({ error: 'Failed to scan' });
    }
    setLoading(false);
  }

  function sentimentColor(val: number) {
    if (val >= 50) return 'var(--green)';
    if (val >= 20) return '#4ade80';
    if (val >= -20) return 'var(--yellow)';
    if (val >= -50) return '#fb923c';
    return 'var(--red)';
  }

  function sentimentLabel(val: number) {
    if (val >= 60) return 'Extreme Greed';
    if (val >= 30) return 'Greed';
    if (val >= -10) return 'Neutral';
    if (val >= -40) return 'Fear';
    return 'Extreme Fear';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Sentiment Scanner
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          MiMo web search scans news, social media & on-chain data
        </p>
      </div>

      {/* Coin Multi-Select */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {allCoins.map(c => (
          <button
            key={c}
            onClick={() => toggle(c)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: `1px solid ${selected.includes(c) ? 'var(--accent)' : 'var(--border)'}`,
              background: selected.includes(c) ? 'rgba(139,92,246,0.1)' : 'var(--card)',
              color: selected.includes(c) ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {c.replace('-2', '').replace('avalanche-2', 'avax')}
          </button>
        ))}
      </div>

      <button
        onClick={scan}
        disabled={loading || selected.length === 0}
        style={{
          padding: '10px 24px', alignSelf: 'flex-start',
          background: loading ? 'var(--border)' : 'var(--accent)',
          border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Scanning...' : `Scan ${selected.length} Coins`}
      </button>

      {loading && (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '32px', textAlign: 'center',
        }}>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            MiMo scanning {selected.length} coins...<br/>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              News → Social Media → On-Chain → Sentiment Analysis
            </span>
          </div>
        </div>
      )}

      {results && !loading && results.results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {results.results.map((r: any, i: number) => {
            const s = r.sentiment;
            const score = s?.overall_sentiment || 0;
            return (
              <div key={i} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600, textTransform: 'capitalize' }}>{r.coin}</div>
                    <div style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginTop: 4,
                      background: `${sentimentColor(score)}15`,
                      color: sentimentColor(score),
                    }}>
                      {s?.label?.replace('_', ' ') || sentimentLabel(score)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', color: sentimentColor(score) }}>
                      {score > 0 ? '+' : ''}{score}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ -100 to +100</div>
                  </div>
                </div>

                {/* Sentiment Bars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                  {[
                    { label: 'News', val: s?.news_sentiment },
                    { label: 'Social', val: s?.social_sentiment },
                    { label: 'On-Chain', val: s?.onchain_sentiment },
                  ].map((b, j) => (
                    <div key={j}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.label}</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', color: sentimentColor(b.val || 0) }}>
                          {b.val > 0 ? '+' : ''}{b.val}
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.abs(b.val || 0) / 2}%`,
                          marginLeft: (b.val || 0) < 0 ? 'auto' : undefined,
                          height: '100%',
                          background: sentimentColor(b.val || 0),
                          borderRadius: 2,
                          transition: 'width 0.5s',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Whale: <span style={{ color: s?.whale_activity === 'accumulating' ? 'var(--green)' : s?.whale_activity === 'distributing' ? 'var(--red)' : 'var(--text-secondary)' }}>
                      {s?.whale_activity || 'unknown'}
                    </span>
                  </span>
                  {s?.trending && (
                    <span style={{ fontSize: 12, color: 'var(--accent)' }}>🔥 Trending</span>
                  )}
                </div>

                {/* Key Events */}
                {s?.key_events?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Key Events</div>
                    {s.key_events.map((e: string, k: number) => (
                      <div key={k} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '2px 0' }}>• {e}</div>
                    ))}
                  </div>
                )}

                {/* Risk Alerts */}
                {s?.risk_alerts?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 4 }}>⚠ Risk Alerts</div>
                    {s.risk_alerts.map((a: string, k: number) => (
                      <div key={k} style={{ fontSize: 13, color: 'var(--red)', padding: '2px 0' }}>• {a}</div>
                    ))}
                  </div>
                )}

                {/* Brief */}
                {s?.brief && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    {s.brief}
                  </p>
                )}
              </div>
            );
          })}

          <div style={{ textAlign: 'center', padding: '8px' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{results.powered_by}</span>
          </div>
        </div>
      )}
    </div>
  );
}
