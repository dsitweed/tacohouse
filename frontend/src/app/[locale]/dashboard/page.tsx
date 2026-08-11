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
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import KpiCard from '@/components/KpiCard';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@/components/ui';
import {
  BillStatus,
  MaintenanceStatus,
  NotificationType,
  RentalStatus,
  RoomStatus,
  UserRole,
} from '@/generated/model';
import {
  useBills,
  useBuildings,
  useMaintenanceRequests,
  useNotifications,
  useRentals,
  useRooms,
} from '@/hooks/api';
import { useDashboardRevenueTrend } from '@/hooks/api/useDashboards';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency } from '@/utils';

const revenueChartConfig = {
  total: {
    label: 'Doanh thu',
    color: '#4f46e5',
  },
} satisfies ChartConfig;

const occupancyChartConfig = {
  occupied: {
    label: 'Phòng đã thuê',
    color: '#4f46e5',
  },
  maintenance: {
    label: 'Đang bảo trì',
    color: '#f59e0b',
  },
  vacant: {
    label: 'Còn trống',
    color: '#e2e8f0',
  },
} satisfies ChartConfig;

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
  {
    icon: React.ComponentType<{ className?: string }>;
    background: string;
    foreground: string;
  }
> = {
  [NotificationType.BILL_GENERATED]: {
    icon: Receipt,
    background: 'bg-emerald-100',
    foreground: 'text-emerald-700',
  },
  [NotificationType.PAYMENT_REMINDER]: {
    icon: Wallet,
    background: 'bg-emerald-100',
    foreground: 'text-emerald-700',
  },
  [NotificationType.MAINTENANCE_UPDATE]: {
    icon: Wrench,
    background: 'bg-red-100',
    foreground: 'text-red-700',
  },
  [NotificationType.CHAT_MESSAGE]: {
    icon: MessageSquare,
    background: 'bg-blue-100',
    foreground: 'text-blue-700',
  },
  [NotificationType.ANNOUNCEMENT]: {
    icon: Megaphone,
    background: 'bg-amber-100',
    foreground: 'text-amber-700',
  },
  [NotificationType.SYSTEM]: {
    icon: Bell,
    background: 'bg-gray-100',
    foreground: 'text-gray-700',
  },
};

// TODO: Move this function to a utility file + i18n support
function formatRelativeTime(dateStr: string) {
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: vi,
  });
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === UserRole.ADMIN || role === UserRole.LANDLORD) {
    return <AdminLandlordDashboard />;
  }

  return <TenantDashboard />;
}

const AdminLandlordDashboard = () => {
  const { data: buildingsData } = useBuildings({ page: 1, limit: 1000 });
  const { data: roomsData } = useRooms({ page: 1, limit: 1000 });
  const { data: billsData } = useBills({ page: 1, limit: 1000 });
  const { data: dashboardRevenueTrendData } = useDashboardRevenueTrend({
    months: 6,
  });
  const { data: maintenanceData } = useMaintenanceRequests({
    page: 1,
    limit: 100,
  });
  const { data: rentalsData } = useRentals({ page: 1, limit: 1000 });
  const { data: notificationsData } = useNotifications({
    page: 1,
    limit: 1000,
  });

  const notifications = notificationsData?.data ?? [];

  const stats = useMemo(() => {
    const buildings = buildingsData?.data ?? [];
    const rooms = roomsData?.data ?? [];
    const bills = billsData?.data ?? [];
    const maintenance = maintenanceData?.data ?? [];
    const rentals = rentalsData?.data ?? [];

    const now = new Date();

    const occupiedRooms = rooms.filter(
      (room) => room.status === RoomStatus.OCCUPIED,
    );
    const vacantRooms = rooms.filter(
      (room) => room.status === RoomStatus.AVAILABLE,
    );
    const maintenanceRooms = rooms.filter(
      (room) => room.status === RoomStatus.MAINTENANCE,
    );

    const newBuildingsThisMonth = buildings.filter((building) => {
      const day = new Date(building.createdAt);
      return (
        day.getMonth() === now.getMonth() &&
        day.getFullYear() === now.getFullYear()
      );
    });

    const revenueTrend = dashboardRevenueTrendData?.data ?? [];
    console.log({
      revenueTrend,
    });
    const monthlyRevenue = revenueTrend.at(-1)?.total ?? 0;
    const previousMonthRevenue = revenueTrend.at(-2)?.total ?? 0;
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
      .filter((bill) => bill.status === BillStatus.PAID)
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const pendingAmount = bills
      .filter((bill) => pendingBillStatuses.includes(bill.status))
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const overdueAmount = bills
      .filter((bill) => bill.status === BillStatus.OVERDUE)
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const outstandingAmount = pendingAmount + overdueAmount;
    const billTotal = paidAmount + pendingAmount + overdueAmount || 1;

    const in30Days = now.getTime() + 30 * 24 * 60 * 60 * 1000;
    // const expiringRentals = rentals
    //   .filter(
    //     (rental) =>
    //       rental.status === RentalStatus.ACTIVE &&
    //       rental.endDate &&
    //       new Date(rental.endDate).getTime() > now.getTime() &&
    //       new Date(rental.endDate).getTime() <= in30Days,
    //   )
    //   .sort(
    //     (a, b) =>
    //       new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime(),
    //   );
    const expiringRentals = rentals;

    const urgentMaintenance = maintenance.filter(
      (maintenance) =>
        maintenance.status === MaintenanceStatus.PENDING ||
        maintenance.status === MaintenanceStatus.IN_PROGRESS,
    );

    const paymentBreakdown = {
      received: Math.round((paidAmount / billTotal) * 100),
      pending: Math.round((pendingAmount / billTotal) * 100),
      overdue: Math.round((overdueAmount / billTotal) * 100),
    };

    return {
      buildings: buildingsData?.data ?? [],
      newBuildingsThisMonth,
      rooms,
      maintenanceRooms,
      occupiedRooms,
      vacantRooms,
      revenueTrend,
      monthlyRevenue,
      revenueDeltaPct,
      outstandingAmount,
      expiringRentals,
      urgentMaintenance,
      paymentBreakdown,
    };
  }, [
    buildingsData,
    roomsData,
    billsData,
    maintenanceData,
    rentalsData,
    dashboardRevenueTrendData,
  ]);

  const occupancyPct =
    stats.rooms.length > 0
      ? Math.round((stats.occupiedRooms.length / stats.rooms.length) * 100)
      : 0;
  const occupancyLabel =
    occupancyPct >= 80
      ? 'Tốt'
      : occupancyPct >= 50
        ? 'Trung bình'
        : 'Cần chú ý';
  const donutData = [
    {
      name: occupancyChartConfig.occupied.label,
      value: stats.occupiedRooms.length,
      fill: occupancyChartConfig.occupied.color,
    },
    {
      name: occupancyChartConfig.maintenance.label,
      value: stats.maintenanceRooms.length,
      fill: occupancyChartConfig.maintenance.color,
    },
    {
      name: occupancyChartConfig.vacant.label,
      value: stats.vacantRooms.length,
      fill: occupancyChartConfig.vacant.color,
    },
  ];

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
          <Button
            variant="outline"
            type="button"
            disabled
            title="Tính năng sắp ra mắt"
          >
            <CalendarDays className="size-4" />
            30 ngày qua
          </Button>
          <Button type="button" disabled title="Tính năng sắp ra mắt">
            <Download className="size-3" />
            Xuất báo cáo
          </Button>
        </div>
      </div>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <KpiCard
          label="Tổng nhà trọ"
          value={buildingsData?.data.length}
          icon={Building2}
          delta={
            stats.newBuildingsThisMonth.length > 0
              ? {
                  label: `+${stats.newBuildingsThisMonth.length} mới`,
                  positive: true,
                }
              : undefined
          }
          iconClassName=" text-blue-700"
        />
        <KpiCard
          label="Tổng phòng"
          value={stats.rooms.length}
          icon={DoorOpen}
          iconClassName="text-blue-700"
        />
        <KpiCard
          label="Đã lấp đầy"
          value={
            <>
              {stats.occupiedRooms.length}
              <span className="text-sm font-normal text-gray-500">
                {'/'}
                {stats.rooms.length}
              </span>
            </>
          }
          icon={ShieldCheck}
          iconClassName="text-green-700"
        />
        <KpiCard
          label="Phòng trống"
          value={stats.vacantRooms.length}
          icon={DoorClosed}
          iconClassName="text-red-700"
        />
        <KpiCard
          label="Doanh thu"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={Wallet}
          iconClassName="text-blue-700"
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
          label="Dư nợ"
          value={formatCurrency(stats.outstandingAmount)}
          icon={AlertTriangle}
          iconClassName="text-red-700"
        />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Doanh thu theo tháng
              </h3>
              <p className="text-sm text-gray-600">
                Doanh thu đã thanh toán trong 6 tháng gần đây
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                <span className="size-3 rounded-full bg-indigo-600" />
                Doanh thu
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                <span className="size-3 rounded-full bg-gray-400" />
                Mục tiêu
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={revenueChartConfig}
              className="h-100 w-full"
            >
              <AreaChart
                data={stats.revenueTrend}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray=" 3 3"
                  vertical={false}
                  className="stroke-gray-200/70"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs font-medium text-gray-500"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(val) =>
                    val >= 1000000
                      ? `${(val / 1000000).toFixed(0)} Tr`
                      : `${val}`
                  }
                  className="text-xs font-medium text-gray-500"
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Area
                  dataKey="total"
                  type="monotone"
                  fill="url(#revenueFill)"
                  fillOpacity={0.4}
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Occupancy Donut + Payment Status  */}
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Tỷ lệ lấp đầy
              </h3>
            </CardHeader>
            <CardContent>
              <div>
                <div className="relative flex items-center justify-center">
                  <ChartContainer
                    config={occupancyChartConfig}
                    className="mx-auto aspect-square h-48 w-48"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                        strokeWidth={2}
                        stroke="#ffffff"
                      />
                    </PieChart>
                  </ChartContainer>
                  {/* PieChart center label */}
                  <div className="pointer-events-none absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tracking-tight text-gray-900">
                      {occupancyPct}%
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {occupancyLabel}
                    </span>
                  </div>
                </div>

                {/* Occupancy Legend */}
                <div className="flex flex-col gap-2 text-sm">
                  {donutData.map(({ name, value, fill }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: fill }}
                        />
                        <span className="text-gray-600">{name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Trạng thái thanh toán
              </h3>
            </CardHeader>
            <CardContent>
              <Progress
                value={stats.paymentBreakdown.received}
                className="**:data-[slot=progress-indicator]:bg-emerald-600"
                style={{ height: '8px' }}
              >
                <ProgressLabel>Đã nhận</ProgressLabel>
                <ProgressValue className="text-gray-900" />
              </Progress>
              <Progress
                value={stats.paymentBreakdown.pending}
                className="**:data-[slot=progress-indicator]:bg-amber-500"
                style={{ height: '8px' }}
              >
                <ProgressLabel>Đang chờ</ProgressLabel>
                <ProgressValue className="text-gray-900" />
              </Progress>
              <Progress
                value={stats.paymentBreakdown.overdue}
                className="**:data-[slot=progress-indicator]:bg-red-600"
                style={{ height: '8px' }}
              >
                <ProgressLabel>Quá hạn</ProgressLabel>
                <ProgressValue className="text-gray-900" />
              </Progress>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="h-fit lg:col-span-4">
          <CardHeader className="flex justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Thao tác nhanh
            </h3>
            <Zap className="size-5 text-gray-500" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:bg-gray-50"
              >
                <Icon className="size-5 text-blue-700" />
                <span className="text-sm font-medium text-gray-900">
                  {label}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="h-fit lg:col-span-4">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Hoạt động gần đây
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {notifications.slice(0, 3).map((notify) => {
              const meta =
                NOTIFICATION_STYLES[notify.type] ??
                NOTIFICATION_STYLES[NotificationType.SYSTEM];
              const Icon = meta.icon;

              return (
                <div key={notify.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full',
                      meta.background,
                    )}
                  >
                    <Icon className={cn('size-4', meta.foreground)} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-gray-900">
                      {notify.title}
                    </p>
                    <p className="text-sm text-gray-700">{notify.message}</p>
                    <p className="text-xs font-semibold text-gray-600">
                      {formatRelativeTime(notify.createdAt)}
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
            <Link
              href="/dashboard/notifications"
              className="rounded-lg border border-indigo-100 py-2 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              Xem tất cả hoạt động
            </Link>
          </CardContent>
        </Card>

        {/* Maintenance + Expiring Contracts */}
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Bảo trì</h3>
              {stats.urgentMaintenance.length > 0 && (
                <Badge
                  variant="destructive"
                  className="rounded-md bg-red-700 py-3 text-xs font-bold text-white uppercase"
                >
                  {stats.urgentMaintenance.length} cảnh báo
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {stats.urgentMaintenance.slice(0, 2).map((req) => (
                <div
                  key={req.id}
                  className="rounded-lg border-l-4 border-red-700 bg-indigo-50 py-3 pr-3 pl-4"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Hợp đồng sắp hết hạn
              </h3>
              <span className="text-right text-xs font-semibold text-gray-500">
                30 ngày tới
              </span>
            </CardHeader>
            <CardContent>
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
                    <div>
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
              <Link
                href="/dashboard/tenants"
                className="rounded-lg bg-indigo-50 py-2 text-center text-sm font-medium text-gray-900 hover:bg-indigo-100"
              >
                Xem tất cả ({stats.expiringRentals.length})
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const TenantDashboard = () => {
  const { user } = useAuthStore();
  const { data: billsData } = useBills({ page: 1, limit: 100 });
  const { data: maintenanceData } = useMaintenanceRequests({
    page: 1,
    limit: 100,
  });

  const bills = billsData?.data ?? [];
  const maintenance = maintenanceData?.data ?? [];

  const PENDING_BILL_STATUS: BillStatus[] = [
    BillStatus.PENDING,
    BillStatus.TENANT_CONFIRMED,
    BillStatus.TENANT_CONFIRMED,
    BillStatus.OVERDUE,
  ];
  const OPEN_MAINTENANCE: MaintenanceStatus[] = [
    MaintenanceStatus.IN_PROGRESS,
    MaintenanceStatus.PENDING,
  ];

  const pendingBills = bills.filter((bill) =>
    PENDING_BILL_STATUS.includes(bill.status),
  );
  const openMaintenance = maintenance.filter((req) =>
    OPEN_MAINTENANCE.includes(req.status),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Chào mừng trở lại, {user?.profile?.firstName || user?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Hóa đơn chưa thanh toán
              </h2>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {pendingBills.length}
              </p>
            </div>
            {pendingBills.length > 0 && (
              <Badge variant="destructive">{pendingBills.length}</Badge>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Yêu cầu sửa chữa đang xử lý
              </h2>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {openMaintenance.length}
              </p>
            </div>
            {openMaintenance.length > 0 && (
              <Badge variant="secondary">{openMaintenance.length}</Badge>
            )}
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="sm:flex-row">
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
        </CardContent>
      </Card>
    </div>
  );
};
