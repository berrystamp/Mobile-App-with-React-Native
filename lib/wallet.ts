export function transactionDirection(transaction: any): 'CREDIT' | 'DEBIT' | 'UNKNOWN' {
  const type = String(transaction?.transactionType || transaction?.type || transaction?.direction || '').toUpperCase();
  if (/CREDIT|DEPOSIT|EARNING|REFUND/.test(type)) return 'CREDIT';
  if (/DEBIT|WITHDRAW|PAYMENT/.test(type)) return 'DEBIT';
  if (transaction?.isCredit === true) return 'CREDIT';
  if (transaction?.isCredit === false) return 'DEBIT';
  return 'UNKNOWN';
}

export function transactionAmount(transaction: any): number {
  const amount = Number(transaction?.amount ?? transaction?.value ?? 0);
  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}
