import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../App';

const renderWithRouter = (initialEntries = ['/login']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  );

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the login page when unauthenticated', () => {
    renderWithRouter(['/login']);
    expect(screen.getAllByText(/Online Exam Portal/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('redirects to /login from a protected route when unauthenticated', () => {
    renderWithRouter(['/home']);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });
});
