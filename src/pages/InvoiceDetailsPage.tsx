import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { deleteInvoice, getInvoiceById, updateInvoice, type Invoice } from '../api/invoicesApi';
import { ApiError } from '../api/http';
import { useAuth } from '../auth/AuthContext';
import { allowedStatusOptions, canDelete, canEdit } from '../rbac/invoicePermissions';
import { InvoiceFormDialog } from '../components/InvoiceFormDialog';

export function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const { palette: { mode } } = useTheme();
  const isDark = mode === 'dark';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<Invoice['status'] | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const res = await getInvoiceById(id);
        if (cancelled) return;
        setInvoice(res);
        setSelectedStatus(res.status);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setError(e instanceof Error ? e.message : 'Failed to load invoice.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [id, logout, navigate]);

  const canUpdate = canEdit(role);
  const canRemove = canDelete(role);

  const statusOptions = invoice
    ? Array.from(new Set([invoice.status, ...allowedStatusOptions(role, invoice.status)]))
    : ([] as Invoice['status'][]);

  const statusChipProps = (s: Invoice['status']): { bg: string; textColor: string } => {
    switch (s) {
      case 'Draft': return { bg: isDark ? 'rgba(55,65,81,0.4)' : '#F3F4F6', textColor: isDark ? '#D1D5DB' : '#374151' };
      case 'Sent': return { bg: isDark ? 'rgba(245,158,11,0.18)' : '#FEF3C7', textColor: isDark ? '#FCD34D' : '#92400E' };
      case 'Paid': return { bg: isDark ? 'rgba(16,185,129,0.18)' : '#D1FAE5', textColor: isDark ? '#34D399' : '#065F46' };
      default: return { bg: isDark ? 'rgba(55,65,81,0.4)' : '#F3F4F6', textColor: isDark ? '#D1D5DB' : '#374151' };
    }
  };

  const onSaveStatus = async () => {
    if (!invoice || !selectedStatus) return;
    if (!canUpdate) return;

    setStatusUpdating(true);
    setError(null);
    try {
      const updated = await updateInvoice(invoice.id, { status: selectedStatus });
      setInvoice(updated);
      setSelectedStatus(updated.status);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <Box sx={{ pt: 3 }}>
      {/* Breadcrumb */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2.5 }}>
        <Typography
          variant="body2"
          sx={{ cursor: 'pointer', color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}
          onClick={() => navigate('/invoices')}
        >
          Invoices
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {invoice ? invoice.invoiceNumber : id}
        </Typography>
      </Breadcrumbs>

      {/* Top action row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Invoice detail</Typography>
          {invoice ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
              <Chip
                label={invoice.status}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  bgcolor: statusChipProps(invoice.status).bg,
                  color: statusChipProps(invoice.status).textColor,
                  border: 'none'
                }}
              />
              <Typography variant="body2" color="text.secondary">{invoice.invoiceNumber}</Typography>
            </Stack>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" size="medium" onClick={() => navigate('/invoices')} sx={{ borderRadius: '12px' }}>
            Back
          </Button>
          {canUpdate ? (
            <Button variant="contained" size="medium" onClick={() => setEditOpen(true)} sx={{ borderRadius: '12px' }}>
              Edit
            </Button>
          ) : null}
          {canRemove ? (
            <Button variant="outlined" color="error" size="medium" onClick={() => setDeleteOpen(true)} sx={{ borderRadius: '12px' }}>
              Delete
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      ) : null}

      {loading && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Skeleton variant="text" width="30%" height={32} />
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" width="48%" height={72} />
                <Skeleton variant="rounded" width="48%" height={72} />
              </Stack>
              <Skeleton variant="rounded" width="100%" height={56} />
              <Skeleton variant="text" width="25%" />
            </Stack>
          </CardContent>
        </Card>
      )}
      {!loading && invoice && (
        <Card sx={{ overflow: 'hidden' }}>
          {/* Hero amount section */}
          <Box sx={{
            background: 'linear-gradient(135deg, #5C4EE8 0%, #4538C7 100%)',
            position: 'relative',
            overflow: 'hidden',
            px: { xs: 2.5, sm: 3 },
            py: { xs: 2.5, sm: 3 }
          }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <Box sx={{ position: 'absolute', bottom: -20, right: 60, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                  Total amount
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1 }}>
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(invoice.amount)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                  Invoice
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{invoice.invoiceNumber}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', mt: 0.25 }}>
                  {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Detail rows */}
          <Stack spacing={0} divider={<Divider />} sx={{ px: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minWidth: 120 }}>Customer</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'right' }}>{invoice.customerName}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minWidth: 120 }}>Status</Typography>
              <Chip
                label={invoice.status}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  bgcolor: statusChipProps(invoice.status).bg,
                  color: statusChipProps(invoice.status).textColor,
                }}
              />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minWidth: 120 }}>Invoice #</Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>{invoice.invoiceNumber}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, minWidth: 120 }}>Created</Typography>
              <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                {new Date(invoice.createdAt).toLocaleString()}
              </Typography>
            </Stack>

            {canUpdate ? (
              <Box sx={{ py: 2.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>Update status</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                  <FormControl sx={{ minWidth: 160 }} size="small">
                    <Select
                      value={selectedStatus ?? invoice.status}
                      displayEmpty
                      disabled={!canUpdate || statusOptions.length <= 1 || statusUpdating}
                      onChange={(e) => setSelectedStatus(e.target.value as Invoice['status'])}
                    >
                      {statusOptions.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={onSaveStatus}
                    disabled={statusUpdating || !selectedStatus || selectedStatus === invoice.status}
                    sx={{ borderRadius: '12px', px: 2.5 }}
                  >
                    {statusUpdating ? (
                      <><CircularProgress size={12} sx={{ mr: 1 }} />Saving…</>
                    ) : 'Save status'}
                  </Button>
                </Stack>

                {statusOptions.length <= 1 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontSize: '0.8rem' }}>
                    No further transitions available from <strong>{invoice.status}</strong>.
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </Stack>
        </Card>
      )}

      {invoice ? (
        <InvoiceFormDialog
          mode="edit"
          open={editOpen}
          role={role}
          invoice={invoice}
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) => {
            setInvoice(updated);
            setSelectedStatus(updated.status);
          }}
        />
      ) : null}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#EF4444' }} />
          </Box>
          Delete invoice?
        </DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{deleteError}</Alert>
          ) : null}
          <Typography color="text.secondary" variant="body2">
            This will permanently delete <strong>{invoice?.invoiceNumber}</strong>. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={statusUpdating} sx={{ borderRadius: '12px' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!invoice || statusUpdating}
            sx={{ borderRadius: '12px' }}
            onClick={async () => {
              if (!invoice) return;
              setDeleteError(null);
              setStatusUpdating(true);
              try {
                await deleteInvoice(invoice.id);
                setDeleteOpen(false);
                navigate('/invoices', { replace: true });
              } catch (e) {
                if (e instanceof ApiError && e.status === 401) { logout(); navigate('/login', { replace: true }); return; }
                setDeleteError(e instanceof Error ? e.message : 'Failed to delete invoice.');
              } finally {
                setStatusUpdating(false);
              }
            }}
          >
            {statusUpdating ? <><CircularProgress size={14} sx={{ mr: 1 }} />Deleting…</> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
