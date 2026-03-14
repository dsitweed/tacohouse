'use client';

import { useRoom } from '@/hooks/api';

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const {
    data: room,
    isPending,
    isError,
    error,
  } = useRoom(id, {
    enabled: !!id,
  });

  if (isPending) return <div className="p-4">Loading room...</div>;

  if (isError) {
    return (
      <div className="p-4">
        Failed to load room{error instanceof Error ? `: ${error.message}` : ''}
      </div>
    );
  }

  return <div className="p-4">{room?.number}</div>;
}
