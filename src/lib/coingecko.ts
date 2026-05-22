const CG_BASE = 'https://api.coingecko.com/api/v3';

export async function getTopCoins(limit = 20) {
  const res = await fetch(
    `${CG_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&sparkline=true&price_change_percentage=1h,24h,7d`,
    { next: { revalidate: 30 } }
  );
  return res.json();
}

export async function getGlobalData() {
  const res = await fetch(`${CG_BASE}/global`, { next: { revalidate: 60 } });
  return res.json();
}

export async function getCoinChart(id: string, days = 7) {
  const res = await fetch(
    `${CG_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    { next: { revalidate: 60 } }
  );
  return res.json();
}

export async function getCoinDetail(id: string) {
  const res = await fetch(
    `${CG_BASE}/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=false`,
    { next: { revalidate: 60 } }
  );
  return res.json();
}
