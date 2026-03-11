import { NextResponse } from "next/server";
import type { FavoriteItem, AddFavoriteInput, ApiResponse } from "@/types/favorite";
import { favoritesMap as favorites } from "@/lib/favorites-storage";

export function GET(): NextResponse<ApiResponse<FavoriteItem[]>> {
  const items = Array.from(favorites.values());
  return NextResponse.json({ success: true, data: items });
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<FavoriteItem>>> {
  let body: AddFavoriteInput;

  try {
    body = (await request.json()) as AddFavoriteInput;
  } catch {
    return NextResponse.json(
      { success: false, data: {} as FavoriteItem, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json(
      { success: false, data: {} as FavoriteItem, error: "Field 'id' is required and must be a string" },
      { status: 400 },
    );
  }

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json(
      { success: false, data: {} as FavoriteItem, error: "Field 'title' is required and must be a string" },
      { status: 400 },
    );
  }

  if (favorites.has(body.id)) {
    return NextResponse.json(
      { success: false, data: {} as FavoriteItem, error: "Item already in favorites" },
      { status: 409 },
    );
  }

  const item: FavoriteItem = {
    id: body.id,
    title: body.title,
    createdAt: new Date().toISOString(),
  };

  favorites.set(item.id, item);

  return NextResponse.json({ success: true, data: item }, { status: 201 });
}
