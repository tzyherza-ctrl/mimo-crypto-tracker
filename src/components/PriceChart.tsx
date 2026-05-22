"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChartArea = dynamic(() => import("./RechartArea"), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-5 h-5 border-2 border-[#3f3f46] border-t-white rounded-full animate-spin" /></div>,
});

export default function PriceChart({ coinId }: { coinId: string }) {
  const [data, setData] = useState<{ time: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/chart?coin=${coinId}&days=7`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.prices?.map((p: number[]) => ({
          time: new Date(p[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: p[1],
        })) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [coinId]);

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-5 h-5 border-2 border-[#3f3f46] border-t-white rounded-full animate-spin" /></div>;
  if (!data.length) return <div className="h-64 flex items-center justify-center text-[#52525b] text-sm">No data</div>;

  return <ChartArea data={data} coinId={coinId} />;
}
