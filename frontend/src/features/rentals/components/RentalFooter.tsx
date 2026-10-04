import { HandFist, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button, Card } from '@/components/ui';

type RentalFooterCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: {
    label: string;
    href: string;
  };
};

export function RentalFooter() {
  return (
    <footer
      aria-label="Thao tác nhanh và hỗ trợ"
      className="grid shrink-0 grow-0 grid-cols-1 gap-6 self-stretch pb-12 lg:grid-cols-2"
    >
      <RentalFooterCard
        icon={Zap}
        title="Thao tác nhanh"
        description="Tạo hợp đồng mới hoặc xem hóa đơn liên quan đến hợp đồng thuê."
        action={{ label: 'Tạo hợp đồng mới', href: '/dashboard/rentals/new' }}
      />
      <RentalFooterCard
        icon={HandFist}
        title="Hỗ trợ"
        description="Cần trợ giúp về hợp đồng? Đội ngũ TacoHouse luôn sẵn sàng."
        action={{ label: 'Liên hệ hỗ trợ', href: '/dashboard/chat' }}
      />
    </footer>
  );
}

function RentalFooterCard({
  icon: Icon,
  title,
  description,
  action,
}: RentalFooterCardProps) {
  return (
    <Card className="w-full flex-row items-start gap-4 rounded-[12px] bg-[#eff4ff] p-6 shadow-none ring-0 lg:flex-1">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <Icon className="text-primary size-6" />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <h3 className="text-xl leading-7 font-semibold text-[#0b1c30]">
          {title}
        </h3>
        <p className="text-sm leading-5 text-[#434655]">{description}</p>
        <Button
          variant="link"
          asChild
          className="text-primary h-auto px-0 pt-3.5"
        >
          <Link href={action.href}>{action.label}</Link>
        </Button>
      </div>
    </Card>
  );
}
