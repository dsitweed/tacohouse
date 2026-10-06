import { notFound } from 'next/navigation';

import { BillDetailPage } from '@/features/bills';
import type { Bill } from '@/generated/model';
import { serverApi, ServerApiError } from '@/libs/serverApiClient';

type BillDetailRouteProps = {
  params: Promise<{ id: string }>;
};

async function getBill(id: string): Promise<Bill | null> {
  try {
    const response = await serverApi.get<Bill>(`/bills/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export default async function BillDetailRoute({
  params,
}: BillDetailRouteProps) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) notFound();

  return <BillDetailPage id={id} initialBill={bill} />;
}
