import { LOCALE_CONFIG_MAP, SUPPORTED_LOCALES_TYPE } from './locale';

export function toDateOnlyString(
  date: Date,
  locale: SUPPORTED_LOCALES_TYPE = 'vi',
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: "short",
  },
): string {
  return date.toLocaleString(LOCALE_CONFIG_MAP[locale].locale, {
    dateStyle: options.dateStyle,
    timeStyle: options.timeStyle,
  });
}
