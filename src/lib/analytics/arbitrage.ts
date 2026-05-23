export type ArbitrageSpread = {
  productName: string;
  lowCompetitor: string;
  highCompetitor: string;
  lowPrice: number;
  highPrice: number;
  spread: number;
  spreadPercent: number;
};

export function calculateArbitrageSpreads(
  products: Array<{
    name: string;
    competitor: string;
    latestPrice: number;
  }>,
): ArbitrageSpread[] {
  const grouped = new Map<string, typeof products>();

  for (const product of products) {
    const key = product.name.toLowerCase();
    const existing = grouped.get(key) ?? [];
    existing.push(product);
    grouped.set(key, existing);
  }

  const spreads: ArbitrageSpread[] = [];

  for (const [productName, entries] of grouped) {
    if (entries.length < 2) continue;

    const sorted = [...entries].sort((a, b) => a.latestPrice - b.latestPrice);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    const spread = high.latestPrice - low.latestPrice;

    spreads.push({
      productName,
      lowCompetitor: low.competitor,
      highCompetitor: high.competitor,
      lowPrice: low.latestPrice,
      highPrice: high.latestPrice,
      spread,
      spreadPercent: low.latestPrice === 0 ? 0 : (spread / low.latestPrice) * 100,
    });
  }

  return spreads.sort((a, b) => b.spreadPercent - a.spreadPercent);
}
