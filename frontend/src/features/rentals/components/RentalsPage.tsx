'use client';

import { useState } from 'react';

import { NoDataEmptyState, SkeletonPage } from '@/components/ui';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { RentalStatus } from '@/generated/model';
import { useRentals } from '@/hooks/api/useRentals';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { formatCurrency } from '@/utils';

import { type RentalFilter, RentalFilters } from './RentalFilters';
import { RentalStats } from './RentalStats';
import { RentalTable } from './RentalTable';

function getDaysRemaining(endDate: string | null, now: number) {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate).getTime() - now) / 86400000);
}

function isExpiringSoon(endDate: string | null, now: number) {
  const daysRemaining = getDaysRemaining(endDate, now);
  return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 30;
}

export function RentalsPage() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<RentalFilter>('ALL');
  const [search, setSearch] = useState('');
  const [now] = useState(() => Date.now());

  const rentalQuery = {
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(filter === 'ACTIVE' ? { status: RentalStatus.ACTIVE } : {}),
    ...(filter === 'EXPIRED' ? { status: RentalStatus.TERMINATED } : {}),
    ...(filter === 'EXPIRING' ? { expiringSoon: true } : {}),
    ...(search ? { search } : {}),
  };
  const { data: rentalsData, isLoading } = useRentals(rentalQuery);

  const rentals = rentalsData?.data ?? [];

  const canView =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  if (!canView) {
    return (
      <NoDataEmptyState
        title="Không có quyền truy cập"
        subTitle="Bạn không có quyền truy cập vào trang này."
      />
    );
  }

  if (isLoading) return <SkeletonPage />;

  const activeCount = rentals.filter(
    (rental) => rental.status === RentalStatus.ACTIVE,
  ).length;
  const expiringCount = rentals.filter((rental) =>
    isExpiringSoon(rental.endDate, now),
  ).length;
  const averageTerm = rentals.length
    ? Math.round(
        (rentals.reduce((total, rental) => {
          const endDate = rental.endDate
            ? new Date(rental.endDate).getTime()
            : now;
          return total + (endDate - new Date(rental.startDate).getTime());
        }, 0) /
          rentals.length /
          (30.44 * 24 * 60 * 60 * 1000)) *
          10,
      ) / 10
    : 0;
  const monthlyRevenue = rentals
    .filter((rental) => rental.status === RentalStatus.ACTIVE)
    .reduce((total, rental) => total + Number(rental.monthlyRent), 0);

  const pagination = rentalsData?.pagination;

  return (
    <div className="min-h-screen space-y-8 bg-slate-50/60 pb-10">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
            Danh mục tài sản
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Quản lý hợp đồng
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-500">
            Theo dõi toàn bộ hợp đồng thuê và những kỳ hạn sắp cần xử lý.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Cập nhật từ hệ thống quản lý TacoHouse
        </p>
      </header>

      <RentalStats
        activeCount={activeCount}
        expiringCount={expiringCount}
        averageTerm={averageTerm}
        monthlyRevenue={formatCurrency(monthlyRevenue.toString())}
      />

      <section className="space-y-4" aria-labelledby="rental-list-title">
        <div>
          <h2
            id="rental-list-title"
            className="text-xl font-semibold text-slate-900"
          >
            Danh sách hợp đồng
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn một hợp đồng để xem đầy đủ thông tin người thuê và phòng.
          </p>
        </div>
        <RentalFilters
          activeFilter={filter}
          search={search}
          onFilterChange={(nextFilter) => {
            setFilter(nextFilter);
            setPage(1);
          }}
          onSearchChange={(nextSearch) => {
            setSearch(nextSearch);
            setPage(1);
          }}
        />
        {rentals.length > 0 && pagination ? (
          <RentalTable
            rentals={rentals}
            page={page}
            pagination={pagination}
            onPageChange={setPage}
          />
        ) : (
          <NoDataEmptyState
            title="Không tìm thấy hợp đồng"
            subTitle="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
          />
        )}
      </section>
    </div>
  );
}
