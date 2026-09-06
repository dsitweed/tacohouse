import { Badge, MapPin } from 'lucide-react';
import Link from 'next/link';

const POPULAR_AREAS = [
  {
    name: 'Bình Thạnh, TP. HCM',
    roomCount: '1,240+ phòng trống',
    price: 'Từ 4.5 - 9.5 triệu',
    tag: 'Gần trung tâm & ĐH',
    bg: 'from-blue-600/80 to-slate-900/90',
    image:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
    districts: ['Phường 25', 'Hàng Xanh', 'Thị Nghè'],
  },
  {
    name: 'Quận Cầu Giấy, Hà Nội',
    roomCount: '980+ phòng trống',
    price: 'Từ 3.8 - 8.0 triệu',
    tag: 'Khu vực SV & Văn phòng',
    bg: 'from-indigo-600/80 to-slate-900/90',
    image:
      'https://images.unsplash.com/photo-1508873696983-2df5293cb39f?auto=format&fit=crop&w=600&q=80',
    districts: ['Dịch Vọng', 'Nghĩa Tân', 'Trung Hòa'],
  },
  {
    name: 'Quận 7, TP. HCM',
    roomCount: '860+ phòng trống',
    price: 'Từ 5.0 - 12.0 triệu',
    tag: 'Đô thị văn minh cao cấp',
    bg: 'from-emerald-600/80 to-slate-900/90',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    districts: ['Phú Mỹ Hưng', 'Tân Phong', 'Tân Quy'],
  },
  {
    name: 'Quận Đống Đa, Hà Nội',
    roomCount: '750+ phòng trống',
    price: 'Từ 4.0 - 8.5 triệu',
    tag: 'Trung tâm sầm uất',
    bg: 'from-amber-600/80 to-slate-900/90',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    districts: ['Chùa Bộc', 'Láng Hạ', 'Ô Chợ Dừa'],
  },
  {
    name: 'Quận Nam Từ Liêm, HN',
    roomCount: '910+ phòng trống',
    price: 'Từ 3.5 - 7.5 triệu',
    tag: 'Tòa nhà mới, hiện đại',
    bg: 'from-purple-600/80 to-slate-900/90',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    districts: ['Mỹ Đình', 'Mễ Trì', 'Trung Văn'],
  },
  {
    name: 'Quận Hải Châu, Đà Nẵng',
    roomCount: '520+ phòng trống',
    price: 'Từ 3.0 - 6.5 triệu',
    tag: 'Ven sông Hàn thoáng mát',
    bg: 'from-cyan-600/80 to-slate-900/90',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    districts: ['Bình Thuận', 'Hòa Cường', 'Thạch Thang'],
  },
];

function PopularAreasSection() {
  return (
    <section id="PopularAreasSection" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              KHÁM PHÁ THEO ĐỊA ĐIỂM
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Khu vực có mật độ phòng trọ hot nhất
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Thuận tiện di chuyển đến trường đại học, khu công nghệ cao và các
              tòa nhà văn phòng
            </p>
          </div>

          <Link href="/rooms">
            <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Xem bản đồ phòng trọ toàn quốc →
            </span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_AREAS.map((area, i) => (
            <div
              key={i}
              className="group relative h-72 overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={area.image}
                alt={area.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${area.bg}`} />

              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-xs font-bold text-slate-900 backdrop-blur-md">
                  {area.roomCount}
                </Badge>
              </div>

              <div className="absolute right-4 bottom-4 left-4">
                <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                  {area.tag}
                </span>
                <h3 className="mt-2 text-xl font-bold text-white drop-shadow-sm">
                  {area.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-slate-200">
                  Khoảng giá phổ biến:{' '}
                  <span className="font-bold text-amber-300">{area.price}</span>
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/20 pt-2">
                  {area.districts.map((d, di) => (
                    <span
                      key={di}
                      className="rounded bg-black/30 px-2 py-0.5 text-[10px] text-slate-200 backdrop-blur-xs"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { PopularAreasSection };
