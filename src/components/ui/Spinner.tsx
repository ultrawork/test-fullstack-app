import type { ReactNode } from 'react';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = 'h-6 w-6' }: SpinnerProps): ReactNode {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${className}`}
    />
  );
}
