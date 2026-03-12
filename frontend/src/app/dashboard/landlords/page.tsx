'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserCog, Search, Eye, Phone, Mail, Building2 } from 'lucide-react';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { useBuildings } from '@/hooks/api/useBuildings';
import { useQuery } from '@tanstack/react-query';
import { apiClient, extractData } from '@/lib/apiClient';
import type { User } from '@/types';
import type { ApiResponse } from '@/lib/apiClient';

// Hook to fetch landlords
function useLandlords() {
  return useQuery({
    queryKey: ['landlords'],
    queryFn: async () => {
      // Fetch all buildings and extract unique landlords
      const buildingsResponse = await apiClient.get<ApiResponse<unknown>>('/buildings', {
        params: { page: 1, limit: 1000 },
      });
      const buildings = extractData(buildingsResponse);
      const buildingsData = Array.isArray(buildings)
        ? buildings
        : buildings && typeof buildings === 'object' && 'data' in buildings
          ? ((buildings as { data: unknown[] }).data ?? [])
          : [];
      
      // Extract unique landlords from buildings
      const landlordsMap = new Map<string, any>();
      buildingsData.forEach((building: any) => {
        if (building.landlord && !landlordsMap.has(building.landlord.id)) {
          landlordsMap.set(building.landlord.id, {
            ...building.landlord,
            buildingCount: 0,
            roomCount: 0,
          });
        }
        if (building.landlord) {
          const landlord = landlordsMap.get(building.landlord.id);
          if (landlord) {
            landlord.buildingCount = (landlord.buildingCount || 0) + 1;
            landlord.roomCount = (landlord.roomCount || 0) + (building._count?.rooms || 0);
          }
        }
      });
      
      return Array.from(landlordsMap.values());
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export default function LandlordsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const { data: landlords, isLoading } = useLandlords();

  const canView = user?.role === UserRole.ADMIN;

  if (!canView) {
    return (
      
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Bạn không có quyền truy cập trang này</p>
          </CardContent>
        </Card>
      
    );
  }

  const filteredLandlords = (landlords || []).filter((landlord: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const user = landlord.user || {};
    const profile = user.profile || {};
    return (
      profile.firstName?.toLowerCase().includes(searchLower) ||
      profile.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      profile.phone?.includes(search)
    );
  });

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý chủ nhà</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý thông tin các chủ nhà trong hệ thống
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm chủ nhà..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Landlords List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách chủ nhà</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Đang tải...</p>
              </div>
            ) : filteredLandlords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Chủ nhà
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Số điện thoại
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Số tòa nhà
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Số phòng
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLandlords.map((landlord: any) => {
                      const user = landlord.user || {};
                      const profile = user.profile || {};
                      return (
                        <tr key={landlord.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserCog className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {profile.firstName && profile.lastName
                                    ? `${profile.firstName} ${profile.lastName}`
                                    : user.email || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{user.email || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{profile.phone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span>{landlord.buildingCount || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {landlord.roomCount || 0}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/dashboard/buildings?landlordId=${landlord.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <UserCog className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  {search ? 'Không tìm thấy chủ nhà' : 'Chưa có chủ nhà nào'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}

