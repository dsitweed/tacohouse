'use client';

import { ArrowRight, Building2, Eye } from 'lucide-react';
import Link from 'next/link';

import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useRooms } from '@/hooks/api/useRooms';
import { ROOM_STATUS_MAP } from '@/types';
import { formatCurrency } from '@/utils';

type RoomsTabType = {
  buildingId: string;
};

export default function RoomsTab({ buildingId }: RoomsTabType) {
  const { data: roomsData } = useRooms({
    buildingId,
    page: 1,
    limit: 100,
  });
  const rooms = roomsData?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Danh sách phòng ({rooms.length})
        </h2>
        <Link href={`/dashboard/rooms?buildingId=${buildingId}`}>
          <Button variant="outline" size="sm">
            Xem tất cả <ArrowRight />
          </Button>
        </Link>
      </div>

      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Phòng {room.number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Diện tích: {room.area} m²
                  </p>
                </div>
                <Badge variant={ROOM_STATUS_MAP[room.status].variant}>
                  {ROOM_STATUS_MAP[room.status].label}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-primary text-base font-semibold">
                  {formatCurrency(room.monthlyRent)}/tháng
                </p>
                <Link
                  href={`/dashboard/rooms/${room.id}`}
                  className="flex w-full justify-end gap-1"
                >
                  <Button variant="ghost" size="sm">
                    <Eye className="size-4" /> Chi tiết
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-dashed">
          <CardContent className="items-center text-center">
            <Building2 className="size-12 text-gray-500" />
            <p className="font-medium">Chưa có phòng nào trong tòa nhà này</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
