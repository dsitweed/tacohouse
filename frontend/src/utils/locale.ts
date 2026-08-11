import { Locales } from 'intlayer';

export const SUPPORTED_LOCALES = [Locales.ENGLISH, Locales.VIETNAMESE];
export const DEFAULT_LOCALE = Locales.VIETNAMESE;

export function removeLocaleFromPathname(pathname: string) {
  const localePattern = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})`);
  return pathname.replace(localePattern, '');
}
