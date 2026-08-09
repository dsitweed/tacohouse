'use client';

import { Building2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/api/useAuth';

const AVATARS = [
  '/images/login-avatar-1.jpg',
  '/images/login-avatar-2.jpg',
  '/images/login-avatar-3.jpg',
];

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    loginMutation.mutate(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (err: any) => {
          setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        },
      },
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left: Hero image */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex">
        <Image
          src="/images/login-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/20 to-[#0b1c30]/70" />

        <div className="relative flex w-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="size-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TacoHouse</span>
          </div>

          <div className="flex max-w-xl flex-col gap-6">
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-white">
              Quản lý nhà trọ thông minh hơn
              <br />
              với dữ liệu chuyên sâu.
            </h1>
            <p className="text-base text-white/80">
              Hơn 2.000 chủ nhà và quản lý chuyên nghiệp đang dùng nền tảng
              TacoHouse để tối ưu tỷ lệ lấp đầy, tự động hóa bảo trì và gia tăng
              lợi nhuận.
            </p>

            <div className="flex gap-8 pt-6">
              <div>
                <p className="text-2xl font-bold text-white">98%</p>
                <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Tỷ lệ giữ chân khách thuê
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-white">15 phút</p>
                <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Thời gian phản hồi
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {AVATARS.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={40}
                  height={40}
                  className="-mr-3 rounded-full border-2 border-white object-cover"
                  style={{ zIndex: AVATARS.length - index }}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-white/70 italic">
              {
                '"Công cụ trực quan nhất trong bộ công cụ của tôi." — Chị Lan, Quản lý bất động sản'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex h-full flex-1 flex-col items-center justify-center overflow-y-auto bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Chào mừng trở lại
            </h2>
            <p className="text-sm text-gray-600">
              Đăng nhập để quản lý tài sản và khách thuê của bạn.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled
              title="Tính năng sắp ra mắt"
              className="flex h-11 flex-1 cursor-not-allowed items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-900 opacity-60"
            >
              Google
            </button>
            <button
              type="button"
              disabled
              title="Tính năng sắp ra mắt"
              className="flex h-11 flex-1 cursor-not-allowed items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-900 opacity-60"
            >
              Apple
            </button>
          </div>

          <div className="flex items-center py-6">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="px-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Hoặc dùng email
            </span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                disabled
                title="Tính năng sắp ra mắt"
                className="cursor-not-allowed text-sm font-medium text-indigo-600 opacity-60"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {'Chưa có tài khoản? '}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
