'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Receipt,
  SkipForward,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  type BillGenerationPreviewDto,
  type BillGenerationReadingDto,
  type BillGenerationRowDto,
  BillGenerationRowDtoStatus,
  type GenerateBillsDto,
  UtilityType,
} from '@/generated/model';
import {
  useGenerateBills,
  usePreviewBillGeneration,
} from '@/hooks/api/useBills';
import { useBuildings } from '@/hooks/api/useBuildings';
import { DialogType, useDialogStore } from '@/stores/dialogStore';
import { formatCurrency } from '@/utils';

const UTILITY_LABELS: Record<UtilityType, string> = {
  [UtilityType.ELECTRICITY]: 'Điện (kWh)',
  [UtilityType.WATER]: 'Nước (m³)',
  [UtilityType.GAS]: 'Gas (kg)',
};

const STEPS = ['Kỳ hóa đơn', 'Nhập chỉ số', 'Xem lại'] as const;

const STATUS_META: Record<
  BillGenerationRowDtoStatus,
  { label: string; variant: 'success' | 'pending' | 'secondary' }
> = {
  READY: { label: 'Sẵn sàng', variant: 'success' },
  WARNING: { label: 'Cảnh báo', variant: 'pending' },
  SKIPPED: { label: 'Bỏ qua', variant: 'secondary' },
};

const meterKey = (roomId: string, utilityType: UtilityType) =>
  `${roomId}|${utilityType}`;

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function GenerateBillsDialog() {
  const { isOpen, type, closeDialog } = useDialogStore();
  const { data: buildingsData } = useBuildings({ page: 1, limit: 100 });
  const buildings = buildingsData?.data ?? [];

  const previewMutation = usePreviewBillGeneration();
  const generateMutation = useGenerateBills();

  const [step, setStep] = useState(1);
  const [buildingId, setBuildingId] = useState('');
  const [billingPeriod, setBillingPeriod] = useState(currentMonthValue);
  const [dueDate, setDueDate] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [readingInputs, setReadingInputs] = useState<Record<string, string>>(
    {},
  );
  const [preview, setPreview] = useState<BillGenerationPreviewDto | null>(null);

  const open = isOpen && type === DialogType.GENERATE_BILLS;
  const isBusy = previewMutation.isPending || generateMutation.isPending;

  const reset = () => {
    setStep(1);
    setBuildingId('');
    setBillingPeriod(currentMonthValue());
    setDueDate('');
    setOverwrite(false);
    setReadingInputs({});
    setPreview(null);
  };

  const buildReadings = (): BillGenerationReadingDto[] =>
    Object.entries(readingInputs)
      .filter(([, value]) => value.trim() !== '')
      .map(([key, value]) => {
        const [roomId, utilityType] = key.split('|');
        return {
          roomId,
          utilityType: utilityType as UtilityType,
          currentReading: Number(value),
        };
      });

  const buildPayload = (): GenerateBillsDto => ({
    buildingId,
    billingPeriod,
    dueDate: dueDate || undefined,
    overwrite,
    readings: buildReadings(),
  });

  const runPreview = async (nextStep: number) => {
    if (!buildingId) {
      toast.error('Vui lòng chọn tòa nhà');
      return;
    }

    try {
      const result = await previewMutation.mutateAsync(buildPayload());
      setPreview(result);
      setStep(nextStep);
    } catch {
      // usePreviewBillGeneration already surfaces the error via toast.
    }
  };

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync(buildPayload());

      toast.success(
        `Đã tạo ${result.created} hóa đơn${
          result.skipped > 0 ? `, bỏ qua ${result.skipped}` : ''
        }`,
        { position: 'top-center' },
      );

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} hóa đơn tạo thất bại`, {
          position: 'top-center',
        });
      }

      reset();
      closeDialog();
    } catch {
      // Already surfaced by the hook.
    }
  };

  // Only metered rooms need readings; a room without an active rental cannot
  // be billed at all, so it is hidden from this step.
  const meteredRows = useMemo(
    () => (preview?.rows ?? []).filter((row) => row.meters.length > 0),
    [preview],
  );

  const billableRows = useMemo(
    () => (preview?.rows ?? []).filter((row) => row.status !== 'SKIPPED'),
    [preview],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isBusy) {
          reset();
          closeDialog();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <Receipt className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Tạo hóa đơn cuối tháng
            </h2>
            <p className="text-sm text-gray-500">
              Bước {step}/3 — {STEPS[step - 1]}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index + 1 <= step
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  index + 1 === step ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1 — period */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tòa nhà
              </label>
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger className="w-full" aria-label="Chọn tòa nhà">
                  <SelectValue placeholder="Chọn tòa nhà" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Kỳ hóa đơn
                </label>
                <Input
                  type="month"
                  value={billingPeriod}
                  onChange={(event) => setBillingPeriod(event.target.value)}
                  aria-label="Kỳ hóa đơn"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Hạn thanh toán (tùy chọn)
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  aria-label="Hạn thanh toán"
                />
                <p className="text-xs text-gray-400">
                  Để trống sẽ dùng ngày chốt của tòa nhà ở tháng kế tiếp.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={overwrite}
                onCheckedChange={(checked) => setOverwrite(checked === true)}
              />
              Ghi đè hóa đơn đã tồn tại của kỳ này
            </label>
          </div>
        )}

        {/* Step 2 — meter readings */}
        {step === 2 && preview && (
          <div className="space-y-4">
            {meteredRows.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-gray-600">
                Không có phòng nào cần nhập chỉ số (tất cả phòng đều trọn gói).
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Nhập chỉ số mới. Ô trống sẽ được tính là 0 tiêu thụ.
                </p>
                {meteredRows.map((row) => (
                  <Card key={row.roomId} className="shadow-none">
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          Phòng {row.roomNumber}
                        </span>
                        {row.tenantName && (
                          <span className="text-sm text-gray-500">
                            {row.tenantName}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {row.meters.map((meter) => {
                          const key = meterKey(row.roomId, meter.utilityType);
                          return (
                            <div key={key} className="space-y-1">
                              <label className="text-xs font-medium text-gray-600">
                                {UTILITY_LABELS[meter.utilityType]}
                              </label>
                              <Input
                                type="number"
                                min={0}
                                inputMode="decimal"
                                placeholder={`Đầu: ${Number(meter.previousReading)}`}
                                value={readingInputs[key] ?? ''}
                                onChange={(event) =>
                                  setReadingInputs((prev) => ({
                                    ...prev,
                                    [key]: event.target.value,
                                  }))
                                }
                                aria-label={`Chỉ số ${UTILITY_LABELS[meter.utilityType]} phòng ${row.roomNumber}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — review */}
        {step === 3 && preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryTile label="Sẵn sàng" value={preview.summary.ready} />
              <SummaryTile label="Cảnh báo" value={preview.summary.warnings} />
              <SummaryTile label="Bỏ qua" value={preview.summary.skipped} />
              <SummaryTile
                label="Tổng tiền"
                value={formatCurrency(preview.summary.totalAmount)}
              />
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="text-xs tracking-wider text-slate-600 uppercase">
                    <TableHead className="pl-3">Phòng</TableHead>
                    <TableHead className="text-right">Tiền phòng</TableHead>
                    <TableHead className="text-right">Điện</TableHead>
                    <TableHead className="text-right">Nước</TableHead>
                    <TableHead className="text-right">Gas</TableHead>
                    <TableHead className="text-right">Phí</TableHead>
                    <TableHead className="text-right">Nợ cũ</TableHead>
                    <TableHead className="text-right">Tổng</TableHead>
                    <TableHead className="pr-3">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_td]:py-2">
                  {preview.rows.map((row) => (
                    <ReviewRow key={row.roomId} row={row} />
                  ))}
                </TableBody>
              </Table>
            </div>

            {billableRows.some((row) => row.warnings.length > 0) && (
              <div className="space-y-1 rounded-lg bg-amber-50 p-3">
                {billableRows
                  .filter((row) => row.warnings.length > 0)
                  .map((row) => (
                    <p
                      key={row.roomId}
                      className="flex items-start gap-2 text-xs text-amber-800"
                    >
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      <span>
                        Phòng {row.roomNumber}: {row.warnings.join('; ')}
                      </span>
                    </p>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 flex justify-between gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => {
              if (step === 1) {
                reset();
                closeDialog();
              } else {
                setStep(step - 1);
              }
            }}
          >
            {step === 1 ? (
              'Hủy'
            ) : (
              <>
                <ArrowLeft className="size-4" />
                Quay lại
              </>
            )}
          </Button>

          {step === 1 && (
            <Button
              type="button"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={isBusy || !buildingId}
              onClick={() => runPreview(2)}
            >
              {previewMutation.isPending ? <Spinner /> : 'Tiếp tục'}
              <ArrowRight className="size-4" />
            </Button>
          )}

          {step === 2 && (
            <Button
              type="button"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={isBusy}
              onClick={() => runPreview(3)}
            >
              {previewMutation.isPending ? <Spinner /> : 'Xem lại'}
              <ArrowRight className="size-4" />
            </Button>
          )}

          {step === 3 && (
            <Button
              type="button"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={isBusy || billableRows.length === 0}
              onClick={handleGenerate}
            >
              {generateMutation.isPending ? (
                <Spinner />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Tạo {billableRows.length} hóa đơn
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ReviewRow({ row }: { row: BillGenerationRowDto }) {
  const status = STATUS_META[row.status];
  const otherFees =
    Number(row.managementFee) +
    Number(row.cleaningFee) +
    Number(row.lightingFee);

  return (
    <TableRow
      className={row.status === 'SKIPPED' ? 'opacity-50' : undefined}
      title={row.warnings.join('; ')}
    >
      <TableCell className="pl-3">
        <div className="flex items-center gap-2">
          {row.status === 'SKIPPED' && (
            <SkipForward className="size-3.5 text-slate-400" />
          )}
          <span className="text-sm font-medium text-slate-900">
            {row.roomNumber}
          </span>
        </div>
        {row.tenantName && (
          <span className="text-xs text-slate-500">{row.tenantName}</span>
        )}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatCurrency(row.monthlyRent)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatCurrency(row.electricityAmount)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatCurrency(row.waterAmount)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatCurrency(row.gasAmount)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatCurrency(otherFees)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {Number(row.previousDebt) > 0 ? formatCurrency(row.previousDebt) : '—'}
      </TableCell>
      <TableCell className="text-right text-sm font-semibold text-slate-900">
        {formatCurrency(row.totalAmount)}
      </TableCell>
      <TableCell className="pr-3">
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
    </TableRow>
  );
}
