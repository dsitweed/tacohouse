import { LOCALE_CONFIG_MAP, SUPPORTED_LOCALES_TYPE } from './locale';

export function toDateOnlyString(
  date: Date,
  locale: SUPPORTED_LOCALES_TYPE = 'vi',
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
  },
): string {
  return date.toLocaleString(LOCALE_CONFIG_MAP[locale].locale, {
    dateStyle: options.dateStyle,
    timeStyle: options.timeStyle,
  });
}

/**
 * Returns a date string in the format "YYYY-MM-DD" suitable for API requests.
 */
export function toApiDateString(date: Date | undefined): string | undefined {
  if (!date) return undefined;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getDaysRemaining(endDate: string | null) {
  if (!endDate) return null;
  return Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
}

/**
 * Formats a billing period date as a month label, e.g. "Tháng 11/2023".
 */
export function formatBillingPeriod(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `Tháng ${month}/${date.getFullYear()}`;
}
