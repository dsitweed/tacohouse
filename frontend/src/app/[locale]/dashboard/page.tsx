'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarDays,
  DoorClosed,
  DoorOpen,
  Download,
  Megaphone,
  MessageSquare,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { useBills } from '@/hooks/api/useBills';
import { useBuildings } from '@/hooks/api/useBuildings';
import { useMaintenanceRequests } from '@/hooks/api/useMaintenance';
import { useNotifications } from '@/hooks/api/useNotifications';
import { useRentals } from '@/hooks/api/useRentals';
import { useRooms } from '@/hooks/api/useRooms';
import { useAuthStore } from '@/stores/authStore';
import {
  BillStatus,
  MaintenanceStatus,
  NotificationType,
  RentalStatus,
  RoomStatus,
  UserRole,
} from '@/types';
import { cn, formatCurrency } from '@/utils';

const MONTH_LABELS_VI = [
  'Th1',
  'Th2',
  'Th3',
  'Th4',
  'Th5',
  'Th6',
  'Th7',
  'Th8',
  'Th9',
  'Th10',
  'Th11',
  'Th12',
];

const NOTIFICATION_STYLES: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; bg: string; fg: string }
> = {
  [NotificationType.BILL_GENERATED]: {
    icon: Receipt,
    bg: 'bg-emerald-100',
    fg: 'text-emerald-700',
  },
  [NotificationType.PAYMENT_REMINDER]: {
    icon: Wallet,
    bg: 'bg-emerald-100',
    fg: 'text-emerald-700',
  },
  [NotificationType.MAINTENANCE_UPDATE]: {
    icon: Wrench,
    bg: 'bg-red-100',
    fg: 'text-red-700',
  },
  [NotificationType.CHAT_MESSAGE]: {
    icon: MessageSquare,
    bg: 'bg-blue-100',
    fg: 'text-blue-700',
  },
  [NotificationType.ANNOUNCEMENT]: {
    icon: Megaphone,
    bg: 'bg-amber-100',
    fg: 'text-amber-700',
  },
  [NotificationType.SYSTEM]: {
    icon: Bell,
    bg: 'bg-gray-100',
    fg: 'text-gray-700',
  },
};

function formatRelativeTime(dateStr: string) {
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: vi,
  });
}

function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  delta?: { label: string; positive: boolean };
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          {label}
        </p>
        <Icon className="size-5 text-gray-400" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        {delta && (
          <span
            className={cn(
              'text-xs font-bold',
              delta.positive ? 'text-emerald-700' : 'text-gray-500',
            )}
          >
            {delta.label}
          </span>
        )}
      </div>
    </div>
  );
}

function PaymentBar({
  label,
  pct,
  barClassName,
}: {
  label: string;
  pct: number;
  barClassName: string;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-blue-50">
        <div
          className={cn('h-full rounded-full', barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === UserRole.ADMIN || role === UserRole.LANDLORD) {
    return <AdminLandlordDashboard />;
  }

  return <TenantDashboard />;
}

function AdminLandlordDashboard() {
  const { data: buildingsData } = useBuildings({ page: 1, limit: 1000 });
  const { data: roomsData } = useRooms({ page: 1, limit: 1000 });
  const { data: billsData } = useBills({ page: 1, limit: 1000 });
  const { data: maintenanceData } = useMaintenanceRequests({
    page: 1,
    limit: 100,
  });
  const { data: rentalsData } = useRentals({ page: 1, limit: 1000 });
  const { data: notificationsData } = useNotifications({ page: 1, limit: 5 });

  const notifications = notificationsData?.data ?? [];

  const stats = useMemo(() => {
    const buildings = buildingsData?.data ?? [];
    const rooms = Array.isArray(roomsData) ? roomsData : [];
    const bills = billsData?.data ?? [];
    const maintenance = maintenanceData?.data ?? [];
    const rentals = rentalsData?.data ?? [];

    const now = new Date();
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(
      (r) => r.status === RoomStatus.OCCUPIED,
    ).length;
    const vacantRooms = rooms.filter(
      (r) => r.status === RoomStatus.AVAILABLE,
    ).length;
    const maintenanceRooms = rooms.filter(
      (r) => r.status === RoomStatus.MAINTENANCE,
    ).length;

    const newBuildingsThisMonth = buildings.filter((b) => {
      const d = new Date(b.createdAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const revenueTrend = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const total = bills
        .filter((bill) => {
          if (bill.status !== BillStatus.PAID) return false;
          const billDate = new Date(bill.billingPeriod);
          return (
            billDate.getMonth() === d.getMonth() &&
            billDate.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
      return { label: MONTH_LABELS_VI[d.getMonth()], total };
    });

    const monthlyRevenue = revenueTrend[revenueTrend.length - 1].total;
    const previousMonthRevenue = revenueTrend[revenueTrend.length - 2].total;
    const revenueDeltaPct =
      previousMonthRevenue > 0
        ? Math.round(
            ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) *
              100,
          )
        : null;

    const pendingBillStatuses: BillStatus[] = [
      BillStatus.PENDING,
      BillStatus.TENANT_CONFIRMED,
      BillStatus.LANDLORD_CONFIRMED,
    ];
    const paidAmount = bills
      .filter((b) => b.status === BillStatus.PAID)
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const pendingAmount = bills
      .filter((b) => pendingBillStatuses.includes(b.status))
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const overdueAmount = bills
      .filter((b) => b.status === BillStatus.OVERDUE)
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const outstandingAmount = pendingAmount + overdueAmount;
    const billTotal = paidAmount + pendingAmount + overdueAmount || 1;

    const in30Days = now.getTime() + 30 * 24 * 60 * 60 * 1000;
    const expiringRentals = rentals
      .filter(
        (r) =>
          r.status === RentalStatus.ACTIVE &&
          r.endDate &&
          new Date(r.endDate).getTime() >= now.getTime() &&
          new Date(r.endDate).getTime() <= in30Days,
      )
      .sort(
        (a, b) =>
          new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime(),
      );

    const urgentMaintenance = maintenance.filter(
      (m) =>
        m.status === MaintenanceStatus.PENDING ||
        m.status === MaintenanceStatus.IN_PROGRESS,
    );

    return {
      totalBuildings: buildings.length,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      maintenanceRooms,
      newBuildingsThisMonth,
      revenueTrend,
      monthlyRevenue,
      revenueDeltaPct,
      outstandingAmount,
      paymentBreakdown: {
        received: Math.round((paidAmount / billTotal) * 100),
        pending: Math.round((pendingAmount / billTotal) * 100),
        overdue: Math.round((overdueAmount / billTotal) * 100),
      },
      expiringRentals,
      urgentMaintenance,
    };
  }, [buildingsData, roomsData, billsData, maintenanceData, rentalsData]);

  const occupancyPct =
    stats.totalRooms > 0
      ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
      : 0;
  const occupancyLabel =
    occupancyPct >= 80
      ? 'Tốt'
      : occupancyPct >= 50
        ? 'Trung bình'
        : 'Cần chú ý';

  const maxRevenue = Math.max(...stats.revenueTrend.map((m) => m.total), 1);
  const chartWidth = 600;
  const chartHeight = 200;
  const points = stats.revenueTrend.map((m, i) => {
    const x = (i / (stats.revenueTrend.length - 1)) * chartWidth;
    const y = chartHeight - (m.total / maxRevenue) * chartHeight;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M0,${chartHeight} L ${points.join(' L ')} L ${chartWidth},${chartHeight} Z`;

  const quickActions = [
    { label: 'Thêm nhà trọ', href: '/dashboard/buildings', icon: Building2 },
    { label: 'Thêm phòng', href: '/dashboard/rooms', icon: DoorOpen },
    { label: 'Thêm người thuê', href: '/dashboard/tenants', icon: Users },
    { label: 'Tạo hóa đơn', href: '/dashboard/bills', icon: Receipt },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Tổng quan hệ thống
          </h1>
          <p className="mt-1 text-base text-gray-600">
            Chỉ số hiệu suất thời gian thực cho danh mục của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            title="Tính năng sắp ra mắt"
            className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 opacity-60"
          >
            <CalendarDays className="size-4" />
            30 ngày qua
          </button>
          <button
            type="button"
            disabled
            title="Tính năng sắp ra mắt"
            className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white opacity-60"
          >
            <Download className="size-3" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Tổng nhà trọ"
          value={stats.totalBuildings}
          icon={Building2}
          delta={
            stats.newBuildingsThisMonth > 0
              ? { label: `+${stats.newBuildingsThisMonth} mới`, positive: true }
              : undefined
          }
        />
        <KpiCard label="Tổng phòng" value={stats.totalRooms} icon={DoorOpen} />
        <KpiCard
          label="Đã lấp đầy"
          value={
            <>
              {stats.occupiedRooms}
              <span className="text-sm font-normal text-gray-500">
                {' '}
                / {stats.totalRooms}
              </span>
            </>
          }
          icon={ShieldCheck}
        />
        <KpiCard
          label="Phòng trống"
          value={stats.vacantRooms}
          icon={DoorClosed}
        />
        <KpiCard
          label="Doanh thu"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={Wallet}
          delta={
            stats.revenueDeltaPct !== null
              ? {
                  label: `${stats.revenueDeltaPct >= 0 ? '↑' : '↓'} ${Math.abs(stats.revenueDeltaPct)}%`,
                  positive: stats.revenueDeltaPct >= 0,
                }
              : undefined
          }
        />
        <KpiCard
          label="Còn nợ"
          value={formatCurrency(stats.outstandingAmount)}
          icon={AlertTriangle}
        />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Revenue Chart */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Doanh thu theo tháng
              </h3>
              <p className="text-sm text-gray-600">
                Doanh thu đã thanh toán trong 6 tháng gần đây
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <span className="size-3 rounded-full bg-indigo-600" />
              Doanh thu
            </div>
          </div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-52 w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#revenueFill)" />
            <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" />
          </svg>
          <div className="flex justify-between text-xs text-gray-500">
            {stats.revenueTrend.map((m) => (
              <span key={m.label}>{m.label}</span>
            ))}
          </div>
        </div>

        {/* Occupancy Donut + Payment Status */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="w-full text-lg font-semibold text-gray-900">
              Tỷ lệ lấp đầy
            </h3>
            <div
              className="relative flex size-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#4f46e5 0deg ${occupancyPct * 3.6}deg, #e5eeff ${occupancyPct * 3.6}deg 360deg)`,
              }}
            >
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-gray-900">
                  {occupancyPct}%
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {occupancyLabel}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phòng đã thuê</span>
                <span className="font-bold text-gray-900">
                  {stats.occupiedRooms}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Đang bảo trì</span>
                <span className="font-bold text-gray-900">
                  {stats.maintenanceRooms}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Còn trống</span>
                <span className="font-bold text-gray-900">
                  {stats.vacantRooms}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Trạng thái thanh toán
            </h3>
            <PaymentBar
              label="Đã nhận"
              pct={stats.paymentBreakdown.received}
              barClassName="bg-emerald-600"
            />
            <PaymentBar
              label="Đang chờ"
              pct={stats.paymentBreakdown.pending}
              barClassName="bg-amber-500"
            />
            <PaymentBar
              label="Quá hạn"
              pct={stats.paymentBreakdown.overdue}
              barClassName="bg-red-600"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:bg-gray-50"
              >
                <Icon className="size-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-900">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Hoạt động gần đây
          </h3>
          <div className="flex flex-col gap-4">
            {notifications.slice(0, 3).map((n) => {
              const meta =
                NOTIFICATION_STYLES[n.type] ??
                NOTIFICATION_STYLES[NotificationType.SYSTEM];
              const Icon = meta.icon;
              return (
                <div key={n.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full',
                      meta.bg,
                    )}
                  >
                    <Icon className={cn('size-4', meta.fg)} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="text-xs font-semibold text-gray-400">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <p className="text-sm text-gray-500">
                Chưa có hoạt động nào gần đây.
              </p>
            )}
          </div>
          <Link
            href="/dashboard/notifications"
            className="rounded-lg border border-indigo-100 py-2 text-center text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Xem tất cả hoạt động
          </Link>
        </div>

        {/* Maintenance + Expiring Contracts */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Bảo trì</h3>
              {stats.urgentMaintenance.length > 0 && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white uppercase"
                >
                  {stats.urgentMaintenance.length} cảnh báo
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {stats.urgentMaintenance.slice(0, 2).map((req) => (
                <div
                  key={req.id}
                  className="rounded-lg border-l-4 border-red-600 bg-indigo-50 py-3 pr-3 pl-4"
                >
                  <p className="text-sm font-bold text-gray-900">{req.title}</p>
                  <p className="text-sm text-gray-600">
                    {req.room?.building?.name ?? 'Nhà trọ'} - Phòng{' '}
                    {req.room?.number}
                  </p>
                </div>
              ))}
              {stats.urgentMaintenance.length === 0 && (
                <p className="text-sm text-gray-500">
                  Không có yêu cầu bảo trì đang chờ xử lý.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Hợp đồng sắp hết hạn
              </h3>
              <span className="text-right text-xs font-semibold text-gray-500">
                30 ngày tới
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {stats.expiringRentals.slice(0, 3).map((rental) => {
                const endDate = new Date(rental.endDate!);
                const tenantName = rental.tenant?.user?.profile
                  ? `${rental.tenant.user.profile.lastName} ${rental.tenant.user.profile.firstName}`
                  : (rental.tenant?.user?.email ?? 'Người thuê');
                return (
                  <div
                    key={rental.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-100">
                      <span className="text-xs font-bold text-indigo-600 uppercase">
                        {MONTH_LABELS_VI[endDate.getMonth()]}
                      </span>
                      <span className="text-sm font-bold text-indigo-600">
                        {endDate.getDate()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900">
                        {tenantName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {rental.room?.building?.name ?? 'Nhà trọ'} - Phòng{' '}
                        {rental.room?.number}
                      </p>
                    </div>
                  </div>
                );
              })}
              {stats.expiringRentals.length === 0 && (
                <p className="text-sm text-gray-500">
                  Không có hợp đồng nào sắp hết hạn.
                </p>
              )}
            </div>
            <Link
              href="/dashboard/tenants"
              className="rounded-lg bg-indigo-50 py-2 text-center text-sm font-medium text-gray-900 hover:bg-indigo-100"
            >
              Xem tất cả ({stats.expiringRentals.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantDashboard() {
  const { user } = useAuthStore();
  const { data: billsData } = useBills({ page: 1, limit: 100 });
  const { data: maintenanceData } = useMaintenanceRequests({
    page: 1,
    limit: 100,
  });

  const bills = billsData?.data ?? [];
  const maintenance = maintenanceData?.data ?? [];

  const pendingBillStatuses: BillStatus[] = [
    BillStatus.PENDING,
    BillStatus.TENANT_CONFIRMED,
    BillStatus.LANDLORD_CONFIRMED,
    BillStatus.OVERDUE,
  ];
  const pendingBills = bills.filter((bill) =>
    pendingBillStatuses.includes(bill.status),
  ).length;

  const openMaintenance = maintenance.filter(
    (req) =>
      req.status === MaintenanceStatus.PENDING ||
      req.status === MaintenanceStatus.IN_PROGRESS,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Chào mừng trở lại, {user?.profile?.firstName || user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Hóa đơn chưa thanh toán
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {pendingBills}
            </p>
          </div>
          {pendingBills > 0 && (
            <Badge variant="destructive">{pendingBills}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Yêu cầu sửa chữa đang xử lý
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {openMaintenance}
            </p>
          </div>
          {openMaintenance > 0 && (
            <Badge variant="secondary">{openMaintenance}</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row">
        <Link
          href="/dashboard/bills"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Xem hóa đơn
        </Link>
        <Link
          href="/dashboard/maintenance"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Gửi yêu cầu sửa chữa
        </Link>
      </div>
    </div>
  );
}
