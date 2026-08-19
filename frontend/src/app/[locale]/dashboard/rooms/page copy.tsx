'use client';

import {
  ChevronRight,
  DoorOpen,
  Download,
  Eye,
  Plus,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuildings } from '@/hooks/api/useBuildings';
import { useCreateRoom, useRooms } from '@/hooks/api/useRooms';
import { useAuthStore } from '@/stores/authStore';
import { RoomStatus, UserRole } from '@/types';
import { formatCurrency } from '@/utils';

// Figma sample room data if database has limited or empty records
const SAMPLE_ROOMS = [
  {
    id: 'sample-101',
    number: 'Room 101',
    floor: 'Level 01',
    buildingName: 'Sunset Heights',
    details: '2B/2B • 1,200 sqft',
    monthlyRent: 3450000,
    status: 'OCCUPIED' as RoomStatus,
    tenantName: 'Jane Doe',
    tenantAvatar: 'JD',
    contractEnd: 'Oct 12, 2024',
    isReal: false,
  },
  {
    id: 'sample-102',
    number: 'Room 102',
    floor: 'Level 01',
    buildingName: 'Sunset Heights',
    details: '1B/1B • 850 sqft',
    monthlyRent: 2100000,
    status: 'AVAILABLE' as RoomStatus,
    tenantName: '—',
    tenantAvatar: '',
    contractEnd: '—',
    isReal: false,
  },
  {
    id: 'sample-201',
    number: 'Room 201',
    floor: 'Level 02',
    buildingName: 'Sunset Heights',
    details: '2B/1B • 1,000 sqft',
    monthlyRent: 2800000,
    status: 'OCCUPIED' as RoomStatus,
    tenantName: 'Michael Chen',
    tenantAvatar: 'MC',
    contractEnd: 'Nov 30, 2024',
    isReal: false,
  },
  {
    id: 'sample-305',
    number: 'Room 305',
    floor: 'Level 03',
    buildingName: 'Sunset Heights',
    details: 'Studio • 600 sqft',
    monthlyRent: 1800000,
    status: 'PENDING_CHECKOUT' as RoomStatus,
    tenantName: 'Sarah Jenkins',
    tenantAvatar: 'SJ',
    contractEnd: 'Sep 01, 2024',
    isReal: false,
  },
  {
    id: 'sample-402',
    number: 'Room 402',
    floor: 'Level 04',
    buildingName: 'Sunset Heights',
    details: 'Penthouse • 2,400 sqft',
    monthlyRent: 8900000,
    status: 'MAINTENANCE' as RoomStatus,
    tenantName: 'In Repair',
    tenantAvatar: 'W',
    contractEnd: '—',
    isReal: false,
  },
];

export default function RoomsPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const initialBuildingId = searchParams.get('buildingId') || '';

  // Local state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [selectedBuildingId, setSelectedBuildingId] =
    useState<string>(initialBuildingId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New room form state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBuildingId, setNewBuildingId] = useState(initialBuildingId);
  const [newRoomType, setNewRoomType] = useState<
    'FULL_RIGHTS' | 'PARTIAL_RIGHTS'
  >('FULL_RIGHTS');
  const [newRent, setNewRent] = useState('3000000');
  const [newDeposit, setNewDeposit] = useState('3000000');
  const [newArea, setNewArea] = useState('25');
  const [newMaxTenants, setNewMaxTenants] = useState('2');
  const [newDescription, setNewDescription] = useState('');

  // API Queries & Mutations
  const { data: roomsData, isLoading: isRoomsLoading } = useRooms({
    page: 1,
    limit: 100,
  });
  const { data: buildingsData } = useBuildings({ page: 1, limit: 100 });
  const createRoomMutation = useCreateRoom();

  const canCreate =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  const buildings = buildingsData?.data || [];

  // Set default building id if available and not selected
  if (!newBuildingId && buildings.length > 0) {
    setNewBuildingId(buildings[0].id);
  }

  // Combine real API rooms or fallback sample rooms
  const displayRooms = useMemo(() => {
    if (roomsData?.data && roomsData.data.length > 0) {
      return roomsData.data.map((room) => {
        // Extract tenant name from active rental if available
        const activeRental = room.rentals?.find((r) => r.status === 'ACTIVE');
        const tenantUser = activeRental?.tenant;
        const tenantName = tenantUser?.profile
          ? `${tenantUser.profile.lastName} ${tenantUser.profile.firstName}`
          : tenantUser?.email || '—';
        const tenantAvatar = tenantUser?.profile?.firstName
          ? tenantUser.profile.firstName.substring(0, 2).toUpperCase()
          : 'T';
        

        return {
          id: room.id,
          number: `Phòng ${room.number}`,
          floor: `Tầng ${Math.ceil(Number(room.number.replace(/\D/g, '')) / 100) || 1}`,
          buildingName: room.building?.name || 'Tòa nhà',
          details: `${room.area}m² • ${room.roomType === 'FULL_RIGHTS' ? 'Toàn quyền' : 'Bán quyền'}`,
          monthlyRent: Number(room.monthlyRent),
          status: room.status,
          tenantName: room.status === 'OCCUPIED' ? tenantName : '—',
          tenantAvatar: room.status === 'OCCUPIED' ? tenantAvatar : '',
          contractEnd: activeRental?.endDate
            ? new Date(activeRental.endDate).toLocaleDateString('vi-VN')
            : '—',
          isReal: true,
          buildingId: room.buildingId,
        };
      });
    }

    return SAMPLE_ROOMS;
  }, [roomsData]);

  // Filtered rooms based on search & filters
  const filteredRooms = useMemo(() => {
    return displayRooms.filter((room) => {
      // Filter by building
      if (
        selectedBuildingId &&
        'buildingId' in room &&
        room.buildingId !== selectedBuildingId
      ) {
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
        const query = search.toLowerCase();
        const matchNumber = room.number.toLowerCase().includes(query);
        const matchBuilding = room.buildingName.toLowerCase().includes(query);
        const matchTenant = room.tenantName.toLowerCase().includes(query);
        if (!matchNumber && !matchBuilding && !matchTenant) return false;
      }

      return true;
    });
  }, [displayRooms, selectedBuildingId, statusFilter, floorFilter, search]);

  // Calculated Stats
  const stats = useMemo(() => {
    const total = displayRooms.length;
    const occupied = displayRooms.filter((r) => r.status === 'OCCUPIED').length;
    const vacant = displayRooms.filter((r) => r.status === 'AVAILABLE').length;
    const maintenance = displayRooms.filter(
      (r) => r.status === 'MAINTENANCE',
    ).length;
    const occupancyRate =
      total > 0 ? ((occupied / total) * 100).toFixed(1) : '0';

    return { total, occupied, vacant, maintenance, occupancyRate };
  }, [displayRooms]);

  // Handle create new room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !newBuildingId) return;

    try {
      await createRoomMutation.mutateAsync({
        number: newRoomNumber,
        buildingId: newBuildingId,
        roomType: newRoomType,
        monthlyRent: Number(newRent) || 0,
        deposit: Number(newDeposit) || 0,
        area: Number(newArea) || 0,
        maxTenants: Number(newMaxTenants) || 1,
        description: newDescription,
      });
      setIsAddModalOpen(false);
      setNewRoomNumber('');
      setNewDescription('');
    } catch (err) {
      console.error('Failed to create room', err);
    }
  };

  // Export List CSV action
  const handleExportCSV = () => {
    const headers = [
      'Số phòng',
      'Tòa nhà',
      'Tầng',
      'Giá thuê',
      'Trạng thái',
      'Người thuê',
    ];
    const rows = filteredRooms.map((r) => [
      r.number,
      r.buildingName,
      r.floor,
      r.monthlyRent,
      r.status,
      r.tenantName,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tacohouse-rooms-list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen space-y-8 rounded-2xl bg-[#f8f9ff] p-2 sm:p-4 lg:p-6">
      {/* Breadcrumbs & Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737686]">
            <Link
              href="/dashboard/buildings"
              className="transition-colors hover:text-[#004ac6]"
            >
              Properties
            </Link>
            <ChevronRight className="size-3 text-[#c3c6d7]" />
            <span className="text-[#434655]">
              {selectedBuildingId && buildings.length > 0
                ? buildings.find((b) => b.id === selectedBuildingId)?.name
                : 'All Properties'}
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0b1c30]">
            Rooms Management
          </h1>
          <p className="mt-1 text-sm text-[#434655]">
            Manage and monitor all active rental units across your portfolio
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-10 rounded-xl border-[#c3c6d7] bg-white text-sm font-medium text-[#0b1c30] hover:bg-gray-50"
          >
            <Download className="mr-2 size-4" />
            Export List
          </Button>

          {canCreate && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-10 rounded-xl bg-[#004ac6] px-5 text-sm font-medium text-white shadow-xs hover:bg-[#003bb0]"
            >
              <Plus className="mr-2 size-4" />
              Add New Room
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Stats Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL UNITS */}
        <div className="flex flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold tracking-wider text-[#737686] uppercase">
            TOTAL UNITS
          </span>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight text-[#0b1c30]">
              {stats.total}
            </span>
            <div className="flex items-center gap-1 rounded-sm bg-[#6cf8bb]/20 px-2 py-0.5 text-xs font-bold text-[#006c49]">
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* OCCUPIED */}
        <div className="flex flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold tracking-wider text-[#737686] uppercase">
            OCCUPIED
          </span>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight text-[#0b1c30]">
              {stats.occupied}
            </span>
            <span className="text-xs font-semibold text-[#737686]">
              {stats.occupancyRate}% Rate
            </span>
          </div>
        </div>

        {/* VACANT */}
        <div className="flex flex-col justify-between rounded-xl border-y border-r border-l-4 border-y-[#c3c6d7] border-r-[#c3c6d7] border-l-[#784b00] bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold tracking-wider text-[#737686] uppercase">
            VACANT
          </span>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight text-[#0b1c30]">
              {stats.vacant}
            </span>
            <span className="text-xs font-bold text-[#784b00]">
              Ready to Lease
            </span>
          </div>
        </div>

        {/* MAINTENANCE */}
        <div className="flex flex-col justify-between rounded-xl border-y border-r border-l-4 border-y-[#c3c6d7] border-r-[#c3c6d7] border-l-[#ba1a1a] bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold tracking-wider text-[#737686] uppercase">
            MAINTENANCE
          </span>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight text-[#0b1c30]">
              {stats.maintenance}
            </span>
            <span className="text-xs font-bold text-[#ba1a1a]">
              Needs Attention
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Controls Bar */}
      <div className="flex flex-col gap-4 rounded-xl bg-[#eff4ff] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search room, tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border-[#c3c6d7] bg-[#f8f9ff] pr-3 pl-9 text-sm text-[#0b1c30] placeholder:text-[#94a3b8]"
            />
          </div>

          {/* Building Selector if multiple buildings */}
          {buildings.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#434655]">
                Building:
              </span>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="h-9 rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] px-3 text-sm font-medium text-[#0b1c30] focus:outline-none"
              >
                <option value="">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#434655]">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] px-3 text-sm font-medium text-[#0b1c30] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="AVAILABLE">Vacant / Available</option>
              <option value="PENDING_CHECKOUT">Pending Checkout</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          {/* Floor Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#434655]">Floor:</span>
            <div className="flex gap-1">
              {['ALL', '1', '2', '3', '4'].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setFloorFilter(fl)}
                  className={`size-8 rounded-md text-xs font-semibold transition-all ${
                    floorFilter === fl
                      ? 'bg-[#004ac6] text-white shadow-2xs'
                      : 'border border-[#c3c6d7] bg-white text-[#0b1c30] hover:bg-gray-100'
                  }`}
                >
                  {fl === 'ALL' ? 'All' : fl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-lg border-[#c3c6d7] bg-[#f8f9ff] px-3 text-xs font-medium text-[#0b1c30]"
            onClick={() => {
              setStatusFilter('ALL');
              setFloorFilter('ALL');
              setSelectedBuildingId('');
              setSearch('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-xs">
        {isRoomsLoading ? (
          <div className="p-12 text-center text-gray-500">
            Đang tải danh sách phòng...
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#c3c6d7] bg-[#f8f9ff] text-xs font-semibold tracking-wider text-[#737686] uppercase">
                <tr>
                  <th className="px-6 py-4">ROOM #</th>
                  <th className="px-6 py-4">FLOOR</th>
                  <th className="px-6 py-4">MONTHLY PRICE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">CURRENT TENANT</th>
                  <th className="px-6 py-4">CONTRACT END</th>
                  <th className="px-6 p{y-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7]/60">
                {filteredRooms.map((room) => (
                  <tr
                    key={room.id}
                    className="group transition-colors hover:bg-gray-50/80"
                  >
                    {/* Room Number & Details */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0b1c30]">
                        {room.number}
                      </div>
                      <div className="text-xs text-[#737686]">
                        {room.buildingName} • {room.details}
                      </div>
                    </td>

                    {/* Floor */}
                    <td className="px-6 py-4 font-medium text-[#434655]">
                      {room.floor}
                    </td>

                    {/* Monthly Price */}
                    <td className="px-6 py-4 font-semibold text-[#0b1c30]">
                      {formatCurrency(room.monthlyRent)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {room.status === 'OCCUPIED' && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#6cf8bb] px-3 py-1 text-xs font-semibold text-[#00714d]">
                          <span className="size-1.5 rounded-full bg-[#006c49]" />
                          Occupied
                        </div>
                      )}
                      {room.status === 'AVAILABLE' && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-[#784b00]">
                          <span className="size-1.5 rounded-full bg-[#784b00]" />
                          Vacant
                        </div>
                      )}
                      {room.status === 'MAINTENANCE' && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-semibold text-[#93000a]">
                          <span className="size-1.5 rounded-full bg-[#ba1a1a]" />
                          Maintenance
                        </div>
                      )}
                      {room.status === 'PENDING_CHECKOUT' && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          <span className="size-1.5 rounded-full bg-amber-600" />
                          Pending Checkout
                        </div>
                      )}
                    </td>

                    {/* Current Tenant */}
                    <td className="px-6 py-4">
                      {room.tenantName !== '—' ? (
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-[#d3e4fe] text-[10px] font-bold text-[#004ac6]">
                            {room.tenantAvatar || 'T'}
                          </div>
                          <span className="font-medium text-[#0b1c30]">
                            {room.tenantName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Contract End */}
                    <td className="px-6 py-4 text-[#434655]">
                      {room.contractEnd}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/rooms/${room.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 rounded-full p-0 text-gray-500 hover:bg-blue-50 hover:text-[#004ac6]"
                            title="Xem chi tiết"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#737686]">
            <DoorOpen className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 font-medium text-[#0b1c30]">
              Không tìm thấy phòng nào
            </p>
            <p className="mt-1 text-xs text-[#737686]">
              Thử thay đổi bộ lọc hoặc thêm phòng mới vào tòa nhà.
            </p>
          </div>
        )}
      </div>

      {/* Add Room Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-[#004ac6]">
                <DoorOpen className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">
                Thêm phòng mới
              </h2>
            </div>

            <form onSubmit={handleCreateRoom} className="mt-6 space-y-4">
              {/* Building Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Tòa nhà *
                </label>
                <select
                  required
                  value={newBuildingId}
                  onChange={(e) => setNewBuildingId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#004ac6] focus:outline-none"
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Room Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Số phòng *
                  </label>
                  <Input
                    required
                    placeholder="VD: 101, 202"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Loại phòng *
                  </label>
                  <select
                    value={newRoomType}
                    onChange={(e) =>
                      setNewRoomType(
                        e.target.value as 'FULL_RIGHTS' | 'PARTIAL_RIGHTS',
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#004ac6] focus:outline-none"
                  >
                    <option value="FULL_RIGHTS">Toàn quyền (Trọn gói)</option>
                    <option value="PARTIAL_RIGHTS">
                      Bán quyền (Phòng ghép)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Monthly Rent */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Giá thuê (VNĐ/tháng) *
                  </label>
                  <Input
                    type="number"
                    required
                    value={newRent}
                    onChange={(e) => setNewRent(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Deposit */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Tiền cọc (VNĐ) *
                  </label>
                  <Input
                    type="number"
                    required
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Area */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Diện tích (m²)
                  </label>
                  <Input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Max Tenants */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Số người tối đa
                  </label>
                  <Input
                    type="number"
                    value={newMaxTenants}
                    onChange={(e) => setNewMaxTenants(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Mô tả / Ghi chú
                </label>
                <Input
                  placeholder="VD: Phòng có ban công, đầy đủ nội thất..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#004ac6] text-white hover:bg-[#003bb0]"
                  disabled={createRoomMutation.isPending}
                >
                  {createRoomMutation.isPending ? 'Đang tạo...' : 'Tạo phòng'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
