"use client";
import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, Globe, ArrowUpRight, ArrowDownRight, Clock, Search } from "lucide-react";
import PriceChart from "@/components/PriceChart";

interface Coin {
  id: string; symbol: string; name: string; current_price: number;
  price_change_percentage_24h: number; market_cap: number; total_volume: number;
  image: string; sparkline_in_7d?: { price: number[] }; market_cap_rank: number;
}

function fmt(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalData, setGlobalData] = useState<any>(null);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [search, setSearch] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, g] = await Promise.all([fetch("/api/prices"), fetch("/api/global")]);
        setCoins(await c.json());
        setGlobalData(await g.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const gd = globalData?.data;
  const filtered = coins.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-8 gradient-border" style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.08) 0%, rgba(15,15,35,0.8) 40%, rgba(156,95,255,0.06) 100%)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(255,107,43,0.15), transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(156,95,255,0.2), transparent 70%)" }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium" style={{ background: "rgba(0,230,118,0.1)", color: "#00e676", border: "1px solid rgba(0,230,118,0.2)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
              LIVE
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <Clock size={12} />
              {time} UTC
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #a0a0c0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Market Overview
            </span>
          </h1>
          <p className="text-gray-500 text-sm max-w-lg leading-relaxed">
            Real-time intelligence across 17,000+ crypto assets. Powered by CoinGecko data with AI-driven analysis from Xiaomi MiMo V2.5.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Globe size={16} />, label: "Market Cap", value: fmt(gd?.total_market_cap?.usd || 0), change: gd?.market_cap_change_percentage_24h_usd, color: "#ff6b2b" },
          { icon: <BarChart3 size={16} />, label: "24h Volume", value: fmt(gd?.total_volume?.usd || 0), color: "#3d8bff" },
          { icon: <Zap size={16} />, label: "BTC Dominance", value: `${(gd?.market_cap_percentage?.btc || 0).toFixed(1)}%`, color: "#ffb800" },
          { icon: <Activity size={16} />, label: "Active Assets", value: (gd?.active_cryptocurrencies || 0).toLocaleString(), color: "#9c5fff" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
              <span className="text-[12px] text-gray-500 font-medium">{stat.label}</span>
            </div>
            <div className="text-xl font-bold tracking-tight font-mono">{stat.value}</div>
            {stat.change !== undefined && (
              <div className={`flex items-center gap-1 mt-1.5 text-[12px] font-medium ${stat.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {stat.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(stat.change).toFixed(2)}% <span className="text-gray-600">24h</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass-card p-6 gradient-border">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold">Price Chart</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">7-day price movement</p>
          </div>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="text-[13px] px-3 py-2 rounded-lg font-medium focus:outline-none transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0f0ff" }}
          >
            {coins.slice(0, 15).map((c) => (
              <option key={c.id} value={c.id} style={{ background: "#0a0a1a" }}>{c.name}</option>
            ))}
          </select>
        </div>
        <PriceChart coinId={selectedCoin} />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden gradient-border">
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <h2 className="text-base font-semibold">Top Cryptocurrencies</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">Ranked by market capitalization</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="text-[13px] pl-9 pr-3 py-2 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Fetching market data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-gray-500 uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Asset</th>
                  <th className="text-right px-5 py-3 font-medium">Price</th>
                  <th className="text-right px-5 py-3 font-medium">24h</th>
                  <th className="text-right px-5 py-3 font-medium hidden sm:table-cell">Market Cap</th>
                  <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Volume (24h)</th>
                  <th className="text-right px-5 py-3 font-medium hidden lg:table-cell">7d Chart</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((coin, i) => {
                  const isUp = coin.price_change_percentage_24h >= 0;
                  const sparkColor = isUp ? "#00e676" : "#ff3d5a";
                  return (
                    <tr
                      key={coin.id}
                      onClick={() => setSelectedCoin(coin.id)}
                      className="table-row cursor-pointer"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                    >
                      <td className="px-5 py-3.5 text-[13px] text-gray-600 font-mono">{coin.market_cap_rank || i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                          <div>
                            <div className="text-[13px] font-semibold">{coin.name}</div>
                            <div className="text-[11px] text-gray-500 uppercase">{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[13px] font-medium">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-md ${isUp ? "text-green-400" : "text-red-400"}`} style={{ background: isUp ? "rgba(0,230,118,0.08)" : "rgba(255,61,90,0.08)" }}>
                          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-gray-400 font-mono hidden sm:table-cell">{fmt(coin.market_cap)}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-gray-400 font-mono hidden md:table-cell">{fmt(coin.total_volume)}</td>
                      <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                        <div className="flex justify-end">
                          <MiniSparkline data={coin.sparkline_in_7d?.price || []} color={sparkColor} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-[11px] text-gray-600">
          Built with Next.js 15 + Xiaomi MiMo V2.5 &nbsp;•&nbsp; Data: CoinGecko API &nbsp;•&nbsp; © 2026 MiMo Crypto
        </p>
      </div>
    </div>
  );
}
