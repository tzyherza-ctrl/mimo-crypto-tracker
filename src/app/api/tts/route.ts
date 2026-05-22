import { NextRequest, NextResponse } from 'next/server';
import { mimoReason, mimoTTS } from '@/lib/mimo';
import { getTopCoins } from '@/lib/coingecko';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    let briefingText = text;
    
    if (!text) {
      // Auto-generate market briefing
      const coins = await getTopCoins(10);
      const marketSummary = coins.map((c: any) => 
        `${c.name}: $${c.current_price.toLocaleString()}, ${c.price_change_percentage_24h > 0 ? 'up' : 'down'} ${Math.abs(c.price_change_percentage_24h).toFixed(1)}%`
      ).join('. ');

      // MiMo generates natural briefing
      briefingText = await mimoReason([
        {
          role: 'system',
          content: 'You are a professional crypto news anchor. Write a concise, engaging 30-second market briefing in English. Natural speech, not robotic. Include the top movers and overall market direction.'
        },
        {
          role: 'user',
          content: `Market data: ${marketSummary}. Write the briefing script.`
        }
      ]);
    }

    // Generate audio with MiMo TTS
    const audio = await mimoTTS(briefingText);

    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="briefing.mp3"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
