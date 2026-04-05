import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress,
  Alert, Stack, TablePagination,
} from '@mui/material';
import { useGetNoticesQuery } from './notices-api';
import type { Notice } from './notices-api';

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6">{notice.title}</Typography>
          <Chip label={notice.status} color={statusColors[notice.status]} size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary" mt={1} noWrap>
          {notice.content}
        </Typography>
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          By {notice.createdBy.firstName} {notice.createdBy.lastName} ·
          Targets: {notice.targetRoles.join(', ')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function NoticesListPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useGetNoticesQuery({ page: page + 1, limit: 10 });

  return (
    <Box>
      <Typography variant="h5" mb={3}>Notices</Typography>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load notices</Alert>}

      {data?.data.map((notice) => <NoticeCard key={notice.id} notice={notice} />)}

      {data && (
        <TablePagination
          component="div"
          count={data.pagination.total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
        />
      )}
    </Box>
  );
}
