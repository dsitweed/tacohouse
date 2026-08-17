'use client';

import { Header } from './Header';
import Sidebar from './Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50/60">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col lg:ml-[260px]">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 [scrollbar-gutter:stable] lg:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
