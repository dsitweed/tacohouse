'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useBuildings } from '@/hooks/api/use-buildings';
import { formatCurrency } from '@/lib/utils';
import { Building2, Plus, Search, Edit, Eye } from 'lucide-react';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

export default function BuildingsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useBuildings({
    page: 1,
    limit: 20,
    search,
  });

  const canCreate = user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tòa nhà</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý thông tin các tòa nhà và đơn giá dịch vụ
            </p>
          </div>
          {canCreate && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm tòa nhà
            </Button>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tòa nhà..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Buildings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tòa nhà</CardTitle>
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
                        Tên tòa nhà
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Địa chỉ
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Số phòng
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Điện (VNĐ/kWh)
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Nước (VNĐ/m³)
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
                    {data.data.map((building) => (
                      <tr key={building.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {building.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {building.address}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {building.totalRooms || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatCurrency(building.electricityRate || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatCurrency(building.waterRate || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Hoạt động</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/dashboard/buildings/${building.id}`}>
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
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">Chưa có tòa nhà nào</p>
                {canCreate && (
                  <Button className="mt-4" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm tòa nhà đầu tiên
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}

