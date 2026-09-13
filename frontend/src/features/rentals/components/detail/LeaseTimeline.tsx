import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

import { Button, Card, CardContent } from '@/components/ui';
import { DAYS_REMAINING_THRESHOLD } from '@/features/rentals/rentals.constants';
import { getDaysRemaining } from '@/features/rentals/rentals.utils';
import { toDateOnlyString } from '@/utils';

type LeaseTimelineProps = {
  startDate: string;
  endDate: string | null;
};

export function LeaseTimeline({ startDate, endDate }: LeaseTimelineProps) {
  const daysRemaining = getDaysRemaining(endDate);
  const isExpiring =
    daysRemaining !== null &&
    daysRemaining >= 0 &&
    daysRemaining <= DAYS_REMAINING_THRESHOLD;

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardContent className="p-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Thời hạn hợp đồng
        </p>
        <div className="relative mt-5 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-0.5 before:bg-slate-200">
          <div className="relative pl-8">
            <span className="absolute top-1 left-0 z-10 flex size-6 rounded-full border-4 border-white bg-slate-200" />
            <p className="text-xs text-slate-500">Ngày bắt đầu</p>
            <p className="text-sm font-semibold text-slate-900">
              {toDateOnlyString(new Date(startDate))}
            </p>
          </div>
          <div className="relative pl-8">
            <span className="absolute top-1 left-0 z-10 flex size-6 items-center justify-center rounded-full border-4 border-white bg-blue-600">
              <CheckCircle2 className="size-3 text-white" />
            </span>
            <p className="text-xs text-slate-500">Ngày kết thúc</p>
            <p className="text-sm font-semibold text-slate-900">
              {endDate ? toDateOnlyString(new Date(endDate)) : 'Không thời hạn'}
            </p>
          </div>
        </div>
        {isExpiring && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Hợp đồng còn {daysRemaining} ngày. Hãy chủ động liên hệ để trao đổi
            gia hạn.
          </div>
        )}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <RefreshCw className="size-4" />
            <h3 className="text-sm font-semibold">Tùy chọn gia hạn</h3>
          </div>
          <p className="mt-2 text-xs leading-5 text-amber-900/80">
            Trao đổi với người thuê để thống nhất thời hạn và mức giá mới trước
            ngày kết thúc hợp đồng.
          </p>
          {/* TODO: Add logic to navigate to the lease renewal page */}
          <Button
            variant="outline"
            size="sm"
            disabled={!isExpiring}
            title={
              isExpiring ? 'Hợp đồng sắp hết hạn' : 'Chưa đến thời hạn gia hạn'
            }
            className="mt-3 w-full border-amber-200 bg-white text-amber-900 hover:bg-amber-100"
          >
            Xem điều khoản gia hạn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
