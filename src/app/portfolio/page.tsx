"use client";
import { useState } from "react";
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart } from "lucide-react";

interface Holding {
  id: string; coin: string; symbol: string; amount: number; buyPrice: number; currentPrice: number;
}

const COINS: Record<string, { name: string; symbol: string; price: number }> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", price: 77441 },
  ethereum: { name: "Ethereum", symbol: "ETH", price: 2129 },
  solana: { name: "Solana", symbol: "SOL", price: 86.72 },
  binancecoin: { name: "BNB", symbol: "BNB", price: 657 },
  ripple: { name: "XRP", symbol: "XRP", price: 1.37 },
  cardano: { name: "Cardano", symbol: "ADA", price: 0.25 },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", price: 0.106 },
  avalanche: { name: "Avalanche", symbol: "AVAX", price: 22.5 },
};

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { id: "1", coin: "bitcoin", symbol: "BTC", amount: 0.5, buyPrice: 68000, currentPrice: 77441 },
    { id: "2", coin: "solana", symbol: "SOL", amount: 50, buyPrice: 65, currentPrice: 86.72 },
    { id: "3", coin: "ethereum", symbol: "ETH", amount: 3, buyPrice: 1850, currentPrice: 2129 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoin, setNewCoin] = useState("bitcoin");
  const [newAmount, setNewAmount] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");

  const totalValue = holdings.reduce((s, h) => s + h.amount * h.currentPrice, 0);
  const totalCost = holdings.reduce((s, h) => s + h.amount * h.buyPrice, 0);
  const totalPnl = totalValue - totalCost;
  const roi = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const addHolding = () => {
    if (!newAmount || !newBuyPrice) return;
    const coin = COINS[newCoin];
    setHoldings([...holdings, { id: Date.now().toString(), coin: newCoin, symbol: coin.symbol, amount: parseFloat(newAmount), buyPrice: parseFloat(newBuyPrice), currentPrice: coin.price }]);
    setNewAmount(""); setNewBuyPrice(""); setShowAdd(false);
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">Track your holdings and performance</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #ff6b2b, #ff8f40)", color: "white", boxShadow: "0 4px 20px rgba(255,107,43,0.3)" }}>
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Portfolio Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <Wallet size={16} />, color: "#ff6b2b" },
          { label: "Total P&L", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: totalPnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, color: totalPnl >= 0 ? "#00e676" : "#ff3d5a" },
          { label: "ROI", value: `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`, icon: <PieChart size={16} />, color: roi >= 0 ? "#00e676" : "#ff3d5a" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 gradient-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <span className="text-[12px] text-gray-500 font-medium">{s.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="glass-card p-5 gradient-border" style={{ borderColor: "rgba(255,107,43,0.2)" }}>
          <h3 className="font-semibold text-sm mb-4">Add New Holding</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={newCoin} onChange={(e) => setNewCoin(e.target.value)} className="text-[13px] px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {Object.entries(COINS).map(([id, c]) => <option key={id} value={id} style={{ background: "#0a0a1a" }}>{c.name} ({c.symbol})</option>)}
            </select>
            <input type="number" placeholder="Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="text-[13px] px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
            <input type="number" placeholder="Avg buy price (USD)" value={newBuyPrice} onChange={(e) => setNewBuyPrice(e.target.value)} className="text-[13px] px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
            <button onClick={addHolding} className="text-[13px] font-semibold rounded-xl transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #00e676, #00c853)", color: "white", boxShadow: "0 4px 20px rgba(0,230,118,0.2)" }}>Add</button>
          </div>
        </div>
      )}

      {/* Holdings */}
      <div className="glass-card overflow-hidden gradient-border">
        <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <h2 className="text-base font-semibold">Holdings</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-gray-500 uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <th className="text-left px-5 py-3 font-medium">Asset</th>
              <th className="text-right px-5 py-3 font-medium">Amount</th>
              <th className="text-right px-5 py-3 font-medium">Avg Buy</th>
              <th className="text-right px-5 py-3 font-medium">Current</th>
              <th className="text-right px-5 py-3 font-medium">Value</th>
              <th className="text-right px-5 py-3 font-medium">P&L</th>
              <th className="text-right px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const val = h.amount * h.currentPrice;
              const pnl = (h.currentPrice - h.buyPrice) * h.amount;
              const pct = ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100;
              const isUp = pnl >= 0;
              return (
                <tr key={h.id} className="table-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                  <td className="px-5 py-3.5 font-semibold text-[13px]">{h.symbol}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px]">{h.amount}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] text-gray-400">${h.buyPrice.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px]">${h.currentPrice.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] font-medium">${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-md ${isUp ? "text-green-400" : "text-red-400"}`} style={{ background: isUp ? "rgba(0,230,118,0.08)" : "rgba(255,61,90,0.08)" }}>
                      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {isUp ? "+" : ""}{pct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setHoldings(holdings.filter((x) => x.id !== h.id))} className="text-gray-600 hover:text-red-400 transition p-1"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
