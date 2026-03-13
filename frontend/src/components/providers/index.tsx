import { ReactNode } from 'react';

import { QueryProvider } from './queryProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return <QueryProvider>{children}</QueryProvider>;
};
