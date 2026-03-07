import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import RegisterPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: { register: () => Promise<void> }) => unknown) =>
    selector({ register: vi.fn().mockResolvedValue(undefined) }),
}));

afterEach(() => {
  cleanup();
});

describe('RegisterPage', () => {
  it('renders create account heading', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Create account' })).toBeInTheDocument();
  });

  it('renders main element', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders registration form fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });
});
