import { supabaseCLient } from '@/lib/supbaseClient';
import type { Room } from '@/types';
import { RoomStatus } from '@/types';
import 'server-only';

export async function getRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabaseCLient
    .from('rooms')
    .select(`*, building:buildings(*)`)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as Room;
}

export async function getAvailableRooms(): Promise<Room[]> {
  const { data, error } = await supabaseCLient
    .from('rooms')
    .select(`*, building:buildings(*)`)
    .eq('status', RoomStatus.AVAILABLE);

  if (error || !data) {
    return [];
  }

  return data as unknown as Room[];
}
