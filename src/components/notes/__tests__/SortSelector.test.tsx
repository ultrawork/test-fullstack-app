import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { SortSelector } from '../SortSelector';

const mockSetFilter = vi.fn();
let mockFilter = { sortBy: 'createdAt' as const, sortOrder: 'desc' as const };

vi.mock('@/stores/notes-store', () => ({
  useNotesStore: (
    selector: (state: {
      filter: typeof mockFilter;
      setFilter: typeof mockSetFilter;
    }) => unknown,
  ) => selector({ filter: mockFilter, setFilter: mockSetFilter }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockFilter = { sortBy: 'createdAt', sortOrder: 'desc' };
});

describe('SortSelector', () => {
  it('renders sort select and order button', () => {
    render(<SortSelector />);
    expect(screen.getByTestId('sort-select')).toBeInTheDocument();
    expect(screen.getByTestId('sort-order-button')).toBeInTheDocument();
  });

  it('has correct select options', () => {
    render(<SortSelector />);
    const select = screen.getByTestId('sort-select');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Date created');
    expect(options[1]).toHaveTextContent('Title');
  });

  it('calls setFilter when sort field changes', async () => {
    render(<SortSelector />);
    const select = screen.getByTestId('sort-select');
    await userEvent.selectOptions(select, 'title');
    expect(mockSetFilter).toHaveBeenCalledWith({ sortBy: 'title' });
  });

  it('toggles sort order on button click', async () => {
    render(<SortSelector />);
    const button = screen.getByTestId('sort-order-button');
    await userEvent.click(button);
    expect(mockSetFilter).toHaveBeenCalledWith({ sortOrder: 'asc' });
  });

  it('has accessible group role', () => {
    render(<SortSelector />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Sort options');
  });

  it('has accessible sort order button label', () => {
    render(<SortSelector />);
    expect(screen.getByTestId('sort-order-button')).toHaveAttribute(
      'aria-label',
      'Sort descending',
    );
  });

  it('shows ascending label when sortOrder is asc', () => {
    mockFilter = { sortBy: 'createdAt', sortOrder: 'asc' };
    render(<SortSelector />);
    expect(screen.getByTestId('sort-order-button')).toHaveAttribute(
      'aria-label',
      'Sort ascending',
    );
  });
});
