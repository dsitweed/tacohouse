import { notFound } from 'next/navigation';

import { User } from '@/generated/model';
import { serverApi, ServerApiError } from '@/libs/serverApiClient';

import TenantDetail from './TenantDetail';

async function getTenant(id: string) {
  try {
    const response = await serverApi.get<User>(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tenant data', error);
    if (error instanceof ServerApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

type TenantDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  const { id: tenantId } = await params;
  const tenant = await getTenant(tenantId);

  if (!tenant) {
    notFound();
  }

  return <TenantDetail id={tenantId} tenant={tenant} />;
}
