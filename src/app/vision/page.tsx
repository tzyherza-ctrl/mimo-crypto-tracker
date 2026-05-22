'use client';
import { useState, useRef } from 'react';

export default function VisionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [coinName, setCoinName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, coin_name: coinName }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: 'Analysis failed' });
    }
    setLoading(false);
  }

  const analysis = result?.analysis;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Chart Vision Analyzer
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Upload a chart screenshot — MiMo vision identifies patterns & signals
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8, padding: '40px', textAlign: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
          background: dragActive ? 'rgba(139,92,246,0.05)' : 'var(--card)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {image ? (
          <img src={image} alt="Chart" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 6, border: '1px solid var(--border)' }} />
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Drop a chart image here or click to upload
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              PNG, JPG, WebP
            </div>
          </div>
        )}
      </div>

      {/* Coin name (optional) */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
          placeholder="Coin name (optional, e.g. Bitcoin)"
          style={{
            flex: 1, padding: '10px 16px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={analyze}
          disabled={loading || !image}
          style={{
            padding: '10px 24px',
            background: loading || !image ? 'var(--border)' : 'var(--accent)',
            border: 'none', borderRadius: 8,
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: loading || !image ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Chart'}
        </button>
      </div>

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
            MiMo vision analyzing chart patterns...
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Trend & Confidence */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '20px',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Trend</div>
              <div style={{
                fontSize: 18, fontWeight: 700, textTransform: 'capitalize',
                color: analysis.trend === 'bullish' ? 'var(--green)' : analysis.trend === 'bearish' ? 'var(--red)' : 'var(--yellow)',
              }}>
                {analysis.trend}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Timeframe</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{analysis.timeframe || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Confidence</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>{analysis.confidence}%</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Patterns</div>
              <div style={{ fontSize: 14 }}>{analysis.patterns?.join(', ') || 'None detected'}</div>
            </div>
          </div>

          {/* Summary */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '20px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              MiMo Vision Analysis
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{analysis.summary}</p>
          </div>

          {/* Levels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '20px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 8 }}>Support Levels</div>
              {analysis.support_levels?.map((l: number, i: number) => (
                <div key={i} style={{ fontSize: 14, fontFamily: 'monospace', padding: '4px 0' }}>${l.toLocaleString()}</div>
              ))}
            </div>
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '20px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>Resistance Levels</div>
              {analysis.resistance_levels?.map((l: number, i: number) => (
                <div key={i} style={{ fontSize: 14, fontFamily: 'monospace', padding: '4px 0' }}>${l.toLocaleString()}</div>
              ))}
            </div>
          </div>

          {/* Entry/Exit */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '20px',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            {[
              { label: 'Entry Zone', value: analysis.entry_zone, color: 'var(--green)' },
              { label: 'Exit Zone', value: analysis.exit_zone, color: 'var(--accent)' },
              { label: 'Stop Loss', value: analysis.stop_loss, color: 'var(--red)' },
            ].map((z, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{z.label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: z.color }}>{z.value || 'N/A'}</div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          {analysis.indicators && Object.keys(analysis.indicators).length > 0 && (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '20px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Indicators
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {Object.entries(analysis.indicators).map(([k, v]) => (
                  <span key={k} style={{
                    padding: '4px 10px', borderRadius: 4,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    fontSize: 13, fontFamily: 'monospace',
                  }}>
                    {k}: {v as string}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', padding: '8px' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.powered_by}</span>
          </div>
        </div>
      )}
    </div>
  );
}
