'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@/hooks/api/use-auth';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'TENANT' as 'ADMIN' | 'LANDLORD' | 'TENANT',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    registerMutation.mutate(
      {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      },
      {
        onSuccess: () => {
          router.push('/login?registered=true');
        },
        onError: (err: any) => {
          setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Đăng ký</h2>
          <p className="mt-2 text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Đăng nhập
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tạo tài khoản mới</CardTitle>
            <CardDescription>
              Điền thông tin để tạo tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Họ"
                  placeholder="Nguyễn"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
                <Input
                  label="Tên"
                  placeholder="Văn A"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0901234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Loại tài khoản
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                >
                  <option value="TENANT">Người thuê</option>
                  <option value="LANDLORD">Chủ nhà</option>
                </select>
              </div>

              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={registerMutation.isPending}
              >
                Đăng ký
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

