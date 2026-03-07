import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { RegisterForm } from '../RegisterForm';

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

describe('RegisterForm', () => {
  it('renders all fields', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  it('shows validation error for short password', async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows validation error for mismatched passwords', async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'different123');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
