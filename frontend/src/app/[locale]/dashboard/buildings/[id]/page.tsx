import { notFound } from 'next/navigation';

import { Building } from '@/generated/model';
import { serverApi, ServerApiError } from '@/libs/serverApiClient';

import BuildingDetail from './BuildingDetailClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getBuilding(id: string): Promise<Building | null> {
  try {
    const response = await serverApi.get<Building>(`/buildings/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export default async function BuildingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const building = await getBuilding(id);

  if (!building) {
    notFound();
  }

  return <BuildingDetail id={id} initialBuilding={building} />;
}
