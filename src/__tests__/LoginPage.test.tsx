import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import { LoginPage } from '../pages/LoginPage';
import * as AuthContext from '../auth/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeAuthValue(overrides: Partial<ReturnType<typeof AuthContext.useAuth>> = {}) {
  return {
    token: null,
    user: null,
    role: null,
    loading: false,
    error: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    reloadMe: vi.fn(),
    ...overrides,
  };
}

function renderLoginPage(authValue: ReturnType<typeof makeAuthValue>) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue(authValue);
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <LoginPage />
      </ThemeProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockNavigate.mockReset();
});

describe('LoginPage', () => {
  it('renders the email and password fields', () => {
    renderLoginPage(makeAuthValue());
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders the sign in button', () => {
    renderLoginPage(makeAuthValue());
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows email validation error when invalid email is typed', () => {
    renderLoginPage(makeAuthValue());
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'not-an-email' },
    });
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('shows password validation error when password is too short', () => {
    renderLoginPage(makeAuthValue());
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'short' },
    });
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('displays a server error from auth context', () => {
    renderLoginPage(makeAuthValue({ error: 'Invalid credentials' }));
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('calls login with email and password on submit', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    renderLoginPage(makeAuthValue({ login: loginMock }));

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await vi.waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });
});
