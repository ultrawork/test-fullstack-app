export interface FavoriteItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface AddFavoriteInput {
  id: string;
  title: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
