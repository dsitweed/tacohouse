import { BadgeVariantType } from '@/components/ui';
import { PaymentStatus } from '@/generated/model';

export const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  {
    title: string;
    badgeVariant: BadgeVariantType;
  }
> = {
  PENDING: {
    title: 'Chờ thanh toán',
    badgeVariant: 'pending',
  },
  COMPLETED: {
    title: 'Đã thanh toán',
    badgeVariant: 'successLight',
  },
  FAILED: {
    title: 'Thất bại',
    badgeVariant: 'destructive',
  },
  REFUNDED: {
    title: 'Đã hoàn tiền',
    badgeVariant: 'successLight',
  },
};
