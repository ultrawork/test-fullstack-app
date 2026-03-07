import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { LoginForm } from '../LoginForm';

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

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<LoginForm />);
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'invalid');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows validation error for empty password', async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
