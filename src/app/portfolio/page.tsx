"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Holding {
  id: string;
  coin: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
}

const COINS: Record<string, { name: string; symbol: string; price: number }> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", price: 77500 },
  ethereum: { name: "Ethereum", symbol: "ETH", price: 2130 },
  solana: { name: "Solana", symbol: "SOL", price: 87 },
  binancecoin: { name: "BNB", symbol: "BNB", price: 659 },
  ripple: { name: "XRP", symbol: "XRP", price: 1.37 },
  cardano: { name: "Cardano", symbol: "ADA", price: 0.25 },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", price: 0.106 },
};

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      id: "1",
      coin: "bitcoin",
      symbol: "BTC",
      amount: 0.5,
      buyPrice: 68000,
      currentPrice: 77500,
    },
    {
      id: "2",
      coin: "solana",
      symbol: "SOL",
      amount: 50,
      buyPrice: 65,
      currentPrice: 87,
    },
    {
      id: "3",
      coin: "ethereum",
      symbol: "ETH",
      amount: 3,
      buyPrice: 1850,
      currentPrice: 2130,
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoin, setNewCoin] = useState("bitcoin");
  const [newAmt, setNewAmt] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const val = holdings.reduce((s, h) => s + h.amount * h.currentPrice, 0);
  const cost = holdings.reduce((s, h) => s + h.amount * h.buyPrice, 0);
  const pnl = val - cost;
  const roi = cost > 0 ? (pnl / cost) * 100 : 0;

  const add = () => {
    if (!newAmt || !newPrice) return;
    const c = COINS[newCoin];
    setHoldings([
      ...holdings,
      {
        id: Date.now().toString(),
        coin: newCoin,
        symbol: c.symbol,
        amount: +newAmt,
        buyPrice: +newPrice,
        currentPrice: c.price,
      },
    ]);
    setNewAmt("");
    setNewPrice("");
    setShowAdd(false);
  };

  const inputCls =
    "text-[12px] px-2.5 py-1.5 rounded-md bg-[#18181b] border border-[#222225] text-[#70707b] focus:outline-none focus:border-[#3f3f46] w-full";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#ededef]">
            Portfolio
          </h1>
          <p className="text-[13px] text-[#70707b] mt-1">
            Track holdings and performance
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-black hover:bg-[#e4e4e7] transition-colors"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Add Asset</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Value",
            value: `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          },
          {
            label: "P&L",
            value: `${pnl >= 0 ? "+" : ""}$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            color: pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]",
          },
          {
            label: "ROI",
            value: `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`,
            color: roi >= 0 ? "text-[#22c55e]" : "text-[#ef4444]",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="border border-[#222225] rounded-lg p-3 sm:p-4 bg-[#111113]"
          >
            <p className="text-[10px] sm:text-[11px] text-[#52525b] uppercase tracking-wider font-medium mb-1.5 sm:mb-2">
              {s.label}
            </p>
            <p
              className={`text-sm sm:text-lg font-semibold tabular-nums ${s.color || "text-[#ededef]"}`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="border border-[#222225] rounded-lg bg-[#111113] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <select
              value={newCoin}
              onChange={(e) => setNewCoin(e.target.value)}
              className={inputCls}
            >
              {Object.entries(COINS).map(([id, c]) => (
                <option key={id} value={id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={newAmt}
              onChange={(e) => setNewAmt(e.target.value)}
              className={inputCls}
            />
            <input
              type="number"
              placeholder="Buy price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className={inputCls}
            />
            <button
              onClick={add}
              className="text-[12px] font-medium rounded-md bg-white text-black hover:bg-[#e4e4e7] transition-colors py-1.5"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="border border-[#222225] rounded-lg bg-[#111113] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-[#52525b] uppercase tracking-wider border-b border-[#222225]">
                <th className="text-left px-3 sm:px-4 py-2.5 font-medium">
                  Asset
                </th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium">
                  Amount
                </th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium hidden sm:table-cell">
                  Buy
                </th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium">
                  Current
                </th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium">
                  Value
                </th>
                <th className="text-right px-3 sm:px-4 py-2.5 font-medium">
                  P&L
                </th>
                <th className="px-3 sm:px-4 py-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const v = h.amount * h.currentPrice;
                const p =
                  ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100;
                const up = p >= 0;
                return (
                  <tr
                    key={h.id}
                    className="border-b border-[#19191b] hover:bg-[#18181b] transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] font-medium text-[#ededef]">
                      {h.symbol}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[13px] text-[#70707b] tabular-nums">
                      {h.amount}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[12px] text-[#52525b] tabular-nums hidden sm:table-cell">
                      ${h.buyPrice.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[13px] text-[#ededef] tabular-nums">
                      ${h.currentPrice.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[13px] text-[#ededef] font-medium tabular-nums whitespace-nowrap">
                      $
                      {v.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums ${
                          up ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                      >
                        {up ? (
                          <ArrowUpRight size={11} />
                        ) : (
                          <ArrowDownRight size={11} />
                        )}
                        {up ? "+" : ""}
                        {p.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                      <button
                        onClick={() =>
                          setHoldings(
                            holdings.filter((x) => x.id !== h.id)
                          )
                        }
                        className="text-[#3f3f46] hover:text-[#ef4444] transition-colors p-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
