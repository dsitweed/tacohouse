import { Locales } from 'intlayer';

export const SUPPORTED_LOCALES = [Locales.ENGLISH, Locales.VIETNAMESE];
export const DEFAULT_LOCALE = Locales.VIETNAMESE;
export type SUPPORTED_LOCALES_TYPE = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_CONFIG_MAP: Record<
  SUPPORTED_LOCALES_TYPE,
  {
    currency: string;
    locale: string;
    language: string;
  }
> = {
  en: {
    currency: 'USD',
    locale: 'en-US',
    language: 'en',
  },
  vi: {
    currency: 'VND',
    locale: 'vi-VN',
    language: 'vi',
  },
};

/**
 * Remove locale prefix from pathname
 */
export function getPathWithoutLocale(pathname: string): string {
  const localePattern = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})`);
  return pathname.replace(localePattern, '') || '/';
}

/**
 * Get locale from pathname or default
 */
export function getLocaleFromPath(pathname: string): SUPPORTED_LOCALES_TYPE {
  const match = pathname.match(
    new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})`),
  );
  return match ? (match[1] as SUPPORTED_LOCALES_TYPE) : DEFAULT_LOCALE;
}

/**
 * Build path with locale if needed
 */
export function buildLocalePath(
  path: string,
  locale: SUPPORTED_LOCALES_TYPE,
): string {
  // For default locale in prefix-no-default mode, don't add prefix
  if (locale === DEFAULT_LOCALE) {
    return path;
  }
  return `/${locale}${path}`;
}
