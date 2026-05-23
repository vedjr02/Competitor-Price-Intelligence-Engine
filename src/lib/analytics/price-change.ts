export type PriceChange = {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
  direction: "up" | "down" | "flat";
};

export function calculatePriceChange(
  current: number,
  previous: number,
): PriceChange {
  const delta = current - previous;
  const deltaPercent = previous === 0 ? 0 : (delta / previous) * 100;

  let direction: PriceChange["direction"] = "flat";
  if (delta > 0) direction = "up";
  if (delta < 0) direction = "down";

  return { current, previous, delta, deltaPercent, direction };
}

export function getLatestTwoPrices(prices: number[]): PriceChange | null {
  if (prices.length < 2) return null;

  const previous = prices[prices.length - 2];
  const current = prices[prices.length - 1];

  return calculatePriceChange(current, previous);
}
