import { generatePagination, supabaseCLient } from '@/lib/supbaseClient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { data, error } = await supabaseCLient
    .from('rooms')
    .select(`*, building:buildings(*)`)
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return Response.json(
      { error: error?.message || 'Room not found' },
      { status: 404 },
    );
  }

  return Response.json({
    statusCode: 200,
    message: 'Room retrieved successfully',
    data,
    pagination: generatePagination(1, data.length),
  });
}
