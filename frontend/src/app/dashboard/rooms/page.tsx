'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRooms } from '@/hooks/api/use-rooms';
import { formatCurrency } from '@/lib/utils';
import { DoorOpen, Plus, Search, Edit, Eye } from 'lucide-react';
import { RoomStatus, UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

const statusColors: Record<RoomStatus, 'default' | 'success' | 'warning' | 'error'> = {
  AVAILABLE: 'success',
  OCCUPIED: 'default',
  PENDING_CHECKOUT: 'warning',
  MAINTENANCE: 'error',
};

const statusLabels: Record<RoomStatus, string> = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang thuê',
  PENDING_CHECKOUT: 'Chờ trả phòng',
  MAINTENANCE: 'Bảo trì',
};

export default function RoomsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useRooms({
    page: 1,
    limit: 20,
  });

  const canCreate = user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý thông tin các phòng trọ
            </p>
          </div>
          {canCreate && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm phòng
            </Button>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách phòng</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Đang tải...</div>
            ) : data?.data && data.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Phòng
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Tòa nhà
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Loại phòng
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Giá thuê
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Diện tích
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.data.map((room: any) => (
                      <tr key={room.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <DoorOpen className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {room.number}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {room.building?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {room.roomType === 'FULL_RIGHTS' ? 'Toàn quyền' : 'Bán quyền'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(room.monthlyRent)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {room.area}m²
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColors[room.status as RoomStatus]}>
                            {statusLabels[room.status as RoomStatus]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/dashboard/rooms/${room.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {canCreate && (
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <DoorOpen className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">Chưa có phòng nào</p>
                {canCreate && (
                  <Button className="mt-4" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm phòng đầu tiên
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}

