import { LOCALE_CONFIG_MAP, SUPPORTED_LOCALES_TYPE } from '.';

export function formatCurrency(
  amount: number | string | null | undefined,
  locale: SUPPORTED_LOCALES_TYPE = 'vi',
): string {
  if (amount === null || amount === undefined) {
    return '';
  }

  const value = typeof amount === 'string' ? Number(amount) : amount;

  if (Number.isNaN(value)) {
    return '';
  }

  return value.toLocaleString(LOCALE_CONFIG_MAP[locale].locale, {
    style: 'currency',
    currency: LOCALE_CONFIG_MAP[locale].currency,
  });
}
