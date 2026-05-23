export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance =
    prices.reduce((sum, price) => sum + (price - mean) ** 2, 0) / prices.length;

  return Math.sqrt(variance);
}

export function calculateVolatilityPercent(prices: number[]): number {
  if (prices.length === 0) return 0;

  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  if (mean === 0) return 0;

  return (calculateVolatility(prices) / mean) * 100;
}
