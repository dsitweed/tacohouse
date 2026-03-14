import { generatePagination } from '@/lib/supbaseClient';
import { getAvailableRooms } from '@/server/rooms';

export async function GET() {
  const data = await getAvailableRooms();

  return Response.json({
    statusCode: 200,
    message: 'Available rooms retrieved successfully',
    data: data,
    pagination: generatePagination(1, data.length),
  });
}
