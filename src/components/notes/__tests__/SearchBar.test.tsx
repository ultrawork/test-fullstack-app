import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { SearchBar } from '../SearchBar';

const mockSetFilter = vi.fn();

vi.mock('@/stores/notes-store', () => ({
  useNotesStore: (selector: (state: { setFilter: typeof mockSetFilter }) => unknown) =>
    selector({ setFilter: mockSetFilter }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(<SearchBar />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search notes');
  });

  it('accepts user input', async () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('calls setFilter after typing', async () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'test');
    await waitFor(
      () => {
        expect(mockSetFilter).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });
});
