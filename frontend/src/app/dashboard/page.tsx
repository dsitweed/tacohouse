'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBills } from '@/hooks/api/useBills';
import { useMaintenanceRequests } from '@/hooks/api/useMaintenance';
import { useRentals } from '@/hooks/api/useRentals';
import { useRooms } from '@/hooks/api/useRooms';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { BillStatus, RoomStatus, UserRole } from '@/types';
import {
  AlertCircle,
  Building2,
  DollarSign,
  DoorOpen,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role;

  // Fetch data from API
  const { data: roomsData } = useRooms({ page: 1, limit: 1000 });
  const { data: billsData } = useBills({ page: 1, limit: 100 });
  const { data: maintenanceData } = useMaintenanceRequests({
    page: 1,
    limit: 100,
  });
  const { data: rentalsData } = useRentals({ page: 1, limit: 1000 });

  // Calculate stats from API data
  const stats = useMemo(() => {
    const rooms = Array.isArray(roomsData) ? roomsData : roomsData?.data || [];
    const bills = billsData?.data || [];
    const maintenance = maintenanceData?.data || [];
    const rentals = rentalsData?.data || [];

    const totalRooms = rooms.length;
    const occupiedRooms = rentals.filter(
      (r: any) => r.status === 'ACTIVE',
    ).length;
    const vacantRooms = rooms.filter(
      (r: any) => r.status === RoomStatus.AVAILABLE,
    ).length;

    // Calculate monthly revenue from paid bills this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = bills
      .filter((bill) => {
        const billDate = new Date(bill.billingPeriod);
        return (
          bill.status === BillStatus.PAID &&
          billDate.getMonth() === currentMonth &&
          billDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

    const pendingBills = bills.filter(
      (bill) =>
        bill.status === BillStatus.PENDING ||
        bill.status === BillStatus.TENANT_CONFIRMED ||
        bill.status === BillStatus.LANDLORD_CONFIRMED,
    ).length;

    const maintenanceRequests = maintenance.filter(
      (req) => req.status === 'PENDING' || req.status === 'IN_PROGRESS',
    ).length;

    return {
      totalRooms,
      occupiedRooms,
      vacantRooms,
      monthlyRevenue,
      pendingBills,
      maintenanceRequests,
    };
  }, [roomsData, billsData, maintenanceData, rentalsData]);

  const kpiCards = [
    {
      title: 'Tổng phòng',
      value: stats.totalRooms,
      icon: Building2,
      color: 'indigo',
    },
    {
      title: 'Phòng đang thuê',
      value: stats.occupiedRooms,
      icon: DoorOpen,
      color: 'emerald',
    },
    {
      title: 'Phòng trống',
      value: stats.vacantRooms,
      icon: DoorOpen,
      color: 'amber',
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: 'emerald',
      isMoney: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Chào mừng trở lại, {user?.profile?.firstName || user?.email}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    card.isMoney ? 'text-emerald-600' : 'text-gray-900'
                  }`}
                >
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Thông báo quan trọng</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.pendingBills > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div>
                  <p className="font-medium text-amber-900">
                    Có {stats.pendingBills} hóa đơn chưa thanh toán
                  </p>
                  <p className="text-sm text-amber-700">
                    Cần xác nhận thanh toán
                  </p>
                </div>
                <Badge variant="warning">{stats.pendingBills}</Badge>
              </div>
            )}
            {stats.maintenanceRequests > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <div>
                  <p className="font-medium text-indigo-900">
                    Có {stats.maintenanceRequests} yêu cầu sửa chữa mới
                  </p>
                  <p className="text-sm text-indigo-700">Cần xem xét</p>
                </div>
                <Badge variant="info">{stats.maintenanceRequests}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(role === UserRole.ADMIN || role === UserRole.LANDLORD) && (
              <>
                <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Tạo hóa đơn tháng
                </button>
                <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Gửi thông báo
                </button>
              </>
            )}
            {role === UserRole.TENANT && (
              <>
                <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Xem hóa đơn
                </button>
                <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Gửi yêu cầu sửa chữa
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span>Doanh thu theo tháng</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Biểu đồ doanh thu sẽ được hiển thị ở đây
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
