'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Eye, Phone, Mail } from 'lucide-react';
import { UserRole, RentalStatus } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { useRentals } from '@/hooks/api/use-rentals';

export default function TenantsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  // Fetch rentals from API
  const { data: rentalsData, isLoading } = useRentals({ 
    page: 1, 
    limit: 100,
    status: RentalStatus.ACTIVE,
  });

  // Extract tenants from active rentals
  const tenants = useMemo(() => {
    if (!rentalsData?.data) return [];
    
    return rentalsData.data
      .filter((rental) => rental.status === RentalStatus.ACTIVE)
      .map((rental) => ({
        id: rental.tenantId,
        rentalId: rental.id,
        profile: rental.tenant?.user?.profile || {
          firstName: '',
          lastName: '',
          phone: '',
        },
        email: rental.tenant?.user?.email || '',
        room: {
          roomNumber: rental.room?.number || '',
          building: { name: rental.room?.building?.name || '' },
        },
        status: rental.status,
      }))
      .filter((tenant) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          tenant.profile.firstName?.toLowerCase().includes(searchLower) ||
          tenant.profile.lastName?.toLowerCase().includes(searchLower) ||
          tenant.email.toLowerCase().includes(searchLower) ||
          tenant.profile.phone?.includes(search)
        );
      });
  }, [rentalsData, search]);

  const canView = user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  if (!canView) {
    return (
      
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Bạn không có quyền truy cập trang này</p>
          </CardContent>
        </Card>
      
    );
  }

  return (
    
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
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Đang tải...</p>
              </div>
            ) : tenants.length > 0 ? (
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
                      <tr key={tenant.rentalId || tenant.id} className="hover:bg-gray-50">
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
                            <span>{tenant.profile.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tenant.room?.roomNumber} - {tenant.room?.building?.name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Đang thuê</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/dashboard/rentals/${tenant.rentalId || tenant.id}`}>
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
                <p className="mt-4 text-sm text-gray-600">
                  {search ? 'Không tìm thấy người thuê' : 'Chưa có người thuê nào'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}

