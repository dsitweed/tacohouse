'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useLogin } from '@/hooks/api/useAuth';

const loginFormSchema = z.object({
  email: z.email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  remember: z.boolean(),
});

const AVATARS = [
  '/images/login-avatar-1.jpg',
  '/images/login-avatar-2.jpg',
  '/images/login-avatar-3.jpg',
];

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: z.infer<typeof loginFormSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left: Hero image */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex">
        <Image
          src="/images/login-hero-1.png"
          alt="login hero image"
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/20 to-[#0b1c30]/70"></div>

        <div className="relative flex w-full flex-col justify-between p-12">
          {/* TODO: create logo component for web */}
          <div className="flex items-center gap-3 text-white">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="size-5" />
            </div>
            <span className="text-2xl font-bold">TacoHouse</span>
          </div>

          <div className="flex max-w-xl flex-col gap-6">
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-white">
              Quản lý nhà trọ thông minh hơn <br />
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
              <AvatarGroup>
                {AVATARS.map((src, index) => (
                  <Avatar key={`avatars-${index}`}>
                    <AvatarImage src={src} />
                    <AvatarFallback>IMG</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
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
      <div className="flex h-full flex-1 flex-col items-center justify-center-safe overflow-y-auto bg-white px-6 py-12">
        <Card className="w-full max-w-md shrink-0 ring-0">
          <CardHeader>
            <CardTitle>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Chào mừng trở lại
              </h2>
            </CardTitle>
            <CardDescription>
              <p className="text-sm font-medium text-gray-600">
                Đăng nhập để quản lý tài sản và khách thuê của bạn.
              </p>
            </CardDescription>

            <div className="mt-8 flex gap-4">
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
                Facebook
              </button>
            </div>

            <div className="mt-6 flex items-center">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="px-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Hoặc dùng email
              </span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Mail className="size-4 text-gray-400" />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          id="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="email@example.com"
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Lock className="size-4 text-gray-400" />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          aria-invalid={fieldState.invalid}
                          placeholder="••••••••"
                        />
                        <InputGroupButton
                          variant="ghost"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="h-full text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </InputGroupButton>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="remember"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <FieldSet
                        data-invalid={fieldState.invalid}
                        className="flex"
                      >
                        <FieldGroup
                          data-slot="checkbox-group"
                          className="flex-row items-center justify-between"
                        >
                          <Field orientation="horizontal" className="w-auto">
                            <Checkbox
                              id="remember"
                              name={field.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FieldLabel
                              htmlFor="remember"
                              className="text-sm font-normal text-gray-700"
                            >
                              Ghi nhớ đăng nhập
                            </FieldLabel>
                          </Field>
                          <button
                            type="button"
                            disabled
                            title="Tính năng sắp ra mắt"
                            className="cursor-not-allowed text-sm font-medium text-indigo-600 opacity-60"
                          >
                            Quên mật khẩu?
                          </button>
                        </FieldGroup>
                      </FieldSet>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </div>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="gap-4">
            <Field orientation="vertical">
              <Button
                type="submit"
                form="login-form"
                className="h-12 rounded-xl bg-indigo-600 text-base font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
              >
                Đăng nhập
              </Button>
              <div className="text-center">
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
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
