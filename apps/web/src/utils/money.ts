/** Dollars as typed (up to 2 decimals, optional `$`) → cents, or `null`. */
export const dollarsToCents = (value: string): number | null => {
  const text = value.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  return Math.round(Number(text) * 100);
};

/** Cents → dollars for an input ("25", "27.50"). */
export const centsToDollars = (cents: number): string =>
  (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
