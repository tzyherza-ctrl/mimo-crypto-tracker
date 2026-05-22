"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ChartDataPoint { time: string; price: number; }

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

  if (loading) return (
    <div className="h-72 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  if (!data.length) return <div className="h-72 flex items-center justify-center text-gray-500 text-sm">No data available</div>;

  const minPrice = Math.min(...data.map((d) => d.price)) * 0.999;
  const maxPrice = Math.max(...data.map((d) => d.price)) * 1.001;
  const isUp = data[data.length - 1].price >= data[0].price;
  const color = isUp ? "#00e676" : "#ff3d5a";
  const gradientId = `gradient-${coinId}`;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#4a4a6a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: "#4a4a6a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
            dx={-5}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10, 10, 26, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              color: "#f0f0ff",
              fontSize: "13px",
              padding: "12px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            labelStyle={{ color: "#6b6b8d", fontSize: "11px", marginBottom: "4px" }}
            formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "#050510" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
