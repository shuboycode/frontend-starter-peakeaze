import type { Invoice as ApiInvoice } from './invoicesApi';

export type NormalizedInvoiceList<TInvoice> = {
  invoices: TInvoice[];
  page: number;
  limit: number;
  totalPages: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function toNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function coerceInvoice(raw: unknown): ApiInvoice | null {
  if (!isRecord(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const idRaw = obj.id;
  const invoiceNumberRaw = obj.invoiceNumber ?? obj.invoice_number ?? obj.number;
  const customerName = obj.customerName ?? obj.customer_name ?? obj.customer;
  const amountRaw = obj.amount;
  const statusRaw = obj.status;
  const createdAt = obj.createdAt ?? obj.created_at ?? obj.creationDate;

  const id = typeof idRaw === 'string' ? idRaw : typeof idRaw === 'number' ? String(idRaw) : null;
  const invoiceNumber =
    typeof invoiceNumberRaw === 'string'
      ? invoiceNumberRaw
      : typeof invoiceNumberRaw === 'number'
        ? String(invoiceNumberRaw)
        : null;

  const amount =
    typeof amountRaw === 'number'
      ? amountRaw
      : typeof amountRaw === 'string' && amountRaw.trim() !== ''
        ? Number.parseFloat(amountRaw)
        : NaN;

  const status = typeof statusRaw === 'string' ? statusRaw : null;

  // Normalize createdAt: accept ISO strings, numeric strings (ms timestamp), or numbers.
  let normalizedCreatedAt: string | null = null;
  if (typeof createdAt === 'number' && Number.isFinite(createdAt)) {
    normalizedCreatedAt = new Date(createdAt).toISOString();
  } else if (typeof createdAt === 'string' && createdAt.trim() !== '') {
    const asNum = Number(createdAt);
    normalizedCreatedAt = Number.isFinite(asNum)
      ? new Date(asNum).toISOString()
      : createdAt;
  }

  const allowedStatuses: ApiInvoice['status'][] = ['Draft', 'Sent', 'Paid'];

  if (!id) return null;
  if (!invoiceNumber) return null;
  if (typeof customerName !== 'string') return null;
  if (!Number.isFinite(amount)) return null;
  if (!status || !allowedStatuses.includes(status as ApiInvoice['status'])) return null;
  if (!normalizedCreatedAt) return null;

  return {
    id,
    invoiceNumber,
    customerName,
    amount,
    status: status as ApiInvoice['status'],
    createdAt: normalizedCreatedAt
  };
}

function inferTotalPages(args: { totalCount?: number; limit: number; totalPages?: number }) {
  const { totalCount, limit, totalPages } = args;
  if (typeof totalPages === 'number' && Number.isFinite(totalPages)) return totalPages;
  if (typeof totalCount === 'number' && Number.isFinite(totalCount) && limit > 0) {
    return Math.max(1, Math.ceil(totalCount / limit));
  }
  return 1;
}

export function normalizeInvoicesListResponse(
  raw: unknown
): NormalizedInvoiceList<ApiInvoice> {
  // Common shapes from Express/Nest/Next:
  // - { invoices, page, limit, totalPages }
  // - { data, meta: { page, limit, totalPages } }
  // - { items, page, limit, totalCount }
  const root = isRecord(raw) ? (raw as Record<string, unknown>) : {};

  const maybeInvoices = root.invoices ?? root.data ?? root.items;
  const invoicesArray = Array.isArray(maybeInvoices) ? maybeInvoices : [];

  const normalizedInvoices = invoicesArray
    .map((x) => coerceInvoice(x))
    .filter((x): x is ApiInvoice => x !== null);

  const page =
    typeof root.page === 'number'
      ? root.page
      : isRecord(root.meta)
        ? toNumber((root.meta as Record<string, unknown>).page, 1)
        : isRecord(root.pagination)
          ? toNumber((root.pagination as Record<string, unknown>).page, 1)
          : 1;

  const limit =
    typeof root.limit === 'number'
      ? root.limit
      : isRecord(root.meta)
        ? toNumber((root.meta as Record<string, unknown>).limit, 10)
        : isRecord(root.pagination)
          ? toNumber((root.pagination as Record<string, unknown>).limit, 10)
          : 10;

  const totalPagesFromRoot = typeof root.totalPages === 'number' ? root.totalPages : undefined;
  const totalCountFromRoot = typeof root.totalCount === 'number' ? root.totalCount : undefined;

  let metaTotalPages: number | undefined;
  let metaTotalCount: number | undefined;
  if (isRecord(root.meta)) {
    const meta = root.meta as Record<string, unknown>;
    if (typeof meta.totalPages === 'number') metaTotalPages = meta.totalPages;
    if (typeof meta.totalCount === 'number') metaTotalCount = meta.totalCount;
  }

  const totalPages = inferTotalPages({
    totalPages: totalPagesFromRoot ?? metaTotalPages,
    totalCount: totalCountFromRoot ?? metaTotalCount,
    limit
  });

  return {
    invoices: normalizedInvoices,
    page,
    limit,
    totalPages
  };
}

export function normalizeInvoice(raw: unknown): ApiInvoice {
  const invoice = coerceInvoice(raw);
  if (!invoice) {
    throw new Error('Failed to normalize invoice response.');
  }
  return invoice;
}

