'use client';

import { LatLngExpression } from 'leaflet';
import { ArrowLeft, Edit, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  SkeletonPage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Building, MaintenanceStatus, UserRole } from '@/generated/model';
import { useBuilding, useRooms, useUpdateBuilding } from '@/hooks/api';
import { useAuthStore } from '@/stores/authStore';

import OverviewTab from './OverviewTab';

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
  initialBuilding: Building;
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

  const { data: building, isLoading } = useBuilding(id, {
    initialData: initialBuilding,
  });
  const updateBuildingMutation = useUpdateBuilding();

  const { data: roomsData } = useRooms({
    buildingId: id,
    page: 1,
    limit: 100,
  });
  const buildingRooms = roomsData?.data ?? [];

  if (isLoading || !building) {
    return <SkeletonPage />;
  }

  const canEdit =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.LANDLORD && building.landlordId === user.id);

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
          <OverviewTab
            buildingId={id}
            buildingName={building.name}
            buildingCoordinates={buildingCoordinates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
