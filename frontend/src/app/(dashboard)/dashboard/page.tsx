'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layouts';
import { formatCurrency } from '@/lib/utils';
import {
  Building2,
  DoorOpen,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { UserRole } from '@tacohouse/shared';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role;

  // Mock data - sẽ thay bằng API calls
  const stats = {
    totalRooms: 24,
    occupiedRooms: 18,
    vacantRooms: 6,
    monthlyRevenue: 63000000,
    pendingBills: 3,
    maintenanceRequests: 2,
  };

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
    <DashboardLayout>
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
                    <p className="text-sm text-amber-700">Cần xác nhận thanh toán</p>
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
    </DashboardLayout>
  );
}

