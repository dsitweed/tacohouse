'use client';

import { getHTMLTextDir, getLocaleName, getLocalizedUrl } from 'intlayer';
import { Languages } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intlayer';

import { Button, Popover, PopoverContent, PopoverTrigger } from './ui';

export default function LocaleSwitcher() {
  const { locale, pathWithoutLocale, availableLocales, setLocale } =
    useLocale();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Languages className="size-5" />
          {getLocaleName(locale)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-40">
        {availableLocales.map((localeItem) => (
          <Link
            href={getLocalizedUrl(pathWithoutLocale, localeItem)}
            key={localeItem}
            aria-current={locale === localeItem ? 'page' : undefined}
            onClick={() => setLocale(localeItem)}
          >
            {/* Locale - e.g. FR */}
            {/* <span>{localeItem}</span> */}
            {/* Language in its own Locale - e.g. Français */}
            {/* <span>{getLocaleName(localeItem, locale)}</span> */}
            {/* Language in current Locale - e.g. Francés with current locale set to Locales.SPANISH */}
            <span dir={getHTMLTextDir(localeItem)} lang={localeItem}>
              {getLocaleName(localeItem)}
            </span>
            {/* Language in English - e.g. French */}
            {/* <span dir="ltr" lang={Locales.ENGLISH}>
              {getLocaleName(localeItem, Locales.ENGLISH)}
            </span> */}
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
