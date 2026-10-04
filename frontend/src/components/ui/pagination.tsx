'use client';

import { cn } from 'cn';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-wrap items-center gap-1', className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? 'page' : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  );
}

function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('pl-2!', className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('pr-2!', className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

/**
 * Builds the page numbers rendered between the previous/next buttons.
 *
 * @param page - Current page (1-based).
 * @param totalPages - Total number of pages.
 * @param siblingCount - Number of page buttons shown on each side of the current page.
 * @returns Ordered page numbers and `'ellipsis'` markers.
 */
function getPaginationRange(
  page: number,
  totalPages: number,
  siblingCount = 1,
): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const siblingRange = Math.max(0, Math.floor(siblingCount));
  const totalSlots = siblingRange * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingRange, 1);
  const rightSibling = Math.min(currentPage + siblingRange, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;
  const edgeItemCount = siblingRange * 2 + 3;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [
      ...Array.from({ length: edgeItemCount }, (_, index) => index + 1),
      'ellipsis',
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [
      1,
      'ellipsis',
      ...Array.from(
        { length: edgeItemCount },
        (_, index) => totalPages - edgeItemCount + 1 + index,
      ),
    ];
  }

  return [
    1,
    'ellipsis',
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, index) => leftSibling + index,
    ),
    'ellipsis',
    totalPages,
  ];
}

export interface PaginationContainerProps extends React.ComponentProps<'div'> {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. Values less than or equal to zero render nothing. */
  totalPages: number;
  /** Invoked with the selected page after a user interaction. */
  onPageChange: (page: number) => void;
  /** Number of page buttons shown on each side of the current page. Defaults to 1. */
  siblingCount?: number;
  /** Optional content rendered beside the page controls. */
  summary?: React.ReactNode;
  /** Visible text for the previous-page button. */
  previousText?: string;
  /** Visible text for the next-page button. */
  nextText?: string;
  /** Disables page controls while an update is in progress. */
  disabled?: boolean;
  /**
   * Layout wrapper:
   * - `card` (default): standalone card for a list or grid.
   * - `plain`: unstyled wrapper for embedding in an existing footer or toolbar.
   */
  variant?: 'card' | 'plain';
}

/**
 * Reusable controlled pagination with a summary, page links, and
 * previous/next controls. Pass `page`, `totalPages`, and `onPageChange` from
 * the parent to synchronize the control with the displayed results.
 *
 * @example
 * <PaginationContainer
 *   page={page}
 *   totalPages={pagination.totalPages}
 *   onPageChange={setPage}
 *   previousText="Trước"
 *   nextText="Sau"
 *   summary={`Hiển thị ${firstItem} đến ${lastItem} trên tổng số ${total}`}
 * />
 */
function PaginationContainer({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  summary,
  previousText = 'Previous',
  nextText = 'Next',
  disabled = false,
  variant = 'card',
  className,
  ...props
}: PaginationContainerProps) {
  const currentPage =
    totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : 0;
  const pageRange = getPaginationRange(currentPage, totalPages, siblingCount);
  const canGoPrevious = !disabled && currentPage > 1;
  const canGoNext = !disabled && currentPage > 0 && currentPage < totalPages;

  const goToPage = (nextPage: number) => {
    if (
      disabled ||
      nextPage === currentPage ||
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return;
    }
    onPageChange(nextPage);
  };

  const controls = (
    <Pagination
      className={cn(
        'mx-0 min-w-0 justify-end',
        summary && pageRange.length > 0 ? 'w-auto' : 'w-full justify-center',
      )}
    >
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text={previousText}
            aria-disabled={!canGoPrevious}
            tabIndex={canGoPrevious ? undefined : -1}
            className={cn(
              !canGoPrevious && 'pointer-events-none opacity-50',
              variant === 'plain' && 'h-8 rounded-full pl-2!',
            )}
            onClick={(event) => {
              event.preventDefault();
              if (canGoPrevious) goToPage(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pageRange.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                aria-label={`Go to page ${item}`}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : undefined}
                className={cn(disabled && 'pointer-events-none opacity-50')}
                onClick={(event) => {
                  event.preventDefault();
                  goToPage(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            text={nextText}
            aria-disabled={!canGoNext}
            tabIndex={canGoNext ? undefined : -1}
            className={cn(
              !canGoNext && 'pointer-events-none opacity-50',
              variant === 'plain' && 'h-8 rounded-full pr-2!',
            )}
            onClick={(event) => {
              event.preventDefault();
              if (canGoNext) goToPage(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  const summaryNode = summary ? (
    <div className="text-muted-foreground text-sm">{summary}</div>
  ) : null;

  if (variant === 'plain') {
    return (
      <div
        data-slot="pagination-container"
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
          className,
        )}
        {...props}
      >
        {summaryNode}
        {controls}
      </div>
    );
  }

  return (
    <Card
      data-slot="pagination-container"
      className={cn('gap-0 p-2', className)}
      {...props}
    >
      <CardContent className="flex min-w-0 flex-wrap items-center justify-between gap-3 p-0">
        {summaryNode}
        {controls}
      </CardContent>
    </Card>
  );
}

export {
  getPaginationRange,
  Pagination,
  PaginationContainer,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
