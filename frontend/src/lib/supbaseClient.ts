import { createClient } from '@supabase/supabase-js';

const DEFAULT_LIMIT = 10;

export const supabaseCLient = createClient(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
  `${process.env.NEXT_PUBLIC_API_KEY}`,
);

export const generatePagination = (page: number, total: number) => {
  const totalPages = Math.ceil(total / DEFAULT_LIMIT);

  return {
    page,
    limit: DEFAULT_LIMIT,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
