'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  Receipt,
  CreditCard,
  Wrench,
  Bell,
  MessageSquare,
  Settings,
  UserCog,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { UserRole } from '@tacohouse/shared';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Tòa nhà',
    href: '/dashboard/buildings',
    icon: Building2,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
  },
  {
    title: 'Phòng',
    href: '/dashboard/rooms',
    icon: DoorOpen,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
  },
  {
    title: 'Người thuê',
    href: '/dashboard/tenants',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
  },
  {
    title: 'Hóa đơn',
    href: '/dashboard/bills',
    icon: Receipt,
  },
  {
    title: 'Thanh toán',
    href: '/dashboard/payments',
    icon: CreditCard,
  },
  {
    title: 'Yêu cầu sửa chữa',
    href: '/dashboard/maintenance',
    icon: Wrench,
  },
  {
    title: 'Thông báo',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    title: 'Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    title: 'Quản lý chủ nhà',
    href: '/dashboard/landlords',
    icon: UserCog,
    roles: [UserRole.ADMIN],
  },
  {
    title: 'Báo cáo',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
  },
  {
    title: 'Cài đặt',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role;

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Tacohouse</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {user && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {role === UserRole.ADMIN && 'Quản trị viên'}
                  {role === UserRole.LANDLORD && 'Chủ nhà'}
                  {role === UserRole.TENANT && 'Người thuê'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

