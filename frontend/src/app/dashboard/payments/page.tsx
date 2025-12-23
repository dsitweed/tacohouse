'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePayments } from '@/hooks/api/use-payments';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PaymentStatus } from '@tacohouse/shared';

const statusColors: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
  REFUNDED: 'default',
};

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Chờ xử lý',
  COMPLETED: 'Thành công',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

const statusIcons: Record<PaymentStatus, typeof CheckCircle> = {
  PENDING: Clock,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  REFUNDED: XCircle,
};

export default function PaymentsPage() {
  const { data, isLoading } = usePayments({
    page: 1,
    limit: 20,
  });

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
          <p className="mt-1 text-sm text-gray-600">
            Theo dõi các giao dịch thanh toán
          </p>
        </div>

        {/* Payments List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Đang tải...
            </CardContent>
          </Card>
        ) : data?.data && data.data.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Mã giao dịch
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Hóa đơn
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Số tiền
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Phương thức
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Ngày thanh toán
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.data.map((payment) => {
                      const StatusIcon = statusIcons[payment.status];
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-5 w-5 text-gray-400" />
                              <span className="font-mono text-sm text-gray-900">
                                {payment.transactionId || payment.id.slice(0, 8)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            #{payment.bill?.billNumber || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.paymentMethod === 'CASH' && 'Tiền mặt'}
                            {payment.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản'}
                            {payment.paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                            {payment.paymentMethod === 'CREDIT_CARD' && 'Thẻ tín dụng'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.paymentDate
                              ? new Date(payment.paymentDate).toLocaleDateString('vi-VN')
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusColors[payment.status]}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusLabels[payment.status]}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">Chưa có giao dịch nào</p>
            </CardContent>
          </Card>
        )}
      </div>
    
  );
}

