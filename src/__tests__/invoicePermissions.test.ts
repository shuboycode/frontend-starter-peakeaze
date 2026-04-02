import { describe, it, expect } from 'vitest';
import {
  canCreate,
  canEdit,
  canDelete,
  allowedStatusOptions,
  isAllowedStatusChange,
  statusSortIndex,
  INVOICE_STATUS_ORDER,
} from '../rbac/invoicePermissions';
import type { InvoiceStatus } from '../rbac/invoicePermissions';

describe('canCreate', () => {
  it('Admin can create', () => expect(canCreate('Admin')).toBe(true));
  it('Accountant can create', () => expect(canCreate('Accountant')).toBe(true));
  it('Viewer cannot create', () => expect(canCreate('Viewer')).toBe(false));
  it('null cannot create', () => expect(canCreate(null)).toBe(false));
});

describe('canEdit', () => {
  it('Admin can edit', () => expect(canEdit('Admin')).toBe(true));
  it('Accountant can edit', () => expect(canEdit('Accountant')).toBe(true));
  it('Viewer cannot edit', () => expect(canEdit('Viewer')).toBe(false));
  it('null cannot edit', () => expect(canEdit(null)).toBe(false));
});

describe('canDelete', () => {
  it('Admin can delete', () => expect(canDelete('Admin')).toBe(true));
  it('Accountant cannot delete', () => expect(canDelete('Accountant')).toBe(false));
  it('Viewer cannot delete', () => expect(canDelete('Viewer')).toBe(false));
  it('null cannot delete', () => expect(canDelete(null)).toBe(false));
});

describe('allowedStatusOptions', () => {
  it('Draft → Sent for Admin', () => {
    expect(allowedStatusOptions('Admin', 'Draft')).toEqual(['Sent']);
  });

  it('Sent → Paid for Accountant', () => {
    expect(allowedStatusOptions('Accountant', 'Sent')).toEqual(['Paid']);
  });

  it('Paid has no transitions for Admin', () => {
    expect(allowedStatusOptions('Admin', 'Paid')).toEqual([]);
  });

  it('Viewer gets no options regardless of status', () => {
    expect(allowedStatusOptions('Viewer', 'Draft')).toEqual([]);
    expect(allowedStatusOptions('Viewer', 'Sent')).toEqual([]);
  });

  it('null role gets no options', () => {
    expect(allowedStatusOptions(null, 'Draft')).toEqual([]);
  });
});

describe('isAllowedStatusChange', () => {
  it('Draft → Sent is allowed for Admin', () => {
    expect(isAllowedStatusChange('Admin', 'Draft', 'Sent')).toBe(true);
  });

  it('Sent → Paid is allowed for Accountant', () => {
    expect(isAllowedStatusChange('Accountant', 'Sent', 'Paid')).toBe(true);
  });

  it('Draft → Paid (skipping Sent) is not allowed', () => {
    expect(isAllowedStatusChange('Admin', 'Draft', 'Paid')).toBe(false);
  });

  it('Viewer is always blocked', () => {
    expect(isAllowedStatusChange('Viewer', 'Draft', 'Sent')).toBe(false);
  });

  it('null role is always blocked', () => {
    expect(isAllowedStatusChange(null, 'Draft', 'Sent')).toBe(false);
  });
});

describe('statusSortIndex', () => {
  it('Draft sorts before Sent', () => {
    expect(statusSortIndex('Draft')).toBeLessThan(statusSortIndex('Sent'));
  });

  it('Sent sorts before Paid', () => {
    expect(statusSortIndex('Sent')).toBeLessThan(statusSortIndex('Paid'));
  });

  it('matches the INVOICE_STATUS_ORDER array', () => {
    const statuses: InvoiceStatus[] = ['Draft', 'Sent', 'Paid'];
    statuses.forEach((s) => {
      expect(statusSortIndex(s)).toBe(INVOICE_STATUS_ORDER.indexOf(s));
    });
  });
});
