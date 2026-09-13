import { useQuery } from '@tanstack/react-query';

import type { Building, User } from '@/generated/model';
import { apiClient } from '@/libs';

export type LandlordSummary = User & {
  buildingCount: number;
  roomCount: number;
};

type BuildingWithRoomCount = Building & {
  _count?: {
    rooms?: number;
  };
};

async function fetchLandlords(): Promise<LandlordSummary[]> {
  const response = await apiClient.get<BuildingWithRoomCount[]>('/buildings', {
    params: { page: 1, limit: 1000 },
  });
  const landlords = new Map<string, LandlordSummary>();

  response.data.forEach((building) => {
    const landlord = building.landlord;
    if (!landlord) return;

    const current = landlords.get(landlord.id);
    if (current) {
      current.buildingCount += 1;
      current.roomCount += building._count?.rooms ?? 0;
      return;
    }

    landlords.set(landlord.id, {
      ...landlord,
      buildingCount: 1,
      roomCount: building._count?.rooms ?? 0,
    });
  });

  return Array.from(landlords.values());
}

export function useLandlords() {
  return useQuery({
    queryKey: ['landlords'],
    queryFn: fetchLandlords,
    staleTime: 2 * 60 * 1000,
  });
}
