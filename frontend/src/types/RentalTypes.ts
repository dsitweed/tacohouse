import { BadgeVariantType } from '@/components/ui';
import { RentalStatus } from '@/generated/model';

export const RENTAL_STATUS_MAP: Record<
  RentalStatus,
  {
    label: string;
    badgeVariant: BadgeVariantType;
  }
> = {
  ACTIVE: {
    label: 'Đang thuê',
    badgeVariant: 'successLight',
  },
  NOTICE_GIVEN: {
    label: 'Báo chuyển',
    badgeVariant: 'pending',
  },
  TERMINATED: {
    label: 'Hết hạn',
    badgeVariant: 'destructive',
  },
};
