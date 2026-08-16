import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowUpRightIcon } from 'lucide-react';

import { cn } from '@/utils';

import { Button } from '.';

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-lg border-dashed p-12 text-center text-balance',
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn('flex max-w-sm flex-col items-center gap-2', className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-lg font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
        className,
      )}
      {...props}
    />
  );
}

function EmptyState({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className="flex items-center justify-center">
      <Empty className="bg-muted">
        <EmptyHeader>
          <EmptyTitle>Không tìm thấy dữ liệu</EmptyTitle>
          <EmptyDescription>
            Không có dữ liệu để hiển thị. Vui lòng thử lại sau hoặc liên hệ với
            bộ phận hỗ trợ nếu vấn đề vẫn tiếp diễn.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
          <Button variant="link" className="text-muted-foreground">
            Tìm hiểu thêm
            <ArrowUpRightIcon />
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyState,
  EmptyTitle,
};
