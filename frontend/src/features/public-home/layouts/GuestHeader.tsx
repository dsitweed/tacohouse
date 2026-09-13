import { LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';

import { BrandLogoCombined } from '@/components/BrandKit';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Avatar, AvatarImage, Button } from '@/components/ui';
import { useLogout } from '@/hooks/api';
import { useAuthStore } from '@/stores/authStore';

const NAV_LINKS = [
  { id: 1, href: '/rooms', label: 'Khám phá phòng' },
  { id: 2, href: '#', label: 'Khu vực/ Toà nhà' },
  { id: 3, href: '#', label: 'Bảng giá & Tiện ích' },
  { id: 4, href: '#', label: 'Về chúng tôi' },
  { id: 5, href: '#', label: 'Hỗ trợ' },
];

function GuestHeader() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <BrandLogoCombined />

          <nav className="hidden items-center space-x-1 md:flex">
            {NAV_LINKS.map(({ id, href, label }) => (
              <Link
                key={id}
                href={href}
                className="hover:text-primary rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <LocaleSwitcher />
          {user ? (
            <>
              {/* Management dashboard */}
              {(user.role === 'ADMIN' || user.role === 'LANDLORD') && (
                <Link href="/dashboard">
                  <Button variant="outline">
                    <LayoutDashboard className="size-4" />
                    <span>Quản lý</span>
                  </Button>
                </Link>
              )}

              {/* User Avatar */}
              <Avatar>
                <AvatarImage
                  src={
                    user?.profile?.avatar ??
                    `https://api.dicebear.com/10.x/thumbs/svg?seed=${user?.email}`
                  }
                  alt="user avatar"
                />
              </Avatar>

              {/* Logout Button */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex size-9 rounded-full text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button>Đăng ký ngay</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
export { GuestHeader };
