import type { Prisma } from '@prisma/client';

export function buildOrderBy(
  sortBy: string,
  sortOrder: string,
): Prisma.NoteOrderByWithRelationInput[] {
  const orderBy: Prisma.NoteOrderByWithRelationInput[] = [{ [sortBy]: sortOrder }];
  if (sortBy === 'title') {
    orderBy.push({ createdAt: 'desc' });
  }
  return orderBy;
}
