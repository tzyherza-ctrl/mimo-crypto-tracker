import { NextRequest, NextResponse } from 'next/server';
import { mimoReason, mimoWebSearch } from '@/lib/mimo';
import { getCoinDetail } from '@/lib/coingecko';

export async function POST(req: NextRequest) {
  try {
    const { coin } = await req.json();
    
    // 1. Get real market data from CoinGecko
    const detail = await getCoinDetail(coin.toLowerCase());
    
    const marketData = {
      name: detail.name,
      symbol: detail.symbol,
      price: detail.market_data?.current_price?.usd,
      market_cap: detail.market_data?.market_cap?.usd,
      volume: detail.market_data?.total_volume?.usd,
      price_change_24h: detail.market_data?.price_change_percentage_24h,
      price_change_7d: detail.market_data?.price_change_percentage_7d,
      ath: detail.market_data?.ath?.usd,
      ath_change: detail.market_data?.ath_change_percentage?.usd,
      circulating: detail.market_data?.circulating_supply,
      total_supply: detail.market_data?.total_supply,
      categories: detail.categories,
      description: detail.description?.en?.slice(0, 500),
    };

    // 2. MiMo web search for latest news & sentiment
    const [newsResult, socialResult] = await Promise.all([
      mimoWebSearch(`${detail.name} crypto news today latest developments 2025`),
      mimoWebSearch(`${detail.name} ${detail.symbol} social media sentiment community reaction`)
    ]);

    // 3. MiMo reasoning - deep analysis
    const analysis = await mimoReason([
      {
        role: 'system',
        content: `You are a senior crypto research analyst. Provide a structured, objective analysis. 
Format your response as JSON with these fields:
- summary: 2-3 sentence overview
- fundamentals: { score: 1-10, analysis: string }
- tokenomics: { score: 1-10, analysis: string }
- sentiment: { score: 1-10, analysis: string }
- risk_level: "low" | "medium" | "high" | "extreme"
- bull_case: string
- bear_case: string  
- key_metrics: string[]
- verdict: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell"
- confidence: 1-100`
      },
      {
        role: 'user',
        content: `Analyze ${detail.name} (${detail.symbol.toUpperCase()}):

MARKET DATA:
- Price: $${marketData.price}
- Market Cap: $${marketData.market_cap?.toLocaleString()}
- 24h Volume: $${marketData.volume?.toLocaleString()}
- 24h Change: ${marketData.price_change_24h?.toFixed(2)}%
- 7d Change: ${marketData.price_change_7d?.toFixed(2)}%
- ATH: $${marketData.ath} (${marketData.ath_change?.toFixed(1)}% from ATH)
- Circulating Supply: ${marketData.circulating?.toLocaleString()}
- Total Supply: ${marketData.total_supply?.toLocaleString()}
- Categories: ${marketData.categories?.join(', ')}

LATEST NEWS (from web search):
${newsResult}

SOCIAL SENTIMENT (from web search):
${socialResult}

Provide your deep analysis as JSON.`
      }
    ]);

    // Parse MiMo's analysis
    let parsedAnalysis;
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: analysis };
    } catch {
      parsedAnalysis = { raw: analysis };
    }

    return NextResponse.json({
      coin: marketData,
      news_summary: newsResult,
      social_sentiment: socialResult,
      analysis: parsedAnalysis,
      generated_at: new Date().toISOString(),
      powered_by: 'MiMo-V2.5 Reasoning + Web Search',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
