import type { ReactNode } from 'react';

interface BadgeProps {
  name: string;
  color?: string | null;
}

export function Badge({ name, color }: BadgeProps): ReactNode {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: color ? `${color}20` : '#e5e7eb',
        color: color || '#374151',
      }}
    >
      {name}
    </span>
  );
}
