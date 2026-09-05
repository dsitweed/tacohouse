'use client';

import { LatLngExpression } from 'leaflet';
import { ArrowLeft, Edit, FileText, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';

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
  NoDataEmptyState,
  SkeletonPage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Building, UserRole } from '@/generated/model';
import { useBuilding } from '@/hooks/api';
import { useAuthStore } from '@/stores/authStore';
import { DialogType, useDialogStore } from '@/stores/dialogStore';

import OverviewTab from './OverviewTab';
import RoomsTab from './RoomsTab';
import UpdateBuildingDialog from './UpdateBuildingDialog';

const TAB_BAR = {
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

// TODO: use real building coordinates
const buildingCoordinates = [43.6532, -79.3832] satisfies LatLngExpression;

export default function BuildingDetail({
  id,
  initialBuilding,
}: BuildingDetailProps) {
  const { user } = useAuthStore();
  const { openDialog } = useDialogStore();

  const { data: building, isLoading } = useBuilding(id, {
    initialData: initialBuilding,
  });

  if (isLoading) {
    return <SkeletonPage />;
  }

  if (!building) {
    return <NoDataEmptyState />;
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
                  className="flex items-center gap-1 text-xs font-semibold tracking-wider"
                >
                  <ArrowLeft className="size-3.5" />
                  Danh sách tòa nhà
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1 text-xs font-semibold tracking-wider">
                  {building?.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {building?.name}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-gray-500">
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
              onClick={() => openDialog(DialogType.UPDATE_BUILDING)}
            >
              <Edit className="size-4" />
              <span>Chỉnh sửa</span>
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
      <Tabs defaultValue={TAB_BAR.overview}>
        <TabsList variant="line" className="gap-3">
          {Object.entries(TAB_BAR).map(([key, value]) => (
            <TabsTrigger key={key} value={value}>
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={TAB_BAR.overview}>
          <OverviewTab
            buildingId={id}
            buildingName={building.name}
            buildingCoordinates={buildingCoordinates}
          />
        </TabsContent>
        <TabsContent value={TAB_BAR.rooms}>
          <RoomsTab buildingId={id} />
        </TabsContent>
        <TabsContent value={TAB_BAR.maintenance}>
          <Card>
            <CardContent className="items-center text-center">
              <FileText className="text-primary size-12" />
              <p className="text-sm text-gray-500">
                Chức năng này đang được phát triển. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={TAB_BAR.incomeStatistics}>
          <Card>
            <CardContent className="items-center text-center">
              <FileText className="text-primary size-12" />
              <p className="text-sm text-gray-500">
                Chức năng này đang được phát triển. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={TAB_BAR.expenses}>
          <Card>
            <CardContent className="items-center text-center">
              <FileText className="text-primary size-12" />
              <p className="text-sm text-gray-500">
                Chức năng này đang được phát triển. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={TAB_BAR.documents}>
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
      <UpdateBuildingDialog buildingId={id} />
    </div>
  );
}
