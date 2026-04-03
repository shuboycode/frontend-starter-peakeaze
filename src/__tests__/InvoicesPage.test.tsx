import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../theme';
import { InvoicesPage } from '../pages/InvoicesPage';
import * as AuthContext from '../auth/AuthContext';
import * as invoicesApi from '../api/invoicesApi';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const INVOICE_STUB = {
  id: '1',
  invoiceNumber: 'INV-001',
  customerName: 'Test Customer',
  amount: 1200,
  status: 'Draft' as const,
  createdAt: '2024-01-15T10:00:00.000Z',
};

function makeAuthValue(role: 'Admin' | 'Accountant' | 'Viewer' | null = 'Admin') {
  return {
    token: 'tok',
    user: { email: 'user@test.com' },
    role,
    loading: false,
    error: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    reloadMe: vi.fn(),
  };
}

function renderInvoicesPage(role: 'Admin' | 'Accountant' | 'Viewer' | null = 'Admin') {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthValue(role));
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <InvoicesPage />
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockNavigate.mockReset();
});

describe('InvoicesPage – role-based "New Invoice" button visibility', () => {
  it('Admin sees the New Invoice button', async () => {
    vi.spyOn(invoicesApi, 'listInvoices').mockResolvedValue({
      invoices: [INVOICE_STUB],
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    renderInvoicesPage('Admin');
    await waitFor(() => expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument());
  });

  it('Accountant sees the New Invoice button', async () => {
    vi.spyOn(invoicesApi, 'listInvoices').mockResolvedValue({
      invoices: [INVOICE_STUB],
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    renderInvoicesPage('Accountant');
    await waitFor(() => expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument());
  });

  it('Viewer does NOT see the New Invoice button', async () => {
    vi.spyOn(invoicesApi, 'listInvoices').mockResolvedValue({
      invoices: [INVOICE_STUB],
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    renderInvoicesPage('Viewer');
    await waitFor(() => expect(screen.queryByRole('button', { name: /new invoice/i })).not.toBeInTheDocument());
  });
});

describe('InvoicesPage – empty state', () => {
  it('shows empty state when no invoices are returned', async () => {
    vi.spyOn(invoicesApi, 'listInvoices').mockResolvedValue({
      invoices: [],
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    renderInvoicesPage('Admin');
    await waitFor(() => expect(screen.getByText('No invoices found')).toBeInTheDocument());
  });
});

describe('InvoicesPage – invoice data display', () => {
  it('renders invoice rows after loading', async () => {
    vi.spyOn(invoicesApi, 'listInvoices').mockResolvedValue({
      invoices: [INVOICE_STUB],
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    renderInvoicesPage('Admin');
    await waitFor(() => expect(screen.getAllByText('INV-001').length).toBeGreaterThan(0));
  });
});
