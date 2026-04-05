import { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  CircularProgress, Alert,
} from '@mui/material';
import { useGetLeaveRequestsQuery } from './leave-api';

const statusColors: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export default function LeavePage() {
  const [tab, setTab] = useState(0);
  const status = tab === 0 ? undefined : tab === 1 ? 'pending' : tab === 2 ? 'approved' : 'rejected';

  const { data, isLoading, isError } = useGetLeaveRequestsQuery({ status });

  return (
    <Box>
      <Typography variant="h5" mb={2}>Leave Management</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="All" />
        <Tab label="Pending" />
        <Tab label="Approved" />
        <Tab label="Rejected" />
      </Tabs>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load leave requests</Alert>}

      {data && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Policy</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((req) => (
                <TableRow key={req.id} hover>
                  <TableCell>{req.user.firstName} {req.user.lastName}</TableCell>
                  <TableCell>{req.policy.name}</TableCell>
                  <TableCell>{req.startDate}</TableCell>
                  <TableCell>{req.endDate}</TableCell>
                  <TableCell>
                    <Chip label={req.status} color={statusColors[req.status]} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
