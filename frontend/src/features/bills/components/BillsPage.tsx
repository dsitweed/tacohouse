'use client';

import {
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileDown,
  Layers,
  MoreHorizontal,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Badge,
  BadgeVariantType,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  NoDataEmptyState,
  PaginationContainer,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SkeletonPage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Bill, BillStatus, UserRole } from '@/generated/model';
import {
  fetchAllBills,
  useBills,
  useCancelBill,
  useConfirmBillPayment,
} from '@/hooks/api/useBills';
import { usePagination } from '@/hooks/use-pagination';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils';

const statusColors: Record<BillStatus, BadgeVariantType> = {
  PENDING: 'pending',
  PAID: 'success',
  TENANT_CONFIRMED: 'secondary',
  OVERDUE: 'destructive',
  LANDLORD_CONFIRMED: 'success',
};

const statusLabels: Record<BillStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  TENANT_CONFIRMED: 'Người thuê đã xác nhận',
  OVERDUE: 'Quá hạn',
  LANDLORD_CONFIRMED: 'Đã xác nhận',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: BillStatus.PENDING, label: statusLabels.PENDING },
  { value: BillStatus.PAID, label: statusLabels.PAID },
  { value: BillStatus.TENANT_CONFIRMED, label: statusLabels.TENANT_CONFIRMED },
  {
    value: BillStatus.LANDLORD_CONFIRMED,
    label: statusLabels.LANDLORD_CONFIRMED,
  },
  { value: BillStatus.OVERDUE, label: statusLabels.OVERDUE },
] as const;

type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number]['value'];

function formatBillingPeriod(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `Tháng ${month}/${date.getFullYear()}`;
}

function escapeCsvCell(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportBillsToCsv(bills: Bill[]) {
  const headers = [
    'Mã hóa đơn',
    'Phòng',
    'Tòa nhà',
    'Kỳ thanh toán',
    'Tổng tiền',
    'Trạng thái',
  ];
  const rows = bills.map((bill) => [
    `#${bill.id.slice(0, 8).toUpperCase()}`,
    bill.room?.number ?? '',
    bill.room?.building?.name ?? '',
    formatBillingPeriod(bill.billingPeriod),
    bill.totalAmount,
    statusLabels[bill.status],
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(','))
    .join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hoa-don-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function exportBillsToPdf(bills: Bill[]) {
  const rows = bills
    .map(
      (bill) => `<tr>
        <td>#${escapeHtml(bill.id.slice(0, 8).toUpperCase())}</td>
        <td>${escapeHtml(bill.room?.number ?? '-')}</td>
        <td>${escapeHtml(bill.room?.building?.name ?? '-')}</td>
        <td>${escapeHtml(formatBillingPeriod(bill.billingPeriod))}</td>
        <td class="amount">${escapeHtml(formatCurrency(bill.totalAmount))}</td>
        <td>${escapeHtml(statusLabels[bill.status])}</td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Danh sách hóa đơn</title>
    <style>
      body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; padding: 24px; color: #0f172a; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      p { color: #64748b; font-size: 12px; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
      th { background: #f1f5f9; }
      td.amount { text-align: right; }
    </style>
  </head>
  <body>
    <h1>Danh sách hóa đơn</h1>
    <p>Xuất ngày ${new Date().toLocaleDateString('vi-VN')} • ${bills.length} hóa đơn</p>
    <table>
      <thead>
        <tr>
          <th>Mã hóa đơn</th>
          <th>Phòng</th>
          <th>Tòa nhà</th>
          <th>Kỳ thanh toán</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=1024,height=768');
  if (!printWindow) {
    toast.error('Không thể mở cửa sổ in. Vui lòng cho phép popup.');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function BillsPage() {
  const user = useAuthStore((state) => state.user);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [monthFilter, setMonthFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkPending, setIsBulkPending] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, '0')}`;

  const { page, setPage, limit } = usePagination(
    `${statusFilter}|${monthFilter}`,
  );

  const { data: billsData, isLoading } = useBills({
    page,
    limit,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    billingPeriod: monthFilter || undefined,
  });

  const bills = useMemo(() => billsData?.data ?? [], [billsData]);
  const pagination = billsData?.pagination;

  const canCreate =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;
  const canDelete =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LANDLORD;

  const pageTotal = useMemo(
    () =>
      bills.reduce((total, bill) => total + Number(bill.totalAmount || 0), 0),
    [bills],
  );

  const selectedBills = useMemo(
    () => bills.filter((bill) => selectedIds.has(bill.id)),
    [bills, selectedIds],
  );

  const allSelected = bills.length > 0 && selectedBills.length === bills.length;
  const headerChecked: boolean | 'indeterminate' = allSelected
    ? true
    : selectedBills.length > 0
      ? 'indeterminate'
      : false;

  const clearSelection = () => setSelectedIds(new Set());

  const toggleAll = () => {
    setSelectedIds((prev) =>
      bills.length > 0 && bills.every((bill) => prev.has(bill.id))
        ? new Set()
        : new Set(bills.map((bill) => bill.id)),
    );
  };

  const toggleRow = (billId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(billId)) {
        next.delete(billId);
      } else {
        next.add(billId);
      }
      return next;
    });
  };

  const handleStatusChange = (value: string) => {
    clearSelection();
    setStatusFilter(value as StatusFilter);
  };

  const handleMonthChange = (value: string) => {
    clearSelection();
    setMonthFilter(value);
  };

  const handlePageChange = (nextPage: number) => {
    clearSelection();
    setPage(nextPage);
  };

  const {
    mutate: confirmPayment,
    mutateAsync: confirmPaymentAsync,
    isPending: isConfirming,
  } = useConfirmBillPayment();
  const { mutateAsync: cancelBill } = useCancelBill();

  const handleConfirmPayment = (billId: string) => {
    confirmPayment(
      { id: billId, data: { tenantConfirmed: true } },
      {
        onSuccess: () =>
          toast.success('Đã xác nhận thanh toán hóa đơn', {
            position: 'top-center',
          }),
      },
    );
  };

  const confirmableBills = selectedBills.filter(
    (bill) => bill.status === BillStatus.PENDING && bill.payment,
  );

  const handleBulkConfirm = async () => {
    if (confirmableBills.length === 0) {
      toast.error('Không có hóa đơn nào đủ điều kiện xác nhận thanh toán');
      return;
    }

    setIsBulkPending(true);
    const results = await Promise.allSettled(
      confirmableBills.map((bill) =>
        confirmPaymentAsync({ id: bill.id, data: { tenantConfirmed: true } }),
      ),
    );
    setIsBulkPending(false);
    clearSelection();

    const succeeded = results.filter(
      (result) => result.status === 'fulfilled',
    ).length;
    toast.success(
      `Đã xác nhận ${succeeded}/${confirmableBills.length} hóa đơn`,
    );
  };

  const handleBulkDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsBulkPending(true);
    const results = await Promise.allSettled(
      selectedBills.map((bill) => cancelBill(bill.id)),
    );
    setIsBulkPending(false);
    clearSelection();

    const succeeded = results.filter(
      (result) => result.status === 'fulfilled',
    ).length;
    toast.success(`Đã xóa ${succeeded}/${selectedBills.length} hóa đơn`);
  };

  const exportQuery = {
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    billingPeriod: monthFilter || undefined,
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      exportBillsToCsv(await fetchAllBills(exportQuery));
    } catch {
      toast.error('Xuất CSV thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      exportBillsToPdf(await fetchAllBills(exportQuery));
    } catch {
      toast.error('Xuất PDF thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hóa đơn hàng tháng
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý và theo dõi hóa đơn của người thuê trong kỳ hiện tại.
          </p>
        </div>
        {canCreate && (
          <Button>
            <Plus className="size-4" />
            Tạo hóa đơn
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="space-y-2">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Trạng thái
            </p>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger
                className="w-full"
                aria-label="Lọc hóa đơn theo trạng thái"
              >
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="space-y-2">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Tháng
            </p>
            <Input
              type="month"
              value={monthFilter}
              max={currentMonth}
              onChange={(event) => handleMonthChange(event.target.value)}
              aria-label="Lọc hóa đơn theo tháng"
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Tổng giá trị hóa đơn
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(pageTotal)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Trang hiện tại
                {pagination ? ` • ${pagination.total} hóa đơn` : ''}
              </p>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      {isLoading ? (
        <SkeletonPage />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {bills.length > 0 ? (
              <>
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="text-xs tracking-wider text-slate-600 uppercase [&>th]:font-bold">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={headerChecked}
                          onCheckedChange={toggleAll}
                          aria-label="Chọn tất cả hóa đơn"
                        />
                      </TableHead>
                      <TableHead>Mã hóa đơn</TableHead>
                      <TableHead>Phòng / Tòa nhà</TableHead>
                      <TableHead>Kỳ thanh toán</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="pr-4 text-right">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_td]:py-3">
                    {bills.map((bill) => (
                      <TableRow
                        key={bill.id}
                        data-state={
                          selectedIds.has(bill.id) ? 'selected' : undefined
                        }
                      >
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selectedIds.has(bill.id)}
                            onCheckedChange={() => toggleRow(bill.id)}
                            aria-label={`Chọn hóa đơn ${bill.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-medium text-indigo-600">
                            #{bill.id.slice(0, 8).toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-slate-900">
                            {bill.room?.number
                              ? `Phòng ${bill.room.number}`
                              : '—'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {bill.room?.building?.name ?? '—'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatBillingPeriod(bill.billingPeriod)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-slate-900">
                          {formatCurrency(bill.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[bill.status]}>
                            {statusLabels[bill.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Thao tác hóa đơn"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="min-w-44"
                            >
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/bills/${bill.id}`}>
                                  <Eye className="size-4" />
                                  <span>Xem chi tiết</span>
                                </Link>
                              </DropdownMenuItem>
                              {bill.status === BillStatus.PENDING &&
                                bill.payment &&
                                user?.role === UserRole.TENANT && (
                                  <DropdownMenuItem
                                    disabled={isConfirming}
                                    onClick={() =>
                                      handleConfirmPayment(bill.id)
                                    }
                                  >
                                    <CheckCircle2 className="size-4" />
                                    <span>Xác nhận thanh toán</span>
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pagination && pagination.total > 0 && (
                  <PaginationContainer
                    variant="plain"
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    disabled={isLoading}
                    previousText="Trước"
                    nextText="Sau"
                    summary={`Hiển thị ${pagination.firstItem} đến ${pagination.lastItem} trên tổng số ${pagination.total} hóa đơn`}
                    className="border-t border-slate-200 px-4 py-3"
                  />
                )}
              </>
            ) : (
              <div className="py-8">
                <NoDataEmptyState
                  title={
                    statusFilter !== 'ALL' || monthFilter
                      ? 'Không tìm thấy hóa đơn phù hợp'
                      : 'Chưa có hóa đơn nào'
                  }
                  subTitle={
                    statusFilter !== 'ALL' || monthFilter
                      ? 'Thử thay đổi bộ lọc trạng thái hoặc tháng.'
                      : 'Hóa đơn sẽ hiển thị khi được tạo cho phòng đang thuê.'
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export & bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting || !pagination || pagination.total === 0}
          >
            <FileDown className="size-4" />
            Xuất PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting || !pagination || pagination.total === 0}
          >
            <Download className="size-4" />
            Xuất CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={selectedBills.length === 0 || isBulkPending}
              >
                <Layers className="size-4" />
                Thao tác hàng loạt
                {selectedBills.length > 0 ? ` (${selectedBills.length})` : ''}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {user?.role === UserRole.TENANT && (
                <DropdownMenuItem
                  disabled={confirmableBills.length === 0 || isBulkPending}
                  onClick={handleBulkConfirm}
                >
                  <CheckCircle2 className="size-4" />
                  <span>Xác nhận thanh toán</span>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="size-4" />
                  <span>Xóa hóa đơn</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-slate-400">
          Đã chọn {selectedBills.length} hóa đơn
        </p>
      </div>

      {/* Bulk delete confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa hóa đơn đã chọn</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa {selectedBills.length} hóa đơn? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkPending}
            >
              Xóa hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
