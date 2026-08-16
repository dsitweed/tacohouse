'use client';

import {
  ArrowLeft,
  Building2,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
  Plus,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building } from '@/generated/model';
import { useBuilding, useUpdateBuilding } from '@/hooks/api/useBuildings';
import { useRooms } from '@/hooks/api/useRooms';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { formatCurrency } from '@/utils';

// Mock Revenue Growth Trend Data for 12 months (JAN - DEC)
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

// Mock Active Maintenance Requests
const SAMPLE_MAINTENANCE = [
  {
    id: 'm-1',
    issue: 'HVAC Filter Replacement',
    unit: '402-B',
    technician: 'Mike Sullivan',
    avatar: 'MS',
    status: 'IN PROGRESS',
    statusColor: 'bg-[#6cf8bb] text-[#00714d]',
    requested: 'Oct 12, 2023',
  },
  {
    id: 'm-2',
    issue: 'Elevator Inspection',
    unit: 'Main Lobby',
    technician: 'KONE Service',
    avatar: 'K',
    status: 'SCHEDULED',
    statusColor: 'bg-[#d3e4fe] text-[#434655]',
    requested: 'Oct 15, 2023',
  },
  {
    id: 'm-3',
    issue: 'Plumbing Leak Repair',
    unit: '101-A',
    technician: 'Alex Rivera',
    avatar: 'AR',
    status: 'RESOLVED',
    statusColor: 'bg-emerald-100 text-emerald-800',
    requested: 'Oct 08, 2023',
  },
];

// Mock Gallery Photos
const GALLERY_PHOTOS = [
  '/images/buildings/gallery/photo-1.png',
  '/images/buildings/gallery/photo-2.png',
  '/images/buildings/gallery/photo-3.png',
  '/images/buildings/gallery/photo-4.png',
];

type TabType =
  'overview' | 'rooms' | 'income' | 'expenses' | 'maintenance' | 'documents';

type BuildingDetailClientProps = {
  id: string;
  initialBuilding?: Building;
};

export default function BuildingDetailClient({
  id,
  initialBuilding,
}: BuildingDetailClientProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Fetch real building data - use initialBuilding for hydration
  const { data: building } = useBuilding(id, {
    initialData: initialBuilding,
  });
  const updateBuildingMutation = useUpdateBuilding();

  // Fetch rooms for this building
  const { data: roomsData } = useRooms({ page: 1, limit: 100 });
  const buildingRooms = useMemo(() => {
    if (!roomsData?.data) return [];
    return roomsData.data.filter((r) => r.buildingId === id);
  }, [roomsData, id]);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editElec, setEditElec] = useState('');
  const [editWater, setEditWater] = useState('');

  const canEdit =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  const handleOpenEditModal = () => {
    if (building) {
      setEditName(building.name);
      setEditAddress(building.address);
      setEditElec(String(building.electricityRate || '3500'));
      setEditWater(String(building.waterRate || '15000'));
    }
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateBuildingMutation.mutateAsync({
        id,
        data: {
          name: editName,
          address: editAddress,
          electricityRate: Number(editElec) || 0,
          waterRate: Number(editWater) || 0,
        },
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update building', err);
    }
  };

  // Fallback building name/address for display if loading or sample
  const displayName = building?.name || 'Sunset Heights';
  const displayAddress =
    building?.address || '8822 Skyline Drive, Los Angeles, CA 90069';

  return (
    <div className="min-h-screen space-y-8 rounded-2xl bg-[#f8f9ff] p-2 sm:p-4 lg:p-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#004ac6] uppercase">
            <Link
              href="/dashboard/buildings"
              className="flex items-center gap-1 text-[#737686] hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              PROPERTIES
            </Link>
            <span>/</span>
            <span>RESIDENTIAL</span>
          </div>

          {/* Building Title */}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0b1c30]">
            {displayName}
          </h1>

          {/* Building Address */}
          <div className="mt-1 flex items-center gap-1.5 text-[#434655]">
            <MapPin className="size-4 shrink-0 text-[#004ac6]" />
            <span className="text-sm">{displayAddress}</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {canEdit && (
            <Button
              onClick={handleOpenEditModal}
              variant="outline"
              className="h-10 rounded-xl border-[#c3c6d7] bg-white text-sm font-semibold text-[#0b1c30] hover:bg-gray-50"
            >
              <Edit className="mr-2 size-4" />
              Edit Details
            </Button>
          )}

          <Link href={`/dashboard/rooms?buildingId=${id}`}>
            <Button className="h-10 rounded-xl bg-[#004ac6] px-5 text-sm font-semibold text-white shadow-xs hover:bg-[#003bb0]">
              <Plus className="mr-2 size-4" />
              Add Unit
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-[#c3c6d7]">
        <nav className="flex gap-8 overflow-x-auto pb-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative pb-4 text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'rooms'
                ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Room List
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'income'
                ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Income Statistics
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'expenses'
                ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'maintenance'
                ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Maintenance History
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'documents'
                ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Documents
          </button>
        </nav>
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Summary Cards & Map Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* 3 Summary Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-8">
              {/* Card 1: Occupancy */}
              <div className="flex flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-[#737686] uppercase">
                      OCCUPANCY
                    </span>
                    <TrendingUp className="size-4 text-[#006c49]" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#0b1c30]">
                    94.2%
                  </p>
                </div>
                <p className="mt-2 text-xs font-medium text-[#006c49]">
                  +2.4% from last month
                </p>
              </div>

              {/* Card 2: Annual ROI */}
              <div className="flex flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-[#737686] uppercase">
                      ANNUAL ROI
                    </span>
                    <DollarSign className="size-4 text-[#004ac6]" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#0b1c30]">8.4%</p>
                </div>
                <p className="mt-2 text-xs font-normal text-[#434655]">
                  Market avg: 6.1%
                </p>
              </div>

              {/* Card 3: Active Issues */}
              <div className="flex flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-[#737686] uppercase">
                      ACTIVE ISSUES
                    </span>
                    <Wrench className="size-4 text-[#ba1a1a]" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#0b1c30]">03</p>
                </div>
                <p className="mt-2 text-xs font-semibold text-[#ba1a1a]">
                  2 Urgent requests
                </p>
              </div>
            </div>

            {/* Map Placeholder Widget */}
            <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-xs lg:col-span-4">
              <div className="relative flex h-44 w-full flex-col items-center justify-center bg-[#f1f5f9]">
                {/* SVG Grid / Map Background simulation */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                {/* Pin */}
                <div className="relative z-10 flex flex-col items-center">
                  <MapPin className="size-8 animate-bounce text-[#004ac6] drop-shadow-md" />
                  <div className="mt-1 rounded-full border border-[#c3c6d7] bg-white px-3 py-1 text-xs font-bold text-[#0b1c30] shadow-xs">
                    {displayName}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#eff4ff] p-4">
                <span className="text-xs font-semibold text-[#0b1c30]">
                  Map View
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    displayAddress,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#004ac6] hover:underline"
                >
                  Open Google Maps
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Middle Bento Row: Revenue Trend & Recent Photos */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Revenue Growth Trend Chart */}
            <div className="flex flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-xs lg:col-span-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30]">
                    Revenue Growth Trend
                  </h3>
                  <p className="text-xs text-[#434655]">
                    Last 12 months financial performance
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-[#737686]">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-[#004ac6]" />
                    <span>Gross Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-[#cbd5e1]" />
                    <span>Operating Expenses</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="mt-8 flex h-64 items-end justify-between gap-1.5 px-2 sm:gap-3">
                {MONTHLY_REVENUE_TREND.map((item) => (
                  <div
                    key={item.month}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    {/* Tooltip on Hover */}
                    <div className="pointer-events-none absolute -top-10 z-20 rounded-md bg-[#0b1c30] px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                      Gross: ${item.gross.toLocaleString()}
                    </div>

                    {/* Bars stack */}
                    <div className="flex h-48 w-full items-end justify-center gap-1">
                      {/* Gross Bar */}
                      <div
                        style={{ height: `${(item.gross / 30000) * 100}%` }}
                        className="w-1/2 rounded-t-sm bg-[#004ac6] transition-all hover:bg-[#003bb0]"
                      />
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${(item.expense / 30000) * 100}%` }}
                        className="w-1/2 rounded-t-sm bg-[#cbd5e1] transition-all hover:bg-[#94a3b8]"
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-[11px] font-medium text-[#737686]">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Photos Gallery Card */}
            <div className="flex flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-xs lg:col-span-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0b1c30]">
                  Recent Photos
                </h3>
                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="text-xs font-bold text-[#004ac6] hover:underline"
                >
                  View Gallery
                </button>
              </div>

              {/* 2x2 Photo Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {GALLERY_PHOTOS.map((src, idx) => (
                  <div
                    key={idx}
                    onClick={() => setIsGalleryOpen(true)}
                    className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-lg border border-[#c3c6d7] bg-gray-100"
                  >
                    <Image
                      src={src}
                      alt={`Building photo ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />

                    {/* Overlay +12 on 4th photo */}
                    {idx === 3 && (
                      <div className="backdrop-blur-2xs absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-bold text-white">
                        +12
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Maintenance Table */}
          <div className="overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-[#c3c6d7] px-6 py-5">
              <h3 className="text-lg font-bold text-[#0b1c30]">
                Active Maintenance
              </h3>
              <button className="text-sm font-bold text-[#004ac6] hover:underline">
                See full history
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#eff4ff] text-xs font-semibold tracking-wider text-[#737686] uppercase">
                  <tr>
                    <th className="px-6 py-4">ISSUE</th>
                    <th className="px-6 py-4">UNIT</th>
                    <th className="px-6 py-4">TECHNICIAN</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4">REQUESTED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d7]/60">
                  {SAMPLE_MAINTENANCE.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-6 py-4 font-semibold text-[#0b1c30]">
                        {row.issue}
                      </td>
                      <td className="px-6 py-4 text-[#434655]">{row.unit}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-[#dbe1ff] text-[10px] font-bold text-[#004ac6]">
                            {row.avatar}
                          </div>
                          <span className="text-[#434655]">
                            {row.technician}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${row.statusColor}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#737686]">
                        {row.requested}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: ROOM LIST */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0b1c30]">
              Danh sách phòng ({buildingRooms.length})
            </h2>
            <Link href={`/dashboard/rooms?buildingId=${id}`}>
              <Button className="bg-[#004ac6] text-white hover:bg-[#003bb0]">
                <Plus className="mr-2 size-4" />
                Thêm phòng
              </Button>
            </Link>
          </div>

          {buildingRooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buildingRooms.map((room) => (
                <div
                  key={room.id}
                  className="transition-hover rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#0b1c30]">
                      Phòng {room.number}
                    </h3>
                    <Badge
                      variant={
                        room.status === 'OCCUPIED' ? 'secondary' : 'outline'
                      }
                    >
                      {room.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[#737686]">
                    Diện tích: {room.area} m²
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#004ac6]">
                    {formatCurrency(room.monthlyRent)}/tháng
                  </p>

                  <div className="mt-4 flex justify-end">
                    <Link href={`/rooms/${room.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-1 size-4" /> Chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#c3c6d7] bg-white p-12 text-center text-[#737686]">
              <Building2 className="mx-auto size-12 text-gray-400" />
              <p className="mt-4 font-medium">
                Chưa có phòng nào trong tòa nhà này
              </p>
            </div>
          )}
        </div>
      )}

      {/* Other Tabs Placeholder */}
      {['income', 'expenses', 'maintenance', 'documents'].includes(
        activeTab,
      ) && (
        <div className="rounded-xl border border-[#c3c6d7] bg-white p-12 text-center text-[#737686]">
          <FileText className="mx-auto size-12 text-[#004ac6]" />
          <h3 className="mt-4 text-lg font-bold text-[#0b1c30] capitalize">
            {activeTab} Analytics
          </h3>
          <p className="mt-1 text-sm text-[#737686]">
            Detailed report and management logs for {activeTab}.
          </p>
        </div>
      )}

      {/* Edit Building Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-xl font-bold text-[#0b1c30]">
              Chỉnh sửa thông tin tòa nhà
            </h2>

            <form onSubmit={handleSaveEdit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Tên tòa nhà
                </label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Địa chỉ
                </label>
                <Input
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Giá điện (VNĐ/kWh)
                  </label>
                  <Input
                    type="number"
                    value={editElec}
                    onChange={(e) => setEditElec(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Giá nước (VNĐ/m³)
                  </label>
                  <Input
                    type="number"
                    value={editWater}
                    onChange={(e) => setEditWater(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#004ac6] text-white hover:bg-[#003bb0]"
                  disabled={updateBuildingMutation.isPending}
                >
                  {updateBuildingMutation.isPending
                    ? 'Đang lưu...'
                    : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Lightbox Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6">
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="size-6" />
            </button>

            <h3 className="mb-4 text-xl font-bold text-[#0b1c30]">
              Thư viện ảnh tòa nhà ({displayName})
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {GALLERY_PHOTOS.map((src, i) => (
                <div
                  key={i}
                  className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200"
                >
                  <Image
                    src={src}
                    alt={`Gallery ${i}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
