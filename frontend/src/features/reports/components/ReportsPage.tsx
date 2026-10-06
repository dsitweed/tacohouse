'use client';

import {
  Building2,
  DoorOpen,
  Download,
  Percent,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
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
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  NoDataEmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SkeletonPage,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { BillStatus, RoomStatus, UserRole } from '@/generated/model';
import { useBills } from '@/hooks/api/useBills';
import { useBuildings } from '@/hooks/api/useBuildings';
import { useDashboardRevenueTrend } from '@/hooks/api/useDashboards';
import { useRooms } from '@/hooks/api/useRooms';
import { useAuthStore } from '@/stores/authStore';
import { formatBillingPeriod, formatCurrency } from '@/utils';

const MONTH_OPTIONS = [
  { value: '3', label: '3 tháng' },
  { value: '6', label: '6 tháng' },
  { value: '12', label: '12 tháng' },
] as const;

const revenueChartConfig = {
  total: {
    label: 'Doanh thu',
    color: 'var(--chart-1)',
  },
};

const occupancyChartConfig = {
  occupied: {
    label: 'Đang thuê',
    color: 'var(--chart-1)',
  },
  vacant: {
    label: 'Còn trống',
    color: 'var(--chart-3)',
  },
  maintenance: {
    label: 'Bảo trì',
    color: 'var(--chart-4)',
  },
};

const PENDING_STATUSES: BillStatus[] = [
  BillStatus.PENDING,
  BillStatus.TENANT_CONFIRMED,
  BillStatus.LANDLORD_CONFIRMED,
];

function escapeCsvCell(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportSummaryToCsv(
  rows: {
    building: string;
    rooms: number;
    occupied: number;
    revenue: number;
    outstanding: number;
  }[],
) {
  const headers = ['Tòa nhà', 'Số phòng', 'Đang thuê', 'Doanh thu', 'Công nợ'];
  const csv = [
    headers,
    ...rows.map((row) => [
      row.building,
      String(row.rooms),
      String(row.occupied),
      String(row.revenue),
      String(row.outstanding),
    ]),
  ]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bao-cao-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { user, isHydrated } = useAuthStore((state) => state);
  const [months, setMonths] = useState('6');

  const { data: buildingsData, isLoading: isBuildingsLoading } = useBuildings({
    page: 1,
    limit: 1000,
  });
  const { data: roomsData, isLoading: isRoomsLoading } = useRooms({
    page: 1,
    limit: 1000,
  });
  const { data: billsData, isLoading: isBillsLoading } = useBills({
    page: 1,
    limit: 1000,
  });
  const { data: revenueTrendData } = useDashboardRevenueTrend({
    months: Number(months),
  });

  const isLoading = isBuildingsLoading || isRoomsLoading || isBillsLoading;

  const report = useMemo(() => {
    const buildings = buildingsData?.data ?? [];
    const rooms = roomsData?.data ?? [];
    const bills = billsData?.data ?? [];
    const revenueTrend = revenueTrendData?.data ?? [];

    const occupiedRooms = rooms.filter(
      (room) => room.status === RoomStatus.OCCUPIED,
    );
    const maintenanceRooms = rooms.filter(
      (room) => room.status === RoomStatus.MAINTENANCE,
    );
    const vacantRooms = rooms.filter(
      (room) => room.status === RoomStatus.AVAILABLE,
    );

    const paidAmount = bills
      .filter((bill) => bill.status === BillStatus.PAID)
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const pendingAmount = bills
      .filter((bill) => PENDING_STATUSES.includes(bill.status))
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const overdueAmount = bills
      .filter((bill) => bill.status === BillStatus.OVERDUE)
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const outstandingAmount = pendingAmount + overdueAmount;
    const billTotal = paidAmount + outstandingAmount;

    // Revenue and outstanding grouped per building
    const roomsByBuilding = new Map<string, typeof rooms>();
    for (const room of rooms) {
      const list = roomsByBuilding.get(room.buildingId) ?? [];
      list.push(room);
      roomsByBuilding.set(room.buildingId, list);
    }

    const buildingRows = buildings
      .map((building) => {
        const buildingRooms = roomsByBuilding.get(building.id) ?? [];
        const buildingBills = bills.filter(
          (bill) => bill.room?.buildingId === building.id,
        );
        const revenue = buildingBills
          .filter((bill) => bill.status === BillStatus.PAID)
          .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
        const outstanding = buildingBills
          .filter(
            (bill) =>
              PENDING_STATUSES.includes(bill.status) ||
              bill.status === BillStatus.OVERDUE,
          )
          .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

        return {
          building: building.name,
          rooms: buildingRooms.length,
          occupied: buildingRooms.filter(
            (room) => room.status === RoomStatus.OCCUPIED,
          ).length,
          revenue,
          outstanding,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const occupancyPct =
      rooms.length > 0
        ? Math.round((occupiedRooms.length / rooms.length) * 100)
        : 0;
    const collectionPct =
      billTotal > 0 ? Math.round((paidAmount / billTotal) * 100) : 0;

    return {
      totalBuildings: buildings.length,
      totalRooms: rooms.length,
      occupiedRooms: occupiedRooms.length,
      vacantRooms: vacantRooms.length,
      maintenanceRooms: maintenanceRooms.length,
      paidAmount,
      outstandingAmount,
      overdueAmount,
      revenueTrend,
      buildingRows,
      occupancyPct,
      collectionPct,
      occupancyData: [
        {
          name: occupancyChartConfig.occupied.label,
          value: occupiedRooms.length,
          fill: occupancyChartConfig.occupied.color,
        },
        {
          name: occupancyChartConfig.vacant.label,
          value: vacantRooms.length,
          fill: occupancyChartConfig.vacant.color,
        },
        {
          name: occupancyChartConfig.maintenance.label,
          value: maintenanceRooms.length,
          fill: occupancyChartConfig.maintenance.color,
        },
      ],
    };
  }, [buildingsData, roomsData, billsData, revenueTrendData]);

  const canView =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  if (!isHydrated) {
    return <Spinner className="mx-auto my-10 size-6" />;
  }

  if (!canView) {
    return (
      <NoDataEmptyState
        title="Không có quyền truy cập"
        subTitle="Báo cáo chỉ dành cho chủ nhà và quản trị viên."
      />
    );
  }

  if (isLoading) return <SkeletonPage />;

  const latestTrend = report.revenueTrend.at(-1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
          <p className="mt-1 text-sm text-gray-600">
            Phân tích doanh thu, công nợ và tỷ lệ lấp đầy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger aria-label="Khoảng thời gian" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => exportSummaryToCsv(report.buildingRows)}
            disabled={report.buildingRows.length === 0}
          >
            <Download className="size-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Doanh thu đã thu"
          value={formatCurrency(report.paidAmount)}
          icon={Wallet}
          iconClassName="text-emerald-500"
        />
        <KpiCard
          label="Công nợ"
          value={formatCurrency(report.outstandingAmount)}
          icon={TrendingUp}
          iconClassName="text-rose-500"
          description={
            <p className="mt-1 text-xs text-slate-500">
              Quá hạn: {formatCurrency(report.overdueAmount)}
            </p>
          }
        />
        <KpiCard
          label="Tỷ lệ lấp đầy"
          value={`${report.occupancyPct}%`}
          icon={Percent}
          description={
            <p className="mt-1 text-xs text-slate-500">
              {report.occupiedRooms}/{report.totalRooms} phòng đang thuê
            </p>
          }
        />
        <KpiCard
          label="Tỷ lệ thu tiền"
          value={`${report.collectionPct}%`}
          icon={Building2}
          description={
            <p className="mt-1 text-xs text-slate-500">
              {report.totalBuildings} tòa nhà • {report.totalRooms} phòng
            </p>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Xu hướng doanh thu</CardTitle>
            <CardDescription>
              Doanh thu từ hóa đơn đã thanh toán trong {months} tháng gần nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report.revenueTrend.length > 0 ? (
              <ChartContainer
                config={revenueChartConfig}
                className="h-80 w-full"
              >
                <AreaChart
                  data={report.revenueTrend}
                  margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="reportRevenueFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(0)}Tr`
                        : `${value}`
                    }
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
                    fill="url(#reportRevenueFill)"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <NoDataEmptyState
                title="Chưa có dữ liệu doanh thu"
                subTitle="Doanh thu sẽ hiển thị khi có hóa đơn đã thanh toán."
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Tình trạng phòng</CardTitle>
            <CardDescription>
              Phân bổ {report.totalRooms} phòng theo trạng thái
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={occupancyChartConfig}
              className="mx-auto h-64 w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={report.occupancyData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  strokeWidth={2}
                >
                  {report.occupancyData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {report.occupancyData.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-medium text-slate-900">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by building */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Doanh thu theo tòa nhà</CardTitle>
          <CardDescription>
            Xếp hạng theo doanh thu từ hóa đơn đã thanh toán
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {report.buildingRows.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="text-xs tracking-wider text-slate-600 uppercase [&>th]:font-bold">
                  <TableHead className="pl-4">Tòa nhà</TableHead>
                  <TableHead className="text-right">Số phòng</TableHead>
                  <TableHead className="text-right">Đang thuê</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="pr-4 text-right">Công nợ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_td]:py-3">
                {report.buildingRows.map((row) => (
                  <TableRow key={row.building}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="size-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {row.building}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-600">
                      {row.rooms}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {row.rooms > 0
                          ? `${Math.round((row.occupied / row.rooms) * 100)}%`
                          : '0%'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell className="pr-4 text-right text-sm text-rose-600">
                      {row.outstanding > 0
                        ? formatCurrency(row.outstanding)
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8">
              <NoDataEmptyState
                title="Chưa có dữ liệu tòa nhà"
                subTitle="Thêm tòa nhà và phòng để xem báo cáo doanh thu."
              />
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">
        Cập nhật lúc {new Date().toLocaleString('vi-VN')} • Kỳ gần nhất:{' '}
        {latestTrend ? formatBillingPeriod(`${latestTrend.month}-01`) : '—'}
      </p>
    </div>
  );
}
