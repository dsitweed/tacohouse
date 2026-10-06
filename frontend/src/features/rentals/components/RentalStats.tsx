import {
  AlertTriangle,
  FileText,
  LogOut,
  Percent,
  Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';

import KpiCard from '@/components/KpiCard';
import { useRentalStats } from '@/hooks/api/useRentals';
import { formatCurrency } from '@/utils';

type RentalStatsProps = {
  activeCount: number;
  noticeGivenCount: number;
  expiringSoonCount: number;
  averageTerm: number;
  monthlyRevenue: string;
};

const statItems = [
  { key: 'active', label: 'Đang hoạt động', icon: FileText },
  { key: 'noticeGiven', label: 'Báo chuyển', icon: LogOut },
  { key: 'expiringSoon', label: 'Sắp hết hạn', icon: AlertTriangle },
  { key: 'term', label: 'Thời hạn trung bình', icon: Percent },
  { key: 'revenue', label: 'Doanh thu hàng tháng', icon: Wallet },
] as const;

export function RentalStatsContainer() {
  const { data } = useRentalStats();

  return (
    <RentalStats
      activeCount={data?.activeCount ?? 0}
      noticeGivenCount={data?.noticeGivenCount ?? 0}
      expiringSoonCount={data?.expiringSoonCount ?? 0}
      averageTerm={data?.averageTerm ?? 0}
      monthlyRevenue={data?.monthlyRevenue ?? '0'}
    />
  );
}

function RentalStats({
  activeCount,
  noticeGivenCount,
  expiringSoonCount,
  averageTerm,
  monthlyRevenue,
}: RentalStatsProps) {
  const values = {
    active: activeCount.toString(),
    noticeGiven: noticeGivenCount.toString(),
    expiringSoon: expiringSoonCount.toString(),
    term: `${averageTerm} tháng`,
    revenue: formatCurrency(monthlyRevenue),
  };

  const descriptions: Partial<Record<keyof typeof values, ReactNode>> = {
    noticeGiven: (
      <p className="text-xs text-amber-700">Người thuê đã báo chuyển</p>
    ),
    expiringSoon: <p className="text-xs text-amber-700">Trong 30 ngày tới</p>,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statItems.map(({ key, label, icon: Icon }) => (
        <KpiCard
          key={key}
          label={label}
          value={values[key]}
          icon={Icon}
          className={
            key === 'noticeGiven' || key === 'expiringSoon'
              ? 'border-l-4 border-l-amber-500 shadow-sm'
              : key === 'revenue'
                ? 'border-blue-700 bg-blue-700 text-white shadow-md'
                : 'shadow-sm'
          }
          iconClassName={key === 'revenue' ? 'text-blue-100' : 'text-blue-600'}
          labelClassName={key === 'revenue' ? 'text-blue-100' : undefined}
          textClassName={key === 'revenue' ? 'text-white' : undefined}
          description={descriptions[key]}
        />
      ))}
    </div>
  );
}
