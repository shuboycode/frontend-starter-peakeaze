import { memo } from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Invoice } from '../api/invoicesApi';

const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

function formatMoney(amount: number) {
  return currencyFormatter.format(amount);
}

function useStatusColors() {
  const { palette: { mode } } = useTheme();
  const isDark = mode === 'dark';
  return {
    accent: {
      Draft: isDark ? '#6B7280' : '#9CA3AF',
      Sent: '#F59E0B',
      Paid: '#10B981',
    } as Record<Invoice['status'], string>,
    chip: {
      Draft: { bgcolor: isDark ? 'rgba(55,65,81,0.4)' : '#F3F4F6', color: isDark ? '#D1D5DB' : '#374151' },
      Sent: { bgcolor: isDark ? 'rgba(245,158,11,0.18)' : '#FEF3C7', color: isDark ? '#FCD34D' : '#92400E' },
      Paid: { bgcolor: isDark ? 'rgba(16,185,129,0.18)' : '#D1FAE5', color: isDark ? '#34D399' : '#065F46' },
    } as Record<Invoice['status'], { bgcolor: string; color: string }>,
  };
}

export const InvoiceCards = memo(function InvoiceCards({
  invoices,
  onView
}: {
  invoices: Invoice[];
  onView: (invoiceId: string) => void;
}) {
  const { accent, chip } = useStatusColors();
  return (
    <Stack spacing={1.5}>
      {invoices.map((inv) => (
        <Card
          key={inv.id}
          sx={{
            borderLeft: `4px solid ${accent[inv.status]}`,
            '&:hover': { boxShadow: 3 },
            transition: 'box-shadow 0.15s'
          }}
        >
          <CardContent sx={{ p: '14px 16px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip
                    size="small"
                    label={inv.status}
                    sx={{ ...chip[inv.status], fontWeight: 700, fontSize: '0.7rem', border: 'none' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(inv.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                  </Typography>
                </Stack>
                <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{inv.invoiceNumber}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{inv.customerName}</Typography>
              </Box>

              <Stack alignItems="flex-end" spacing={1} sx={{ ml: 2, flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'monospace' }}>
                  {formatMoney(inv.amount)}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onView(inv.id)}
                  sx={{ borderRadius: '12px', fontSize: '0.75rem', px: 2 }}
                >
                  View
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
});

