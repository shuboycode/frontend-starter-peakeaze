import {
  Box,
  Button,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import type { Invoice } from '../api/invoicesApi';

const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

function formatMoney(amount: number) {
  return currencyFormatter.format(amount);
}

type StatusStyle = { bgcolor: string; color: string };

function useStatusStyle() {
  const { palette: { mode } } = useTheme();
  const isDark = mode === 'dark';
  return (status: Invoice['status']): StatusStyle => {
    switch (status) {
      case 'Draft': return { bgcolor: isDark ? 'rgba(55,65,81,0.4)' : '#F3F4F6', color: isDark ? '#D1D5DB' : '#374151' };
      case 'Sent': return { bgcolor: isDark ? 'rgba(245,158,11,0.18)' : '#FEF3C7', color: isDark ? '#FCD34D' : '#92400E' };
      case 'Paid': return { bgcolor: isDark ? 'rgba(16,185,129,0.18)' : '#D1FAE5', color: isDark ? '#34D399' : '#065F46' };
      default: return { bgcolor: isDark ? 'rgba(55,65,81,0.4)' : '#F3F4F6', color: isDark ? '#D1D5DB' : '#374151' };
    }
  };
}

export const InvoiceTable = memo(function InvoiceTable({
  invoices,
  onView
}: {
  invoices: Invoice[];
  onView: (invoiceId: string) => void;
}) {
  const statusStyle = useStatusStyle();
  return (
    <TableContainer component={Card}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Invoice #</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} sx={{ cursor: 'default' }}>
              <TableCell>
                <Chip
                  size="small"
                  label={inv.status}
                  sx={{ ...statusStyle(inv.status), fontWeight: 700, fontSize: '0.72rem', border: 'none' }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{inv.invoiceNumber}</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{inv.customerName}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatMoney(inv.amount)}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {new Date(inv.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onView(inv.id)}
                    sx={{ borderRadius: '12px', fontSize: '0.78rem', px: 2 }}
                  >
                    View
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

