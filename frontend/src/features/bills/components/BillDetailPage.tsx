'use client';

import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DoorOpen,
  Download,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  NoDataEmptyState,
  Separator,
  SkeletonPage,
} from '@/components/ui';
import {
  type Bill,
  BillStatus,
  type PaymentMethod,
  UserRole,
} from '@/generated/model';
import { useBill, useConfirmBillPayment } from '@/hooks/api/useBills';
import { useAuthStore } from '@/stores/authStore';
import {
  BILL_STATUS_MAP,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_MAP,
} from '@/types';
import { formatBillingPeriod, formatCurrency, toDateOnlyString } from '@/utils';

type BillDetailPageProps = {
  id: string;
  initialBill: Bill;
};

type FeeRow = {
  label: string;
  value: number;
  usage?: string;
};

function buildFeeRows(bill: Bill): FeeRow[] {
  const rows: FeeRow[] = [
    { label: 'Tiền phòng', value: Number(bill.monthlyRent) },
    {
      label: 'Tiền điện',
      value: Number(bill.electricityAmount),
      usage: bill.electricityUsage ? `${bill.electricityUsage} kWh` : undefined,
    },
    {
      label: 'Tiền nước',
      value: Number(bill.waterAmount),
      usage: bill.waterUsage ? `${bill.waterUsage} m³` : undefined,
    },
    {
      label: 'Tiền gas',
      value: Number(bill.gasAmount),
      usage: bill.gasUsage ? `${bill.gasUsage} kg` : undefined,
    },
    { label: 'Phí quản lý', value: Number(bill.managementFee) },
    { label: 'Phí vệ sinh', value: Number(bill.cleaningFee) },
    { label: 'Phí chiếu sáng', value: Number(bill.lightingFee) },
  ];

  if (Number(bill.previousDebt) > 0) {
    rows.push({ label: 'Nợ cũ', value: Number(bill.previousDebt) });
  }

  return rows;
}

export function BillDetailPage({ id, initialBill }: BillDetailPageProps) {
  const user = useAuthStore((state) => state.user);
  const { data: bill, isLoading } = useBill(id, { initialData: initialBill });
  const { mutate: confirmPayment, isPending: isConfirming } =
    useConfirmBillPayment();

  if (isLoading) return <SkeletonPage />;
  if (!bill) {
    return (
      <NoDataEmptyState
        title="Không tìm thấy hóa đơn"
        subTitle="Hóa đơn không tồn tại hoặc bạn không có quyền truy cập."
      />
    );
  }

  const status = BILL_STATUS_MAP[bill.status];
  const payment = bill.payment;
  const confirmation = payment?.confirmation;
  const canConfirm =
    bill.status === BillStatus.PENDING &&
    !!payment &&
    user?.role === UserRole.TENANT;

  const feeRows = buildFeeRows(bill);

  const handleConfirm = () => {
    confirmPayment(
      { id: bill.id, data: { tenantConfirmed: true } },
      {
        onSuccess: () =>
          toast.success('Đã xác nhận thanh toán hóa đơn', {
            position: 'top-center',
          }),
      },
    );
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/60 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/bills">Hóa đơn</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="size-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  #{bill.id.slice(0, 8).toUpperCase()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Hóa đơn phòng {bill.room?.number ?? 'N/A'}
            </h1>
            <Badge variant={status.badgeVariant}>{status.label}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Kỳ {formatBillingPeriod(bill.billingPeriod)} • Tạo ngày{' '}
            {toDateOnlyString(new Date(bill.createdAt))}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="size-4" />
            In / lưu PDF
          </Button>
          {canConfirm && (
            <Button onClick={handleConfirm} disabled={isConfirming}>
              <CheckCircle2 className="size-4" />
              Xác nhận thanh toán
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết chi phí</CardTitle>
              <CardDescription>
                Các khoản cấu thành nên hóa đơn kỳ{' '}
                {formatBillingPeriod(bill.billingPeriod)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {feeRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <span className="text-slate-700">{row.label}</span>
                    {row.usage && (
                      <span className="ml-2 text-xs text-slate-400">
                        {row.usage}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(row.value)}
                  </span>
                </div>
              ))}

              <Separator className="my-2" />

              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-slate-900">Tổng cộng</span>
                <span className="font-bold text-indigo-600">
                  {formatCurrency(bill.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin phòng</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <DoorOpen className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phòng</p>
                  <p className="text-sm font-medium text-slate-900">
                    {bill.room?.number ?? '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Tòa nhà</p>
                  <p className="text-sm font-medium text-slate-900">
                    {bill.room?.building?.name ?? '—'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Diện tích</p>
                <p className="text-sm font-medium text-slate-900">
                  {bill.room?.area ? `${bill.room.area} m²` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Loại phòng</p>
                <p className="text-sm font-medium text-slate-900">
                  {bill.room?.roomType === 'FULL_RIGHTS'
                    ? 'Toàn quyền'
                    : 'Bán quyền'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-indigo-50 p-4">
                <p className="text-sm text-slate-600">Số tiền cần trả</p>
                <p className="mt-1 text-2xl font-bold text-indigo-600">
                  {formatCurrency(bill.totalAmount)}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Kỳ thanh toán</span>
                <span className="font-medium text-slate-900">
                  {formatBillingPeriod(bill.billingPeriod)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Hạn thanh toán</span>
                <span className="font-medium text-slate-900">
                  {toDateOnlyString(new Date(bill.dueDate))}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Trạng thái</span>
                    <Badge
                      variant={PAYMENT_STATUS_MAP[payment.status].badgeVariant}
                    >
                      {PAYMENT_STATUS_MAP[payment.status].title}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Phương thức</span>
                    <span className="font-medium text-slate-900">
                      {
                        PAYMENT_METHOD_LABELS[
                          payment.paymentMethod as PaymentMethod
                        ]
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Ngày thanh toán</span>
                    <span className="font-medium text-slate-900">
                      {toDateOnlyString(new Date(payment.paymentDate))}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        Người thuê xác nhận
                      </span>
                      <Badge
                        variant={
                          confirmation?.tenantConfirmed
                            ? 'successLight'
                            : 'pending'
                        }
                      >
                        {confirmation?.tenantConfirmed
                          ? 'Đã xác nhận'
                          : 'Chưa xác nhận'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Chủ nhà xác nhận</span>
                      <Badge
                        variant={
                          confirmation?.landlordConfirmed
                            ? 'successLight'
                            : 'pending'
                        }
                      >
                        {confirmation?.landlordConfirmed
                          ? 'Đã xác nhận'
                          : 'Chưa xác nhận'}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CreditCard className="size-8 text-slate-300" />
                  <p className="text-sm text-slate-500">
                    Chưa có thông tin thanh toán cho hóa đơn này.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mã hóa đơn</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Receipt className="size-4 text-slate-400" />
              <span className="font-mono text-sm text-slate-700">
                #{bill.id.slice(0, 8).toUpperCase()}
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
