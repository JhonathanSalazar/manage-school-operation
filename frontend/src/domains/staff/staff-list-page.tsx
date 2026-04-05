import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Alert, TablePagination,
} from '@mui/material';
import { useGetStaffQuery } from './staff-api';

export default function StaffListPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useGetStaffQuery({ page: page + 1, limit: 20 });

  return (
    <Box>
      <Typography variant="h5" mb={3}>Staff</Typography>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load staff</Alert>}

      {data && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.employeeCode}</TableCell>
                    <TableCell>{s.user.firstName} {s.user.lastName}</TableCell>
                    <TableCell>{s.designation}</TableCell>
                    <TableCell>{s.department?.name ?? '—'}</TableCell>
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
