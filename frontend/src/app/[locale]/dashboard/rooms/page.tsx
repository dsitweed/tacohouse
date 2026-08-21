'use client';

import {
  ArrowRight,
  Download,
  Eye,
  Plus,
  SearchIcon,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import KpiCard from '@/components/KpiCard';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  ButtonGroup,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  EmptyState,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  SkeletonPage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, UserRole } from '@/generated/model';
import { useBuildings } from '@/hooks/api';
import { useRooms } from '@/hooks/api/useRooms';
import { useAuthStore } from '@/stores/authStore';
import { ROOM_STATUS_MAP, RoomStatusMapsType } from '@/types';
import { formatCurrency, toDateOnlyString } from '@/utils';

import CreateRoomDialog from './CreateRoomDialog';

export default function RoomsPage() {
  const user = useAuthStore((state) => state.user);
  const searchParams = useSearchParams();
  const initialBuildingId = searchParams.get('buildingId') ?? ''; // If not have buildingId search for all building
  const { data: roomData, isLoading: isRoomsLoading } = useRooms({
    page: 1,
    limit: 20,
  });
  const rooms = useMemo(() => roomData?.data ?? [], [roomData]);
  const { data: buildingsData } = useBuildings({ page: 1, limit: 100 });
  const buildings = buildingsData?.data ?? [];

  // Local sate
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [selectedBuildingId, setSelectedBuildingId] =
    useState(initialBuildingId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const maxFloorData = [
    ...new Set(rooms.map((room) => getFloorNumber(room.number))),
  ].map((floor) => ({
    label: `Tầng ${floor}`,
    value: floor.toString(),
  }));

  const displayRooms = useMemo(() => {
    return rooms.map((room) => {
      const activeRental = room.rentals?.find((r) => r.status === 'ACTIVE');
      const tenantUser = activeRental?.tenant;
      const tenantName = tenantUser?.profile
        ? `${tenantUser.profile.lastName} ${tenantUser.profile.firstName}`
        : tenantUser?.email || '-';

      const tenantAvatar = tenantUser?.profile?.avatar;
      const floor = getFloorNumber(room.number);

      return {
        id: room.id,
        number: `Phòng ${room.number}`,
        floor: `Tầng ${floor}`,
        buildingName: room.building?.name || 'Tòa nhà',
        details: `${room.area}m² • ${room.roomType === 'FULL_RIGHTS' ? 'Toàn quyền' : 'Bán quyền'}`,
        monthRent: Number(room.monthlyRent),
        status: room.status,
        tenantName: room.status === 'OCCUPIED' ? tenantName : '-',
        tenantAvatar: room.status === 'OCCUPIED' ? tenantAvatar : '',
        contractEnd: activeRental?.endDate
          ? toDateOnlyString(new Date(activeRental.endDate))
          : '-',
        buildingId: room.buildingId,
      };
    });
  }, [rooms]);

  // Filtered rooms based on search & filters
  const filteredRooms = useMemo(() => {
    return displayRooms.filter((room) => {
      // Filter by building
      if (selectedBuildingId !== '' && room.buildingId !== selectedBuildingId) {
        return false;
      }

      // Filter by status
      if (statusFilter !== 'ALL' && room.status !== statusFilter) {
        return false;
      }

      // Filter by floor
      if (floorFilter !== 'ALL') {
        const floorNum = room.floor.replace(/\D/g, '');
        if (floorNum !== floorFilter) return false;
      }

      // Filter by search text
      if (search) {
        const query = search.toLocaleLowerCase();
        const matchNumber = room.number.toLocaleLowerCase().includes(query);
        const matchBuilding = room.buildingName.toLowerCase().includes(query);
        const matchTenant = room.tenantName.toLowerCase().includes(query);
        if (!matchNumber && !matchBuilding && !matchTenant) return false;
      }

      return true;
    });
  }, [displayRooms, floorFilter, search, selectedBuildingId, statusFilter]);

  // Calculated stats
  const stats = useMemo(() => {
    const occupied = displayRooms.filter((r) => r.status === 'OCCUPIED');
    const vacant = displayRooms.filter((r) => r.status === 'AVAILABLE');
    const maintenance = displayRooms.filter((r) => r.status === 'MAINTENANCE');
    const pendingCheckout = displayRooms.filter(
      (r) => r.status === 'PENDING_CHECKOUT',
    );
    const occupancyRate =
      displayRooms.length > 0
        ? ((occupied.length / displayRooms.length) * 100).toFixed(1)
        : '0';

    return {
      total: displayRooms,
      occupied,
      vacant,
      maintenance,
      pendingCheckout,
      occupancyRate,
    };
  }, [displayRooms]);

  const handleExportCSV = () => {};

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setFloorFilter('ALL');
    setSelectedBuildingId('');
    setSearch('');
  };

  if (!user) {
    return <SkeletonPage />;
  }

  // TODO: make rule more tricter
  const canCreate =
    user.role === UserRole.ADMIN || user.role === UserRole.LANDLORD;

  const selectedBuilding = buildings.find(
    (build) => build.id === selectedBuildingId,
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/buildings">
                  Danh sách tòa nhà
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {selectedBuilding ? selectedBuilding.name : 'Tất cả phòng'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Rooms Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage and monitor all active rental units across your portfolio
            </p>
          </div>
        </div>

        {/* Top Header Action Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            disabled
            title="Tinh năng xuất danh sách phòng đang được phát triển"
          >
            <Download className="size-4" /> Export List
          </Button>
          {canCreate && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus />
              Add New Room
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Stats Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="TOTAL UNITS"
          value={stats.total.length}
          icon={TrendingUp}
          description={
            <div className="flex justify-end">
              <Badge variant="successLight">100%</Badge>
            </div>
          }
        />
        <KpiCard
          label="OCCUPIED"
          value={stats.occupied.length}
          icon={TrendingUp}
          description={
            <div className="flex justify-end">
              <Badge variant="outline">{stats.occupancyRate}% Rate</Badge>
            </div>
          }
        />
        <KpiCard
          label="VACANT"
          value={stats.vacant.length}
          icon={TrendingUp}
          description={
            <div className="flex justify-end">
              <Badge variant="pending">Ready to Lease</Badge>
            </div>
          }
        />
        <KpiCard
          label="MAINTENANCE"
          value={stats.maintenance.length}
          icon={TrendingUp}
          description={
            <div className="flex justify-end">
              <Badge variant="destructive">Needs Attention</Badge>
            </div>
          }
        />
      </div>

      {/* Filters & Controls Bar */}
      <div className="bg-white-50 flex flex-col gap-4 rounded-xl bg-gray-100 p-4 lg:flex-row lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search box */}
          <ButtonGroup>
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search keys..." />
            </InputGroup>
          </ButtonGroup>
          {/* Building Selector */}
          <Combobox
            items={buildings}
            value={
              buildings.find((item) => item.id === selectedBuildingId) ?? null
            }
            onValueChange={(item) => setSelectedBuildingId(item?.id ?? '')}
            itemToStringLabel={(item) => item.name}
          >
            <ComboboxInput placeholder="Select building" showClear />
            <ComboboxContent>
              <ComboboxEmpty>No buildings found</ComboboxEmpty>
              <ComboboxList>
                {(item: Building) => (
                  <ComboboxItem key={item.id} value={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {/* Status Filter */}
          <Combobox
            items={Object.values(ROOM_STATUS_MAP)}
            value={
              Object.values(ROOM_STATUS_MAP).find(
                ({ value }) => value === statusFilter,
              ) ?? null
            }
            onValueChange={(item) => setStatusFilter(item?.value ?? 'ALL')}
            itemToStringLabel={(item) => item.label}
          >
            <ComboboxInput
              className="max-w-40"
              placeholder="Select status"
              showClear
            />
            <ComboboxContent>
              <ComboboxEmpty>No status found</ComboboxEmpty>
              <ComboboxList>
                {(item: RoomStatusMapsType) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {/* Floor Filter */}
          <Combobox
            items={maxFloorData}
            value={
              maxFloorData.find((item) => item.value === floorFilter) ?? null
            }
            onValueChange={(item) => setFloorFilter(item?.value ?? 'ALL')}
            itemToStringLabel={(item) => item.label}
          >
            <ComboboxInput
              className="max-w-30"
              placeholder="Select floor"
              showClear
            />
            <ComboboxContent>
              <ComboboxEmpty>No floor found</ComboboxEmpty>
              <ComboboxList>
                {(item: { label: string; value: string }) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div>
        {isRoomsLoading ? (
          <SkeletonPage />
        ) : (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 font-semibold tracking-wider uppercase">
                  <TableHead>Phòng #</TableHead>
                  <TableHead>Tầng</TableHead>
                  <TableHead>Tòa nhà</TableHead>
                  <TableHead>Giá thuê</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người thuê</TableHead>
                  <TableHead>Kết thúc </TableHead>
                  <TableHead>Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="">
                      <p className="font-bold">{room.number}</p>
                      <div className="text-xs text-gray-500">
                        <p>{room.buildingName}</p>
                        <p>{room.details}</p>
                      </div>
                    </TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>{room.buildingName}</TableCell>
                    <TableCell>{formatCurrency(room.monthRent)}</TableCell>
                    <TableCell>
                      <Badge variant={ROOM_STATUS_MAP[room.status].variant}>
                        {ROOM_STATUS_MAP[room.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={room.tenantAvatar ?? ''} />
                        <AvatarFallback>
                          {room.tenantName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{room.contractEnd}</TableCell>
                    <TableCell>
                      <Link href={`dashboard/rooms/${room.id}`}>
                        <Button variant="link" title="Xem chi tiết">
                          <Eye className="size-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      {/* TODO: add pagination */}
                      {/* TODO: use empty sate for table filter data */}
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Ad/Promotion Section */}

      <div className="grid grid-cols-12 gap-6">
        <Card className="relative col-span-12 lg:col-span-8">
          <Image
            src="/images/buildings/emerald-garden.png"
            alt="promotion-section-image"
            fill
            sizes="25vw"
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-blue-800/75" />

          <CardContent className="z-1 flex min-h-52 items-start justify-end gap-6">
            <div className="max-w-md text-white">
              <h2 className="text-xl font-bold">
                Automate Maintenance Requests
              </h2>
              <p className="text-xs">
                Our new AI-driven system automatically schedules vendors and
                updates tenants, reducing management overhead by up to 40%.
              </p>
            </div>
            <Button variant="outline" className="border-none bg-white">
              Learn More
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-12 bg-blue-50 lg:col-span-4">
          <CardContent className="flex h-full items-center justify-center">
            <div className="rounded-full bg-white p-3">
              <TrendingUp className="text-primary size-7" />
            </div>
            <div className="max-w-60 text-center">
              <h2 className="text-xl font-semibold">Portfolio Insights</h2>
              <p className="text-muted-foreground text-xs">
                Sunset Heights is currently performing 12% above the regional
                average for occupancy rate.
              </p>
            </div>
            <div className="text-primary flex items-center gap-1">
              <span>View Report</span>
              <ArrowRight className="size-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateRoomDialog
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
      />
    </div>
  );
}

function getFloorNumber(floorString: string) {
  return Math.floor(Number(floorString.replace(/\D/g, '')) / 100) || 1;
}
