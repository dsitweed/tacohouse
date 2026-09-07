import {
  Building2,
  CalendarDays,
  CalendarIcon,
  Home,
  Layers,
  Link,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wind,
} from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  Calendar,
  Card,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { toDateOnlyString } from '@/utils';

const roomTypeSelectItems = [
  {
    value: 'ALL',
    label: 'Tất cả loại phòng',
  },
  {
    value: 'ONE_BED',
    label: 'Căn 1 phòng ngủ',
  },
  {
    value: 'TWO_BED',
    label: 'Căn 2 phòng ngủ',
  },
  {
    value: 'STUDIO',
    label: 'Studio ban công',
  },
  {
    value: 'DUPLEX',
    label: 'Duplex gác lửng',
  },
  {
    value: 'SERVICED',
    label: 'Căn hộ dịch vụ',
  },
];

const priceRangeSelectItems = [
  {
    value: 'ALL',
    label: 'Tất cả mức giá',
  },
  {
    value: 'UNDER_3M',
    label: 'Dưới 3 triệu',
  },
  {
    value: '3M_5M',
    label: '3 - 5 triệu',
  },
  {
    value: '5M_8M',
    label: '5 - 8 triệu',
  },
  {
    value: 'ABOVE_8M',
    label: 'Trên 8 triệu',
  },
];

const amenityQuickFilter = [
  { id: 'balcony', label: 'Ban công thoáng', icon: Wind },
  { id: 'wifi', label: 'Wifi tốc độ cao', icon: Wifi },
  { id: 'aircon', label: 'Máy lạnh mới', icon: Sparkles },
  { id: 'elevator', label: 'Thang máy', icon: Building2 },
  {
    id: 'security',
    label: 'Bảo vệ / Thẻ từ',
    icon: ShieldCheck,
  },
];

function HeroSection() {
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <section
      id="HeroSection"
      className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-[#F8FAFC] pt-12 pb-20"
    >
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-48 -left-20 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          {/* Trust Micro-pill */}
          <Badge
            variant="outline"
            className="border-indigo-200 bg-indigo-50/80 px-4 shadow-xs"
          >
            <ShieldCheck className="size-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700">
              Nền tảng thuê phòng minh bạch • 100% Xác thực thực tế
            </span>
          </Badge>

          {/* Headline */}

          <div className="font-extrabold tracking-tight text-slate-900">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl">
              Tìm phòng trọ chuẩn gu
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-4xl text-transparent sm:text-5xl">
                Minh bạch – Không chi phí ẩn
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Hệ thống phòng trọ, studio và căn hộ dịch vụ cao cấp đã qua kiểm
            duyệt thực tế. Hợp đồng bảo chứng điện tử, giá điện nước rõ ràng,
            quản lý trọn gói tiện lợi.
          </p>
        </div>

        {/* Floating Filter & Search Box */}
        <div className="mx-auto max-w-5xl">
          <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="grid grid-cols-1 gap-4 divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {/* Filter 1: Location */}
              <div className="px-3 py-1">
                <label className="flex items-center text-xs font-semibold text-slate-500 uppercase">
                  <MapPin className="mr-1.5 size-3.5 text-indigo-600" />
                  Khu vực / Tòa nhà
                </label>
                <input
                  type="text"
                  placeholder="Mê Linh, Cầu Giấy..."
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Filter 2: Room Type */}
              <div className="px-3 py-1 sm:pl-4">
                <label className="flex items-center text-xs font-semibold text-slate-500 uppercase">
                  <Home className="mr-1.5 size-3.5 text-indigo-600" />
                  Loại hình phòng
                </label>
                <select className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none">
                  {roomTypeSelectItems.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Price Range */}
              <div className="px-3 py-1 sm:pl-4">
                <label className="flex items-center text-xs font-semibold text-slate-500 uppercase">
                  <Layers className="mr-1.5 size-3.5 text-indigo-600" />
                  Mức giá mong muốn
                </label>
                <select className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none">
                  {priceRangeSelectItems.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 4: Move-in Date & Action */}
              <div className="flex flex-col justify-between px-3 py-1 sm:pl-4">
                <div>
                  <label className="flex items-center text-xs font-semibold text-slate-500 uppercase">
                    <CalendarIcon className="mr-1.5 size-3.5 text-indigo-600" />
                    <span>Ngày có thể vào</span>
                  </label>

                  <Popover open={popoverIsOpen} onOpenChange={setPopoverIsOpen}>
                    <PopoverTrigger className="mt-1 flex w-full justify-between gap-2">
                      <span className="font-semibold text-slate-900 focus:outline-none">
                        {selectedDate
                          ? toDateOnlyString(selectedDate)
                          : toDateOnlyString(new Date())}
                      </span>
                      <CalendarDays className="size-3.5" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          // TODO: real implement
                          setSelectedDate(date);
                          setPopoverIsOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Amenity Quick Filters & Submit Button */}
            <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 md:flex-row">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Tiện ích:
                </span>
                {amenityQuickFilter.map((chip) => {
                  const Icon = chip.icon;
                  const isActive = activeQuickFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() =>
                        setActiveQuickFilter(isActive ? 'all' : chip.id)
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <Link href="/rooms" className="w-full md:w-auto">
                <Button className="w-full gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 md:w-auto">
                  <Search className="size-4" />
                  <span>Tìm phòng ngay</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export { HeroSection };
