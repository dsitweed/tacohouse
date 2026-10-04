import { PaginationMeta } from 'types';

type PaginationInput = {
  page: number;
  limit: number;
  total: number;
  /** Overrides the default `page < totalPages` value for cursor-style lists. */
  hasNext?: boolean;
};

export function buildPaginationMeta({
  page,
  limit,
  total,
  hasNext,
}: PaginationInput): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: hasNext ?? page < totalPages,
    hasPrev: page > 1,
    firstItem: total === 0 ? 0 : (page - 1) * limit + 1,
    lastItem: Math.min(page * limit, total),
  };
}
