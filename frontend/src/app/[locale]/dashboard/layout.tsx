import { DashboardLayout } from '@/components/layouts/DashboardLayout';

// Auth protection is handled by proxy.ts (checks refreshToken cookie).
// No client-side auth check needed here - avoids hydration flash issues.
export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
