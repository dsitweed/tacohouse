'use client';

import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  DoorOpen,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

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
    (item) => !item.roles || (role && item.roles.includes(role)),
  );

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              Tacohouse
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50',
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <span className="font-semibold text-indigo-600">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.email}
                </p>
                <p className="truncate text-xs text-gray-500">
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
