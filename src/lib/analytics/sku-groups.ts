export type SkuGroup = {
  sku: string;
  productName: string;
  competitors: Array<{
    productId: string;
    competitor: string;
    latestPrice: number | null;
    url: string;
  }>;
  spread: number | null;
  spreadPercent: number | null;
  lowestCompetitor: string | null;
  highestCompetitor: string | null;
};

type ProductInput = {
  id: string;
  name: string;
  sku: string | null;
  competitor: string;
  url: string;
  latestPrice: number | null;
};

export function groupProductsBySku(products: ProductInput[]): SkuGroup[] {
  const grouped = new Map<string, ProductInput[]>();

  for (const product of products) {
    const key = (product.sku ?? product.name).trim().toLowerCase();
    const existing = grouped.get(key) ?? [];
    existing.push(product);
    grouped.set(key, existing);
  }

  return [...grouped.entries()].map(([, entries]) => {
    const priced = entries.filter((entry) => entry.latestPrice != null);
    const sorted = [...priced].sort(
      (a, b) => (a.latestPrice ?? 0) - (b.latestPrice ?? 0),
    );

    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    const spread =
      low?.latestPrice != null && high?.latestPrice != null
        ? high.latestPrice - low.latestPrice
        : null;

    return {
      sku: entries[0].sku ?? entries[0].name,
      productName: entries[0].name,
      competitors: entries.map((entry) => ({
        productId: entry.id,
        competitor: entry.competitor,
        latestPrice: entry.latestPrice,
        url: entry.url,
      })),
      spread,
      spreadPercent:
        spread != null && low?.latestPrice
          ? (spread / low.latestPrice) * 100
          : null,
      lowestCompetitor: low?.competitor ?? null,
      highestCompetitor: high?.competitor ?? null,
    };
  });
}
