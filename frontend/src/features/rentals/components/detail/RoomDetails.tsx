import { Home, MapPin } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui';
import { Room } from '@/generated/model/room';

type RoomDetailsProps = {
  room: Room;
};

export function RoomDetails({ room }: RoomDetailsProps) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-slate-100 pb-4">
        <Home className="size-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          Thông tin phòng
        </h2>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-48 overflow-hidden rounded-lg bg-slate-100 lg:col-span-1">
            {room.images[0] ? (
              // TODO: Replace this div with an optimized image component for better performance
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${room.images[0]})` }}
                role="img"
                aria-label={`Ảnh phòng ${room.number}`}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                <Home className="size-10" />
                <span className="text-xs">Chưa có ảnh phòng</span>
              </div>
            )}
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Phòng {room.number}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="size-4" />
                {room.building?.name ?? 'Chưa cập nhật tòa nhà'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                {room.area} m²
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                Tối đa {room.maxTenants} người
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                {room.roomType}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {room.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
