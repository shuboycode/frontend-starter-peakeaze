import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { listInvoices, type InvoiceStatus } from '../api/invoicesApi';
import { ApiError } from '../api/http';
import { statusSortIndex, canCreate } from '../rbac/invoicePermissions';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoiceCards } from '../components/InvoiceCards';
import { Pagination } from '../components/Pagination';
import { InvoiceFormDialog } from '../components/InvoiceFormDialog';

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <Card sx={{ flex: 1, minWidth: 0, borderLeft: `4px solid ${accent}` }}>
      <CardContent sx={{ p: '16px 20px !important' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: 'text.primary', lineHeight: 1.2 }}>{value}</Typography>
        {sub ? <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>{sub}</Typography> : null}
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        {['sk-a', 'sk-b', 'sk-c', 'sk-d', 'sk-e'].map((key) => (
          <Box key={key} sx={{ display: 'flex', gap: 2, px: 3, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
            <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: 8 }} />
            <Skeleton variant="text" width="16%" />
            <Skeleton variant="text" width="22%" />
            <Skeleton variant="text" width="12%" sx={{ ml: 'auto' }} />
            <Skeleton variant="text" width="14%" />
            <Skeleton variant="rounded" width={60} height={28} sx={{ borderRadius: 50 }} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent>
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '18px',
            background: '#EEF0FD',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ReceiptLongOutlinedIcon sx={{ fontSize: 30, color: '#5C4EE8' }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>No invoices found</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.9rem' }}>
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function InvoicesPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const { role, logout } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const queryKey = ['invoices', { page, limit, search: debouncedSearch, status }] as const;

  const { data, isLoading, error: queryError } = useQuery({
    queryKey,
    queryFn: () => listInvoices({ page, limit, search: debouncedSearch, status }),
    placeholderData: (prev) => prev, // keep showing old data while fetching new page
    throwOnError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        logout();
        navigate('/login', { replace: true });
      }
      return false;
    },
  });

  // Prefetch next page so navigation feels instant
  useEffect(() => {
    const totalPages = data?.totalPages ?? 1;
    if (page < totalPages) {
      void queryClient.prefetchQuery({
        queryKey: ['invoices', { page: page + 1, limit, search: debouncedSearch, status }],
        queryFn: () => listInvoices({ page: page + 1, limit, search: debouncedSearch, status }),
      });
    }
  }, [page, limit, debouncedSearch, status, data?.totalPages, queryClient]);

  const invoices = data?.invoices ?? [];
  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading;
  const error = queryError instanceof Error ? queryError.message : queryError ? 'Failed to load invoices.' : null;

  const sortedInvoices = useMemo(() => {
    const safe = [...invoices];
    safe.sort((a, b) => {
      const byStatus = statusSortIndex(a.status) - statusSortIndex(b.status);
      if (byStatus !== 0) return byStatus;
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
    return safe;
  }, [invoices]);

  // Stats derived from current page data
  const totalAmount = useMemo(() => invoices.reduce((s, inv) => s + inv.amount, 0), [invoices]);
  const draftCount = useMemo(() => invoices.filter((i) => i.status === 'Draft').length, [invoices]);
  const paidCount = useMemo(() => invoices.filter((i) => i.status === 'Paid').length, [invoices]);

  const canUserCreate = canCreate(role);
  const onViewInvoice = useCallback((id: string) => navigate(`/invoices/${id}`), [navigate]);

  return (
    <Box sx={{ pt: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Invoices</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.9rem' }}>
              Manage and track all your invoices
            </Typography>
          </Box>
          {canUserCreate ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: '12px', whiteSpace: 'nowrap' }}
            >
              New Invoice
            </Button>
          ) : null}
        </Stack>

        {/* Stats row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard
            label="Total this page"
            value={String(invoices.length)}
            sub={`${draftCount} Draft · ${paidCount} Paid`}
            accent="#5C4EE8"
          />
          <StatCard
            label="Page amount"
            value={totalAmount.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            accent="#10B981"
          />
          <StatCard
            label="Current page"
            value={`${page} / ${totalPages}`}
            sub={`${limit} per page`}
            accent="#F59E0B"
          />
        </Stack>

        {/* Filter toolbar */}
        <Card>
          <CardContent sx={{ p: '10px 16px !important' }}>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={1} alignItems={isMobile ? 'stretch' : 'center'}>
              <TextField
                placeholder="Search by customer name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth={isMobile}
                size="small"
                sx={{ flex: isMobile ? undefined : 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />
              <FormControl sx={{ minWidth: isMobile ? '100%' : 180 }} size="small">
                <Select
                  value={status}
                  displayEmpty
                  onChange={(e) => { setStatus(e.target.value as InvoiceStatus | ''); setPage(1); }}
                >
                  <MenuItem value="">All statuses</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Sent">Sent</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Error */}
        {error ? (
          <Box sx={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2, px: 2, py: 1.5 }}>
            <Typography color="error" role="alert" variant="body2">{error}</Typography>
          </Box>
        ) : null}

        {/* Content */}
        {(() => {
          if (loading) return <TableSkeleton />;
          if (sortedInvoices.length === 0) return <EmptyState />;
          if (isMobile) return <InvoiceCards invoices={sortedInvoices} onView={onViewInvoice} />;
          return <InvoiceTable invoices={sortedInvoices} onView={onViewInvoice} />;
        })()}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Stack>

      <InvoiceFormDialog
        mode="create"
        open={createOpen}
        role={role}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => {
          void queryClient.invalidateQueries({ queryKey: ['invoices'] });
          navigate(`/invoices/${created.id}`, { replace: true });
        }}
      />
    </Box>
  );
}
