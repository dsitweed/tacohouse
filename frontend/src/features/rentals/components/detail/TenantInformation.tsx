import { Mail, Phone, UserRound } from 'lucide-react';
import Link from 'next/link';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui';

type TenantInformationProps = {
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
};

export function TenantInformation({
  tenantId,
  name,
  email,
  phone,
  avatar,
}: TenantInformationProps) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <UserRound className="size-5 text-blue-600" />
          Thông tin người thuê
        </h2>
        <Link
          href={`/dashboard/tenants/${tenantId}`}
          className="text-xs font-semibold text-blue-700 hover:underline"
        >
          Xem hồ sơ
        </Link>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 rounded-xl">
              <AvatarImage src={avatar ?? ''} alt={name} />
              <AvatarFallback className="rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
                {name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-500">Người thuê chính</p>
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 text-slate-400" />
                  {email ?? 'Chưa cập nhật email'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400" />
                  {phone ?? 'Chưa cập nhật số điện thoại'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Liên hệ khẩn cấp
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Chưa cập nhật
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Thông tin liên hệ khẩn cấp chưa được cung cấp.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
