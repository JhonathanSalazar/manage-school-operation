import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Alert,
  TablePagination, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useGetStudentsQuery } from './students-api';

export default function StudentsListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useGetStudentsQuery({
    page: page + 1,
    limit: 20,
    search: search || undefined,
  });

  return (
    <Box>
      <Typography variant="h5" mb={3}>Students</Typography>

      <TextField
        placeholder="Search by name or code..."
        size="small"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ mb: 2, width: 320 }}
      />

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load students</Alert>}

      {data && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Guardian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.studentCode}</TableCell>
                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                    <TableCell>{student.class?.name ?? '—'}</TableCell>
                    <TableCell>{student.section?.name ?? '—'}</TableCell>
                    <TableCell>{student.guardianName}</TableCell>
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
