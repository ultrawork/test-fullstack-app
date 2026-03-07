import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import HomePage from './page';

afterEach(() => {
  cleanup();
});

describe('HomePage', () => {
  it('renders the heading', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Notes App' })).toBeInTheDocument();
  });

  it('renders main element', () => {
    render(<HomePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  it('renders create account link', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('renders description', () => {
    render(<HomePage />);
    expect(screen.getByText(/private, self-hosted notes/i)).toBeInTheDocument();
  });
});
