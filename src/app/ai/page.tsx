"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Welcome to MiMo Crypto AI**\n\nI'm powered by Xiaomi MiMo V2.5, specialized in crypto market analysis. Ask me about:\n\n• 📊 Market trends and price analysis\n• 🔍 Specific coin deep-dives\n• 📈 Portfolio strategy recommendations\n• ⚠️ Risk assessment\n\nWhat would you like to analyze?",
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
          const summary = data
            .slice(0, 5)
            .map((c: any) => `${c.name}: $${c.current_price.toLocaleString()} (${c.price_change_percentage_24h?.toFixed(2)}%)`)
            .join(", ");
          setMarketContext(summary);
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, context: marketContext }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Sorry, I couldn't process that.", model: data.model },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Analyze BTC trend for the next week",
    "What are the best altcoins right now?",
    "Risk assessment for SOL long position",
    "Compare ETH vs BTC for DCA strategy",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm">
          <Sparkles size={14} /> Powered by Xiaomi MiMo V2.5
        </div>
        <h1 className="text-2xl font-bold">AI Crypto Analyst</h1>
        <p className="text-gray-400 text-sm">Ask anything about crypto markets. MiMo provides real-time analysis.</p>
      </div>

      {/* Chat Container */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden flex flex-col" style={{ height: "60vh" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.model && (
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Sparkles size={10} /> {msg.model}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 size={14} className="animate-spin" /> MiMo is analyzing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-300 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask MiMo about crypto..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
