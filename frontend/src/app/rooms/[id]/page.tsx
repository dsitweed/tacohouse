import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getRoomById } from '@/server/rooms';
import { RoomTypeLabels } from '@/types';

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Phòng {room.number}</CardTitle>
          <CardDescription>
            {room.building?.name ?? `Building ${room.buildingId}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{RoomTypeLabels[room.roomType]}</Badge>
            <Badge variant="outline">{room.status}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground">Diện tích</div>
              <div>{room.area} m²</div>
            </div>
            <div>
              <div className="text-muted-foreground">Giá thuê</div>
              <div>{formatCurrency(room.monthlyRent)}/tháng</div>
            </div>
            <div>
              <div className="text-muted-foreground">Tiền cọc</div>
              <div>{formatCurrency(room.deposit)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Số người tối đa</div>
              <div>{room.maxTenants}</div>
            </div>
          </div>

          {room.availableFrom ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Trống từ: </span>
              {new Date(room.availableFrom).toLocaleDateString('vi-VN')}
            </div>
          ) : null}

          {room.description ? (
            <p className="text-muted-foreground text-sm">{room.description}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
