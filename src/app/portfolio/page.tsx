"use client";
import { useState } from "react";
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface Holding {
  id: string;
  coin: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
}

const COINS: Record<string, { name: string; symbol: string; price: number }> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", price: 103500 },
  ethereum: { name: "Ethereum", symbol: "ETH", price: 2520 },
  solana: { name: "Solana", symbol: "SOL", price: 172 },
  "binancecoin": { name: "BNB", symbol: "BNB", price: 658 },
  ripple: { name: "XRP", symbol: "XRP", price: 2.34 },
  cardano: { name: "Cardano", symbol: "ADA", price: 0.76 },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", price: 0.228 },
  avalanche: { name: "Avalanche", symbol: "AVAX", price: 22.5 },
};

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { id: "1", coin: "bitcoin", symbol: "BTC", amount: 0.5, buyPrice: 95000, currentPrice: 103500 },
    { id: "2", coin: "solana", symbol: "SOL", amount: 50, buyPrice: 145, currentPrice: 172 },
    { id: "3", coin: "ethereum", symbol: "ETH", amount: 3, buyPrice: 2200, currentPrice: 2520 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoin, setNewCoin] = useState("bitcoin");
  const [newAmount, setNewAmount] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");

  const totalValue = holdings.reduce((sum, h) => sum + h.amount * h.currentPrice, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.amount * h.buyPrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const addHolding = () => {
    if (!newAmount || !newBuyPrice) return;
    const coin = COINS[newCoin];
    setHoldings([...holdings, {
      id: Date.now().toString(),
      coin: newCoin,
      symbol: coin.symbol,
      amount: parseFloat(newAmount),
      buyPrice: parseFloat(newBuyPrice),
      currentPrice: coin.price,
    }]);
    setNewAmount("");
    setNewBuyPrice("");
    setShowAdd(false);
  };

  const removeHolding = (id: string) => {
    setHoldings(holdings.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Track your crypto holdings and PnL</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Add Holding
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Wallet size={16} /> Total Value</div>
          <div className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="text-gray-400 text-sm mb-1">Total P&L</div>
          <div className={`text-2xl font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="text-gray-400 text-sm mb-1">ROI</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${totalPnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalPnlPercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {totalPnlPercent >= 0 ? "+" : ""}{totalPnlPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-gray-900/50 border border-orange-500/30 rounded-xl p-5">
          <h3 className="font-medium mb-4">Add New Holding</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={newCoin} onChange={(e) => setNewCoin(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
              {Object.entries(COINS).map(([id, c]) => <option key={id} value={id}>{c.name} ({c.symbol})</option>)}
            </select>
            <input type="number" placeholder="Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
            <input type="number" placeholder="Buy price (USD)" value={newBuyPrice} onChange={(e) => setNewBuyPrice(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
            <button onClick={addHolding} className="bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 text-sm font-medium transition">Add</button>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
              <th className="text-left px-4 py-3">Asset</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-right px-4 py-3">Buy Price</th>
              <th className="text-right px-4 py-3">Current</th>
              <th className="text-right px-4 py-3">Value</th>
              <th className="text-right px-4 py-3">P&L</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const value = h.amount * h.currentPrice;
              const pnl = (h.currentPrice - h.buyPrice) * h.amount;
              const pnlPct = ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100;
              return (
                <tr key={h.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3 font-medium">{h.symbol}</td>
                  <td className="px-4 py-3 text-right font-mono">{h.amount}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-400">${h.buyPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">${h.currentPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className={`px-4 py-3 text-right font-medium ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => removeHolding(h.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
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
