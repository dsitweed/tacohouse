import { ChevronDown, HelpCircle, Star } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui';

const REVIEWS = [
  {
    stars: 5,
    content:
      '“Mình tìm được căn Studio ở Bình Thạnh chỉ sau đúng 2 ngày. Phòng thực tế giống hệt 100% hình ảnh trên hệ thống, không có chi phí ẩn, chủ nhà cực kỳ lịch sự và hỗ trợ tận tình.”',
    name: 'Nguyễn Minh Khang',
    role: 'Người thuê tại Căn hộ Sunset Bình Thạnh',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    stars: 5,
    content:
      '“Tính năng xem hợp đồng bảo chứng trực tuyến và hóa đơn điện tử của TacoHouse giúp mình tiết kiệm rất nhiều thời gian. Đặt cọc qua nền tảng an tâm tuyệt đối, không sợ bị mất cọc.”',
    name: 'Lê Thu Trang',
    role: 'Sinh viên ĐH Ngoại Thương',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    stars: 5,
    content:
      '“Trước đây đi tìm phòng trọ rất sợ bị chèo kéo qua môi giới lừa đảo. Lên TacoHouse mọi thông tin phòng, giá điện nước đều ghi rõ ràng, quy trình đặt lịch xem phòng trực tiếp chủ nhà.”',
    name: 'Hoàng Đức Anh',
    role: 'Lập trình viên làm việc tại Cầu Giấy',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80',
  },
];

const FAQS = [
  {
    q: 'Người tìm phòng có phải trả phí môi giới hay phí dịch vụ nền tảng không?',
    a: 'Hoàn toàn KHÔNG. Người tìm phòng được sử dụng miễn phí 100% tất cả các tính năng xem phòng, liên hệ chủ trọ và làm thủ tục hợp đồng trên TacoHouse mà không mất thêm bất kỳ đồng phí dịch vụ môi giới nào.',
  },
  {
    q: 'Làm thế nào để xác minh thông tin phòng và chủ nhà là thật?',
    a: 'Mọi chủ nhà và tòa nhà trên TacoHouse đều phải trải qua quy trình xác thực danh tính (CCCD), quyền sở hữu/vận hành bất động sản và kiểm duyệt thông tin hình ảnh trước khi hiển thị huy hiệu Đã Xác Thực.',
  },
  {
    q: 'Tôi có thể hẹn giờ xem phòng trực tiếp trước khi quyết định thuê không?',
    a: 'Có. Bạn có thể dễ dàng nhấn nút Đặt lịch xem phòng trên trang chi tiết hoặc chat trực tiếp với chủ trọ để chọn khung giờ thuận tiện nhất.',
  },
];

function ReviewsAndFaqSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <section id="ReviewsAndFaqSection" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
            NGƯỜI THẬT VIỆC THẬT
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Cộng đồng hơn 10.000+ người thuê hài lòng
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Trải nghiệm thực tế từ những khách hàng đã tìm được căn phòng ưng ý
            qua nền tảng TacoHouse
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs"
            >
              <div className="flex gap-1 text-amber-400">
                {[...Array(review.stars)].map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-700 italic">
                {review.content}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {review.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{review.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">
              Câu hỏi thường gặp về TacoHouse
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Giải đáp mọi thắc mắc trước khi bạn bắt đầu tìm kiếm căn phòng mới
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-slate-900 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-indigo-600" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export { ReviewsAndFaqSection };
