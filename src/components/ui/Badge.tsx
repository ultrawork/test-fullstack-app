import { type ReactNode } from "react";

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export default function Badge({
  label,
  color = "#6B7280",
  className = "",
}: BadgeProps): ReactNode {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}
