import { Briefcase, Download, FileText, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  SkeletonPage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useTenantDashboard } from '@/hooks/api';
import { formatCurrency, toDateOnlyString } from '@/utils';

type PersonalTabProps = {
  tenantId: string;
};

export default function PersonalTab({ tenantId }: PersonalTabProps) {
  const { data: tenantDashboardData, isLoading } = useTenantDashboard(tenantId);

  const profile = tenantDashboardData?.tenant.profile;
  const currentRental = tenantDashboardData?.currentRental;

  const rentalSummary = useMemo(() => {
    if (!currentRental) {
      return {
        moveInDate: 'Không có dữ liệu',
        leaseEndDate: 'Không có dữ liệu',
        monthlyRent: '',
        depositPaid: '',
        roomName: undefined,
        buildingName: undefined,
      };
    }

    return {
      moveInDate: toDateOnlyString(new Date(currentRental.startDate)),
      leaseEndDate: currentRental.endDate
        ? toDateOnlyString(new Date(currentRental.endDate))
        : 'Không có dữ liệu',
      monthlyRent: formatCurrency(currentRental.monthlyRent),
      depositPaid: formatCurrency(currentRental.depositPaid),
      roomName: currentRental.room?.number,
      buildingName: currentRental.room?.building?.name,
    };
  }, [currentRental]);

  if (isLoading) {
    return <SkeletonPage />;
  }

  const getNextBillDate = () => {
    const now = new Date();

    return toDateOnlyString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Current Residence & Lease Details */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Residence Overview Highlight */}
            <Card className="bg-primary/10 md:w-1/3">
              <CardContent className="px-2 text-center">
                <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Căn hộ đang thuê
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {rentalSummary.roomName}, {rentalSummary.buildingName}
                </div>
                <div className="text-primary text-sm font-semibold">
                  {rentalSummary.monthlyRent} / tháng
                </div>
              </CardContent>
            </Card>

            {/* Lease Details Grid */}
            <div className="grid grid-cols-2 gap-4 md:w-2/3">
              <div>
                <div className="text-xs font-semibold text-slate-400">
                  Ngày vào ở
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {rentalSummary.moveInDate}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400">
                  Hạn hợp đồng
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {rentalSummary.leaseEndDate}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400">
                  Tiền đặt cọc
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {rentalSummary.depositPaid}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400">
                  Hóa đơn tiếp theo
                </div>
                <div className="text-primary mt-1 text-sm font-medium">
                  {getNextBillDate()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asymmetric 2-Grid: Employment & Priority Documents */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Employment Information Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Công việc & Nghề nghiệp
            </h3>
            <Briefcase className="text-primary size-5" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2.5">
                  <UserCheck className="text-primary size-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {profile?.occupation}
                  </div>
                  <div className="text-xs text-slate-500">
                    {profile?.workplace}
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">SĐT công ty</span>
                  <span className="font-medium text-slate-800">
                    +84 (555) 987-6543
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Xác minh thu nhập</span>
                  <span className="font-semibold text-emerald-600">
                    Đã xác minh
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Documents Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Tài liệu lưu trữ
            </h3>
            <Link href="#" className="text-primary text-xs font-bold">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* TODO: use real document data from the API */}
              {[
                'Government_ID_Tenant.pdf',
                'Employment_Letter_2023.pdf',
                'Signed_Lease_Agreement.pdf',
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="text-primary size-4 shrink-0" />
                    <span className="truncate font-medium text-slate-800">
                      {doc}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary size-7 text-slate-500"
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Width Table: Recent Activity / Payment History */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Lịch sử thanh toán gần đây
          </h3>
          <Badge variant="outline" className="text-xs">
            3 giao dịch gần nhất
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="text-xs tracking-wider text-slate-600 uppercase [&>th]:font-bold">
                <TableHead>MÃ GIAO DỊCH</TableHead>
                <TableHead>NỘI DUNG</TableHead>
                <TableHead>NGÀY</TableHead>
                <TableHead>SỐ TIỀN</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="text-right">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[
                {
                  id: '#PAY-99120',
                  desc: 'Tiền thuê tháng 04/2024',
                  date: '01/04/2024',
                  amount: '3.200.000 đ',
                  status: 'PAID',
                },
                {
                  id: '#PAY-98845',
                  desc: 'Dịch vụ & Điện nước 03/2024',
                  date: '15/03/2024',
                  amount: '540.000 đ',
                  status: 'PAID',
                },
                {
                  id: '#PAY-97120',
                  desc: 'Tiền thuê tháng 03/2024',
                  date: '01/03/2024',
                  amount: '3.200.000 đ',
                  status: 'PAID',
                },
              ].map((row, i) => (
                <TableRow key={i} className="hover:bg-slate-50/80">
                  <TableCell className="font-mono text-xs font-semibold text-slate-900">
                    {row.id}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {row.desc}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {row.date}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {row.amount}
                  </TableCell>
                  <TableCell>
                    <Badge variant="successLight" size="sm">
                      Đã thanh toán
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary h-8 text-xs font-medium"
                    >
                      <Download className="size-3" />
                      <span>Hóa đơn</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
