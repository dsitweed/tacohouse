'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layouts';
import { Users, Search, Eye, Phone, Mail } from 'lucide-react';
import { UserRole } from '@tacohouse/shared';
import { useAuthStore } from '@/stores/auth-store';

export default function TenantsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  // Mock data - sẽ thay bằng API call
  const tenants = [
    {
      id: '1',
      profile: {
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        phone: '0901234567',
      },
      email: 'nguyenvana@example.com',
      room: {
        roomNumber: '101',
        building: { name: 'Tòa nhà ABC' },
      },
      status: 'ACTIVE',
    },
  ];

  const canView = user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  if (!canView) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Bạn không có quyền truy cập trang này</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người thuê</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý thông tin người thuê và hợp đồng
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm người thuê..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người thuê</CardTitle>
          </CardHeader>
          <CardContent>
            {tenants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Người thuê
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Số điện thoại
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Phòng đang thuê
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
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {tenant.profile.firstName} {tenant.profile.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{tenant.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{tenant.profile.phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tenant.room?.roomNumber} - {tenant.room?.building?.name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Đang thuê</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/dashboard/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">Chưa có người thuê nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

