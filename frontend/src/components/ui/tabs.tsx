'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/utils';

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn(
        'group/tabs flex gap-3 data-[orientation=horizontal]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex items-center text-muted-foreground data-[orientation=vertical]:h-fit data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col',
  {
    variants: {
      variant: {
        default: 'h-9 w-fit justify-center rounded-lg bg-muted p-[3px]',
        line: 'w-full gap-1 rounded-none border-b bg-transparent p-0 data-[orientation=vertical]:gap-0 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-l',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base
        'text-muted-foreground hover:text-foreground relative inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        // Default variant: pill with background
        'group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:h-[calc(100%-1px)] group-data-[variant=default]/tabs-list:flex-1 group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-2 group-data-[variant=default]/tabs-list:py-1 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm',
        // Line variant: border indicator
        'group-data-[variant=line]/tabs-list:data-[state=active]:border-primary group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground group-data-[variant=line]/tabs-list:border-transparent',
        'group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:border-b-2 group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:px-1 group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:py-2',
        'group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:w-full group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:justify-start group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:border-l-2 group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:px-3 group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:py-2',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger };
