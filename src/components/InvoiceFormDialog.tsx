import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { createInvoice, updateInvoice, type Invoice } from '../api/invoicesApi';
import type { Role } from '../rbac/roles';
import { canCreate, canEdit } from '../rbac/invoicePermissions';
import { parseMoney, validateCustomerName } from '../validation/validators';

type CreateDialogProps = {
  mode: 'create';
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onCreated: (invoice: Invoice) => void;
};

type EditDialogProps = {
  mode: 'edit';
  open: boolean;
  role: Role | null;
  invoice: Invoice;
  onClose: () => void;
  onUpdated: (invoice: Invoice) => void;
};

export function InvoiceFormDialog(props: CreateDialogProps | EditDialogProps) {
  const { open, onClose, role, mode } = props;
  const existingInvoice = mode === 'edit' ? (props as EditDialogProps).invoice : null;
  const onCreated = mode === 'create' ? (props as CreateDialogProps).onCreated : null;
  const onUpdated = mode === 'edit' ? (props as EditDialogProps).onUpdated : null;

  const [customerName, setCustomerName] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const isCreate = mode === 'create';

  useEffect(() => {
    if (!open) return;

    setError(null);
    if (isCreate) {
      setCustomerName('');
      setAmountStr('');
      return;
    }

    setCustomerName(existingInvoice?.customerName ?? '');
    setAmountStr(String(existingInvoice?.amount ?? ''));
  }, [open, isCreate, existingInvoice]);

  const permitted = isCreate ? canCreate(role) : canEdit(role);
  const submitLabel = isCreate ? 'Create' : 'Save changes';

  const customerError = validateCustomerName(customerName);
  const { value: amount, error: amountError } = parseMoney(amountStr);
  const amountValid = amountError === null;
  const customerValid = customerError === null;

  const customerErrorForUi = customerName.trim().length > 0 ? customerError : null;
  const amountErrorForUi = amountStr.trim().length > 0 ? amountError : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitted) return;
    setError(null);

    if (!customerValid) {
      setError(customerError ?? 'Customer name is required.');
      return;
    }

    if (!amountValid) {
      setError(amountError ?? 'Invoice amount must be a number greater than 0.');
      return;
    }

    if (amount === null) {
      setError(amountError ?? 'Invoice amount is invalid.');
      return;
    }

    setSubmitting(true);
    try {
      if (isCreate) {
        const created = await createInvoice({ customerName: customerName.trim(), amount });
        onCreated?.(created);
      } else {
        const updated = await updateInvoice(existingInvoice!.id, {
          customerName: customerName.trim(),
          amount
        });
        onUpdated?.(updated);
      }
      onClose();
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Failed to submit invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => { if (!submitting) onClose(); }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isCreate ? 'New invoice' : 'Edit invoice'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontWeight: 400 }}>
          {isCreate ? 'Fill in the details to create a new draft invoice.' : 'Update the invoice details below.'}
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {permitted ? null : (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              You don&apos;t have permission to perform this action.
            </Alert>
          )}

          <Stack spacing={1.5}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Customer name</Typography>
              <TextField
                placeholder="e.g. Acme Corporation"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                fullWidth
                size="small"
                disabled={submitting}
                error={!!customerErrorForUi}
                helperText={customerErrorForUi ?? ' '}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Amount</Typography>
              <TextField
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                fullWidth
                size="small"
                inputMode="decimal"
                disabled={submitting}
                error={!!amountErrorForUi}
                helperText={amountErrorForUi ?? ' '}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>$</Typography>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {error ? (
              <Alert severity="error" role="alert" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button onClick={onClose} disabled={submitting} sx={{ borderRadius: '12px' }}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={submitting || !permitted} sx={{ borderRadius: '12px' }}>
            {submitting ? (
              <><CircularProgress size={16} sx={{ mr: 1 }} />Saving...</>
            ) : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}