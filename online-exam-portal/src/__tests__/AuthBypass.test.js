import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';

import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import theme from '../theme/theme';

// Override the config so we can flip authBypass on per-test.
jest.mock('../config', () => ({
  __esModule: true,
  default: {
    apiBaseUrl: 'http://test-api/api',
    authBypass: true,
    bypassUser: {
      id: '00000000-0000-0000-0000-0000000000aa',
      email: 'bypass@example.com',
      name: 'Bypass User',
      role: 'admin',
    },
  },
  config: {
    apiBaseUrl: 'http://test-api/api',
    authBypass: true,
    bypassUser: {
      id: '00000000-0000-0000-0000-0000000000aa',
      email: 'bypass@example.com',
      name: 'Bypass User',
      role: 'admin',
    },
  },
}));

const Protected = () => <div data-testid="protected">protected content</div>;

describe('AUTH_BYPASS=true (UI)', () => {
  beforeEach(() => localStorage.clear());

  it('renders protected routes without a token', () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <Protected />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>login page</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });
});
