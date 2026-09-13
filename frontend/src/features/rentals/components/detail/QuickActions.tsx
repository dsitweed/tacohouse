import { ArrowRight, History, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui';
export function QuickActions({ rentalId }: { rentalId: string }) {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        asChild
        className="h-auto w-full justify-between rounded-xl border-slate-200 bg-slate-100 p-4 hover:bg-slate-200"
      >
        <Link href={`/dashboard/notifications?contractId=${rentalId}`}>
          <span className="flex items-center gap-3">
            <History className="size-5 text-blue-600" />
            Lịch sử hợp đồng
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
      {/* TODO: Add logic for handling termination of the lease */}
      <Button
        variant="outline"
        asChild
        className="h-auto w-full justify-between rounded-xl border-red-200 p-4 text-red-700 hover:bg-red-50"
      >
        <Link href={`/dashboard/rentals/${rentalId}`}>
          <span className="flex items-center gap-3">
            <XCircle className="size-5" />
            Xử lý kết thúc hợp đồng
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
