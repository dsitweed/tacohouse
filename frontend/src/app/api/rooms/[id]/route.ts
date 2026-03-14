import { generatePagination } from '@/lib/supbaseClient';
import { getRoomById } from '@/server/rooms';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getRoomById(id);

  if (!data) {
    return Response.json({ error: 'Room not found' }, { status: 404 });
  }

  return Response.json({
    statusCode: 200,
    message: 'Room retrieved successfully',
    data,
  });
}
