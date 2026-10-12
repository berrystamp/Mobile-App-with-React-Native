/** Two calendar months, clamped to the last day of the destination month. */
export function nextShopLocationUpdate(lastUpdate?: string | null): Date | null {
  if (!lastUpdate) return null;
  const date = new Date(lastUpdate);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 2);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date;
}
