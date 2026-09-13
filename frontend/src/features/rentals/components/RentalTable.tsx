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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { Rental } from '@/generated/model';
import { PaginationMeta, RENTAL_STATUS_MAP } from '@/types';
import { toDateOnlyString } from '@/utils';

type RentalTableProps = {
  rentals: Rental[];
  page: number;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

function getTenantName(rental: Rental) {
  const profile = rental.tenant?.profile;
  const name = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  return name || rental.tenant?.email || 'Người thuê';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoomLabel(rental: Rental) {
  if (!rental.room) return 'Chưa gán phòng';
  return `Phòng ${rental.room.number} - ${rental.room.building?.name ?? 'Chưa có tòa nhà'}`;
}

function getPageNumbers(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages] as const;
  if (page >= totalPages - 2) {
    return [
      1,
      'ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    'ellipsis',
    page - 1,
    page,
    page + 1,
    'ellipsis',
    totalPages,
  ] as const;
}

export function RentalTable({
  rentals,
  page,
  pagination,
  onPageChange,
}: RentalTableProps) {
  const { limit, total, totalPages, hasNext, hasPrev } = pagination;
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

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
          {rentals.map((rental) => {
            const tenantName = getTenantName(rental);
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
                        {getInitials(tenantName)}
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
                    {getRoomLabel(rental)}
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
      {total > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Hiển thị {firstItem} đến {lastItem} trên tổng số {total} hợp đồng
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Trước"
                  aria-disabled={!hasPrev}
                  className={!hasPrev ? 'pointer-events-none opacity-50' : ''}
                  onClick={(event) => {
                    event.preventDefault();
                    if (hasPrev) onPageChange(page - 1);
                  }}
                />
              </PaginationItem>
              {pageNumbers.map((pageNumber, index) =>
                pageNumber === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === page}
                      onClick={(event) => {
                        event.preventDefault();
                        onPageChange(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Sau"
                  aria-disabled={!hasNext}
                  className={!hasNext ? 'pointer-events-none opacity-50' : ''}
                  onClick={(event) => {
                    event.preventDefault();
                    if (hasNext) onPageChange(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
