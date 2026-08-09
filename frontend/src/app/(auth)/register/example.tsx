'use client';

import {
  ArrowRight,
  Building2,
  ChevronRight,
  Loader2,
  Phone,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/hooks/api/useAuth';
import { cn } from '@/utils';

const ROLES = [
  { value: 'LANDLORD', label: 'Chủ nhà / Quản lý', icon: Building2 },
  { value: 'TENANT', label: 'Người thuê', icon: User },
] as const;

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
    dateOfBirth: '',
    occupation: '',
    workplace: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
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
        dateOfBirth: formData.dateOfBirth,
        occupation: formData.occupation,
        workplace: formData.workplace,
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left: Hero image */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <Image
          src="/images/register-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c30]/70 to-[#0b1c30]/0" />
        <div className="absolute bottom-12 left-12 flex max-w-xl flex-col gap-4">
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-white">
            Quản lý nhà trọ chuyên nghiệp
            <br />
            với sự hỗ trợ thông minh.
          </h1>
          <p className="text-base text-white/90">
            Tham gia cùng hàng nghìn chủ nhà và người quản lý đang tối ưu vận
            hành với nền tảng TacoHouse.
          </p>
        </div>
      </div>

      {/* Right: Register form */}
      <div className="flex h-full flex-1 flex-col overflow-y-auto bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="size-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              TacoHouse
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Đăng nhập
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-lg">
            <div className="mb-8 flex flex-col gap-2">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                Tạo tài khoản
              </h2>
              <p className="text-sm text-gray-600">
                Điền thông tin để đăng ký không gian quản lý nhà trọ của bạn.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  Loại tài khoản
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {ROLES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: value })}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
                        formData.role === value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 bg-white hover:bg-gray-50',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-5',
                          formData.role === value
                            ? 'text-indigo-600'
                            : 'text-gray-500',
                        )}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Họ *
                  </label>
                  <Input
                    className="h-11 rounded-lg"
                    placeholder="Nguyễn"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Tên *
                  </label>
                  <Input
                    className="h-11 rounded-lg"
                    placeholder="Văn A"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  Email *
                </label>
                <Input
                  className="h-11 rounded-lg"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="h-11 rounded-lg pl-9"
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Mật khẩu *
                  </label>
                  <Input
                    className="h-11 rounded-lg"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Xác nhận mật khẩu *
                  </label>
                  <Input
                    className="h-11 rounded-lg"
                    type="password"
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
                </div>
              </div>

              <div className="flex items-center py-1">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="px-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Thông tin bổ sung
                </span>
                <div className="h-px flex-1 bg-gray-300" />
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-gray-300 bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                      Ngày sinh *
                    </label>
                    <Input
                      className="h-10 rounded-lg bg-white"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                      Nghề nghiệp *
                    </label>
                    <Input
                      className="h-10 rounded-lg bg-white"
                      placeholder="VD: Kỹ sư phần mềm"
                      value={formData.occupation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          occupation: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Nơi làm việc *
                  </label>
                  <Input
                    className="h-10 rounded-lg bg-white"
                    placeholder="VD: Công ty TNHH ABC"
                    value={formData.workplace}
                    onChange={(e) =>
                      setFormData({ ...formData, workplace: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-1">
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    Tôi đồng ý với{' '}
                    <span className="text-indigo-600">Điều khoản dịch vụ</span>{' '}
                    và{' '}
                    <span className="text-indigo-600">Chính sách bảo mật</span>.
                  </span>
                </label>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-medium shadow-sm hover:bg-indigo-700"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Tạo tài khoản
                      <ArrowRight className="size-3" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
