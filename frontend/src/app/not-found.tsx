'use client';

import './globals.css';

import { ArrowLeft, Building2, Compass, Home } from 'lucide-react';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
});

export default function RootNotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="flex h-full min-h-screen font-sans text-slate-800 antialiased">
        <main className="relative flex h-full w-full flex-col overflow-hidden md:flex-row">
          {/* Left half: Content Area */}
          <div className="relative z-10 flex flex-1 flex-col justify-between border-b bg-slate-50/80 p-6 md:w-1/2 md:p-12 lg:p-16">
            {/* Header Brand */}
            <header className="py-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg transition-opacity hover:opacity-90"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                  <Building2 className="size-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Taco<span className="text-indigo-600">House</span>
                </span>
              </Link>
            </header>

            {/* Content Area */}
            <div className="my-auto py-12 md:max-w-md lg:max-w-lg">
              {/* Decorative Icon */}
              <div className="mb-6 flex size-16 animate-pulse items-center justify-center rounded-full border border-indigo-100 bg-indigo-100/50 text-indigo-600">
                <Compass className="size-8 stroke-[1.5]" />
              </div>

              <div>
                <h1 className="bg-clip-text text-8xl font-black text-slate-900 md:text-9xl">
                  404
                </h1>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Không tìm thấy trang
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
                  Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none"
                >
                  <Home className="size-4" />
                  Quay về trang chủ
                </Link>
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại trang trước
                </button>
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-4 text-xs text-slate-500">
              <p>
                © {new Date().getFullYear()} TacoHouse. Tất cả quyền được bảo
                lưu.
              </p>
            </footer>
          </div>

          {/* Right half: Image */}
          <div className="relative hidden select-none md:flex md:h-full md:w-1/2">
            <Image
              src="/images/not-found-bg.jpeg"
              alt="not-found-bg"
              fill
              sizes="50vw"
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-black/10" />
          </div>
        </main>
      </body>
    </html>
  );
}
