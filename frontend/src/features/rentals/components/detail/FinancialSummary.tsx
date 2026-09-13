import { Wallet } from 'lucide-react';

import { Card, CardContent } from '@/components/ui';
import { formatCurrency } from '@/utils';

type FinancialSummaryProps = {
  monthlyRent: string;
  depositPaid: string;
};

export function FinancialSummary({
  monthlyRent,
  depositPaid,
}: FinancialSummaryProps) {
  return (
    <Card className="border-blue-700 bg-blue-700 text-white shadow-md">
      <CardContent className="p-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-blue-100 uppercase">
          Tóm tắt tài chính
        </p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-blue-100">Giá thuê hàng tháng</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatCurrency(monthlyRent)}
            </p>
          </div>
          <Wallet className="mb-1 size-6 text-blue-100" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-blue-400/40 pt-4">
          <div>
            <p className="text-xs text-blue-100">Tiền đặt cọc</p>
            <p className="mt-1 font-semibold">{formatCurrency(depositPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Kỳ thanh toán</p>
            <p className="mt-1 font-semibold">Ngày 1 hàng tháng</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
