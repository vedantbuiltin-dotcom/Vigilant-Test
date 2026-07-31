import { Component } from 'react';
import { Alert, Box, Button, Container, Typography } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
    if (typeof window !== 'undefined') window.location.assign('/');
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Something went wrong
          </Typography>
          <Alert severity="error" sx={{ textAlign: 'left', my: 2 }}>
            {this.state.error.message || String(this.state.error)}
          </Alert>
          <Button variant="contained" onClick={this.handleReset}>
            Reload
          </Button>
        </Box>
      </Container>
    );
  }
}

export default ErrorBoundary;
