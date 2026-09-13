import { AlertTriangle, FileText, Percent, Wallet } from 'lucide-react';

import KpiCard from '@/components/KpiCard';

type RentalStatsProps = {
  activeCount: number;
  expiringCount: number;
  averageTerm: number;
  monthlyRevenue: string;
};

const statItems = [
  { key: 'active', label: 'Đang hoạt động', icon: FileText },
  { key: 'expiring', label: 'Sắp hết hạn', icon: AlertTriangle },
  { key: 'term', label: 'Thời hạn trung bình', icon: Percent },
  { key: 'revenue', label: 'Doanh thu hàng tháng', icon: Wallet },
] as const;

export function RentalStats({
  activeCount,
  expiringCount,
  averageTerm,
  monthlyRevenue,
}: RentalStatsProps) {
  const values = {
    active: activeCount.toString(),
    expiring: expiringCount.toString(),
    term: `${averageTerm} tháng`,
    revenue: monthlyRevenue,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map(({ key, label, icon: Icon }) => (
        <KpiCard
          key={key}
          label={label}
          value={values[key]}
          icon={Icon}
          className={
            key === 'expiring'
              ? 'border-l-4 border-l-amber-500 shadow-sm'
              : key === 'revenue'
                ? 'border-blue-700 bg-blue-700 text-white shadow-md'
                : 'shadow-sm'
          }
          iconClassName={key === 'revenue' ? 'text-blue-100' : 'text-blue-600'}
          labelClassName={key === 'revenue' ? 'text-blue-100' : undefined}
          textClassName={key === 'revenue' ? 'text-white' : undefined}
          description={
            key === 'expiring' ? (
              <p className="text-xs text-amber-700">Trong 30 ngày tới</p>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
