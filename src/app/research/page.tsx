'use client';
import { useState, useEffect } from 'react';

export default function ResearchPage() {
  const [coin, setCoin] = useState('bitcoin');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');

  const popularCoins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'xrp', 'dogecoin', 'avalanche-2', 'chainlink'];

  async function runResearch() {
    setLoading(true);
    setResult(null);
    setStreamedText('');
    
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: 'Failed to run research' });
    }
    setLoading(false);
  }

  const analysis = result?.analysis;
  const coinData = result?.coin;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          AI Research Agent
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          MiMo reasoning + web search → deep coin analysis
        </p>
      </div>

      {/* Coin Selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {popularCoins.map(c => (
          <button
            key={c}
            onClick={() => setCoin(c)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: `1px solid ${coin === c ? 'var(--accent)' : 'var(--border)'}`,
              background: coin === c ? 'rgba(139,92,246,0.1)' : 'var(--card)',
              color: coin === c ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {c.replace('-2', '').replace('avalanche-2', 'avax')}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          placeholder="CoinGecko coin ID (e.g. bitcoin)"
          style={{
            flex: 1, padding: '10px 16px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={runResearch}
          disabled={loading}
          style={{
            padding: '10px 24px',
            background: loading ? 'var(--border)' : 'var(--accent)',
            border: 'none', borderRadius: 8,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Analyzing...' : 'Research'}
        </button>
      </div>

      {/* Loading */}
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
            MiMo is researching {coin}...<br/>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Fetching market data → Web search → Reasoning analysis
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Market Data Card */}
          {coinData && (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '20px',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
            }}>
              {[
                { label: 'Price', value: `$${coinData.price?.toLocaleString()}` },
                { label: 'Market Cap', value: `$${(coinData.market_cap / 1e9)?.toFixed(2)}B` },
                { label: '24h Change', value: `${coinData.price_change_24h?.toFixed(2)}%`, color: coinData.price_change_24h >= 0 ? 'var(--green)' : 'var(--red)' },
                { label: '7d Change', value: `${coinData.price_change_7d?.toFixed(2)}%`, color: coinData.price_change_7d >= 0 ? 'var(--green)' : 'var(--red)' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'monospace', color: s.color || 'var(--text)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Verdict */}
          {analysis && !analysis.raw && (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>AI Verdict</div>
                  <div style={{
                    fontSize: 20, fontWeight: 700, textTransform: 'uppercase',
                    color: analysis.verdict?.includes('buy') ? 'var(--green)' : 
                           analysis.verdict?.includes('sell') ? 'var(--red)' : 'var(--yellow)',
                  }}>
                    {analysis.verdict?.replace('_', ' ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Confidence</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}>{analysis.confidence}%</div>
                </div>
              </div>

              {/* Score bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Fundamentals', score: analysis.fundamentals?.score },
                  { label: 'Tokenomics', score: analysis.tokenomics?.score },
                  { label: 'Sentiment', score: analysis.sentiment?.score },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{s.score}/10</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(s.score || 0) * 10}%`,
                        height: '100%',
                        background: (s.score || 0) >= 7 ? 'var(--green)' : (s.score || 0) >= 4 ? 'var(--yellow)' : 'var(--red)',
                        borderRadius: 2,
                        transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Risk */}
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 4,
                fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                background: analysis.risk_level === 'low' ? 'rgba(34,197,94,0.1)' :
                           analysis.risk_level === 'medium' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                color: analysis.risk_level === 'low' ? 'var(--green)' :
                       analysis.risk_level === 'medium' ? 'var(--yellow)' : 'var(--red)',
                marginBottom: 12,
              }}>
                Risk: {analysis.risk_level}
              </div>

              {/* Summary */}
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                {analysis.summary}
              </p>

              {/* Bull/Bear */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '12px', background: 'rgba(34,197,94,0.05)', borderRadius: 6, border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 6 }}>🐂 Bull Case</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.bull_case}</p>
                </div>
                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>🐻 Bear Case</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{analysis.bear_case}</p>
                </div>
              </div>
            </div>
          )}

          {/* News & Sentiment */}
          {result.news_summary && (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '20px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Latest News (via MiMo Web Search)
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.news_summary}
              </p>
            </div>
          )}

          {/* Powered by badge */}
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {result.powered_by}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
