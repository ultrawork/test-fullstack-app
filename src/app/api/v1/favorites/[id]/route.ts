import { NextResponse } from "next/server";
import type { FavoriteItem, ApiResponse } from "@/types/favorite";
import { favoritesMap as favorites } from "@/lib/favorites-storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<FavoriteItem>>> {
  const { id } = await params;

  const item = favorites.get(id);

  if (!item) {
    return NextResponse.json(
      { success: false, error: "Item not found in favorites" },
      { status: 404 },
    );
  }

  favorites.delete(id);

  return NextResponse.json({ success: true, data: item });
}
