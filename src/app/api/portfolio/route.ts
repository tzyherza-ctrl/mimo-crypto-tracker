import { NextRequest, NextResponse } from 'next/server';
import { mimoReason } from '@/lib/mimo';
import { getTopCoins } from '@/lib/coingecko';

export async function POST(req: NextRequest) {
  try {
    const { holdings } = await req.json();
    // holdings: [{ coin: 'bitcoin', amount: 0.5 }, { coin: 'ethereum', amount: 10 }]

    const coins = await getTopCoins(100);
    
    // Calculate portfolio values
    const portfolio = holdings.map((h: any) => {
      const coinData = coins.find((c: any) => c.id === h.coin);
      return {
        ...h,
        name: coinData?.name,
        symbol: coinData?.symbol?.toUpperCase(),
        price: coinData?.current_price,
        value: (coinData?.current_price || 0) * h.amount,
        change_24h: coinData?.price_change_percentage_24h,
        change_7d: coinData?.price_change_percentage_7d_in_currency,
        market_cap: coinData?.market_cap,
        category: coinData?.categories?.[0],
      };
    });

    const totalValue = portfolio.reduce((sum: number, p: any) => sum + p.value, 0);
    const allocations = portfolio.map((p: any) => ({
      ...p,
      allocation: ((p.value / totalValue) * 100).toFixed(1),
    }));

    // MiMo reasoning for portfolio advice
    const advice = await mimoReason([
      {
        role: 'system',
        content: `You are a crypto portfolio manager. Analyze the portfolio and provide actionable advice.
Respond in JSON:
{
  "overall_score": 1-100,
  "diversification_score": 1-100,
  "risk_score": 1-100,
  "portfolio_summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": [
    { "action": "buy" | "sell" | "reduce" | "add", "coin": "string", "reason": "string", "priority": "high" | "medium" | "low" }
  ],
  "risk_assessment": "string",
  "recommended_allocation": { "coin": "percentage" }
}`
      },
      {
        role: 'user',
        content: `Portfolio Analysis Request:

Total Value: $${totalValue.toLocaleString()}

Holdings:
${allocations.map((a: any) => `- ${a.name} (${a.symbol}): ${a.amount} coins = $${a.value.toLocaleString()} (${a.allocation}% of portfolio) | 24h: ${a.change_24h?.toFixed(2)}% | 7d: ${a.change_7d?.toFixed(2)}%`).join('\n')}

Provide detailed portfolio advice as JSON.`
      }
    ]);

    let parsedAdvice;
    try {
      const jsonMatch = advice.match(/\{[\s\S]*\}/);
      parsedAdvice = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: advice };
    } catch {
      parsedAdvice = { raw: advice };
    }

    return NextResponse.json({
      holdings: allocations,
      total_value: totalValue,
      advice: parsedAdvice,
      powered_by: 'MiMo-V2.5 Reasoning Engine',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
