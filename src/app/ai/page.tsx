"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to MiMo Crypto Analyst.\n\nI'm powered by Xiaomi MiMo V2.5, specialized in crypto market intelligence.\n\nTry asking me to:\n\u2022 Analyze BTC trend for the next week\n\u2022 Compare ETH vs BTC for DCA\n\u2022 Risk assessment for SOL position\n\u2022 Recommend altcoins to accumulate",
      model: "MiMo-V2.5",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d))
          setCtx(
            d
              .slice(0, 5)
              .map(
                (c: any) =>
                  `${c.name}: $${c.current_price} (${c.price_change_percentage_24h?.toFixed(2)}%)`
              )
              .join(", ")
          );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, context: ctx }),
      });
      const d = await r.json();
      setMessages((p) => [
        ...p,
        { role: "assistant", content: d.response || "No response.", model: d.model },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Connection error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#ededef]">
          AI Crypto Analyst
        </h1>
        <p className="text-[13px] text-[#70707b] mt-1">
          Powered by Xiaomi MiMo V2.5
        </p>
      </div>

      <div
        className="border border-[#222225] rounded-lg bg-[#111113] overflow-hidden flex flex-col"
        style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-white text-black"
                    : "bg-[#18181b] text-[#ededef] border border-[#222225]"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                {m.model && (
                  <div className="text-[10px] mt-1.5 opacity-40">
                    {m.model}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#18181b] border border-[#222225] rounded-lg px-3 py-2.5 flex items-center gap-2 text-[13px] text-[#52525b]">
                <Loader2 size={13} className="animate-spin" />
                Analyzing...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-3 sm:px-4 pb-3 flex flex-wrap gap-1.5">
            {[
              "Analyze BTC trend",
              "Best altcoins now",
              "Risk: SOL position",
              "ETH vs BTC DCA",
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="px-2.5 py-1 rounded-md text-[11px] text-[#70707b] bg-[#18181b] border border-[#222225] hover:border-[#3f3f46] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-[#222225]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about crypto..."
              className="flex-1 text-[13px] px-3 py-2 rounded-md bg-[#18181b] border border-[#222225] text-[#ededef] placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46]"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-md bg-white text-black hover:bg-[#e4e4e7] disabled:opacity-30 transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
