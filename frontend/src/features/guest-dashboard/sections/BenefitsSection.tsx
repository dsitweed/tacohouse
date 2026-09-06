import { CheckCircle2, Layers, ShieldCheck } from 'lucide-react';

function BenefitsSection() {
  return (
    <section
      id="BenefitsSection"
      className="border-y border-slate-200/80 bg-white py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Phòng thật – Giá thật 100%
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Tất cả phòng đăng tải đều được đội ngũ kiểm duyệt thực tế tại
                địa chỉ, cam kết hình ảnh đúng thực tế và không kênh giá.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bảo chứng cọc & Hợp đồng
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Hợp đồng mẫu pháp lý chặt chẽ, số hóa trực tuyến. Tiền đặt cọc
                được giữ an toàn, tránh rủi ro bị bùng cọc hoặc tranh chấp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Minh bạch phí điện nước
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Công tơ riêng từng phòng, chốt chỉ số online bằng hình ảnh. Hóa
                đơn hàng tháng rõ ràng từng khoản mục chi tiết.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { BenefitsSection };
