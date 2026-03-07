"use client";

import type { ReactNode } from "react";

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}

function getContrastColor(hex: string): string {
  if (typeof hex !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return "#FFFFFF";
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export default function TagBadge({
  name,
  color,
  onRemove,
  size = "md",
}: TagBadgeProps): ReactNode {
  const textColor = getContrastColor(color);
  const sizeClasses =
    size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex items-center rounded-full p-0.5 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={`Remove tag ${name}`}
          style={{ color: textColor }}
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

export { getContrastColor };
