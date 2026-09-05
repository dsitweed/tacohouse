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
