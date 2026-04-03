import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Root } from './Root';
import { ThemeModeProvider } from './context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // cache is fresh for 5 minutes
      gcTime: 10 * 60 * 1000,   // keep unused cache for 10 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <Root />
      </ThemeModeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
