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
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  PieSectorShapeProps,
  Sector,
  XAxis,
  YAxis,
} from 'recharts';

import KpiCard from '@/components/KpiCard';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
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
  useMaintenanceRequest,
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
    const expiringRentals = rentals
      .filter(
        (rental) =>
          rental.status === RentalStatus.ACTIVE &&
          rental.endDate &&
          new Date(rental.endDate).getTime() > now.getTime() &&
          new Date(rental.endDate).getTime() <= in30Days,
      )
      .sort(
        (a, b) =>
          new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime(),
      );

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
            <ChartContainer config={revenueChartConfig} className="h-64 w-full">
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
        <Card className="lg:col-span-4">
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
                  <div key={name} className="flex items-center justify-between">
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
      </div>
    </div>
  );
};

export const TenantDashboard = () => {
  return 'TenantDashboard';
};
