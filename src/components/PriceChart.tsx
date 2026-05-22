"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDataPoint {
  time: string;
  price: number;
}

export default function PriceChart({ coinId }: { coinId: string }) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/chart?coin=${coinId}&days=7`)
      .then((r) => r.json())
      .then((d) => {
        const points = d.prices?.map((p: number[]) => ({
          time: new Date(p[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: p[1],
        })) || [];
        setData(points);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [coinId]);

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>;
  if (!data.length) return <div className="h-64 flex items-center justify-center text-gray-500">No data</div>;

  const minPrice = Math.min(...data.map((d) => d.price)) * 0.998;
  const maxPrice = Math.max(...data.map((d) => d.price)) * 1.002;
  const isUp = data[data.length - 1].price >= data[0].price;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[minPrice, maxPrice]} tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <Tooltip
            contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb" }}
            formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke={isUp ? "#22c55e" : "#ef4444"} fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
