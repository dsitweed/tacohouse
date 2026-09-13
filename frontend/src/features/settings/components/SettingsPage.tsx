'use client';

import { Bell, Lock, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useChangePassword, useUpdateProfile } from '@/hooks/api/useAuth';
import { useAuthStore } from '@/stores/authStore';

export function SettingsPage() {
  const { user } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData, {
      onSuccess: () => {
        alert('Cập nhật thông tin thành công');
      },
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    changePasswordMutation.mutate(
      {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      },
      {
        onSuccess: () => {
          alert('Đổi mật khẩu thành công');
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quản lý thông tin tài khoản và cài đặt
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <CardTitle>Thông tin cá nhân</CardTitle>
          </div>
          <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-1 text-sm font-medium">
                <span>Họ</span>
                <Input
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                <span>Tên</span>
                <Input
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <label className="space-y-1 text-sm font-medium">
              <span>Email</span>
              <Input type="email" value={user?.email || ''} disabled />
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>Số điện thoại</span>
              <Input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </label>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-600" />
            <CardTitle>Đổi mật khẩu</CardTitle>
          </div>
          <CardDescription>Thay đổi mật khẩu của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              ['Mật khẩu hiện tại', 'currentPassword'],
              ['Mật khẩu mới', 'newPassword'],
              ['Xác nhận mật khẩu mới', 'confirmPassword'],
            ].map(([label, field]) => (
              <label key={field} className="space-y-1 text-sm font-medium">
                <span>{label}</span>
                <Input
                  type="password"
                  value={passwordData[field as keyof typeof passwordData]}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      [field]: e.target.value,
                    })
                  }
                  required
                />
              </label>
            ))}
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending
                ? 'Đang đổi...'
                : 'Đổi mật khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <CardTitle>Thông báo</CardTitle>
          </div>
          <CardDescription>Quản lý cài đặt thông báo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                defaultChecked
              />
              <span className="text-sm text-gray-700">
                Nhận thông báo về hóa đơn mới
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                defaultChecked
              />
              <span className="text-sm text-gray-700">
                Nhận thông báo về thanh toán
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                defaultChecked
              />
              <span className="text-sm text-gray-700">
                Nhận thông báo về yêu cầu sửa chữa
              </span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
