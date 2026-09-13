'use client';

import { ChevronRight, Download, FileSignature } from 'lucide-react';

import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  NoDataEmptyState,
  SkeletonPage,
} from '@/components/ui';
import type { Rental } from '@/generated/model';
import { useRental } from '@/hooks/api/useRentals';
import { useAuthStore } from '@/stores/authStore';
import { RENTAL_STATUS_MAP, UserRole } from '@/types';
import { toDateOnlyString } from '@/utils';

import { FinancialSummary } from './FinancialSummary';
import { LeaseTimeline } from './LeaseTimeline';
import { QuickActions } from './QuickActions';
import { RoomDetails } from './RoomDetails';
import { TenantInformation } from './TenantInformation';

type RentalDetailProps = {
  id: string;
  initialRental: Rental;
};
import { getTenantName } from '@/features/rentals/rentals.utils';

export function RentalDetail({ id, initialRental }: RentalDetailProps) {
  const user = useAuthStore((state) => state.user);
  const { data: rental, isLoading } = useRental(id, {
    initialData: initialRental,
  });

  const canView =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;
  const handleDownload = () => window.print();

  if (!canView)
    return (
      <NoDataEmptyState
        title="Không có quyền truy cập"
        subTitle="Bạn không có quyền truy cập vào trang này."
      />
    );
  if (isLoading) return <SkeletonPage />;
  if (!rental) return <SkeletonPage />;

  const status = RENTAL_STATUS_MAP[rental.status];

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/60 pb-8">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/contracts">
                  Hợp đồng
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="size-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  #{rental.id.slice(0, 8).toUpperCase()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Hợp đồng thuê phòng {rental.room?.number ?? 'N/A'}
            </h1>
            <Badge variant={status.badgeVariant}>{status.label}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Tạo ngày {toDateOnlyString(new Date(rental.createdAt))}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="size-4" />
            In / lưu PDF
          </Button>
          <Button>
            <FileSignature className="size-4" />
            Ký điện tử
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <TenantInformation
            tenantId={rental.tenantId}
            name={!rental.tenant ? 'Người thuê' : getTenantName(rental.tenant)}
            email={rental.tenant?.email ?? undefined}
            phone={rental.tenant?.profile?.phone ?? undefined}
            avatar={rental.tenant?.profile?.avatar ?? undefined}
          />
          {rental.room ? (
            <RoomDetails room={rental.room} />
          ) : (
            <p className="text-sm text-slate-500">Chưa có thông tin phòng</p>
          )}
        </div>
        <div className="space-y-6 lg:col-span-4">
          <FinancialSummary
            monthlyRent={rental.monthlyRent}
            depositPaid={rental.depositPaid}
          />
          <LeaseTimeline
            startDate={rental.startDate}
            endDate={rental.endDate}
          />
          <QuickActions rentalId={rental.id} />
        </div>
      </div>

      <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        TacoHouse Rental ID: {rental.id}
      </footer>
    </div>
  );
}
