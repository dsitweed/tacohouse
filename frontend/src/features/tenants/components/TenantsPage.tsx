'use client';

import { cn } from 'cn';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  History,
  Home,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Search,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  NoDataEmptyState,
  PaginationContainer,
  Spinner,
} from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bill,
  PaymentStatus,
  Rental,
  RentalStatus,
  UserRole,
} from '@/generated/model';
import { useBills } from '@/hooks/api/useBills';
import { useRentals,useRentalStats } from '@/hooks/api/useRentals';
import { usePagination } from '@/hooks/use-pagination';
import { useAuthStore } from '@/stores/authStore';
import { PAYMENT_STATUS_MAP, RENTAL_STATUS_MAP } from '@/types';
import { formatCurrency, toDateOnlyString } from '@/utils';

const RENTAL_STATUS_FILTER = [
  {
    value: 'ALL',
    label: 'Tất cả',
  },
  {
    value: 'ACTIVE',
    label: 'Đang thuê',
  },
  {
    value: 'NOTICE',
    label: 'Sắp hết hạn / Báo chuyển',
  },
] as const;
type RentalStatusFilter = (typeof RENTAL_STATUS_FILTER)[number]['value'];

// Tenants are derived from rentals because the API exposes no dedicated
// tenants endpoint; payment status comes from each room's latest bill.
function mapRentalToTenant(
  rental: Rental,
  billsByRoom: Map<string, Bill[]>,
) {
  const firstName = rental.tenant?.profile?.firstName || '';
  const lastName = rental.tenant?.profile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Người thuê';
  const initials =
    (firstName[0] || '') + (lastName[0] || '') || fullName[0] || 'T';

  // Real payment status: the most recent bill for this room, falling back to
  // PENDING when the tenant has no payment recorded yet.
  const roomBills = billsByRoom.get(rental.roomId) ?? [];
  const latestBill = roomBills[0];
  const paymentStatus: PaymentStatus =
    latestBill?.payment?.status ?? PaymentStatus.PENDING;

  const createdAtFormatted = toDateOnlyString(new Date(rental.createdAt));

  return {
    id: rental.tenantId,
    rentalId: rental.id,
    fullName,
    initials,
    avatar: rental.tenant?.profile?.avatar || null,
    phone: rental.tenant?.profile?.phone || 'Chưa cập nhật',
    email: rental.tenant?.email || 'N/A',
    roomNumber: rental.room?.number || 'N/A',
    buildingName: rental.room?.building?.name || 'Tòa nhà N/A',
    status: rental.status,
    paymentStatus,
    createdAtFormatted,
    startDate: rental.startDate,
    endDate: rental.endDate,
  };
}

type TenantRow = ReturnType<typeof mapRentalToTenant>;

// One row per tenant, prefer the active rental then the newest
function dedupeTenants(rows: TenantRow[]) {
  const tenantMap = new Map<string, TenantRow>();

  for (const tenant of rows) {
    const existing = tenantMap.get(tenant.id);
    if (!existing) {
      tenantMap.set(tenant.id, tenant);
      continue;
    }

    const isActive = tenant.status === RentalStatus.ACTIVE;
    const existingIsActive = existing.status === RentalStatus.ACTIVE;
    if (
      (isActive && !existingIsActive) ||
      (isActive === existingIsActive &&
        new Date(tenant.startDate) > new Date(existing.startDate))
    ) {
      tenantMap.set(tenant.id, tenant);
    }
  }

  return Array.from(tenantMap.values());
}

export function TenantsPage() {
  const { user, isHydrated } = useAuthStore((state) => state);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RentalStatusFilter>('ALL');

  const { page, setPage, limit } = usePagination(
    `${search.trim()}|${statusFilter}`,
  );

  // Tenants are derived from rentals; the stats endpoint gives authoritative
  // active/expiring counts, and bills give real payment status per tenant.
  const { data: statsData } = useRentals({
    page: 1,
    limit: 1000,
  });
  const { data: rentalStats } = useRentalStats();
  const { data: billsData } = useBills({ page: 1, limit: 1000 });

  const { data: rentalsData, isLoading } = useRentals({
    page,
    limit,
    search: search.trim() || undefined,
    status:
      statusFilter === 'ALL'
        ? undefined
        : statusFilter === 'ACTIVE'
          ? 'ACTIVE'
          : 'NOTICE_GIVEN',
  });

  const pagination = rentalsData?.pagination;

  const billsByRoom = useMemo(() => {
    const map = new Map<string, Bill[]>();
    for (const bill of billsData?.data ?? []) {
      const list = map.get(bill.roomId) ?? [];
      list.push(bill);
      map.set(bill.roomId, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(b.billingPeriod).getTime() -
          new Date(a.billingPeriod).getTime(),
      );
    }
    return map;
  }, [billsData]);

  const tenants = useMemo(
    () =>
      dedupeTenants(
        (rentalsData?.data ?? []).map((rental) =>
          mapRentalToTenant(rental, billsByRoom),
        ),
      ),
    [rentalsData, billsByRoom],
  );

  const stats = useMemo(() => {
    const unique = dedupeTenants(
      (statsData?.data ?? []).map((rental) =>
        mapRentalToTenant(rental, billsByRoom),
      ),
    );

    const now = new Date();
    const newThisMonth = unique.filter((tenant) => {
      const started = new Date(tenant.startDate);
      return (
        started.getMonth() === now.getMonth() &&
        started.getFullYear() === now.getFullYear()
      );
    }).length;

    const active =
      rentalStats?.activeCount ??
      unique.filter((tenant) => tenant.status === RentalStatus.ACTIVE).length;
    // "Sắp hết hạn" is time-derived (endDate within 30 days) and is a
    // different concept from the NOTICE_GIVEN lifecycle state.
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);
    const renewalsDue =
      rentalStats?.expiringSoonCount ??
      unique.filter(
        (tenant) =>
          tenant.status === RentalStatus.ACTIVE &&
          tenant.endDate !== null &&
          new Date(tenant.endDate).getTime() >= now.getTime() &&
          new Date(tenant.endDate).getTime() <= in30Days.getTime(),
      ).length;
    const pendingPayment = unique.filter(
      (tenant) =>
        tenant.paymentStatus === PaymentStatus.PENDING ||
        tenant.paymentStatus === PaymentStatus.FAILED,
    ).length;

    return {
      total: unique.length,
      active,
      newThisMonth,
      pendingPayment,
      renewalsDue,
      monthlyRevenue: Number(rentalStats?.monthlyRevenue ?? 0),
    };
  }, [statsData, billsByRoom, rentalStats]);

  const canView =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  if (!isHydrated) {
    return <Spinner className="mx-auto my-10 size-6" />;
  }

  const handleExportCsv = () => {
    const headers = [
      'Tên người thuê',
      'Điện thoại',
      'Email',
      'Tòa nhà',
      'Phòng',
      'Hợp đồng',
      'Thanh toán',
    ];
    const rows = tenants.map((tenant) => [
      tenant.fullName,
      tenant.phone,
      tenant.email,
      tenant.buildingName,
      tenant.roomNumber,
      RENTAL_STATUS_MAP[tenant.status].label,
      PAYMENT_STATUS_MAP[tenant.paymentStatus].title,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','),
      )
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tenants.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!canView) {
    return (
      <NoDataEmptyState
        title="Không có quyền truy cập"
        subTitle="Bạn không có quyền truy cập vào trang này."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Quản lý người thuê
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin người thuê, theo dõi hợp đồng và trạng thái thanh
            toán
          </p>
        </div>
        {/* TODO: add actions */}
        <Button>
          <UserPlus className="size-4" />
          <span>Thêm người thuê</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Tenants */}
        <Card>
          <CardContent>
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Tổng người thuê
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats.total}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="size-4" />
              <span>+{stats.newThisMonth} tháng này</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Active Contracts */}
        <Card>
          <CardContent>
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Hợp đồng hoạt động
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats.active}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="size-4" />
              <span>
                Doanh thu tháng: {formatCurrency(stats.monthlyRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pending Payments */}
        <Card>
          <CardContent>
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Chờ thanh toán
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats.pendingPayment}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-600">
              <AlertTriangle className="size-4" />
              <span>Cần xử lý thanh toán</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Renewals Due */}
        <Card>
          <CardContent>
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Sắp hết hạn hợp đồng
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats.renewalsDue}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600">
              <Clock className="size-4" />
              <span>Trong 30 ngày tới</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Container */}
      <Card className="overflow-hidden">
        {/* Table Filters & Search Controls */}
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Status Buttons */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {RENTAL_STATUS_FILTER.map((status) => (
                  <Button
                    key={status.value}
                    type="button"
                    variant="ghost"
                    onClick={() => setStatusFilter(status.value)}
                    className={cn(
                      'text-xs hover:bg-white',
                      statusFilter === status.value
                        ? 'text-primary bg-white'
                        : 'text-gray-600 hover:text-gray-900',
                    )}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>

              {/* Search Input */}
              <div className="min-w-xs">
                <InputGroup className="">
                  <InputGroupAddon>
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Tìm người thuê, phòng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              <span>Hiển thị </span>
              <span className="font-semibold text-gray-700">
                {tenants.length}
              </span>
              <span> người thuê</span>
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="size-8 animate-spin rounded-full border-b-2 border-indigo-600" />
              <p className="text-sm text-slate-500">
                Đang tải danh sách người thuê...
              </p>
            </div>
          ) : tenants.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="text-xs tracking-wider text-slate-600 uppercase [&>th]:font-bold">
                  <TableHead className="pl-4">NGƯỜI THUÊ</TableHead>
                  <TableHead>LIÊN HỆ</TableHead>
                  <TableHead>TÒA NHÀ</TableHead>
                  <TableHead>PHÒNG</TableHead>
                  <TableHead>HỢP ĐỒNG</TableHead>
                  <TableHead>THANH TOÁN</TableHead>
                  <TableHead>THAO TÁC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_td]:py-3">
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="pl-4">
                      <Link
                        className="flex items-center gap-3"
                        href={`/dashboard/tenants/${tenant.id}`}
                      >
                        <Avatar className="size-10 shrink-0">
                          <AvatarImage
                            src={tenant.avatar || ''}
                            alt={tenant.fullName}
                          />
                          <AvatarFallback>{tenant.initials}</AvatarFallback>
                        </Avatar>
                        <div className="max-w-44 min-w-0 [&>div]:truncate">
                          <div className="text-sm font-semibold text-slate-900">
                            {tenant.fullName}
                          </div>
                          <div className="text-xs text-slate-400">
                            Tham gia {tenant.createdAtFormatted}
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    {/* Contact Column */}
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="size-3.5 text-slate-400" />
                          <span>{tenant.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="size-3.5 text-slate-400" />
                          <span>{tenant.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Building Column */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Building className="size-3.5 shrink-0 text-slate-400" />
                        <span className="max-w-44 truncate">
                          {tenant.buildingName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Room Column */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                        <Home className="size-3.5 text-indigo-500" />
                        <span>Phòng {tenant.roomNumber}</span>
                      </div>
                    </TableCell>

                    {/* Contract Status Column */}
                    <TableCell>
                      <Badge
                        variant={RENTAL_STATUS_MAP[tenant.status].badgeVariant}
                      >
                        {RENTAL_STATUS_MAP[tenant.status].label}
                      </Badge>
                    </TableCell>

                    {/* Payment Status Column */}
                    <TableCell>
                      <Badge
                        variant={
                          PAYMENT_STATUS_MAP[tenant.paymentStatus].badgeVariant
                        }
                      >
                        {PAYMENT_STATUS_MAP[tenant.paymentStatus].title}
                      </Badge>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/rentals/${tenant.id}`}>
                              <Eye className="size-4" />
                              <span>Xem hợp đồng</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/chat`}>
                              <MessageSquare className="size-4" />
                              <span>Gửi tin nhắn</span>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8">
              <NoDataEmptyState
                title={
                  search || statusFilter !== 'ALL'
                    ? 'Không tìm thấy người thuê phù hợp'
                    : 'Chưa có dữ liệu người thuê'
                }
                subTitle={
                  search || statusFilter !== 'ALL'
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.'
                    : 'Dữ liệu người thuê sẽ hiển thị khi có hợp đồng thuê.'
                }
              />
            </div>
          )}
          {pagination && pagination.total > 0 && (
            <PaginationContainer
              variant="plain"
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              disabled={isLoading}
              previousText="Trước"
              nextText="Sau"
              summary={`Hiển thị ${pagination.firstItem} đến ${pagination.lastItem} trên tổng số ${pagination.total} hợp đồng`}
              className="border-t border-slate-200 px-4 py-3"
            />
          )}
        </CardContent>
      </Card>

      {/* Action buttons for tenants page */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          asChild
          className="group h-auto min-h-28 justify-start gap-4 rounded-xl border-slate-200 bg-white/80 p-6 text-left shadow-none backdrop-blur-sm hover:bg-white hover:shadow-md"
        >
          <Link href="/dashboard/chat">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-transform group-hover:scale-110">
              <Mail className="size-5" />
            </span>
            <span className="flex flex-col items-start gap-1">
              <span className="text-sm font-semibold text-slate-900">
                Bulk Message
              </span>
              <span className="text-sm font-normal text-slate-500">
                Send updates to all tenants
              </span>
            </span>
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleExportCsv}
          className="group h-auto min-h-28 justify-start gap-4 rounded-xl border-slate-200 bg-white/80 p-6 text-left shadow-none backdrop-blur-sm hover:bg-white hover:shadow-md"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
            <FileText className="size-5" />
          </span>
          <span className="flex flex-col items-start gap-1">
            <span className="text-sm font-semibold text-slate-900">
              Export CSV
            </span>
            <span className="text-sm font-normal text-slate-500">
              Generate tenant data report
            </span>
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          asChild
          className="group h-auto min-h-28 justify-start gap-4 rounded-xl border-slate-200 bg-white/80 p-6 text-left shadow-none backdrop-blur-sm hover:bg-white hover:shadow-md"
        >
          <Link href="/dashboard/notifications">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition-transform group-hover:scale-110">
              <History className="size-5" />
            </span>
            <span className="flex flex-col items-start gap-1">
              <span className="text-sm font-semibold text-slate-900">
                Activity Log
              </span>
              <span className="text-sm font-normal text-slate-500">
                View recent profile changes
              </span>
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
