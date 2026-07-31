import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';

import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import theme from '../theme/theme';
import * as authApiModule from '../api/authApi';

jest.mock('../api/authApi');

const renderLogin = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<div data-testid="home-page">home</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it('logs in and redirects to /home on success', async () => {
    authApiModule.authApi.login = jest.fn().mockResolvedValue({
      token: 'tok',
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'student' },
    });
    authApiModule.authApi.me = jest.fn().mockResolvedValue({
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'student' },
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByTestId('home-page')).toBeInTheDocument());
    expect(authApiModule.authApi.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'password123' });
  });

  it('shows an error when credentials are invalid', async () => {
    authApiModule.authApi.login = jest.fn().mockRejectedValue(new Error('Invalid email or password'));

    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('demo button fills the form', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /use student demo/i }));
    expect(screen.getByLabelText(/email/i)).toHaveValue('student@example.com');
    expect(screen.getByLabelText(/^password/i)).toHaveValue('Student@12345');
  });
});
