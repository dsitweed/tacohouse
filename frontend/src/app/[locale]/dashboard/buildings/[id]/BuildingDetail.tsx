'use client';

import { LatLngExpression } from 'leaflet';
import { ArrowLeft, Edit, FileText, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  SkeletonPage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Building, UserRole } from '@/generated/model';
import { useBuilding } from '@/hooks/api';
import { useAuthStore } from '@/stores/authStore';

import OverviewTab from './OverviewTab';
import RoomsTab from './RoomsTab';
import UpdateBuildingDialog from './UpdateBuildingDialog';

const TabBar = {
  overview: 'Tổng quan',
  rooms: 'Danh sách phòng',
  incomeStatistics: 'Thống kê thu nhập',
  expenses: 'Chi phí',
  maintenance: 'Lịch sử bảo trì',
  documents: 'Tài liệu',
};

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: building, isLoading } = useBuilding(id, {
    initialData: initialBuilding,
  });

  if (isLoading || !building) {
    return <SkeletonPage />;
  }

  const canEdit =
    user?.role === UserRole.ADMIN ||
    (user?.role === UserRole.LANDLORD && building.landlordId === user.id);

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

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
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
            <Button
              className=""
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
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
        <TabsList variant="line" className="gap-3">
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
        <TabsContent value={TabBar.rooms}>
          <RoomsTab buildingId={id} />
        </TabsContent>
        <TabsContent value={TabBar.maintenance}>
          <Card>
            <CardContent className="items-center text-center">
              <FileText className="text-primary size-12" />
              <p className="text-sm text-gray-500">
                Chức năng này đang được phát triển. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={TabBar.incomeStatistics}>
          <Card>
            <CardContent className="items-center text-center">
              <FileText className="text-primary size-12" />
              <p className="text-sm text-gray-500">
                Chức năng này đang được phát triển. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={TabBar.expenses}>
          <Card>
            <CardContent className="items-center text-center">
              <FileText className="text-primary size-12" />
              <p className="text-sm text-gray-500">
                Chức năng này đang được phát triển. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={TabBar.documents}>
          <Card>
            <CardContent className="items-center text-center">
              <FileText className="text-primary size-12" />
              <p className="text-sm text-gray-500">
                Chức năng này đang được phát triển. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Building Dialog */}
      <UpdateBuildingDialog
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        buildingId={id}
      />
    </div>
  );
}
