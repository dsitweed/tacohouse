'use client';

import { Progress as ProgressPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/utils';

type ProgressContextValue = {
  value: number;
};

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

/**
 * Customize
 * className="**:data-[slot=progress-indicator]:bg-violet-500"
    style={{ height: '12px' }}
 */
function Progress({
  className,
  value = 0,
  children,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const progressValue = value ?? 0;

  return (
    <ProgressContext.Provider value={{ value: progressValue }}>
      <div className={cn('w-full space-y-2', className)}>
        <div className="flex items-center justify-between">{children}</div>

        <ProgressPrimitive.Root
          data-slot="progress"
          value={value}
          className="bg-muted relative h-1 w-full overflow-hidden rounded-full"
          {...props}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className="bg-primary size-full flex-1 transition-all"
            style={{
              transform: `translateX(-${100 - progressValue}%)`,
            }}
          />
        </ProgressPrimitive.Root>
      </div>
    </ProgressContext.Provider>
  );
}

function ProgressLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="progress-label"
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: React.ComponentProps<'span'>) {
  const context = React.useContext(ProgressContext);

  if (!context) {
    throw new Error('ProgressValue must be used inside Progress');
  }

  return (
    <span
      data-slot="progress-value"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    >
      {context.value}%
    </span>
  );
}

export { Progress, ProgressLabel, ProgressValue };
