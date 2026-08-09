type Currency = 'VND' | 'USD' | 'JPY';

const LocalMap: Record<Currency, string> = {
  VND: 'vi-VN',
  USD: 'en-US',
  JPY: 'ja-JP',
};

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: Currency = 'VND',
): string {
  if (amount === null || amount === undefined) {
    return '0';
  }

  const value = typeof amount === 'string' ? Number(amount) : amount;

  if (Number.isNaN(value)) {
    return '';
  }

  return value.toLocaleString(LocalMap[currency], {
    style: 'currency',
    currency: currency,
  });
}
