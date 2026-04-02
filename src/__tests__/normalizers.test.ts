import { describe, it, expect } from 'vitest';
import { normalizeInvoicesListResponse } from '../api/normalizers';

const VALID_INVOICE = {
  id: '1',
  invoiceNumber: 'INV-001',
  customerName: 'Acme Corp',
  amount: 500,
  status: 'Draft',
  createdAt: '2024-01-15T10:00:00.000Z',
};

describe('normalizeInvoicesListResponse – shape { invoices, page, limit, totalPages }', () => {
  it('parses the standard shape correctly', () => {
    const raw = { invoices: [VALID_INVOICE], page: 1, limit: 10, totalPages: 3 };
    const result = normalizeInvoicesListResponse(raw);
    expect(result.invoices).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
    expect(result.invoices[0].invoiceNumber).toBe('INV-001');
  });
});

describe('normalizeInvoicesListResponse – shape { data, meta }', () => {
  it('parses the data/meta shape correctly', () => {
    const raw = {
      data: [VALID_INVOICE],
      meta: { page: 2, limit: 5, totalPages: 4 },
    };
    const result = normalizeInvoicesListResponse(raw);
    expect(result.invoices).toHaveLength(1);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.totalPages).toBe(4);
  });
});

describe('normalizeInvoicesListResponse – shape { items, totalCount }', () => {
  it('infers totalPages from totalCount / limit', () => {
    const raw = { items: [VALID_INVOICE], page: 1, limit: 10, totalCount: 25 };
    const result = normalizeInvoicesListResponse(raw);
    expect(result.invoices).toHaveLength(1);
    expect(result.totalPages).toBe(3); // ceil(25/10)
  });
});

describe('normalizeInvoicesListResponse – edge cases', () => {
  it('returns empty invoices for empty list', () => {
    const result = normalizeInvoicesListResponse({ invoices: [], page: 1, limit: 10, totalPages: 0 });
    expect(result.invoices).toHaveLength(0);
  });

  it('returns empty invoices for missing list field', () => {
    const result = normalizeInvoicesListResponse({});
    expect(result.invoices).toHaveLength(0);
  });

  it('silently drops malformed invoice entries', () => {
    const raw = {
      invoices: [
        VALID_INVOICE,
        { id: '2' }, // missing required fields
        null,
        'string item',
        { ...VALID_INVOICE, id: '3', status: 'UNKNOWN_STATUS' },
      ],
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    const result = normalizeInvoicesListResponse(raw);
    expect(result.invoices).toHaveLength(1);
    expect(result.invoices[0].id).toBe('1');
  });
});

describe('normalizeInvoicesListResponse – Unix ms timestamp string coercion', () => {
  it('converts a numeric string createdAt to ISO format', () => {
    const ms = 1775116100060;
    const raw = {
      invoices: [{ ...VALID_INVOICE, createdAt: String(ms) }],
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    const result = normalizeInvoicesListResponse(raw);
    expect(result.invoices).toHaveLength(1);
    expect(result.invoices[0].createdAt).toBe(new Date(ms).toISOString());
  });

  it('converts a numeric createdAt number directly to ISO format', () => {
    const ms = 1775116100060;
    const raw = {
      invoices: [{ ...VALID_INVOICE, createdAt: ms }],
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    const result = normalizeInvoicesListResponse(raw);
    expect(result.invoices[0].createdAt).toBe(new Date(ms).toISOString());
  });
});
