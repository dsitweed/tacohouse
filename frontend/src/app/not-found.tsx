import Link from 'next/link';

// root layout has no <html>/<body>,
// so this page must provide its own full document.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 px-6 font-sans">
        <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
            404
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Không tìm thấy trang
          </h1>
          <p className="mt-4 text-gray-600">
            Đường dẫn bạn truy cập không tồn tại.xxxx
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
