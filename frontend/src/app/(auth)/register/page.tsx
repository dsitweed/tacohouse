'use client';

import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/hooks/api/useAuth';

const FEATURES = [
  'Quản lý phòng trọ & hợp đồng thuê trực tuyến',
  'Hóa đơn, thanh toán minh bạch, tự động nhắc hạn',
  'Kết nối chủ nhà - người thuê tức thời qua chat',
];

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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục');
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
      },
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left: Branding panel */}
      <div className="relative hidden w-[55%] shrink-0 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 lg:flex">
        <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative flex w-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="size-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TacoHouse</span>
          </div>

          <div className="flex max-w-xl flex-col gap-6">
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-white">
              Quản lý nhà trọ thông minh, dễ dàng hơn.
            </h1>
            <p className="text-base text-white/80">
              Tạo tài khoản để bắt đầu quản lý phòng trọ, hợp đồng và thanh toán
              chỉ trong vài phút.
            </p>

            <ul className="flex flex-col gap-3 pt-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-indigo-400" />
                  <span className="text-sm text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-8 pt-6">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Phòng đang quản lý
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Hỗ trợ trực tuyến
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} TacoHouse. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: Register form */}
      <div className="flex w-full flex-1 items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col gap-2 lg:hidden">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="size-6 text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Tạo tài khoản mới
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Đăng nhập
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Họ</label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="h-11 rounded-xl pl-9"
                    placeholder="Nguyễn"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Tên</label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="h-11 rounded-xl pl-9"
                    placeholder="Văn A"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="h-11 rounded-xl pl-9"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="h-11 rounded-xl pl-9"
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Loại tài khoản
              </label>
              <div className="relative">
                <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <select
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-xl border bg-transparent pl-9 text-sm shadow-xs outline-none focus-visible:ring-3"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                >
                  <option value="TENANT">Người thuê</option>
                  <option value="LANDLORD">Chủ nhà</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="h-11 rounded-xl pr-9 pl-9"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="h-11 rounded-xl pr-9 pl-9"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                Tôi đồng ý với{' '}
                <span className="font-medium text-indigo-600 underline">
                  Điều khoản dịch vụ
                </span>{' '}
                và{' '}
                <span className="font-medium text-indigo-600 underline">
                  Chính sách bảo mật
                </span>
              </span>
            </label>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Đăng ký
            </Button>
          </form>

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
    </div>
  );
}
