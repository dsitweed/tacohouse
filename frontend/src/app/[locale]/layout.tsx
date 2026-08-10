import '../globals.css';

import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { getLocale } from 'next-intlayer/server';

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

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProvider locale={locale}>
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
