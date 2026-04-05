import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert, Paper } from '@mui/material';
import { useGetClassesQuery } from './classes-api';

export default function ClassesListPage() {
  const { data, isLoading, isError } = useGetClassesQuery();

  return (
    <Box>
      <Typography variant="h5" mb={3}>Classes</Typography>

      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load classes</Alert>}

      {data && (
        <Paper>
          <List>
            {data.data.map((cls) => (
              <ListItem key={cls.id} divider>
                <ListItemText primary={cls.name} secondary={`ID: ${cls.id}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
