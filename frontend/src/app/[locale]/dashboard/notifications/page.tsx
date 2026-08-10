'use client';

import { AlertCircle, Bell, CheckCircle, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { NotificationsListResult } from '@/hooks/api/useNotifications';
import { useNotifications } from '@/hooks/api/useNotifications';
import { NotificationType } from '@/types';

const typeIcons: Record<NotificationType, typeof Bell> = {
  BILL_GENERATED: Bell,
  PAYMENT_REMINDER: CheckCircle,
  MAINTENANCE_UPDATE: AlertCircle,
  CHAT_MESSAGE: Bell,
  ANNOUNCEMENT: Info,
  SYSTEM: Info,
};

const typeColors: Record<
  NotificationType,
  'default' | 'success' | 'warning' | 'error' | 'info'
> = {
  BILL_GENERATED: 'info',
  PAYMENT_REMINDER: 'warning',
  MAINTENANCE_UPDATE: 'warning',
  CHAT_MESSAGE: 'info',
  ANNOUNCEMENT: 'default',
  SYSTEM: 'default',
};

const typeLabels: Record<NotificationType, string> = {
  BILL_GENERATED: 'Hóa đơn mới',
  PAYMENT_REMINDER: 'Nhắc nhở thanh toán',
  MAINTENANCE_UPDATE: 'Cập nhật sửa chữa',
  CHAT_MESSAGE: 'Tin nhắn',
  ANNOUNCEMENT: 'Thông báo',
  SYSTEM: 'Hệ thống',
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications({
    page: 1,
    limit: 50,
  });

  const list = data as NotificationsListResult | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="mt-1 text-sm text-gray-600">
            Xem tất cả thông báo của bạn
          </p>
        </div>
        <Button variant="outline" size="sm">
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Đang tải...
          </CardContent>
        </Card>
      ) : list?.data && list.data.length > 0 ? (
        <div className="space-y-3">
          {list.data.map((notification) => {
            const Icon = typeIcons[notification.type];
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors ${
                  !notification.isRead ? 'border-indigo-200 bg-indigo-50' : ''
                } hover:bg-gray-50`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        !notification.isRead ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          !notification.isRead
                            ? 'text-indigo-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? 'text-gray-900'
                                  : 'text-gray-600'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <Badge variant="info" size="sm">
                                Mới
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString(
                              'vi-VN',
                            )}
                          </p>
                        </div>
                        <Badge
                          variant={typeColors[notification.type]}
                          size="sm"
                        >
                          {typeLabels[notification.type]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">Chưa có thông báo nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
