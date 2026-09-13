import type { User } from '@/generated/model';

export function getTenantName(tenant: User) {
  const firstName = tenant?.profile?.firstName ?? '';
  const lastName = tenant?.profile?.lastName ?? '';
  return `${firstName} ${lastName}`.trim() || tenant?.email || 'Người thuê';
}

export function getDaysRemaining(endDate: string | null) {
  if (!endDate) return null;
  return Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
}
