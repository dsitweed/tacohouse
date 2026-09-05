'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Building2,
  CalendarIcon,
  ChevronRight,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
  Input,
  InputGroup,
  InputGroupButton,
  InputGroupInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Spinner,
} from '@/components/ui';
import { RegisterAuthDto, UserRole } from '@/generated/model';
import { useRegister } from '@/hooks/api/useAuth';
import { cn } from '@/utils';
import { toApiDateString } from '@/utils';

const registerFormSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.')
      .max(50, 'Mật khẩu không được vượt quá 50 ký tự.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một chữ số.',
      ),
    confirmPassword: z.string().trim().min(1, 'Xác nhận mật khẩu là bắt buộc.'),
    firstName: z.string().trim().min(1, 'Tên là bắt buộc.'),
    lastName: z.string().trim().min(1, 'Họ là bắt buộc.'),
    phone: z.string().trim().min(1, 'Số điện thoại là bắt buộc.'),
    role: z.enum(UserRole),
    dateOfBirth: z.date(),
    occupation: z.string().trim().min(1, 'Nghề nghiệp là bắt buộc.'),
    workplace: z.string().trim().min(1, 'Nơi làm việc là bắt buộc.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

const ROLES = [
  { value: UserRole.LANDLORD, label: 'Chủ nhà / Quản lý', icon: Building2 },
  { value: UserRole.TENANT, label: 'Người thuê', icon: User },
] as const;

// FIXME: Logged in user is not redirected to dashboard page, but stays on register page
export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: UserRole.TENANT,
      occupation: '',
      workplace: '',
    },
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);

  const onSubmit = (data: z.infer<typeof registerFormSchema>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = data;
    const registerAuthDto = {
      ...rest,
      dateOfBirth: toApiDateString(rest.dateOfBirth),
    } as RegisterAuthDto;

    registerMutation.mutate(registerAuthDto, {
      onSuccess: () => {
        router.push('/login?registered=true');
      },
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left: Hero image */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <Image
          src="/images/register-hero-1.png"
          alt="register hero image"
          fill
          sizes="50vw"
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
          {/* TODO: create logo component for web */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
              <Building2 className="size-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              TacoHouse
            </span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Đăng nhập
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center-safe px-6 py-10">
          <Card className="w-full max-w-lg ring-0">
            <CardHeader>
              <CardTitle>
                <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                  Tạo tài khoản
                </h2>
              </CardTitle>
              <CardDescription>
                <p className="text-sm font-medium text-gray-600">
                  Điền thông tin để đăng ký không gian quản lý nhà trọ của bạn.
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="role"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <FieldSet>
                        <RadioGroup
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2"
                        >
                          {ROLES.map(({ value, label, icon: Icon }) => (
                            <FieldLabel
                              key={value}
                              htmlFor={`register-form-radiogroup-${value}`}
                              className="hover:bg-gray-50 has-data-checked:border-indigo-600 has-data-checked:bg-indigo-50"
                            >
                              <Field
                                orientation="horizontal"
                                data-invalid={fieldState.invalid}
                              >
                                <FieldContent className="flex flex-col items-center gap-2">
                                  <Icon
                                    className={cn(
                                      'size-5',
                                      field.value === value
                                        ? 'text-indigo-600'
                                        : 'text-gray-500',
                                    )}
                                  />
                                  <FieldTitle className="text-sm font-medium text-gray-900">
                                    {label}
                                  </FieldTitle>
                                </FieldContent>
                                <RadioGroupItem
                                  hidden
                                  value={value}
                                  aria-invalid={fieldState.invalid}
                                  id={`register-form-radiogroup-${value}`}
                                />
                              </Field>
                            </FieldLabel>
                          ))}
                        </RadioGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldSet>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="lastName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="lastName">Họ *</FieldLabel>
                          <Input
                            {...field}
                            id="lastName"
                            aria-invalid={fieldState.invalid}
                            placeholder="Nguyễn"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="firstName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="firstName">Tên *</FieldLabel>
                          <Input
                            {...field}
                            id="firstName"
                            aria-invalid={fieldState.invalid}
                            placeholder="Văn A"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">Email *</FieldLabel>
                        <Input
                          {...field}
                          id="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="email@example.com"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="phone">Số điện thoại *</FieldLabel>
                        <Input
                          {...field}
                          id="phone"
                          aria-invalid={fieldState.invalid}
                          placeholder="0901234567"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      name="password"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="password">Mật khẩu *</FieldLabel>
                          <InputGroup>
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
                      name="confirmPassword"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="confirmPassword">
                            Xác nhận mật khẩu *
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              {...field}
                              id="confirmPassword"
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
                  </div>

                  <div className="flex items-center py-1">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="px-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Thông tin bổ sung
                    </span>
                    <div className="h-px flex-1 bg-gray-300" />
                  </div>

                  <div className="flex flex-col gap-7 rounded-xl border border-gray-300 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Controller
                        name="dateOfBirth"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="dateOfBirth">
                              Ngày sinh *
                            </FieldLabel>
                            <Popover
                              open={popoverIsOpen}
                              onOpenChange={setPopoverIsOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  id="dateOfBirth"
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start font-normal"
                                >
                                  <CalendarIcon />
                                  {field.value ? (
                                    field.value.toLocaleDateString()
                                  ) : (
                                    <span className="text-gray-500">
                                      {'dd/mm/yyyy'}
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  defaultMonth={field.value}
                                  captionLayout="dropdown"
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setPopoverIsOpen(false);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name="occupation"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="occupation">
                              Nghề nghiệp *
                            </FieldLabel>
                            <Input
                              {...field}
                              id="occupation"
                              aria-invalid={fieldState.invalid}
                              placeholder="VD: Kỹ sư phần mềm"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      name="workplace"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="workplace">
                            Nơi làm việc *
                          </FieldLabel>
                          <Input
                            {...field}
                            id="workplace"
                            aria-invalid={fieldState.invalid}
                            placeholder="VD: Công ty TNHH ABC"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <Field orientation="horizontal" className="relative">
                    <Checkbox
                      id="agreeTerms"
                      checked={agreeTerms}
                      onCheckedChange={() => setAgreeTerms((prev) => !prev)}
                    />
                    <FieldLabel htmlFor="agreeTerms" className="text-gray-700">
                      <span>
                        Tôi đồng ý với{' '}
                        <span className="text-indigo-600">
                          Điều khoản dịch vụ
                        </span>{' '}
                        và{' '}
                        <span className="text-indigo-600">
                          Chính sách bảo mật
                        </span>
                        .
                      </span>
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="register-form"
                className="h-12 w-full bg-indigo-600 text-sm font-medium shadow-sm hover:bg-indigo-700"
                disabled={registerMutation.isPending || !agreeTerms}
              >
                {registerMutation.isPending ? (
                  <Spinner />
                ) : (
                  <>
                    Tạo tài khoản
                    <ArrowRight className="size-3" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
