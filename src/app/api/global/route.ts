import { NextResponse } from 'next/server';
import { getGlobalData } from '@/lib/coingecko';

export async function GET() {
  try {
    const data = await getGlobalData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
