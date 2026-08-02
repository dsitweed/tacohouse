'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAvailableRooms } from '@/hooks/api/useRooms';
import { formatCurrency } from '@/lib/utils';
import { type Room, RoomTypeLabels } from '@/types';
import { DollarSign, Home, Search, Shield } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { data: rooms, isLoading } = useAvailableRooms();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header - Public Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                TacoHouse
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Tìm phòng trọ phù hợp
            <br />
            <span className="text-indigo-600">Minh bạch – Không phát sinh</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Hệ thống quản lý nhà trọ hiện đại, giúp chủ nhà và người thuê quản
            lý hợp đồng, thanh toán một cách minh bạch và hiệu quả.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-10 max-w-3xl">
          <Card className="px-8 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tòa nhà
                </label>
                <input
                  type="text"
                  placeholder="Tìm theo tên tòa nhà..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Giá tối đa
                </label>
                <input
                  type="number"
                  placeholder="VNĐ/tháng"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <Card className="px-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <Home className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quản lý dễ dàng
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Quản lý tòa nhà, phòng trọ và hợp đồng một cách trực quan và hiệu
              quả.
            </p>
          </Card>

          <Card className="px-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Thanh toán minh bạch
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Theo dõi hóa đơn, thanh toán và lịch sử giao dịch một cách rõ
              ràng.
            </p>
          </Card>

          <Card className="px-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Bảo mật cao</h3>
            <p className="mt-2 text-sm text-gray-600">
              Dữ liệu được mã hóa và bảo vệ an toàn, đảm bảo quyền riêng tư.
            </p>
          </Card>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Phòng đang tuyển</h2>
          <Button>
            <Link href="/rooms">Xem tất cả</Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </Card>
            ))}
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.slice(0, 9).map((room: Room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200">
                  <Home className="h-16 w-16 text-indigo-400" />
                </div>
                <div className="p-4">
                  <Link
                    href={`/rooms/${room.id}`}
                    className="mb-2 font-semibold text-gray-900"
                  >
                    Phòng {room.number}, {room.building?.address}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {RoomTypeLabels[room.roomType]}
                  </p>
                  <p className="text-lg font-bold text-indigo-600">
                    {formatCurrency(room.monthlyRent)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Diện tích: {room.area}m²
                  </p>
                  {room.availableFrom && (
                    <p className="mt-1 text-xs text-amber-600">
                      Có thể vào:{' '}
                      {new Date(room.availableFrom).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-6 py-12 text-center">
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Hiện tại không có phòng nào đang tuyển
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
