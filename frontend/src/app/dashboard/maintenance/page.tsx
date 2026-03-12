'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMaintenanceRequests } from '@/hooks/api/useMaintenance';
import { Wrench, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { MaintenanceStatus, PriorityType, UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

const statusColors: Record<MaintenanceStatus, 'default' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const statusLabels: Record<MaintenanceStatus, string> = {
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const priorityColors: Record<PriorityType, 'default' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
  URGENT: 'error',
};

const priorityLabels: Record<PriorityType, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
};

export default function MaintenancePage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMaintenanceRequests({
    page: 1,
    limit: 20,
  });

  const canCreate = user?.role === UserRole.TENANT;

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yêu cầu sửa chữa</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý các yêu cầu bảo trì và sửa chữa
            </p>
          </div>
          {canCreate && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Gửi yêu cầu
            </Button>
          )}
        </div>

        {/* Maintenance Requests */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Đang tải...
            </CardContent>
          </Card>
        ) : data?.data && data.data.length > 0 ? (
          <div className="space-y-4">
            {data.data.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <p className="mt-1 text-sm text-gray-600">
                        {request.room?.number} - {request.room?.building?.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={statusColors[request.status]}>
                        {statusLabels[request.status]}
                      </Badge>
                      <Badge variant={priorityColors[request.priority]}>
                        {priorityLabels[request.priority]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{request.description}</p>
                  
                  {request.images && request.images.length > 0 && (
                    <div className="mt-4 flex space-x-2">
                      {request.images.map((image, idx) => (
                        <div
                          key={idx}
                          className="h-20 w-20 rounded-lg bg-gray-200 bg-cover bg-center"
                          style={{ backgroundImage: `url(${image})` }}
                        />
                      ))}
                    </div>
                  )}

                  {request.completionNote && (
                    <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                      <p className="text-sm font-medium text-emerald-900">
                        Phản hồi từ chủ nhà:
                      </p>
                      <p className="mt-1 text-sm text-emerald-700">
                        {request.completionNote}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="text-xs text-gray-500">
                      Ngày tạo: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    {(user?.role === UserRole.LANDLORD ||
                      user?.role === UserRole.ADMIN) &&
                      request.status === MaintenanceStatus.PENDING && (
                        <Button size="sm">Xử lý</Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">Chưa có yêu cầu nào</p>
              {canCreate && (
                <Button className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Gửi yêu cầu đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    
  );
}

