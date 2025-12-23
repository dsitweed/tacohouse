'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layouts';
import { useBills } from '@/hooks/api/use-bills';
import { formatCurrency } from '@/lib/utils';
import { Receipt, Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { BillStatus, UserRole } from '@tacohouse/shared';
import { useAuthStore } from '@/stores/auth-store';

const statusColors: Record<BillStatus, 'default' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'error',
  CANCELLED: 'default',
  LANDLORD_CONFIRMED: 'success',
};

const statusLabels: Record<BillStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
  CANCELLED: 'Đã hủy',
  LANDLORD_CONFIRMED: 'Đã xác nhận',
};

export default function BillsPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useBills({
    page: 1,
    limit: 20,
  });

  const canCreate = user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hóa đơn</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý hóa đơn và thanh toán
            </p>
          </div>
          {canCreate && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo hóa đơn
            </Button>
          )}
        </div>

        {/* Bills List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Đang tải...
            </CardContent>
          </Card>
        ) : data?.data && data.data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((bill) => (
              <Card key={bill.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Hóa đơn #{bill.billNumber}</CardTitle>
                    <Badge variant={statusColors[bill.status]}>
                      {statusLabels[bill.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {bill.room?.roomNumber} - {bill.room?.building?.name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Total Amount */}
                  <div className="rounded-lg bg-indigo-50 p-4">
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(bill.totalAmount)}
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền phòng:</span>
                      <span className="font-medium">{formatCurrency(bill.roomRent)}</span>
                    </div>
                    {bill.electricityAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Điện:</span>
                        <span className="font-medium">
                          {formatCurrency(bill.electricityAmount)}
                        </span>
                      </div>
                    )}
                    {bill.waterAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nước:</span>
                        <span className="font-medium">
                          {formatCurrency(bill.waterAmount)}
                        </span>
                      </div>
                    )}
                    {bill.otherFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí khác:</span>
                        <span className="font-medium">
                          {formatCurrency(bill.otherFees)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hạn thanh toán:</span>
                      <span className="font-medium">
                        {new Date(bill.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Link href={`/dashboard/bills/${bill.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Chi tiết
                      </Button>
                    </Link>
                    {bill.status === BillStatus.PENDING &&
                      user?.role === UserRole.TENANT && (
                        <Button variant="primary" size="sm" className="flex-1">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Xác nhận
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">Chưa có hóa đơn nào</p>
              {canCreate && (
                <Button className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo hóa đơn đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

