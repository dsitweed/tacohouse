'use client';

import {
  ArrowRight,
  Calendar,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  BarShapeProps,
  CartesianGrid,
  Rectangle,
  XAxis,
} from 'recharts';

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
  SkeletonPage,
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBuildings } from '@/hooks/api/useBuildings';
import { useAuthStore } from '@/stores/authStore';
import { DialogType, useDialogStore } from '@/stores/dialogStore';
import { UserRole } from '@/types';
import { formatCurrency, typedEntries } from '@/utils';

import CreateBuildingDialog from './CreateBuildingDialog';

// Revenue Forecast mock chart data
const REVENUE_FORECAST = [
  { month: 'Tháng 7', revenue: 68000, heightPct: 65 },
  { month: 'Tháng 8', revenue: 72000, heightPct: 72 },
  { month: 'Tháng 9', revenue: 71000, heightPct: 70 },
  { month: 'Tháng 10', revenue: 84000, heightPct: 92 }, // Best revenue month
  { month: 'Tháng 11', revenue: 79000, heightPct: 82 },
  { month: 'Tháng 12', revenue: 82000, heightPct: 88 },
];

const IMAGES_LIST = [
  '/images/buildings/sunset-heights.png',
  '/images/buildings/azure-bay.png',
  '/images/buildings/oakwood-lofts.png',
  '/images/buildings/emerald-garden.png',
  'https://images.pexels.com/photos/9864028/pexels-photo-9864028.jpeg',
];

const BuildingTab = {
  all: 'Tất cả',
  residential: 'Nhà ở',
  commercial: 'Thương mại',
};
type BuildingTabType = keyof typeof BuildingTab;

const revenueChartConfig = {
  revenue: {
    label: 'Doanh thu',
  },
} satisfies ChartConfig;

export default function BuildingsPage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<BuildingTabType>('all');

  // TODO: add pagination and infinite scroll
  const { openDialog } = useDialogStore();
  const { data: buildingsData, isLoading } = useBuildings({
    page: 1,
    limit: 20,
    search,
  });
  const buildings = buildingsData?.data ?? [];

  const canCreate =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  const displayBuildings = buildings.map((building, index) => ({
    id: building.id,
    name: building.name,
    address: building.address,
    // TODO: fix this error
    roomsCount: building._count.rooms || building.rooms?.length || 0,
    occupancy: '80%',
    monthlyRevenue: 10000000,
    status: 'ACTIVE', // TODO: fix this logic
    image: IMAGES_LIST[index % IMAGES_LIST.length], // TODO: fix this logic
    type: index % 2 === 0 ? 'residential' : 'commercial', // TODO: fix this logic
    verified: true, // TODO: fix this logic (like Facebook verified badge)
  }));

  // TODO: fix this logic
  const filteredBuildings = displayBuildings.filter(
    (item) => activeTab === 'all' || item.type === activeTab,
  );

  const maxRevenueMonth = REVENUE_FORECAST.reduce((max, item) =>
    max.revenue > item.revenue ? max : item,
  );

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

        <div>
          {/* TODO: Use Tabs components instead */}
          <ButtonGroup>
            {typedEntries(BuildingTab).map(([tab, tabName]) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab)}
              >
                {tabName}
              </Button>
            ))}
            <Button variant="outline" disabled>
              <SlidersHorizontal className="size-3.5" />
              Bộ lọc
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Buildings Bento Grid */}
      {isLoading ? (
        <SkeletonPage className="max-w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBuildings.map((building) => (
            <Card key={building.id} className="p-0">
              <CardContent className="group h-full p-0">
                {/* Card Image Banner */}
                {/* TODO: use Aspect Ratio of Shadcn */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Link
                    href={`/dashboard/buildings/${building.id}`}
                    className="relative block h-full w-full"
                  >
                    <Image
                      src={building.image}
                      alt={building.name}
                      fill
                      // TODO: fix size dependent on screen size
                      sizes="50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Active Status Badge */}
                  <Badge
                    variant={
                      building.status === 'ACTIVE' ? 'success' : 'destructive'
                    }
                    className="absolute top-3 left-3 rounded-md text-[10px] font-bold"
                  >
                    {building.status}
                  </Badge>

                  {/* Overlay Action */}
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
                          {building.occupancy}
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
        {/* Revenue Forecast Bar Chart Widget */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Dự báo doanh thu <span className="text-xs">(VNĐ)</span>
            </h3>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
              <Calendar className="size-3.5 text-blue-800" />
              <span>6 tháng tới</span>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-52">
              <BarChart accessibilityLayer data={REVENUE_FORECAST}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      // labelFormatter={(_, payload) =>
                      //   payload[0]?.payload?.month ?? ''
                      // }
                      // formatter={(value) => [
                      //   formatCurrency(value as number),
                      //   '',
                      // ]}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  strokeWidth={2}
                  radius={8}
                  opacity={0.8}
                  shape={({ index, ...props }: BarShapeProps) => {
                    return (
                      <Rectangle
                        {...props}
                        fill={
                          props.payload.month === maxRevenueMonth.month
                            ? '#1e40af'
                            : '#93C5FD'
                        }
                      />
                    );
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Portfolio Insights Banner */}
        <Card className="bg-blue-800">
          <CardHeader className="gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <Sparkles className="size-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Phân tích hiệu suất
            </h3>
            <p className="text-sm leading-relaxed text-white/90">
              Tỷ lệ lấp đầy tổng thể của bạn <strong>cao hơn 4%</strong> so với
              mức trung bình của thị trường khu vực. Bạn có thể cân nhắc tăng
              giá tại <strong>thêm 2,5%</strong> vào tháng tới.
            </p>
          </CardHeader>
          <CardContent>
            <Button className="bg-white font-bold text-blue-800 hover:bg-blue-50">
              Xem kế hoạch tối ưu hóa
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create New Building Dialog */}
      <CreateBuildingDialog />
    </div>
  );
}
