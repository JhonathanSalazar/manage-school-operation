import { Component, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 4 }}>
          <Typography variant="h5" color="error" mb={2}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Typography>
          <Button variant="contained" onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
