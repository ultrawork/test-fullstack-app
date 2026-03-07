import { type ReactNode } from "react";
import type { Category } from "@/types/category";
import Badge from "@/components/ui/Badge";

interface CategoryBadgeProps {
  category: Category;
}

export default function CategoryBadge({
  category,
}: CategoryBadgeProps): ReactNode {
  return <Badge label={category.name} color={category.color} />;
}
