import '../globals.css';

import { getHTMLTextDir } from 'intlayer';
import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { NextLayoutIntlayer } from 'next-intlayer';

import { AppProvider } from '@/components/providers';
export { generateStaticParams } from 'next-intlayer';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TacoHouse - Rental Room Management',
  description: 'Manage your rental properties efficiently',
};

const LocaleLayout: NextLayoutIntlayer = async ({ children, params }) => {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      dir={getHTMLTextDir(locale)}
    >
      <body className="min-h-full">
        <AppProvider locale={locale}>
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
