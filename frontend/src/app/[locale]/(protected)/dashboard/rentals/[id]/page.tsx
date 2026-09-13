import { notFound } from 'next/navigation';

import { RentalDetail } from '@/features/rentals';
import type { Rental } from '@/generated/model';
import { serverApi, ServerApiError } from '@/libs/serverApiClient';

type RentalDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function getRental(id: string): Promise<Rental | null> {
  try {
    const response = await serverApi.get<Rental>(`/rentals/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export default async function RentalDetailPage({
  params,
}: RentalDetailPageProps) {
  const { id } = await params;
  const rental = await getRental(id);

  if (!rental) notFound();

  return <RentalDetail id={id} initialRental={rental} />;
}
