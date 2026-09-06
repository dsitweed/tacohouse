import { ChevronRight, Link } from 'lucide-react';

import { Card, CardContent } from '@/components/ui';

const GUIDES = [
  {
    tag: 'Cẩm nang thuê phòng',
    readTime: '5 phút đọc',
    views: '12.4k lượt xem',
    title:
      'Checklist kiểm tra phòng trọ thực tế: 10 điều tuyệt đối không bỏ qua',
    desc: 'Tránh bẫy phụ phí phát sinh, cam kết hoàn tiền cọc và kiểm tra kỹ hệ thống điện nước, công tơ riêng biệt trước khi ký.',
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
  },
  {
    tag: 'Báo cáo giá cả',
    readTime: '7 phút đọc',
    views: '8.9k lượt xem',
    title: 'Bảng so sánh chi phí thuê phòng các quận trung tâm năm 2025',
    desc: 'Khảo sát thực tế mức giá theo từng phân khúc Studio, Duplex và Căn hộ dịch vụ giúp bạn cân đối ngân sách thông minh.',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
  },
  {
    tag: 'Mẹo tiết kiệm',
    readTime: '4 phút đọc',
    views: '15.1k lượt xem',
    title:
      'Cách quản lý hóa đơn sinh hoạt minh bạch, không lo bị tính sai chỉ số',
    desc: 'Tổng hợp định mức giá điện nhà nước, cách thỏa thuận giá dịch vụ máy giặt, rác và hướng dẫn dùng app theo dõi chuẩn xác.',
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
  },
];

function RentalGuidesSection() {
  return (
    <section
      id="RentalGuidesSection"
      className="border-t border-slate-200/80 bg-white py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              KIẾN THỨC BỔ ÍCH
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Cẩm nang & Kinh nghiệm tìm trọ an toàn
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Các bài viết chia sẻ kinh nghiệm giúp bạn tránh bẫy hợp đồng và
              tiết kiệm chi phí
            </p>
          </div>

          <Link
            href="/rooms"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Tất cả bài viết →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {GUIDES.map((guide, i) => (
            <Card
              key={i}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all hover:shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-indigo-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {guide.tag}
                  </span>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{guide.readTime}</span>
                  <span>•</span>
                  <span>{guide.views}</span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-base leading-snug font-bold text-slate-900 group-hover:text-indigo-600">
                  {guide.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {guide.desc}
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600">
                  Đọc tiếp <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export { RentalGuidesSection };
