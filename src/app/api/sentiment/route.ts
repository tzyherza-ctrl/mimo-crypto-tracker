import { NextRequest, NextResponse } from 'next/server';
import { mimoReason, mimoWebSearch } from '@/lib/mimo';

export async function POST(req: NextRequest) {
  try {
    const { coins } = await req.json();
    // coins: ['bitcoin', 'ethereum', 'solana']

    const results = await Promise.all(
      coins.map(async (coin: string) => {
        // Web search for each coin
        const [news, social, onchain] = await Promise.all([
          mimoWebSearch(`${coin} crypto news latest developments today`),
          mimoWebSearch(`${coin} twitter reddit community sentiment reaction`),
          mimoWebSearch(`${coin} on-chain whale activity transaction volume`),
        ]);

        // MiMo reasoning for sentiment analysis
        const sentiment = await mimoReason([
          {
            role: 'system',
            content: `You are a crypto sentiment analyst. Rate sentiment from -100 (extreme fear) to +100 (extreme greed).
Respond in JSON:
{
  "overall_sentiment": -100 to 100,
  "news_sentiment": -100 to 100,
  "social_sentiment": -100 to 100,
  "onchain_sentiment": -100 to 100,
  "label": "extreme_fear" | "fear" | "neutral" | "greed" | "extreme_greed",
  "key_events": ["string"],
  "whale_activity": "accumulating" | "distributing" | "neutral",
  "trending": boolean,
  "risk_alerts": ["string"],
  "brief": "1-2 sentence summary"
}`
          },
          {
            role: 'user',
            content: `Analyze sentiment for ${coin}:

NEWS:
${news}

SOCIAL MEDIA:
${social}

ON-CHAIN:
${onchain}

Provide sentiment analysis as JSON.`
          }
        ]);

        let parsed;
        try {
          const jsonMatch = sentiment.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: sentiment };
        } catch {
          parsed = { raw: sentiment };
        }

        return { coin, sentiment: parsed };
      })
    );

    return NextResponse.json({
      results,
      scanned_at: new Date().toISOString(),
      powered_by: 'MiMo-V2.5 Web Search + Reasoning',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
