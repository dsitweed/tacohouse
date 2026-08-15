'use client';

import { LatLngExpression } from 'leaflet';
import {
  ArrowLeft,
  DollarSign,
  Edit,
  ExternalLink,
  MapPin,
  Plus,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import KpiCard from '@/components/KpiCard';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Map,
  MapMarker,
  MapPopup,
  MapTileLayer,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Building, MaintenanceStatus, UserRole } from '@/generated/model';
import { useBuilding, useRooms, useUpdateBuilding } from '@/hooks/api';
import { useAuthStore } from '@/stores/authStore';

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

const MAINTENANCE_STATUS_COLORS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [MaintenanceStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [MaintenanceStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [MaintenanceStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

const GALLERY_IMAGES = [
  '/images/buildings/gallery/photo-1.png',
  '/images/buildings/gallery/photo-2.png',
  '/images/buildings/gallery/photo-3.png',
  '/images/buildings/gallery/photo-4.png',
];

const TabBar = {
  overview: 'Tổng quan',
  rooms: 'Danh sách phòng',
  incomeStatistics: 'Thống kê thu nhập',
  expenses: 'Chi phí',
  maintenance: 'Lịch sử bảo trì',
  documents: 'Tài liệu',
};

type TabBarType = keyof typeof TabBar;

type BuildingDetailProps = {
  id: string;
  initialBuilding?: Building;
};

// TODO: add building address to Building model
const buildingCoordinates = [43.6532, -79.3832] satisfies LatLngExpression;

export default function BuildingDetail({
  id,
  initialBuilding,
}: BuildingDetailProps) {
  const { user } = useAuthStore();
  const form = useForm();

  const [activeTab, setActiveTab] = useState<TabBarType>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { data: building } = useBuilding(id, {
    initialData: initialBuilding,
  });
  const updateBuildingMutation = useUpdateBuilding();

  const { data: roomsData } = useRooms({
    buildingId: id,
    page: 1,
    limit: 100,
  });
  const buildingRooms = useMemo(() => roomsData?.data ?? [], [roomsData]);

  const canEdit =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.LANDLORD && building?.landlordId === user.id);

  const onSubmit = async () => {};

  return (
    <div className="min-h-screen">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList className="gap-1.5 sm:gap-1">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/buildings"
                  className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase"
                >
                  <ArrowLeft className="size-3.5" />
                  Tòa nhà
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                  {building?.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 capitalize">
            {building?.name}
          </h1>
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin className="size-4 shrink-0" />
            <span className="text-xs">{building?.address}</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {canEdit && (
            <Button className="" variant="outline">
              <Edit className="size-4" />
              Chỉnh sửa
            </Button>
          )}

          <Link href={`/dashboard/rooms?buildingId=${id}`}>
            <Button className="bg-primary">
              <Plus className="size4" />
              Thêm phòng
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <Tabs defaultValue={TabBar.overview}>
        <TabsList variant="line">
          {Object.entries(TabBar).map(([key, value]) => (
            <TabsTrigger key={key} value={value}>
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={TabBar.overview}>
          <div>
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
                  label="LỢI NHUẬN HÀNG NĂM (ROI)"
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
                    <p className="text-xs font-medium text-rose-700">
                      2 khẩn cấp
                    </p>
                  }
                />
              </div>

              {/* Map Placeholder Widget */}
              <div className="flex flex-col overflow-hidden rounded-xl border lg:col-span-4">
                <Map center={buildingCoordinates} className="z-0 min-h-32">
                  <MapTileLayer />
                  <MapMarker position={buildingCoordinates}>
                    <MapPopup className="w-40 px-2 font-semibold capitalize">
                      {building?.name}
                    </MapPopup>
                  </MapMarker>
                </Map>
                <div className="flex items-center justify-between border-t bg-white px-4 py-3">
                  <span className="text-xs font-semibold text-gray-900">
                    Bản đồ
                  </span>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
