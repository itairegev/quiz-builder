'use client';

import React from 'react';
import { AppProvider } from '@shopify/polaris';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider
      i18n={{
        Polaris: {
          Common: {
            close: 'Close',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            remove: 'Remove',
            search: 'Search',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            warning: 'Warning',
            info: 'Information',
          },
        },
      }}
    >
      {children}
    </AppProvider>
  );
}
