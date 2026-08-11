import { cn } from '@/utils';

import { Card, CardContent } from './ui';

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  delta?: {
    label: string;
    positive: boolean;
  };
  iconClassName?: string;
  textClassName?: string;
};

// TODO: update this component. Now using iconClassName and textClassName. But should use variant instead
// TODO: Add description section for explain
export default function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  iconClassName,
  textClassName,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col justify-between px-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {label}
          </p>
          <Icon className={cn('size-5 text-gray-400', iconClassName)} />
        </div>

        <div className="flex min-w-0 items-baseline gap-2">
          <span
            className={cn(
              'min-w-0 text-2xl font-semibold break-words text-gray-900',
              textClassName,
            )}
          >
            {value}
          </span>
          {delta && (
            <span
              className={cn(
                'text-xs font-bold',
                delta.positive ? 'text-emerald-700' : 'text-rose-600',
              )}
            >
              {delta.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
