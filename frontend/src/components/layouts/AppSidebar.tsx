'use client';

import { cn } from 'cn';
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

import {
  Avatar,
  AvatarImage,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui';
import { UserRole } from '@/generated/model';
import { useAuthStore } from '@/stores/authStore';
import { getPathWithoutLocale } from '@/utils';

import { BrandLogoCombined, BrandLogoIcon, BrandLogoText } from '../BrandKit';

type SidebarProps = {
  className?: string;
};

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

export default function AppSidebar({ className }: SidebarProps) {
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

  const renderNavGroup = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathWithoutLocale === item.href ||
          (item.href !== '/dashboard' &&
            pathWithoutLocale.startsWith(item.href));

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              className={cn(
                'rounded-md px-3.5 py-2.5 text-sm font-medium',
                isActive && 'text-primary bg-slate-50 shadow-2xs',
              )}
            >
              <Link href={item.href}>
                <Icon className="size-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.title}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className={className}>
      <SidebarHeader className="justify-center border-b border-gray-200/80">
        <div className="flex h-12 min-w-0 items-center gap-2">
          <BrandLogoIcon className="p-1.5" />
          <div className="group-data-[collapsible=icon]:hidden">
            <BrandLogoText />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUP.map((nav, index) => {
          const group = filterGroup(nav);

          return (
            <SidebarGroup key={nav}>
              {index > 0 && group.length > 0 && <Separator className="my-3" />}
              {renderNavGroup(group)}
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      {user && (
        <SidebarFooter className="border-t border-gray-200/80 p-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage
                src={
                  user.profile?.avatar ??
                  `https://api.dicebear.com/10.x/thumbs/svg?seed=${user?.email}`
                }
                alt="user avatar"
              />
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate font-semibold">
                {user.profile?.firstName && user.profile?.lastName
                  ? `${user.profile.lastName} ${user.profile.firstName}`
                  : user.email}
              </span>
              <span className="text-muted-foreground block truncate text-xs">
                {role === UserRole.ADMIN && 'Quản trị viên'}
                {role === UserRole.LANDLORD && 'Chủ nhà / Quản lý'}
                {role === UserRole.TENANT && 'Người thuê'}
              </span>
            </span>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
