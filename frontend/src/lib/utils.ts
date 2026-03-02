import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Vietnamese currency
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  const numericAmount =
    typeof amount === 'number'
      ? amount
      : typeof amount === 'string'
        ? Number(amount)
        : 0;

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number | string | null | undefined): string {
  const numericValue =
    typeof num === 'number' ? num : typeof num === 'string' ? Number(num) : 0;
  return new Intl.NumberFormat('vi-VN').format(
    Number.isFinite(numericValue) ? numericValue : 0
  );
}

