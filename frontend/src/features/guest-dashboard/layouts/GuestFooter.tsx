import Link from 'next/link';

import { BrandLogoCombined } from '@/components/BrandKit';

const columns = [
  {
    title: 'Khám phá',
    links: [
      { href: '/rooms', label: 'Phòng trọ' },
      { href: '/rooms', label: 'Căn hộ cho thuê' },
      { href: '#buildings', label: 'Tòa nhà' },
      { href: '#areas', label: 'Khu vực' },
      { href: '#landlords', label: 'Chủ trọ' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { href: '#guides', label: 'Cẩm nang thuê nhà' },
      { href: '#faq', label: 'Câu hỏi thường gặp' },
      { href: '#contact', label: 'Liên hệ' },
      { href: '#report', label: 'Báo cáo tin đăng' },
    ],
  },
  {
    title: 'Về TacoHouse',
    links: [
      { href: '#about', label: 'Giới thiệu' },
      { href: '#terms', label: 'Điều khoản' },
      { href: '#privacy', label: 'Chính sách bảo mật' },
      { href: '#careers', label: 'Tuyển dụng' },
    ],
  },
];

function GuestFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <BrandLogoCombined />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Tìm một nơi ở phù hợp, bắt đầu từ thông tin đáng tin cậy.
              <br />
              Phòng thật, thông tin rõ ràng, đánh giá từ người thuê.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-1">
              <h4 className="text-sm font-bold text-slate-900">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-emerald-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 sm:flex-row">
          <p className="text-sm text-slate-600">
            © 2026 TacoHouse. Bảo lưu mọi quyền.
          </p>
          <p className="text-sm text-slate-600">Made with care in Hà Nội</p>
        </div>
      </div>
    </footer>
  );
}

export { GuestFooter };
