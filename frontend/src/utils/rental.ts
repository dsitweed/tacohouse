import type { Rental, User } from '@/generated/model';

export function getTenantName(tenant?: User | null) {
  const firstName = tenant?.profile?.firstName ?? '';
  const lastName = tenant?.profile?.lastName ?? '';
  return `${firstName} ${lastName}`.trim() || tenant?.email || 'Người thuê';
}

export function getInitName(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function getRentalRoomLabel(rental: Rental) {
  if (!rental.room) return 'Chưa gán phòng';
  return `Phòng ${rental.room.number} - ${rental.room.building?.name ?? 'Chưa có tòa nhà'}`;
}
