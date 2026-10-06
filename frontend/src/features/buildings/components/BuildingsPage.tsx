'use client';

import {
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ButtonGroup,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Field,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  NoDataEmptyState,
  SkeletonPage,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BillStatus, RoomStatus } from '@/generated/model';
import { useBills } from '@/hooks/api/useBills';
import { useBuildings } from '@/hooks/api/useBuildings';
import { useDashboardRevenueTrend } from '@/hooks/api/useDashboards';
import { useRooms } from '@/hooks/api/useRooms';
import { useAuthStore } from '@/stores/authStore';
import { DialogType, useDialogStore } from '@/stores/dialogStore';
import { UserRole } from '@/types';
import { formatCurrency } from '@/utils';

import CreateBuildingDialog from './CreateBuildingDialog';

const OCCUPANCY_FILTER = [
  { value: 'all', label: 'Tất cả' },
  { value: 'available', label: 'Còn phòng trống' },
  { value: 'full', label: 'Đã lấp đầy' },
] as const;
type OccupancyFilterType = (typeof OCCUPANCY_FILTER)[number]['value'];

const revenueChartConfig = {
  total: {
    label: 'Doanh thu',
  },
} satisfies ChartConfig;

export function BuildingsPage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [occupancyFilter, setOccupancyFilter] =
    useState<OccupancyFilterType>('all');

  const { openDialog } = useDialogStore();
  const { data: buildingsData, isLoading } = useBuildings({
    page: 1,
    limit: 20,
    search,
  });
  const { data: roomsData } = useRooms({ page: 1, limit: 1000 });
  const { data: billsData } = useBills({ page: 1, limit: 1000 });
  const { data: revenueTrendData } = useDashboardRevenueTrend({ months: 6 });

  const canCreate =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  const displayBuildings = useMemo(() => {
    const buildings = buildingsData?.data ?? [];
    const rooms = roomsData?.data ?? [];
    const bills = billsData?.data ?? [];

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return buildings.map((building) => {
      const buildingRooms = rooms.filter(
        (room) => room.buildingId === building.id,
      );
      const occupiedRooms = buildingRooms.filter(
        (room) => room.status === RoomStatus.OCCUPIED,
      );
      const occupancyPct =
        buildingRooms.length > 0
          ? Math.round((occupiedRooms.length / buildingRooms.length) * 100)
          : 0;

      const monthlyRevenue = bills
        .filter((bill) => {
          if (bill.room?.buildingId !== building.id) return false;
          if (bill.status !== BillStatus.PAID) return false;
          const period = new Date(bill.billingPeriod);
          return period >= currentMonthStart && period < nextMonthStart;
        })
        .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

      return {
        id: building.id,
        name: building.name,
        address: building.address,
        roomsCount: buildingRooms.length,
        occupiedCount: occupiedRooms.length,
        occupancyPct,
        monthlyRevenue,
      };
    });
  }, [buildingsData, roomsData, billsData]);

  const filteredBuildings = displayBuildings.filter((building) => {
    if (occupancyFilter === 'available') {
      return building.roomsCount > building.occupiedCount;
    }
    if (occupancyFilter === 'full') {
      return (
        building.roomsCount > 0 &&
        building.occupiedCount === building.roomsCount
      );
    }
    return true;
  });

  const portfolio = useMemo(() => {
    const totalRooms = displayBuildings.reduce(
      (sum, building) => sum + building.roomsCount,
      0,
    );
    const occupiedRooms = displayBuildings.reduce(
      (sum, building) => sum + building.occupiedCount,
      0,
    );

    return {
      totalRooms,
      occupiedRooms,
      vacantRooms: totalRooms - occupiedRooms,
      occupancyPct:
        totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    };
  }, [displayBuildings]);

  const revenueTrend = revenueTrendData?.data ?? [];

  return (
    <div className="space-y-8">
      {/* Search & Top Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Field className="max-w-md flex-1">
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4 text-gray-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm kiếm theo tên hoặc địa chỉ tòa nhà..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Field>

        {canCreate && (
          <Button
            onClick={() => openDialog(DialogType.CREATE_BUILDING)}
            className="bg-blue-700 hover:bg-blue-800"
          >
            <Plus className="size-4" />
            Thêm tòa nhà
          </Button>
        )}
      </div>
      {/* Header & Filter Tabs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tòa nhà</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý thông tin các tòa nhà và đơn giá dịch vụ
          </p>
        </div>

        <ButtonGroup>
          {OCCUPANCY_FILTER.map((filter) => (
            <Button
              key={filter.value}
              variant={occupancyFilter === filter.value ? 'default' : 'outline'}
              onClick={() => setOccupancyFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Buildings Bento Grid */}
      {isLoading ? (
        <SkeletonPage className="max-w-full" />
      ) : filteredBuildings.length === 0 && !canCreate ? (
        <NoDataEmptyState
          title="Không tìm thấy tòa nhà phù hợp"
          subTitle="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc lấp đầy."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBuildings.map((building) => (
            <Card key={building.id} className="p-0">
              <CardContent className="group h-full p-0">
                {/* Card Banner */}
                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
                  <Link
                    href={`/dashboard/buildings/${building.id}`}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <Building2 className="size-14 text-white/80" />
                  </Link>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute top-3 right-3 rounded-full"
                    title="Xem thêm"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </div>

                {/* Card Main Info */}
                <div className="flex flex-1 flex-col gap-3 p-5 pt-0">
                  <div>
                    <Link href={`/dashboard/buildings/${building.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {building.name}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1.5 text-gray-500">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{building.address}</span>
                    </div>

                    {/* Metric Boxes */}
                    <div className="mt-4 flex gap-3">
                      <div className="flex-1 rounded-xl bg-slate-100 p-3">
                        <p className="text-xs font-semibold tracking-wide text-gray-500">
                          Số phòng
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight">
                          {building.roomsCount}
                        </p>
                      </div>
                      <div className="flex-1 rounded-xl bg-slate-100 p-3">
                        <p className="text-xs font-semibold tracking-wide text-gray-500">
                          Lấp đầy
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-800">
                          {building.occupancyPct}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Month Revenue */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-gray-500">
                        Doanh thu hàng tháng
                      </p>
                      <p className="text-xl font-semibold text-blue-700">
                        {formatCurrency(building.monthlyRevenue)}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-full"
                    >
                      <Link href={`/dashboard/buildings/${building.id}`}>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create new building */}
          {canCreate && (
            <Card
              className="cursor-pointer border border-dashed hover:border-blue-500 hover:bg-blue-50/40"
              onClick={() => openDialog(DialogType.CREATE_BUILDING)}
            >
              <CardContent className="min-h-95 items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-blue-200 text-blue-800">
                  <Plus className="size-7" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Thêm tòa nhà mới
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Mở rộng danh mục đầu tư của bạn
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Portfolio Analytics Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Revenue Bar Chart Widget */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Doanh thu theo tháng <span className="text-xs">(VNĐ)</span>
            </h3>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
              <Calendar className="size-3.5 text-blue-800" />
              <span>6 tháng gần nhất</span>
            </div>
          </CardHeader>
          <CardContent>
            {revenueTrend.length > 0 ? (
              <ChartContainer config={revenueChartConfig} className="h-52">
                <BarChart accessibilityLayer data={revenueTrend}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value: string) => {
                      const month = value.split('-')[1];
                      return month ? `T${Number(month)}` : value;
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideIndicator
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <Bar
                    dataKey="total"
                    strokeWidth={2}
                    radius={8}
                    fill="var(--chart-1)"
                    opacity={0.9}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <NoDataEmptyState
                title="Chưa có dữ liệu doanh thu"
                subTitle="Doanh thu sẽ hiển thị khi có hóa đơn đã thanh toán."
              />
            )}
          </CardContent>
        </Card>

        {/* Portfolio Insights Banner */}
        <Card className="bg-blue-800">
          <CardHeader className="gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <Sparkles className="size-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Tổng quan danh mục
            </h3>
            <div className="space-y-2 text-sm leading-relaxed text-white/90">
              <p className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                Tỷ lệ lấp đầy trung bình:{' '}
                <strong>{portfolio.occupancyPct}%</strong>
              </p>
              <p>
                {portfolio.occupiedRooms}/{portfolio.totalRooms} phòng đang
                thuê • {portfolio.vacantRooms} phòng còn trống
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="bg-white font-bold text-blue-800 hover:bg-blue-50"
            >
              <Link href="/dashboard/reports">Xem báo cáo chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create New Building Dialog */}
      <CreateBuildingDialog />
    </div>
  );
}
