import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import LoginPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: { login: () => Promise<void> }) => unknown) =>
    selector({ login: vi.fn().mockResolvedValue(undefined) }),
}));

afterEach(() => {
  cleanup();
});

describe('LoginPage', () => {
  it('renders sign in heading', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders main element', () => {
    render(<LoginPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders login form fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
