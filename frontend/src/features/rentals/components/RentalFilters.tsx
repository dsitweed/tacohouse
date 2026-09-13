import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { Button, Input } from '@/components/ui';

export type RentalFilter = 'ALL' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED';

type RentalFiltersProps = {
  activeFilter: RentalFilter;
  search: string;
  onFilterChange: (filter: RentalFilter) => void;
  onSearchChange: (search: string) => void;
};

type RentalSearchForm = {
  search: string;
};

const filters: { value: RentalFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'EXPIRING', label: 'Sắp hết hạn' },
  { value: 'EXPIRED', label: 'Đã kết thúc' },
];

export function RentalFilters({
  activeFilter,
  search,
  onFilterChange,
  onSearchChange,
}: RentalFiltersProps) {
  const { register, handleSubmit } = useForm<RentalSearchForm>({
    defaultValues: { search },
  });

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 overflow-x-auto rounded-xl bg-blue-50 p-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange(filter.value)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter.value
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/70'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          className="relative min-w-0 sm:w-72"
          onSubmit={handleSubmit(({ search: nextSearch }) =>
            onSearchChange(nextSearch.trim()),
          )}
        >
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          {/* TODO: Check search input field */}
          <Input
            {...register('search')}
            placeholder="Tìm người thuê, phòng..."
            aria-label="Tìm kiếm hợp đồng"
            className="h-10 rounded-xl border-slate-200 bg-white pl-9"
          />
        </form>
        <Button asChild className="rounded-xl bg-blue-700 hover:bg-blue-800">
          <Link href="/dashboard/rentals/new">
            <Plus className="size-4" />
            Tạo hợp đồng
          </Link>
        </Button>
      </div>
    </div>
  );
}
