"use client";

import type { ReactNode } from "react";
import { getContrastColor } from "@/lib/color-utils";

interface CategoryBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "md";
}

export default function CategoryBadge({
  name,
  color,
  size = "md",
}: CategoryBadgeProps): ReactNode {
  const textColor = getContrastColor(color);
  const sizeClasses =
    size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${sizeClasses}`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {name}
    </span>
  );
}
