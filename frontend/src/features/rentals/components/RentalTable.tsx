import { ArrowRight, DoorOpen, MoreVertical } from 'lucide-react';
import Link from 'next/link';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NoDataEmptyState,
  PaginationContainer,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useRentals } from '@/hooks/api';
import { RENTAL_STATUS_MAP } from '@/types';
import {
  getInitName,
  getRentalRoomLabel,
  getTenantName,
  toDateOnlyString,
} from '@/utils';

import { RentalActiveFilter } from './RentalFilters';

type RentalTableProps = {
  activeFilter: RentalActiveFilter;
  search: string;
  page: number;
  onPageChange: (page: number) => void;
};

export function RentalTable({
  activeFilter,
  search,
  page,
  onPageChange,
}: RentalTableProps) {
  const { data, isPending } = useRentals({
    status: activeFilter === 'ALL' ? undefined : activeFilter,
    search,
    page,
  });

  const rentals = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-blue-50/70">
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="px-5 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Người thuê
            </TableHead>
            <TableHead className="px-5 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Phòng / căn hộ
            </TableHead>
            <TableHead className="px-5 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Ngày bắt đầu
            </TableHead>
            <TableHead className="px-5 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Ngày kết thúc
            </TableHead>
            <TableHead className="px-5 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Trạng thái
            </TableHead>
            <TableHead className="px-5 py-4 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="h-40 text-center">
                <Spinner className="mx-auto size-6" />
              </TableCell>
            </TableRow>
          )}
          {rentals.map((rental) => {
            const tenantName = getTenantName(rental.tenant);
            const status = RENTAL_STATUS_MAP[rental.status];

            return (
              <TableRow
                key={rental.id}
                className="group border-slate-100 hover:bg-blue-50/50"
              >
                <TableCell className="px-5 py-4">
                  <Link
                    href={`/dashboard/rentals/${rental.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="size-9 rounded-lg">
                      <AvatarImage src={rental.tenant?.profile?.avatar ?? ''} />
                      <AvatarFallback className="rounded-lg bg-blue-100 text-xs font-semibold text-blue-700">
                        {getInitName(tenantName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-900">
                        {tenantName}
                      </span>
                      <span className="block max-w-44 truncate text-xs text-slate-500">
                        {rental.tenant?.email ?? 'Chưa cập nhật email'}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Link
                    href={`/dashboard/rentals/${rental.id}`}
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-700"
                  >
                    <DoorOpen className="size-4 shrink-0 text-slate-400" />
                    {getRentalRoomLabel(rental)}
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-slate-600">
                  {toDateOnlyString(new Date(rental.startDate))}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-slate-600">
                  {rental.endDate
                    ? toDateOnlyString(new Date(rental.endDate))
                    : 'Không thời hạn'}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge variant={status.badgeVariant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Mở thao tác hợp đồng"
                        aria-label="Mở thao tác hợp đồng"
                        className="size-8 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/rentals/${rental.id}`}>
                          Xem chi tiết
                          <ArrowRight className="ml-auto size-4" />
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {pagination && pagination.total > 0 && (
        <PaginationContainer
          variant="plain"
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          disabled={isPending}
          previousText="Trước"
          nextText="Sau"
          summary={
            <span className="text-xs text-slate-500">
              Hiển thị {pagination.firstItem} đến {pagination.lastItem} trên
              tổng số {pagination.total} hợp đồng
            </span>
          }
          className="border-t border-slate-200 bg-slate-50 px-5 py-4"
        />
      )}
      {pagination?.total === 0 && !isPending && (
        <NoDataEmptyState
          title={
            search || activeFilter !== 'ALL'
              ? 'Không tìm thấy hợp đồng phù hợp'
              : 'Chưa có hợp đồng nào'
          }
          subTitle={
            search || activeFilter !== 'ALL'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
              : 'Hợp đồng thuê sẽ hiển thị ở đây sau khi được tạo.'
          }
        />
      )}
    </div>
  );
}
