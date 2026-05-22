'use client';
import { useState } from 'react';

interface Holding {
  coin: string;
  amount: number;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { coin: 'bitcoin', amount: 0.5 },
    { coin: 'ethereum', amount: 5 },
    { coin: 'solana', amount: 100 },
  ]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newCoin, setNewCoin] = useState('');
  const [newAmount, setNewAmount] = useState('');

  function addHolding() {
    if (newCoin && newAmount) {
      setHoldings(prev => [...prev, { coin: newCoin.toLowerCase(), amount: parseFloat(newAmount) }]);
      setNewCoin('');
      setNewAmount('');
    }
  }

  function removeHolding(idx: number) {
    setHoldings(prev => prev.filter((_, i) => i !== idx));
  }

  async function analyze() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: 'Analysis failed' });
    }
    setLoading(false);
  }

  const advice = result?.advice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Portfolio Advisor
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          MiMo reasoning engine analyzes your portfolio for optimization
        </p>
      </div>

      {/* Holdings Editor */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '20px',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
          Your Holdings
        </div>

        {holdings.map((h, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 0', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
              }}>
                {h.coin.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{h.coin}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="number"
                value={h.amount}
                onChange={(e) => {
                  const newH = [...holdings];
                  newH[i].amount = parseFloat(e.target.value) || 0;
                  setHoldings(newH);
                }}
                style={{
                  width: 120, padding: '6px 10px', textAlign: 'right',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text)', fontSize: 14, fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => removeHolding(i)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: 'var(--red)', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Add new */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            type="text"
            placeholder="CoinGecko ID (e.g. bitcoin)"
            value={newCoin}
            onChange={(e) => setNewCoin(e.target.value)}
            style={{
              flex: 1, padding: '8px 12px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 6, color: 'var(--text)', fontSize: 13, outline: 'none',
            }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            style={{
              width: 120, padding: '8px 12px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 6, color: 'var(--text)', fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={addHolding}
            style={{
              padding: '8px 16px', background: 'var(--border)', border: 'none',
              borderRadius: 6, color: 'var(--text)', fontSize: 13, cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={loading || holdings.length === 0}
        style={{
          padding: '10px 24px', alignSelf: 'flex-start',
          background: loading ? 'var(--border)' : 'var(--accent)',
          border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Portfolio'}
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
            MiMo reasoning about your portfolio...
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && result.holdings && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Total Value */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '20px',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Total Value</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace' }}>
                ${result.total_value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            {advice && !advice.raw && (
              <>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Diversification</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace' }}>{advice.diversification_score}/100</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Risk Score</div>
                  <div style={{
                    fontSize: 24, fontWeight: 700, fontFamily: 'monospace',
                    color: advice.risk_score <= 30 ? 'var(--green)' : advice.risk_score <= 60 ? 'var(--yellow)' : 'var(--red)',
                  }}>
                    {advice.risk_score}/100
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Holdings Breakdown */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '20px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
              Holdings Breakdown
            </div>
            {result.holdings.map((h: any, i: number) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < result.holdings.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                  }}>
                    {h.symbol}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.amount} coins</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontFamily: 'monospace' }}>${h.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.allocation}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Advice */}
          {advice && !advice.raw && (
            <>
              {/* Summary */}
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '20px',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                  AI Analysis
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{advice.portfolio_summary}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '20px',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 8 }}>✓ Strengths</div>
                  {advice.strengths?.map((s: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>• {s}</div>
                  ))}
                </div>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '20px',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>✗ Weaknesses</div>
                  {advice.weaknesses?.map((w: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>• {w}</div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {advice.suggestions?.length > 0 && (
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '20px',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                    Actionable Suggestions
                  </div>
                  {advice.suggestions.map((s: any, i: number) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 0', borderBottom: i < advice.suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        background: s.action === 'buy' || s.action === 'add' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: s.action === 'buy' || s.action === 'add' ? 'var(--green)' : 'var(--red)',
                      }}>
                        {s.action}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{s.coin}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.reason}</div>
                      </div>
                      <span style={{
                        marginLeft: 'auto', padding: '2px 6px', borderRadius: 3,
                        fontSize: 10, background: s.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'var(--border)',
                        color: s.priority === 'high' ? 'var(--red)' : 'var(--text-muted)',
                      }}>
                        {s.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div style={{ textAlign: 'center', padding: '8px' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.powered_by}</span>
          </div>
        </div>
      )}
    </div>
  );
}
