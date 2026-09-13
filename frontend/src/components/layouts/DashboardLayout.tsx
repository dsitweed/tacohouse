'use client';

import { SidebarInset } from '../ui';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh min-h-0 w-full overflow-hidden bg-slate-50/60">
      <AppSidebar className="hidden lg:flex" />
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-gutter:stable] lg:py-4">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
