import { NextResponse } from "next/server";

const MIMO_API_KEY = process.env.MIMO_API_KEY || "";
const MIMO_BASE_URL = "https://api.xiaomimimo.com/v1";

export async function POST(request: Request) {
  const { message, context } = await request.json();

  if (!MIMO_API_KEY) {
    // Fallback: return a mock analysis when no API key is set
    return NextResponse.json({
      response: `📊 **Market Analysis (Demo Mode)**\n\nBased on the current market data: ${context || "No market context available"}\n\n**Key Insights:**\n• Market sentiment appears cautiously optimistic\n• Watch for BTC support levels around key moving averages\n• Consider dollar-cost averaging for long-term positions\n\n_Connect your MiMo API key for full AI-powered analysis._`,
      model: "MiMo-V2.5 (Demo)",
    });
  }

  try {
    const res = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MIMO_API_KEY}`,
      },
      body: JSON.stringify({
        model: "MiMo-V2.5",
        messages: [
          {
            role: "system",
            content: "You are MiMo Crypto Analyst, an AI assistant specialized in cryptocurrency market analysis. Provide concise, data-driven insights. Use bullet points and formatting. Always include risk disclaimers.",
          },
          { role: "user", content: `Market context: ${context}\n\nUser question: ${message}` },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    const data = await res.json();
    return NextResponse.json({
      response: data.choices?.[0]?.message?.content || "No response from MiMo",
      model: "MiMo-V2.5",
    });
  } catch (error) {
    return NextResponse.json({ error: "MiMo API error" }, { status: 500 });
  }
}
