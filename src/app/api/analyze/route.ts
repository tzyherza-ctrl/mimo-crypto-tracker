import { NextRequest, NextResponse } from 'next/server';
import { mimoVision } from '@/lib/mimo';

export async function POST(req: NextRequest) {
  try {
    const { image, coin_name } = await req.json();
    
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    
    const analysis = await mimoVision(
      base64Data,
      `You are an expert crypto technical analyst. Analyze this chart${coin_name ? ` for ${coin_name}` : ''}.

Identify:
1. Chart type and timeframe
2. Current trend (bullish/bearish/neutral)
3. Key support and resistance levels
4. Chart patterns (triangles, channels, H&S, double top/bottom, etc.)
5. Volume analysis
6. Key indicators if visible (RSI, MACD, Moving Averages)
7. Potential entry/exit zones
8. Risk assessment

Format as JSON:
{
  "trend": "bullish" | "bearish" | "neutral",
  "timeframe": "string",
  "patterns": ["pattern1", "pattern2"],
  "support_levels": [number],
  "resistance_levels": [number],
  "indicators": { "name": "reading" },
  "entry_zone": "string",
  "exit_zone": "string",
  "stop_loss": "string",
  "confidence": 1-100,
  "summary": "2-3 sentence analysis"
}`
    );

    let parsed;
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: analysis };
    } catch {
      parsed = { raw: analysis };
    }

    return NextResponse.json({
      analysis: parsed,
      powered_by: 'MiMo-V2.5-VL Vision Understanding',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
