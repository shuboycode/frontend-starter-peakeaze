import type React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Root } from '../Root';
import { theme } from '../theme';

function renderWithTheme(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>
  );
}

describe('Root', () => {
  it('renders the app brand name', async () => {
    renderWithTheme(<Root />);
    await waitFor(() => expect(screen.getAllByText(/PeakEaze/i).length).toBeGreaterThan(0));
  });
});
