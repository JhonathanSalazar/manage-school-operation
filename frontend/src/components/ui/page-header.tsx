import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function PageHeader({ title, actionLabel, onAction }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" fontWeight={600}>{title}</Typography>
      {actionLabel && onAction && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
