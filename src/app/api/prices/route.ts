import { NextResponse } from 'next/server';
import { getTopCoins } from '@/lib/coingecko';

export async function GET() {
  try {
    const data = await getTopCoins(20);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
