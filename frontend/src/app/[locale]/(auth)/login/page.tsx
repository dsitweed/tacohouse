'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIntlayer } from 'next-intlayer';
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

const AVATARS = [
  '/images/login-avatar-1.jpg',
  '/images/login-avatar-2.jpg',
  '/images/login-avatar-3.jpg',
];

// FIXME: Logged in user is not redirected to dashboard page, but stays on login page
export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const content = useIntlayer('loginPage');

  const loginFormSchema = z.object({
    email: z.email(String(content.validation.emailInvalid)),
    password: z.string().min(6, String(content.validation.passwordMin)),
    remember: z.boolean(),
  });

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
              {content.hero.title}
            </h1>
            <p className="text-base text-white/80">
              {content.hero.description}
            </p>

            <div className="flex gap-8 pt-6">
              <div>
                <p className="text-2xl font-bold text-white">
                  {content.hero.retentionValue}
                </p>
                <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                  {content.hero.retentionLabel}
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {content.hero.responseValue}
                </p>
                <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                  {content.hero.responseLabel}
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
              {content.hero.quote}
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
                {content.title}
              </h2>
            </CardTitle>
            <CardDescription>
              <p className="text-sm font-medium text-gray-600">
                {content.subtitle}
              </p>
            </CardDescription>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                disabled
                title={String(content.comingSoon)}
                className="flex h-11 flex-1 cursor-not-allowed items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-900 opacity-60"
              >
                {content.googleButton}
              </button>
              <button
                type="button"
                disabled
                title={String(content.comingSoon)}
                className="flex h-11 flex-1 cursor-not-allowed items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-900 opacity-60"
              >
                {content.facebookButton}
              </button>
            </div>

            <div className="mt-6 flex items-center">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="px-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {content.divider}
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
                      <FieldLabel htmlFor="email">
                        {content.emailLabel}
                      </FieldLabel>
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
                      <FieldLabel htmlFor="password">
                        {content.passwordLabel}
                      </FieldLabel>
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
                              {content.rememberMe}
                            </FieldLabel>
                          </Field>
                          <button
                            type="button"
                            disabled
                            title={String(content.comingSoon)}
                            className="cursor-not-allowed text-sm font-medium text-indigo-600 opacity-60"
                          >
                            {content.forgotPassword}
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
                {content.submitButton}
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {content.noAccount}
                  <Link
                    href="/register"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {content.createAccount}
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
