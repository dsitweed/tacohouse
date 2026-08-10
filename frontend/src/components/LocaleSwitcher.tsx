'use client';

import {
  getHTMLTextDir,
  getLocaleName,
  getLocalizedUrl,
  Locales,
} from 'intlayer';
import Link from 'next/link';
import { useLocale } from 'next-intlayer';

import { Popover, PopoverContent, PopoverTrigger } from './ui';

export default function LocaleSwitcher() {
  const { locale, pathWithoutLocale, availableLocales, setLocale } =
    useLocale();

  return (
    <Popover>
      <PopoverTrigger>{getLocaleName(locale)}</PopoverTrigger>
      <PopoverContent>
        {availableLocales.map((localeItem) => (
          <Link
            href={getLocalizedUrl(pathWithoutLocale, localeItem)}
            key={localeItem}
            aria-current={locale === localeItem ? 'page' : undefined}
            onClick={() => setLocale(localeItem)}
          >
            <span>
              {/* Locale - e.g. FR */}
              {localeItem}
            </span>
            <span>
              {/* Language in its own Locale - e.g. Français */}
              {getLocaleName(localeItem, locale)}
            </span>
            <span dir={getHTMLTextDir(localeItem)} lang={localeItem}>
              {/* Language in current Locale - e.g. Francés with current locale set to Locales.SPANISH */}
              {getLocaleName(localeItem)}
            </span>
            <span dir="ltr" lang={Locales.ENGLISH}>
              {/* Language in English - e.g. French */}
              {getLocaleName(localeItem, Locales.ENGLISH)}
            </span>
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
