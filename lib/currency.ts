export const formatNaira = (amount: number | string | null | undefined) => {
  const numeric = typeof amount === 'number' ? amount : Number(amount || 0);
  return `\u20A6${numeric.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
};
