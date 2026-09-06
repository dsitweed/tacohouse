'use client';

import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  DoorOpen,
  FileText,
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

import { Avatar, AvatarImage, Separator } from '@/components/ui';
import { UserRole } from '@/generated/model';
import { useAuthStore } from '@/stores/authStore';
import { cn, getPathWithoutLocale } from '@/utils';

import { BrandLogoCombined } from '../BrandKit';

const NAV_GROUP = ['main', 'financial', 'system'] as const;
type NavGroupType = (typeof NAV_GROUP)[number];

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  group: NavGroupType;
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    group: 'main',
  },
  {
    title: 'Tòa nhà',
    href: '/dashboard/buildings',
    icon: Building2,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
    group: 'main',
  },
  {
    title: 'Phòng',
    href: '/dashboard/rooms',
    icon: DoorOpen,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
    group: 'main',
  },
  {
    title: 'Người thuê',
    href: '/dashboard/tenants',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
    group: 'main',
  },
  {
    title: 'Hợp đồng',
    href: '/dashboard/rentals',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
    group: 'main',
  },
  {
    title: 'Hóa đơn',
    href: '/dashboard/bills',
    icon: Receipt,
    group: 'financial',
  },
  {
    title: 'Thanh toán',
    href: '/dashboard/payments',
    icon: CreditCard,
    group: 'financial',
  },
  {
    title: 'Sửa chữa',
    href: '/dashboard/maintenance',
    icon: Wrench,
    group: 'financial',
  },
  {
    title: 'Báo cáo',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
    group: 'financial',
  },
  {
    title: 'Thông báo',
    href: '/dashboard/notifications',
    icon: Bell,
    group: 'system',
  },
  {
    title: 'Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
    group: 'system',
  },
  {
    title: 'Quản lý chủ nhà',
    href: '/dashboard/landlords',
    icon: UserCog,
    roles: [UserRole.ADMIN],
    group: 'system',
  },
  {
    title: 'Cài đặt',
    href: '/dashboard/settings',
    icon: Settings,
    group: 'system',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role;
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const filterGroup = (group: NavGroupType) =>
    navItems.filter(
      (item) =>
        item.group === group &&
        (!item.roles || (role && item.roles.includes(role))),
    );

  const renderNavGroup = (items: NavItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive =
        pathWithoutLocale === item.href ||
        (item.href !== '/dashboard' && pathWithoutLocale.startsWith(item.href));

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-100',
            isActive
              ? 'text-primary bg-indigo-50 font-semibold shadow-2xs'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          <Icon className="size-5 transition-colors" />
          <span>{item.title}</span>
        </Link>
      );
    });

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col p-4">
        <div>
          <BrandLogoCombined className="mb-4" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {NAV_GROUP.map((nav, index) => {
            const filterResult = filterGroup(nav);

            return (
              <div key={nav}>
                {index > 0 && filterResult.length > 0 && (
                  <Separator className="my-3" />
                )}
                {renderNavGroup(filterResult)}
              </div>
            );
          })}
        </nav>

        {/* User info */}
        {user && (
          <div className="mt-auto border-t border-gray-200 pt-3">
            <div className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50">
              <Avatar>
                <AvatarImage
                  src={
                    user.profile?.avatar ??
                    `https://api.dicebear.com/10.x/thumbs/svg?seed=${user.email}`
                  }
                  alt="user avatar"
                />
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.lastName} ${user.profile.firstName}`
                    : user.email}
                </p>
                <p className="truncate text-xs font-medium text-gray-500">
                  {role === UserRole.ADMIN && 'Quản trị viên'}
                  {role === UserRole.LANDLORD && 'Chủ nhà / Quản lý'}
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
