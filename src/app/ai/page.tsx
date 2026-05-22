"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, Loader2, Brain, Zap, Shield, BarChart3 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to **MiMo Crypto Analyst** 🔮\n\nI'm powered by Xiaomi MiMo V2.5 — specialized in crypto market intelligence.\n\n**What I can do:**\n• 📊 Real-time market trend analysis\n• 🔍 Deep-dive coin research & fundamentals\n• 📈 Portfolio strategy & risk assessment\n• ⚡ Sentiment analysis from market data\n\nTry asking me something below, or type your own question.",
      model: "MiMo-V2.5",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [marketContext, setMarketContext] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMarketContext(data.slice(0, 5).map((c: any) => `${c.name}: $${c.current_price.toLocaleString()} (${c.price_change_percentage_24h?.toFixed(2)}%)`).join(", "));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg, context: marketContext }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response || "No response.", model: data.model }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { icon: <TrendingUp size={14} />, text: "Analyze BTC trend for the next week", color: "#ff6b2b" },
    { icon: <BarChart3 size={14} />, text: "Best altcoins to accumulate now", color: "#3d8bff" },
    { icon: <Shield size={14} />, text: "Risk assessment for SOL position", color: "#9c5fff" },
    { icon: <Zap size={14} />, text: "Compare ETH vs BTC DCA strategy", color: "#00e676" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in-up">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold" style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.15), rgba(156,95,255,0.15))", border: "1px solid rgba(255,107,43,0.2)" }}>
          <Brain size={14} style={{ color: "#ff6b2b" }} />
          <span style={{ background: "linear-gradient(135deg, #ff6b2b, #9c5fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Powered by Xiaomi MiMo V2.5</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">AI Crypto Analyst</h1>
        <p className="text-gray-500 text-sm">Ask anything about crypto markets. MiMo provides data-driven insights in real-time.</p>
      </div>

      {/* Chat */}
      <div className="glass-card gradient-border overflow-hidden flex flex-col" style={{ height: "60vh" }}>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #ff6b2b, #ffb800)", boxShadow: "0 4px 12px rgba(255,107,43,0.3)" }}>
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`} style={msg.role === "user" ? { background: "linear-gradient(135deg, #ff6b2b, #e55a1b)", color: "white", boxShadow: "0 4px 16px rgba(255,107,43,0.2)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#e0e0f0" }}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.model && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                    <Sparkles size={10} /> {msg.model}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <User size={14} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff6b2b, #ffb800)" }}>
                <Bot size={16} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Loader2 size={14} className="animate-spin text-orange-400" />
                <span className="text-gray-400">MiMo is analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-5 pb-4 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s.text)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all hover:scale-[1.02]"
                style={{ background: `${s.color}08`, border: `1px solid ${s.color}20`, color: s.color }}
              >
                {s.icon} {s.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask MiMo about crypto markets..."
              className="flex-1 text-[13px] px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #ff6b2b, #e55a1b)", boxShadow: "0 4px 16px rgba(255,107,43,0.3)" }}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}
