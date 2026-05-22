"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import PriceChart from "@/components/PriceChart";

interface Coin {
  id: string; symbol: string; name: string; current_price: number;
  price_change_percentage_24h: number; market_cap: number; total_volume: number;
  image: string; market_cap_rank: number; sparkline_in_7d?: { price: number[] };
}

function fmt(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function MiniSpark({ data, up }: { data: number[]; up: boolean }) {
  if (!data?.length) return null;
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 64},${28 - ((v - min) / r) * 24}`).join(" ");
  return (
    <svg width="64" height="28" className="opacity-50">
      <polyline fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="1.5" points={pts} />
    </svg>
  );
}

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [gd, setGd] = useState<any>(null);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [c, g] = await Promise.all([fetch("/api/prices"), fetch("/api/global")]);
        setCoins(await c.json());
        setGd((await g.json()).data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = coins.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Market Overview</h1>
        <p className="text-[13px] text-[#70707b] mt-1">Real-time data across 17,000+ assets · Refreshes every 30s</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Market Cap", val: fmt(gd?.total_market_cap?.usd || 0), chg: gd?.market_cap_change_percentage_24h_usd },
          { label: "24h Volume", val: fmt(gd?.total_volume?.usd || 0) },
          { label: "BTC Dominance", val: `${(gd?.market_cap_percentage?.btc || 0).toFixed(1)}%` },
          { label: "Active Assets", val: (gd?.active_cryptocurrencies || 0).toLocaleString() },
        ].map((s, i) => (
          <div key={i} className="border border-[#222225] rounded-lg p-4 bg-[#111113]">
            <p className="text-[11px] text-[#52525b] uppercase tracking-wider font-medium mb-2">{s.label}</p>
            <p className="text-lg font-semibold text-white font-[system-ui]">{s.val}</p>
            {s.chg !== undefined && (
              <p className={`flex items-center gap-1 text-[12px] mt-1 ${s.chg >= 0 ? "text-green-400" : "text-red-400"}`}>
                {s.chg >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(s.chg).toFixed(2)}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="border border-[#222225] rounded-lg bg-[#111113] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-white">Price Chart</h2>
            <p className="text-[11px] text-[#52525b] mt-0.5">7-day history</p>
          </div>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="text-[12px] bg-[#18181b] border border-[#222225] text-[#70707b] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#3f3f46]"
          >
            {coins.slice(0, 15).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <PriceChart coinId={selectedCoin} />
      </div>

      {/* Table */}
      <div className="border border-[#222225] rounded-lg bg-[#111113] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#222225]">
          <h2 className="text-sm font-medium text-white">Top Cryptocurrencies</h2>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#52525b]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter..."
              className="text-[12px] pl-8 pr-2.5 py-1.5 rounded-md bg-[#18181b] border border-[#222225] text-[#70707b] w-36 focus:outline-none focus:border-[#3f3f46]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-5 h-5 border-2 border-[#3f3f46] border-t-white rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-[#52525b] uppercase tracking-wider border-b border-[#222225]">
                <th className="text-left px-4 py-2.5 font-medium">#</th>
                <th className="text-left px-4 py-2.5 font-medium">Asset</th>
                <th className="text-right px-4 py-2.5 font-medium">Price</th>
                <th className="text-right px-4 py-2.5 font-medium">24h</th>
                <th className="text-right px-4 py-2.5 font-medium hidden sm:table-cell">Market Cap</th>
                <th className="text-right px-4 py-2.5 font-medium hidden md:table-cell">Volume</th>
                <th className="text-right px-4 py-2.5 font-medium hidden lg:table-cell">7d</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const up = c.price_change_percentage_24h >= 0;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCoin(c.id)}
                    className="border-b border-[#19191b] hover:bg-[#18181b] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-[12px] text-[#52525b]">{c.market_cap_rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={c.image} alt="" className="w-5 h-5 rounded-full" />
                        <div>
                          <span className="text-[13px] font-medium text-white">{c.name}</span>
                          <span className="ml-1.5 text-[11px] text-[#52525b] uppercase">{c.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] text-white font-[system-ui] tabular-nums">
                      ${c.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums ${up ? "text-green-400" : "text-red-400"}`}>
                        {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {Math.abs(c.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] text-[#70707b] tabular-nums hidden sm:table-cell">{fmt(c.market_cap)}</td>
                    <td className="px-4 py-3 text-right text-[12px] text-[#70707b] tabular-nums hidden md:table-cell">{fmt(c.total_volume)}</td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <div className="flex justify-end"><MiniSpark data={c.sparkline_in_7d?.price || []} up={up} /></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-[11px] text-[#3f3f46] pt-2">
        Built with Next.js 15 + Xiaomi MiMo V2.5 · Data: CoinGecko · © 2026
      </p>
    </div>
  );
}
