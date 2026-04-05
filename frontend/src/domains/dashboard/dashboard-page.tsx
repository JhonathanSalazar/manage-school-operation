import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import BadgeIcon from '@mui/icons-material/Badge';
import { useGetDashboardQuery } from './dashboard-api';
import { useAuth } from '@domains/auth/use-auth';

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useGetDashboardQuery();

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load dashboard</Alert>;

  const stats = data?.data?.stats;

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        Welcome back, {user?.firstName}
      </Typography>

      {stats && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Total Students" value={stats.totalStudents} icon={<SchoolIcon fontSize="large" />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Teachers" value={stats.totalTeachers} icon={<PeopleIcon fontSize="large" />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Classes" value={stats.totalClasses} icon={<ClassIcon fontSize="large" />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Staff" value={stats.totalStaff} icon={<BadgeIcon fontSize="large" />} />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Recent Notices</Typography>
              {data?.data?.notices?.length === 0 && (
                <Typography color="text.secondary">No notices</Typography>
              )}
              {data?.data?.notices?.map((n) => (
                <Box key={n.id} sx={{ mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2">{n.title}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Upcoming Birthdays</Typography>
              {data?.data?.birthdays?.length === 0 && (
                <Typography color="text.secondary">No upcoming birthdays</Typography>
              )}
              {data?.data?.birthdays?.map((b) => (
                <Box key={b.userId} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {b.firstName} {b.lastName} — {b.dateOfBirth}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
