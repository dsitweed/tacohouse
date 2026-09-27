'use client';

import { NoDataEmptyState, Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

import { RentalStatsContainer } from './RentalStats';

// FIXME: fix stats logic, fix pagination logic
export function RentalsPage() {
  const { user, isHydrated } = useAuthStore((state) => state);

  const canView =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  if (!isHydrated) {
    return <Spinner className="mx-auto my-10 size-6" />;
  }

  if (!canView) {
    return (
      <NoDataEmptyState
        title="Không có quyền truy cập"
        subTitle="Bạn không có quyền truy cập vào trang này."
      />
    );
  }

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

      <RentalStatsContainer />

      {/* <section className="space-y-4" aria-labelledby="rental-list-title">
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
      </section> */}
    </div>
  );
}
