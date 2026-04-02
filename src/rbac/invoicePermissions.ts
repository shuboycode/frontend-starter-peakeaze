import type { Role } from './roles';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

const STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  Draft: ['Sent'],
  Sent: ['Paid'],
  Paid: []
};

function canCreateInvoice(role: Role | null | undefined) {
  return role === 'Admin' || role === 'Accountant';
}

function canEditInvoice(role: Role | null | undefined) {
  return role === 'Admin' || role === 'Accountant';
}

function canDeleteInvoice(role: Role | null | undefined) {
  return role === 'Admin';
}

function canChangeInvoiceStatus(role: Role | null | undefined) {
  return role === 'Admin' || role === 'Accountant';
}

export function getAllowedStatusTransitions(
  role: Role | null | undefined,
  fromStatus: InvoiceStatus
): InvoiceStatus[] {
  if (!canChangeInvoiceStatus(role)) return [];
  return STATUS_TRANSITIONS[fromStatus];
}

/**
 * UI helper: returns the full list of statuses the UI should allow selecting
 * based on current status and the logged-in user's role.
 */
export function allowedStatusOptions(
  role: Role | null | undefined,
  currentStatus: InvoiceStatus
): InvoiceStatus[] {
  // Typically UI uses dropdown options; we only want "next" statuses.
  return getAllowedStatusTransitions(role, currentStatus);
}

export function canCreate(role: Role | null | undefined) {
  return canCreateInvoice(role);
}

export function canEdit(role: Role | null | undefined) {
  return canEditInvoice(role);
}

export function canDelete(role: Role | null | undefined) {
  return canDeleteInvoice(role);
}

export const INVOICE_STATUS_ORDER: InvoiceStatus[] = ['Draft', 'Sent', 'Paid'];

export function statusSortIndex(status: InvoiceStatus) {
  return INVOICE_STATUS_ORDER.indexOf(status);
}

/**
 * Business rule guard: whether an attempted status change is allowed.
 * This can be used to validate user actions before calling the backend.
 */
export function isAllowedStatusChange(
  role: Role | null | undefined,
  fromStatus: InvoiceStatus,
  toStatus: InvoiceStatus
): boolean {
  if (!canChangeInvoiceStatus(role)) return false;
  return STATUS_TRANSITIONS[fromStatus].includes(toStatus);
}

