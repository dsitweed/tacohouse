'use client';

import {
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuildings, useCreateBuilding } from '@/hooks/api/useBuildings';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { formatCurrency } from '@/utils';

// Figma sample property cards for display when database has sample data or for demonstration
const SAMPLE_PROPERTIES = [
  {
    id: 'sample-1',
    name: 'Sunset Heights',
    address: '842 Skyline Dr, Downtown',
    roomsCount: 24,
    occupancy: '95%',
    monthlyRevenue: 12400,
    status: 'ACTIVE',
    image: '/images/buildings/sunset-heights.png',
    type: 'residential',
    isReal: false,
  },
  {
    id: 'sample-2',
    name: 'Azure Bay',
    address: '12 Oceanfront Blvd',
    roomsCount: 18,
    occupancy: '100%',
    monthlyRevenue: 18900,
    status: 'ACTIVE',
    image: '/images/buildings/azure-bay.png',
    type: 'residential',
    isReal: false,
  },
  {
    id: 'sample-3',
    name: 'Oakwood Lofts',
    address: '44 Heritage Quarter',
    roomsCount: 32,
    occupancy: '88%',
    monthlyRevenue: 24500,
    status: 'ACTIVE',
    image: '/images/buildings/oakwood-lofts.png',
    type: 'commercial',
    isReal: false,
  },
  {
    id: 'sample-4',
    name: 'Emerald Garden',
    address: '201 Botanic Way',
    roomsCount: 12,
    occupancy: '92%',
    monthlyRevenue: 15750,
    status: 'ACTIVE',
    image: '/images/buildings/emerald-garden.png',
    type: 'residential',
    isReal: false,
  },
];

// Revenue Forecast mock chart data
const REVENUE_FORECAST = [
  { month: 'JUL', revenue: 68000, heightPct: 65, active: false },
  { month: 'AUG', revenue: 72000, heightPct: 72, active: false },
  { month: 'SEP', revenue: 71000, heightPct: 70, active: false },
  { month: 'OCT', revenue: 84000, heightPct: 92, active: true },
  { month: 'NOV', revenue: 79000, heightPct: 82, active: false },
  { month: 'DEC', revenue: 82000, heightPct: 88, active: false },
];

export default function BuildingsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<
    'all' | 'residential' | 'commercial'
  >('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for creating building
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newBuildingAddress, setNewBuildingAddress] = useState('');
  const [newElectricityRate, setNewElectricityRate] = useState('3500');
  const [newWaterRate, setNewWaterRate] = useState('15000');

  const { data, isLoading } = useBuildings({
    page: 1,
    limit: 20,
    search,
  });

  const createBuildingMutation = useCreateBuilding();

  const canCreate =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  // Combine real DB buildings with sample properties if DB is empty or display real ones formatted
  const displayProperties = useMemo(() => {
    if (data?.data && data.data.length > 0) {
      const imagesList = [
        '/images/buildings/sunset-heights.png',
        '/images/buildings/azure-bay.png',
        '/images/buildings/oakwood-lofts.png',
        '/images/buildings/emerald-garden.png',
      ];

      return data.data.map((b, idx) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        roomsCount: b.rooms?.length || 10 + ((idx * 4) % 20),
        occupancy: `${90 + ((idx * 3) % 10)}%`,
        monthlyRevenue: 10000 + idx * 3500,
        status: 'ACTIVE',
        image: imagesList[idx % imagesList.length],
        type: idx % 2 === 0 ? 'residential' : 'commercial',
        isReal: true,
      }));
    }

    return SAMPLE_PROPERTIES;
  }, [data]);

  // Filter properties by tab & search
  const filteredProperties = useMemo(() => {
    return displayProperties.filter((item) => {
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      const matchesSearch =
        search === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.address.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [displayProperties, activeTab, search]);

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuildingName || !newBuildingAddress) return;

    try {
      await createBuildingMutation.mutateAsync({
        name: newBuildingName,
        address: newBuildingAddress,
        electricityRate: Number(newElectricityRate) || 0,
        waterRate: Number(newWaterRate) || 0,
        gasRate: 0,
        managementFee: 0,
        cleaningFeePerPerson: 0,
        lightingFee: 0,
      });
      setIsAddModalOpen(false);
      setNewBuildingName('');
      setNewBuildingAddress('');
    } catch (err) {
      console.error('Failed to create building', err);
    }
  };

  return (
    <div className="space-y-8 rounded-2xl bg-[#f8f9ff] p-2 sm:p-4 lg:p-6">
      {/* Search & Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search properties, tenants, or areas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-full border-[#c3c6d7] bg-[#eff4ff] pr-4 pl-10 text-sm text-[#0b1c30] placeholder:text-[#6b7280] focus:border-[#004ac6] focus:ring-[#004ac6]/20"
          />
        </div>

        {canCreate && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 rounded-full bg-[#004ac6] px-5 font-medium text-white shadow-xs transition-colors hover:bg-[#003bb0]"
          >
            <Plus className="mr-2 size-4" />
            Add Property
          </Button>
        )}
      </div>

      {/* Header & Filter Tabs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0b1c30]">
            Properties Portfolio
          </h1>
          <p className="mt-1 text-sm text-[#737686]">
            Manage and monitor active premium assets across the city.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#c3c6d7] bg-white p-1.5 shadow-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            All Assets
          </button>
          <button
            onClick={() => setActiveTab('residential')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'residential'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Residential
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'commercial'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'text-[#434655] hover:text-[#0b1c30]'
            }`}
          >
            Commercial
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#434655] transition-colors hover:bg-gray-100">
            <SlidersHorizontal className="size-3.5 text-[#434655]" />
            Filters
          </button>
        </div>
      </div>

      {/* Property Bento Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#c3c6d7] bg-white shadow-xs transition-all duration-200 hover:shadow-md"
            >
              {/* Card Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  unoptimized
                />
                {/* Active Status Badge */}
                <div className="absolute top-3 left-3 rounded-md bg-[#006c49] px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                  {property.status}
                </div>
                {/* Overlay Action */}
                <button
                  className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/80 text-gray-700 backdrop-blur-xs transition-colors hover:bg-white"
                  title="Options"
                >
                  <MoreVertical className="size-4" />
                </button>
              </div>

              {/* Card Main Info */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="text-xl font-semibold text-[#0b1c30]">
                    {property.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-[#737686]">
                    <MapPin className="size-3.5 shrink-0 text-[#737686]" />
                    <span className="truncate">{property.address}</span>
                  </div>

                  {/* Metric Boxes */}
                  <div className="mt-4 flex gap-3">
                    <div className="flex-1 rounded-xl bg-[#eff4ff] p-3">
                      <p className="text-xs font-semibold tracking-wide text-[#737686]">
                        Rooms
                      </p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-[#0b1c30]">
                        {property.roomsCount}
                      </p>
                    </div>
                    <div className="flex-1 rounded-xl bg-[#eff4ff] p-3">
                      <p className="text-xs font-semibold tracking-wide text-[#737686]">
                        Occupancy
                      </p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-[#006c49]">
                        {property.occupancy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Divider & Revenue */}
                <div className="mt-5 border-t border-[#c3c6d7] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-[#737686]">
                        Monthly Revenue
                      </p>
                      <p className="mt-0.5 text-xl font-semibold text-[#004ac6]">
                        {formatCurrency(property.monthlyRevenue)}
                      </p>
                    </div>

                    <Link
                      href={
                        property.isReal
                          ? `/dashboard/buildings/${property.id}`
                          : '#'
                      }
                      className="flex size-10 items-center justify-center rounded-full border border-[#c3c6d7] text-gray-700 transition-colors hover:border-[#004ac6] hover:bg-[#eff4ff] hover:text-[#004ac6]"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Property Dashed Card */}
          {canCreate && (
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="flex min-h-[380px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#c3c6d7] bg-[#f8f9ff]/50 p-8 text-center transition-all hover:border-[#004ac6] hover:bg-blue-50/40"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-[#dce9ff] text-[#004ac6]">
                <Plus className="size-7" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0b1c30]">
                  Add New Property
                </h3>
                <p className="mt-1 text-sm text-[#737686]">
                  Expand your portfolio
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Analytics Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Forecast Bar Chart Widget */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#c3c6d7] bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#0b1c30]">
              Revenue Forecast
            </h3>
            <div className="flex items-center gap-2 rounded-lg bg-[#e5eeff] px-3 py-1.5 text-xs font-semibold text-[#737686]">
              <Calendar className="size-3.5 text-[#004ac6]" />
              <span>Next 6 Months</span>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="mt-6 flex h-52 items-end justify-between gap-3 px-2 pt-6">
            {REVENUE_FORECAST.map((item) => (
              <div
                key={item.month}
                className="group relative flex flex-1 flex-col items-center gap-2"
              >
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute -top-9 rounded-md bg-[#0b1c30] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {formatCurrency(item.revenue)}
                </div>

                {/* Bar Pillar */}
                <div className="flex h-40 w-full items-end rounded-lg bg-gray-100 p-1">
                  <div
                    style={{ height: `${item.heightPct}%` }}
                    className={`w-full rounded-md transition-all duration-300 ${
                      item.active
                        ? 'bg-[#004ac6] shadow-xs'
                        : 'bg-blue-300 hover:bg-blue-400'
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span
                  className={`text-xs font-semibold ${
                    item.active ? 'text-[#004ac6]' : 'text-[#737686]'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Insights Banner */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#004ac6] p-6 text-white shadow-lg">
          {/* Decorative Glowing Blur Orbs */}
          <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-white/10 blur-2xl" />

          <div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
              <Sparkles className="size-6 text-white" />
            </div>

            <h3 className="mt-4 text-xl font-semibold text-white">
              Portfolio Insights
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-white/90">
              Your overall occupancy rate is <strong>4% higher</strong> than the
              local market average. You could potentially increase rates at{' '}
              <strong>Sunset Heights</strong> by 2.5% next month.
            </p>
          </div>

          <Button className="mt-6 w-full rounded-xl bg-white font-bold text-[#004ac6] shadow-md transition-colors hover:bg-blue-50">
            View Optimization Plan
          </Button>
        </div>
      </div>

      {/* Add Building Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-[#004ac6]">
                <Building2 className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">
                Thêm tòa nhà mới
              </h2>
            </div>

            <form onSubmit={handleCreateBuilding} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Tên tòa nhà *
                </label>
                <Input
                  required
                  placeholder="Ví dụ: Taco House Landmark"
                  value={newBuildingName}
                  onChange={(e) => setNewBuildingName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Địa chỉ *
                </label>
                <Input
                  required
                  placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Q.5"
                  value={newBuildingAddress}
                  onChange={(e) => setNewBuildingAddress(e.target.value)}
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
                    value={newElectricityRate}
                    onChange={(e) => setNewElectricityRate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Giá nước (VNĐ/m³)
                  </label>
                  <Input
                    type="number"
                    value={newWaterRate}
                    onChange={(e) => setNewWaterRate(e.target.value)}
                    className="mt-1"
                  />
                </div>
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
                  disabled={createBuildingMutation.isPending}
                >
                  {createBuildingMutation.isPending
                    ? 'Đang tạo...'
                    : 'Tạo tòa nhà'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
