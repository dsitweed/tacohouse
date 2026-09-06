import { CheckCircle2, ShieldCheck, Star } from 'lucide-react';

import { Button, Card } from '@/components/ui';

const FEATURED_LANDLORDS = [
  {
    name: 'Chị Mai Phương',
    verified: true,
    rating: 4.9,
    reviews: 128,
    buildingsCount: 3,
    roomsCount: 42,
    responseRate: '100% trong 15p',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    address: 'Bình Thạnh & Phú Nhuận',
    desc: 'Hệ thống căn hộ dịch vụ cao cấp, đầy đủ nội thất, camera an ninh 24/7, giờ giấc tự do.',
  },
  {
    name: 'Anh Trần Hoàng',
    verified: true,
    rating: 4.95,
    reviews: 96,
    buildingsCount: 2,
    roomsCount: 28,
    responseRate: '98% trong 10p',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    address: 'Cầu Giấy & Đống Đa',
    desc: 'Chuyên căn hộ Studio và Duplex khép kín cho sinh viên và người đi làm, cam kết giá điện nước nhà nước.',
  },
  {
    name: 'Bác Quang Minh',
    verified: true,
    rating: 4.88,
    reviews: 154,
    buildingsCount: 4,
    roomsCount: 65,
    responseRate: '99% trong 30p',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    address: 'Quận 7 & Nhà Bè',
    desc: 'Tòa nhà mới xây có thang máy, bảo vệ thẻ từ, PCCC đạt chuẩn kiểm định nhà nước.',
  },
];

function FeaturedLandlordsSection() {
  return (
    <section
      id="FeaturedLandlordsSection"
      className="border-t border-slate-200/80 bg-white py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              ĐỐI TÁC TIN CẬY
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Chủ trọ tiêu biểu & Tận tâm
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Những chủ nhà đạt tiêu chuẩn vận hành chuyên nghiệp, đánh giá cao
              từ cộng đồng người thuê
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Chủ nhà đã ký cam kết minh bạch chi phí</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURED_LANDLORDS.map((landlord, i) => (
            <Card
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={landlord.avatar}
                    alt={landlord.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                  <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900">
                      {landlord.name}
                    </h3>
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">
                      {landlord.rating}
                    </span>
                    <span className="text-slate-400">
                      ({landlord.reviews} đánh giá)
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {landlord.address}
                  </p>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-slate-600">
                {landlord.desc}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    {landlord.buildingsCount}
                  </span>
                  <span className="text-[10px] text-slate-500">Tòa nhà</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    {landlord.roomsCount}
                  </span>
                  <span className="text-[10px] text-slate-500">Phòng</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-600">
                    {landlord.responseRate}
                  </span>
                  <span className="text-[10px] text-slate-500">Phản hồi</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Xem phòng ({landlord.roomsCount})
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Liên hệ chủ trọ
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export { FeaturedLandlordsSection };
