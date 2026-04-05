import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert,
  TablePagination,
} from '@mui/material';
import { useGetUsersQuery } from './users-api';

const roleColors: Record<string, 'primary' | 'secondary' | 'default' | 'success'> = {
  admin: 'primary',
  teacher: 'secondary',
  student: 'success',
  custom: 'default',
};

export default function UsersListPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useGetUsersQuery({ page: page + 1, limit: 20 });

  return (
    <Box>
      <Typography variant="h5" mb={3}>User Management</Typography>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load users</Alert>}

      {data && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>
                      <Chip label={user.role} color={roleColors[user.role] ?? 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data.pagination.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
          />
        </>
      )}
    </Box>
  );
}
