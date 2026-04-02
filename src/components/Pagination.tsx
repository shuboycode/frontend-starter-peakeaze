import { Box, Pagination as MuiPagination, Stack, Typography } from '@mui/material';

export function Pagination({
  page,
  totalPages,
  onPageChange
}: {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.max(1, Math.min(page, safeTotalPages));

  if (safeTotalPages <= 1) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary">
          Page <strong>{safePage}</strong> of <strong>{safeTotalPages}</strong>
        </Typography>
        <MuiPagination
          count={safeTotalPages}
          page={safePage}
          onChange={(_, val) => onPageChange(val)}
          shape="rounded"
          color="primary"
          siblingCount={1}
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 600,
              borderRadius: '8px'
            }
          }}
        />
      </Stack>
    </Box>
  );
}

