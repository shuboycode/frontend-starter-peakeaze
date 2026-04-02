import { authFetch, API_BASE } from './http';
import { normalizeInvoice, normalizeInvoicesListResponse } from './normalizers';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
};

export type ListInvoicesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus | '' | null;
};

export async function listInvoices(params: ListInvoicesParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = params.search ?? '';
  const status = params.status ?? '';

  const url = new URL('/api/invoices', API_BASE || window.location.origin);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('search', String(search));
  url.searchParams.set('status', String(status));

  // Use authFetch with absolute URL so querystring is preserved.
  const raw = await authFetch<unknown>(url.toString(), {}, true);
  return normalizeInvoicesListResponse(raw);
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const raw = await authFetch<unknown>(`${API_BASE}/api/invoices/${id}`, { method: 'GET' }, true);
  return normalizeInvoice(raw);
}

export async function createInvoice(payload: {
  customerName: string;
  amount: number;
}): Promise<Invoice> {
  const raw = await authFetch<unknown>(
    `${API_BASE}/api/invoices`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    },
    true
  );
  return normalizeInvoice(raw);
}

export async function updateInvoice(
  id: string,
  payload: Partial<{
    customerName: string;
    amount: number;
    status: InvoiceStatus;
  }>
): Promise<Invoice> {
  const raw = await authFetch<unknown>(
    `${API_BASE}/api/invoices/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    },
    true
  );
  return normalizeInvoice(raw);
}

export async function deleteInvoice(id: string): Promise<void> {
  await authFetch<unknown>(
    `${API_BASE}/api/invoices/${id}`,
    {
      method: 'DELETE'
    },
    true
  );
}

