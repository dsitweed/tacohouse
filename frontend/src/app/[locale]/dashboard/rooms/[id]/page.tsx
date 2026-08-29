import { notFound } from 'next/navigation';

import { Room } from '@/generated/model';
import { serverApi, ServerApiError } from '@/libs/serverApiClient';

import RoomDetail from './RoomDetail';

type RoomDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function getRoom(id: string): Promise<Room | null> {
  try {
    const response = await serverApi.get<Room>(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = await getRoom(id);

  console.log({
    room,
  });

  if (!room) {
    notFound();
  }

  return <RoomDetail id={id} initialRoom={room} />;
}
