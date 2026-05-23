export function parsePrice(raw: string): number | null {
  const normalized = raw.replace(/[^\d.,]/g, "").trim();
  if (!normalized) return null;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  let cleaned = normalized;

  if (lastComma > lastDot) {
    cleaned = normalized.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    cleaned = normalized.replace(/,/g, "");
  } else {
    cleaned = normalized.replace(",", ".");
  }

  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}
