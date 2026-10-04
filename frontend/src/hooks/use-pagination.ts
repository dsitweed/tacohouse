import { useState } from 'react';

import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';

export function usePagination(
  filtersKey: string,
  limit: number = DEFAULT_PAGE_SIZE,
) {
  const [page, setPage] = useState(1);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);

  if (prevFiltersKey !== filtersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  return { page, setPage, limit };
}
