'use client';

import {
  FileText,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  NoDataEmptyState,
  Progress,
  SkeletonPage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTenantDashboard } from '@/hooks/api';
import type { User } from '@/types';

import PersonalTab from './PersonalTab';

type TenantDetailProps = {
  id: string;
  tenant: User;
};

const TAB_TYPE = {
  personal: 'Thông tin cá nhân',
  emergency: 'Liên hệ khẩn cấp',
  documents: 'Tài liệu',
  history: 'Lịch sử thuê',
  payments: 'Thanh toán',
  contracts: 'Hợp đồng',
};

export default function TenantDetail({ id, tenant }: TenantDetailProps) {
  const { data: tenantDashboardData, isLoading } = useTenantDashboard(id);

  if (isLoading) {
    return <SkeletonPage />;
  }

  if (!tenantDashboardData) {
    return <NoDataEmptyState />;
  }

  const profile = tenantDashboardData.tenant.profile;
  const firstName = profile?.firstName || '';
  const lastName = profile?.lastName || '';
  const fullName =
    `${firstName} ${lastName}`.trim() || tenant.email || 'Người thuê';
  const initials =
    (firstName[0] || '') + (lastName[0] || '') || fullName[0] || 'T';

  const tenantIdTag = `#TM-${id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/tenants">
              Người thuê
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Sidebar Profile Card & Contact (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Profile Card */}
          <Card className="relative">
            {/* Top Visual Accent */}
            <div className="bg-primary h-1.5 w-full" />
            <CardContent className="p-6 text-center">
              <Avatar className="mx-auto size-24 border-4 border-indigo-100 shadow-xs">
                <AvatarImage src={profile?.avatar || ''} alt={fullName} />
                <AvatarFallback className="bg-indigo-100 text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {fullName}
              </h2>

              <div className="text-primary inline-flex items-center justify-center gap-1 rounded-full bg-indigo-50 py-1 text-xs font-semibold">
                <ShieldCheck className="size-3.5" />
                <span>Người thuê đã xác minh</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-left text-xs">
                <div className="space-y-2 font-semibold">
                  <div className="tracking-wider text-slate-400 uppercase">
                    Mã định danh
                  </div>
                  <div className="text-slate-800">{tenantIdTag}</div>
                </div>
                <div className="space-y-1 font-semibold">
                  <div className="tracking-wider text-slate-400 uppercase">
                    Trạng thái
                  </div>
                  <Badge variant="success" size="sm">
                    Đang thuê
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details Card */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-slate-900">
                Thông tin liên hệ
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-primary flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-400">Email</div>
                    <div className="truncate text-sm font-medium text-slate-900">
                      {tenant.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-primary flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    <Phone className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-400">Số điện thoại</div>
                    <div className="text-sm font-medium text-slate-900">
                      {profile?.phone || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/dashboard/chat" className="mt-5 block">
                <Button className="w-full">
                  <MessageSquare className="size-4" />
                  <span>Gửi tin nhắn</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Score Widget */}
          {/* TODO: Fix with real payment score */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  Điểm thanh toán
                </span>
                <span className="text-base font-bold text-emerald-600">
                  98/100
                </span>
              </div>
              <Progress
                value={98}
                className="**:data-[slot=progress]:h-2 **:data-[slot=progress-indicator]:bg-emerald-500"
              />
              <p className="mt-3 text-xs text-slate-400 italic">
                {/* TODO: fix with real payment score */}
                Lịch sử thanh toán xuất sắc qua 14 kỳ liên tiếp.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detail Content & Asymmetric Cards (8 cols) */}
        <div className="lg:col-span-8">
          {/* Navigation Tabs */}
          <Tabs defaultValue={TAB_TYPE.personal}>
            <TabsList variant="line" className="flex w-full flex-wrap gap-3">
              {Object.entries(TAB_TYPE).map(([key, value]) => (
                <TabsTrigger key={key} value={value}>
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={TAB_TYPE.personal}>
              <PersonalTab tenantId={id} />
            </TabsContent>

            {/* TODO: Implement other tabs */}
            <TabsContent value={TAB_TYPE.emergency}>
              <Card>
                <CardContent className="items-center text-center">
                  <FileText className="text-primary size-12" />
                  <p className="text-sm text-gray-500">
                    Chức năng này đang được phát triển. Vui lòng quay lại sau.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value={TAB_TYPE.documents}>
              <Card>
                <CardContent className="items-center text-center">
                  <FileText className="text-primary size-12" />
                  <p className="text-sm text-gray-500">
                    Chức năng này đang được phát triển. Vui lòng quay lại sau.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value={TAB_TYPE.history}>
              <Card>
                <CardContent className="items-center text-center">
                  <FileText className="text-primary size-12" />
                  <p className="text-sm text-gray-500">
                    Chức năng này đang được phát triển. Vui lòng quay lại sau.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value={TAB_TYPE.payments}>
              <Card>
                <CardContent className="items-center text-center">
                  <FileText className="text-primary size-12" />
                  <p className="text-sm text-gray-500">
                    Chức năng này đang được phát triển. Vui lòng quay lại sau.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value={TAB_TYPE.contracts}>
              <Card>
                <CardContent className="items-center text-center">
                  <FileText className="text-primary size-12" />
                  <p className="text-sm text-gray-500">
                    Chức năng này đang được phát triển. Vui lòng quay lại sau.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
