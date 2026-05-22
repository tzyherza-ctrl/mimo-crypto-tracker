"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function RechartArea({ data, coinId }: { data: { time: string; price: number }[]; coinId: string }) {
  const min = Math.min(...data.map((d) => d.price)) * 0.999;
  const max = Math.max(...data.map((d) => d.price)) * 1.001;
  const up = data[data.length - 1].price >= data[0].price;
  const color = up ? "#22c55e" : "#ef4444";
  const gid = `g-${coinId}`;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} dy={8} />
          <YAxis domain={[min, max]} tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${Number(v).toLocaleString()}`} dx={-4} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#ededef", fontSize: "12px", padding: "8px 12px" }}
            labelStyle={{ color: "#52525b", fontSize: "10px" }}
            formatter={(v: any) => [`$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke={color} fill={`url(#${gid})`} strokeWidth={1.5} dot={false} activeDot={{ r: 3, stroke: color, strokeWidth: 2, fill: "#09090b" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
