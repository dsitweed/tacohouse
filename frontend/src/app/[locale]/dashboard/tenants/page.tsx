'use client';

import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Eye,
  Home,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui';
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentStatus, RentalStatus, UserRole } from '@/generated/model';
import { useRentals } from '@/hooks/api/useRentals';
import { useAuthStore } from '@/stores/authStore';
import { PAYMENT_STATUS_MAP, RENTAL_STATUS_MAP } from '@/types';
import { cn, toDateOnlyString } from '@/utils';

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

export default function TenantsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RentalStatusFilter>('ALL');

  const { data: rentalsData, isLoading } = useRentals({
    page: 1,
    limit: 100,
  });

  // TODO: Need push this logic to the BE for better performance
  // Process & filter tenants
  const { tenants, stats } = useMemo(() => {
    if (!rentalsData?.data) {
      return {
        tenants: [],
        stats: {
          total: 0,
          active: 0,
          pendingPayment: 0,
          renewalsDue: 0,
        },
      };
    }

    const allRentals = rentalsData.data;

    const mapped = allRentals.map((rental) => {
      const firstName = rental.tenant?.profile?.firstName || '';
      const lastName = rental.tenant?.profile?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Người thuê';
      const initials =
        (firstName[0] || '') + (lastName[0] || '') || fullName[0] || 'T';

      // TODO: Replace with real data
      // Mock contract/payment status for UI demonstration matching Figma
      const isPendingPayment = rental.status === RentalStatus.NOTICE_GIVEN;
      // TODO: Status for payment not have overdue (Confusing with bill status)
      const paymentStatus: PaymentStatus =
        rental.status === 'ACTIVE'
          ? 'COMPLETED'
          : isPendingPayment
            ? 'PENDING'
            : 'FAILED';

      const createdAtFormatted = toDateOnlyString(new Date(rental.createdAt));

      return {
        id: rental.id,
        tenantId: rental.tenantId,
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
    });

    // Calculate dynamic stats
    const totalCount = mapped.length;
    const activeCount = mapped.filter(
      (t) => t.status === RentalStatus.ACTIVE,
    ).length;
    const pendingPaymentCount = mapped.filter(
      (t) => t.paymentStatus === 'FAILED' || t.paymentStatus === 'PENDING',
    ).length;
    const renewalsCount = mapped.filter(
      (t) => t.status === RentalStatus.NOTICE_GIVEN,
    ).length;

    // Filter by Tab and Search string
    const filtered = mapped.filter((tenant) => {
      // Tab filter
      if (statusFilter === 'ACTIVE' && tenant.status !== RentalStatus.ACTIVE) {
        return false;
      }
      if (
        statusFilter === 'NOTICE' &&
        tenant.status !== RentalStatus.NOTICE_GIVEN
      ) {
        return false;
      }

      // Search filter
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        tenant.fullName.toLowerCase().includes(s) ||
        tenant.email.toLowerCase().includes(s) ||
        tenant.phone.includes(s) ||
        tenant.roomNumber.toLowerCase().includes(s) ||
        tenant.buildingName.toLowerCase().includes(s)
      );
    });

    return {
      tenants: filtered,
      stats: {
        total: totalCount,
        active: activeCount,
        pendingPayment: pendingPaymentCount,
        renewalsDue: renewalsCount,
      },
    };
  }, [rentalsData, search, statusFilter]);

  const canView =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  // TODO: Update with Empty State component for users who cannot view this page
  if (!canView) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Bạn không có quyền truy cập trang này</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-4">
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
              <span>+12 tháng này</span>
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
              {/* TODO: fill with actual data */}
              <span>90.2% tỷ lệ lấp đầy</span>
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
                <TableRow className="border-b border-slate-200 text-xs font-bold tracking-wider text-slate-600 uppercase">
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
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <Users className="size-12 text-slate-300" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">
                  {search
                    ? 'Không tìm thấy người thuê phù hợp'
                    : 'Chưa có dữ liệu người thuê'}
                </p>
                <p className="text-xs text-slate-400">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
