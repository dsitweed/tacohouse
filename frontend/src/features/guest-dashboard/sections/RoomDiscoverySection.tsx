import {
  ArrowRight,
  Bath,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Heart,
  Home,
  Link,
  MapPin,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wind,
} from 'lucide-react';

import { Button, Card, CardContent, SkeletonPage } from '@/components/ui';
import { useAvailableRooms } from '@/hooks/api/useRooms';
import { ROOM_TYPES_MAPS } from '@/types';
import { formatCurrency } from '@/utils';

const fallbackImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80',
];

function RoomDiscoverySection() {
  const { data: rooms, isLoading } = useAvailableRooms();

  return (
    <section
      id="RoomDiscoverySection"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            DANH SÁCH MỚI NHẤT
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Phòng đang mở tuyển sinh hoạt
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Cập nhật liên tục từ các tòa nhà uy tín đối tác của TacoHouse
          </p>
        </div>

        <Link href="/rooms">
          <Button
            variant="outline"
            className="gap-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Xem tất cả phòng trống
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Room Grid */}
      {isLoading ? (
        <SkeletonPage />
      ) : rooms && rooms.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.slice(0, 6).map((room, idx) => {
            const cardImage =
              room.images?.[0] ?? fallbackImages[idx % fallbackImages.length];

            return (
              <Card
                key={room.id}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
              >
                {/* Image / Header Preview */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardImage}
                    alt={`Phòng ${room.number}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-xs backdrop-blur-md">
                      {ROOM_TYPES_MAPS[room.roomType]?.label || 'Studio'}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã xác thực
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label="Lưu phòng"
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 backdrop-blur-md transition-colors hover:bg-white hover:text-rose-500"
                  >
                    <Heart className="h-4 w-4" />
                  </button>

                  {/* Bottom Specs on Image */}
                  <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-xs font-medium text-white/95">
                    <div className="flex items-center gap-1 drop-shadow-xs">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>{room.area} m²</span>
                    </div>
                    <div className="flex items-center gap-1 drop-shadow-xs">
                      <BedDouble className="h-3.5 w-3.5" />
                      <span>Tầng {room.number.charAt(0) || '2'}</span>
                    </div>
                    <div className="flex items-center gap-1 drop-shadow-xs">
                      <Bath className="h-3.5 w-3.5" />
                      <span>WC Riêng</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/rooms/${room.id}`}
                        className="font-bold text-slate-900 transition-colors hover:text-indigo-600"
                      >
                        Phòng {room.number} –{' '}
                        {room.building?.name || 'Tòa nhà cao cấp'}
                      </Link>
                      <p className="mt-1 flex items-center text-xs text-slate-500">
                        <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">
                          {room.building?.address || 'Quận trung tâm, TP.HCM'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Features */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      <Wind className="h-3 w-3 text-indigo-500" /> Máy lạnh
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      <Wifi className="h-3 w-3 text-indigo-500" /> Wifi riêng
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Cửa
                      vân tay
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-[11px] text-slate-400">
                        Giá thuê niêm yết
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-indigo-600">
                          {formatCurrency(room.monthlyRent)}
                        </span>
                        <span className="text-xs text-slate-500">/tháng</span>
                      </div>
                    </div>

                    <Link href={`/rooms/${room.id}`}>
                      <Button
                        size="sm"
                        className="rounded-xl bg-slate-900 px-4 font-semibold text-white hover:bg-indigo-600"
                      >
                        Chi tiết
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Home className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-slate-900">
            Hiện tại đang cập nhật thêm phòng trống mới
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Vui lòng quay lại sau hoặc liên hệ với ban quản lý để nhận danh sách
            sớm nhất.
          </p>
        </div>
      )}
    </section>
  );
}

export { RoomDiscoverySection };
