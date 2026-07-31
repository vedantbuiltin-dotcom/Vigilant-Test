import { CssBaseline, ThemeProvider } from '@mui/material';

import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import theme from './theme/theme';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
