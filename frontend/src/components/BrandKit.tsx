import { Building2 } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/utils';

function BrandLogoIcon() {
  return (
    <div className="bg-primary rounded-lg p-3">
      <Building2 className="size-5 text-white" />
    </div>
  );
}

function BrandLogoText() {
  return (
    <div className="flex flex-col">
      <span className="text-primary text-xl font-bold tracking-tight">
        TacoHouse
      </span>
      <span className="-mt-1 text-[10px] font-medium tracking-wider text-indigo-600 uppercase">
        PREMIUM ASSETS
      </span>
    </div>
  );
}

function BrandLogoCombined({
  link = '/',
  className,
}: {
  link?: string;
  className?: string;
}) {
  return (
    <Link href={link} className={cn('flex items-center gap-3', className)}>
      <BrandLogoIcon />
      <BrandLogoText />
    </Link>
  );
}

export { BrandLogoCombined, BrandLogoIcon, BrandLogoText };
