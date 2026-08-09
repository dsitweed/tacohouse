import { ReactNode } from 'react';

import { Toaster } from '../ui';
import { QueryProvider } from './queryProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
};
