'use client';

import { DashboardLayout } from '@/components/layouts';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  /**
   * FIX 2: mounted State - Đợi hydration hoàn tất
   *
   * TẠI SAO CẦN:
   *
   * Timeline khi reload page:
   * t0: Component mount (SSR) → mounted = false, isAuthenticated = false (default)
   * t1: useEffect chạy → setMounted(true)
   * t2: Zustand hydrate từ localStorage → isAuthenticated = true
   * t3: Component re-render với state đúng
   *
   * VẤN ĐỀ NẾU KHÔNG CÓ mounted:
   * - Ở t0: isAuthenticated = false → redirect ngay → SAI!
   * - Hydration chưa xong, localStorage chưa được đọc
   *
   * GIẢI PHÁP:
   * - Đợi mounted = true (component đã mount trên client)
   * - Sau đó mới check isAuthenticated (đã được hydrate từ localStorage)
   * - Tránh redirect sai trong quá trình hydration
   */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Chỉ set mounted = true sau khi component mount trên client
    // Trên server, mounted luôn là false
    setMounted(true);
  }, []);

  useEffect(() => {
    // Chỉ redirect nếu:
    // 1. Component đã mount (mounted = true)
    // 2. VÀ không authenticated
    // → Tránh redirect trong quá trình hydration
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  /**
   * Return null nếu:
   * - Chưa mount (đang SSR hoặc đang hydrate)
   * - Hoặc không authenticated (sẽ redirect ở useEffect trên)
   *
   * Điều này đảm bảo:
   * - Không render trên server (SSR-safe)
   * - Không render trong quá trình hydration
   * - Chỉ render khi đã có state đúng từ localStorage
   */
  if (!mounted || !isAuthenticated) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
