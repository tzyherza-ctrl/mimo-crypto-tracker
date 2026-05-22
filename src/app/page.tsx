"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap } from "lucide-react";
import PriceChart from "@/components/PriceChart";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
  image: string;
}

function formatNum(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function StatCard({ icon, label, value, change }: { icon: React.ReactNode; label: string; value: string; change?: number }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-gray-800">{icon}</div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-sm ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
          {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalData, setGlobalData] = useState<any>(null);
  const [selectedCoin, setSelectedCoin] = useState<string>("bitcoin");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coinsRes, globalRes] = await Promise.all([
          fetch("/api/prices"),
          fetch("/api/global"),
        ]);
        const coinsData = await coinsRes.json();
        const globalDataRes = await globalRes.json();
        setCoins(coinsData);
        setGlobalData(globalDataRes);
      } catch (e) {
        console.error("Failed to fetch:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalMcap = globalData?.data?.total_market_cap?.usd || 0;
  const totalVol = globalData?.data?.total_volume?.usd || 0;
  const btcDom = globalData?.data?.market_cap_percentage?.btc || 0;
  const activeCryptos = globalData?.data?.active_cryptocurrencies || 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950/30 border border-gray-800 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Crypto Market Dashboard
        </h1>
        <p className="text-gray-400 max-w-xl">
          Real-time market data powered by CoinGecko with AI-driven analysis from Xiaomi MiMo.
          Track prices, analyze trends, and manage your portfolio.
        </p>
        <div className="flex items-center gap-2 mt-4 text-sm text-orange-400">
          <Activity size={14} className="animate-pulse" />
          <span>Live data • Refreshes every 30s</span>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={18} className="text-green-400" />} label="Total Market Cap" value={formatNum(totalMcap)} change={coins[0]?.price_change_percentage_24h} />
        <StatCard icon={<BarChart3 size={18} className="text-blue-400" />} label="24h Volume" value={formatNum(totalVol)} />
        <StatCard icon={<Zap size={18} className="text-amber-400" />} label="BTC Dominance" value={`${btcDom.toFixed(1)}%`} />
        <StatCard icon={<Activity size={18} className="text-purple-400" />} label="Active Cryptos" value={activeCryptos.toLocaleString()} />
      </div>

      {/* Price Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Price Chart — 7 Days</h2>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
          >
            {coins.slice(0, 10).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <PriceChart coinId={selectedCoin} />
      </div>

      {/* Coins Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Top Cryptocurrencies</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
            Loading market data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Coin</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">24h %</th>
                  <th className="text-right px-4 py-3">Market Cap</th>
                  <th className="text-right px-4 py-3">Volume (24h)</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, i) => (
                  <tr key={coin.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition cursor-pointer" onClick={() => setSelectedCoin(coin.id)}>
                    <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <div>
                          <span className="font-medium">{coin.name}</span>
                          <span className="ml-2 text-xs text-gray-500 uppercase">{coin.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">${coin.current_price.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 font-mono">{formatNum(coin.market_cap)}</td>
                    <td className="px-4 py-3 text-right text-gray-400 font-mono">{formatNum(coin.total_volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 py-4">
        Built with Next.js 15 + Xiaomi MiMo AI • Data from CoinGecko • © 2026 MiMo Crypto Tracker
      </footer>
    </div>
  );
}
