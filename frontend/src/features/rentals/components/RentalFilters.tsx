import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  FieldGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui';
import { RentalsControllerFindAllStatus } from '@/generated/model/rentalsControllerFindAllStatus';

export type RentalActiveFilter = 'ALL' | RentalsControllerFindAllStatus;

type RentalFiltersProps = {
  activeFilter: RentalActiveFilter;
  search: string;
  onFilterChange: (filter: RentalActiveFilter) => void;
  onSearchChange: (search: string) => void;
};

const filters: { value: RentalActiveFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'NOTICE_GIVEN', label: 'Sắp hết hạn' },
  { value: 'TERMINATED', label: 'Đã kết thúc' },
];

const formSchema = z.object({
  search: z.string().optional(),
});

export function RentalFilters({
  activeFilter,
  search,
  onFilterChange,
  onSearchChange,
}: RentalFiltersProps) {
  const { register, handleSubmit } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { search },
  });

  const handleSearchSubmit = (data: z.infer<typeof formSchema>) => {
    const nextSearch = data.search?.trim() ?? '';
    onSearchChange(nextSearch);
  };

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
          onSubmit={handleSubmit(handleSearchSubmit)}
        >
          <FieldGroup>
            <InputGroup>
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                {...register('search')}
                placeholder="Tìm người thuê, phòng..."
                aria-label="Tìm kiếm hợp đồng"
              />
            </InputGroup>
          </FieldGroup>
        </form>
        <Button asChild>
          <Link href="/dashboard/rentals/new">
            <Plus className="size-4" />
            Tạo hợp đồng
          </Link>
        </Button>
      </div>
    </div>
  );
}
