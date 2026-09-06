'use client';

import { LatLngTuple } from 'leaflet';
import { DollarSign, ExternalLink, TrendingUp, Wrench } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import KpiCard from '@/components/KpiCard';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  ChartContainer,
  Map,
  MapMarker,
  MapPopup,
  MapTileLayer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useMaintenanceRequests } from '@/hooks/api';
import { MAINTENANCE_STATUS_MAP } from '@/types';
import { toDateOnlyString } from '@/utils';

import BuildingGalleryCard from './BuildingGalleryModal';

const revenueChartConfig = {
  gross: {
    label: 'Gross Income',
    color: 'var(--chart-1)',
  },
  expense: {
    label: 'Operating Expenses',
    color: 'var(--chart-4)',
  },
};

const MONTHLY_REVENUE_TREND = [
  { month: 'JAN', gross: 22000, expense: 6000 },
  { month: 'FEB', gross: 23500, expense: 5800 },
  { month: 'MAR', gross: 24000, expense: 6200 },
  { month: 'APR', gross: 23800, expense: 5900 },
  { month: 'MAY', gross: 25000, expense: 6100 },
  { month: 'JUN', gross: 26200, expense: 6400 },
  { month: 'JUL', gross: 25800, expense: 6300 },
  { month: 'AUG', gross: 27000, expense: 6500 },
  { month: 'SEP', gross: 26500, expense: 6200 },
  { month: 'OCT', gross: 28400, expense: 6800 },
  { month: 'NOV', gross: 27900, expense: 6600 },
  { month: 'DEC', gross: 29500, expense: 7100 },
];

type OverviewTabProps = {
  buildingId: string;
  buildingName: string;
  buildingCoordinates: LatLngTuple;
};

export default function OverviewTab({
  buildingId,
  buildingName,
  buildingCoordinates,
}: OverviewTabProps) {
  const { data: maintenanceData } = useMaintenanceRequests({
    buildingId,
  });

  const maintenance = maintenanceData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Top Summary Cards & Map Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 3 Summary stats card */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-8">
          <KpiCard
            label="Tỷ lệ lấp đầy"
            value="94.2%"
            icon={TrendingUp}
            iconClassName="text-green-500"
            description={
              <p className="text-xs font-medium text-green-700">
                +2.4% với tháng trước
              </p>
            }
          />
          <KpiCard
            label="LỢI NHUẬN NĂM "
            value="8.4%"
            icon={DollarSign}
            iconClassName="text-blue-500"
            description={
              <p className="text-xs font-medium text-gray-700">
                Thị trường: 6,1%
              </p>
            }
          />
          <KpiCard
            label="Vấn đề"
            value="3"
            icon={Wrench}
            iconClassName="text-red-800"
            description={
              <p className="text-xs font-medium text-rose-700">2 khẩn cấp</p>
            }
          />
        </div>

        {/* Map Placeholder Widget */}
        <div className="flex flex-col overflow-hidden rounded-xl border lg:col-span-4">
          <Map center={buildingCoordinates} className="z-0 min-h-32">
            <MapTileLayer />
            <MapMarker position={buildingCoordinates}>
              <MapPopup className="w-40 px-2 font-semibold capitalize">
                {buildingName}
              </MapPopup>
            </MapMarker>
          </Map>
          <div className="flex items-center justify-between border-t bg-white px-4 py-3">
            <span className="text-xs font-semibold text-gray-900">Bản đồ</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${buildingCoordinates[0]},${buildingCoordinates[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 text-xs font-bold hover:underline"
            >
              Mở Google Maps
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Middle Bento Row: Revenue Trend & Recent Photos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Revenue Growth Trend Chart */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Revenue Growth Trend
              </h3>
              <p className="text-xs text-gray-500">
                Last 12 months financial performance
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="bg-chart-1 size-3 rounded-full" />
                <span>Gross Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-chart-4 size-3 rounded-full" />
                <span>Operating Expenses</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-52">
              <BarChart accessibilityLayer data={MONTHLY_REVENUE_TREND}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <Bar
                  dataKey="gross"
                  strokeWidth={2}
                  radius={8}
                  opacity={0.8}
                  fill="var(--color-gross)"
                />
                <Bar
                  dataKey="expense"
                  strokeWidth={2}
                  radius={8}
                  fill="var(--color-expense)"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Photos Gallery Card */}
        <div className="lg:col-span-4">
          <BuildingGalleryCard buildingId={buildingId} />
        </div>
      </div>

      {/* Active Maintenance Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Active Maintenance
          </h3>
          <Button variant="ghost" className="text-sm font-bold">
            See full history
          </Button>
        </CardHeader>
        <CardContent>
          {/* TODO: Update table with pagination and data table */}
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="text-xs tracking-wider text-slate-600 uppercase [&>th]:font-bold">
                <TableHead>Title</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenance.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>Room {item.room?.number}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={MAINTENANCE_STATUS_MAP[item.status].badgeVariant}
                    >
                      {MAINTENANCE_STATUS_MAP[item.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {toDateOnlyString(new Date(item.createdAt))}
                  </TableCell>
                </TableRow>
              ))}

              {maintenance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="mt-4 text-sm font-bold">
                      No active maintenance requests.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
