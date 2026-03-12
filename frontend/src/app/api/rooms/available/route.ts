import { generatePagination, supabaseCLient } from '@/lib/supbaseClient';
import { RoomStatus } from '@/types';

export async function GET() {
  const { data, error } = await supabaseCLient
    .from('rooms')
    .select('*')
    .eq('status', RoomStatus.AVAILABLE);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }


  return Response.json({
    statusCode: 200,
    message: 'Available rooms retrieved successfully',
    data: data,
    pagination: generatePagination(1, data.length)
  });
}
