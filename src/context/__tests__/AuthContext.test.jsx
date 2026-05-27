import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const {
  mockGetSession,
  mockOnAuthStateChange,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
} = vi.hoisted(() => {
  let authCallback = null;
  return {
    mockGetSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    mockOnAuthStateChange: vi.fn((cb) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    mockSignInWithPassword: vi.fn().mockImplementation(async (params) => {
      const user = { email: params.email, user_metadata: { role: 'student' } };
      const session = { user, access_token: 'token' };
      if (authCallback) authCallback('SIGNED_IN', session);
      return { data: { session }, error: null };
    }),
    mockSignUp: vi.fn().mockImplementation(async (params) => {
      const role = params.options?.data?.role || 'student';
      const user = { email: params.email, user_metadata: { role, name: params.options?.data?.name } };
      const session = { user, access_token: 'token' };
      if (authCallback) authCallback('SIGNED_UP', session);
      return { data: { session }, error: null };
    }),
    mockSignOut: vi.fn().mockImplementation(async () => {
      if (authCallback) authCallback('SIGNED_OUT', null);
      return { error: null };
    }),
  };
});

vi.mock('../../shared/api/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
}));

vi.mock('../../shared/api/client', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';

function TestComponent({ email = 'test@test.com', password = 'Password123' }) {
  const auth = useAuth();
  const [result, setResult] = React.useState('');

  return (
    <div>
      <div data-testid="loading">{String(auth.loading)}</div>
      <div data-testid="user-email">{auth.user?.email || ''}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="result">{result}</div>
      <button data-testid="login-btn" onClick={async () => {
        const res = await auth.login(email, password);
        setResult(JSON.stringify(res));
      }}>Login</button>
      <button data-testid="register-btn" onClick={async () => {
        const res = await auth.register(email, password, 'Test User');
        setResult(JSON.stringify(res));
      }}>Register</button>
      <button data-testid="logout-btn" onClick={async () => {
        await auth.logout();
        setResult('logged-out');
      }}>Logout</button>
    </div>
  );
}

function renderWithProvider(props) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestComponent {...props} />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  it('renders children correctly', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <div data-testid="child">child-content</div>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('child-content');
  });

  it('provides initial loading state then resolves', async () => {
    renderWithProvider();
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('login as student succeeds', async () => {
    const mockUser = { email: 'test@test.com', user_metadata: { role: 'student' } };
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: mockUser, access_token: 'token' } },
      error: null,
    });

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@test.com');
    });
  });

  it('login as teacher succeeds', async () => {
    const mockUser = { email: 'teacher@test.com', user_metadata: { role: 'teacher' } };
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: mockUser, access_token: 'token' } },
      error: null,
    });

    renderWithProvider({ email: 'teacher@test.com' });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('teacher@test.com');
    });
  });

  it('login with invalid credentials fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    });

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      const result = JSON.parse(screen.getByTestId('result').textContent);
      expect(result.success).toBe(false);
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('register succeeds', async () => {
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      const result = JSON.parse(screen.getByTestId('result').textContent);
      expect(result.success).toBe(true);
    });
  });

  it('logout clears user and session', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const mockUser = { email: 'test@test.com', user_metadata: { role: 'student' } };
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: mockUser, access_token: 'token' } },
      error: null,
    });

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));

    fireEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('');
    });
  });
});
