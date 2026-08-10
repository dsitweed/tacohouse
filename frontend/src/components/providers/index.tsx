import { Locale } from 'intlayer';
import { IntlayerClientProvider } from 'next-intlayer';
import { ReactNode } from 'react';

import { Toaster } from '../ui';
import { QueryProvider } from './queryProvider';

export const AppProvider = ({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) => {
  return (
    <QueryProvider>
      <IntlayerClientProvider locale={locale}>
        {children}
        <Toaster />
      </IntlayerClientProvider>
    </QueryProvider>
  );
};
