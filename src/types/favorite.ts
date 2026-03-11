export interface FavoriteItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface AddFavoriteInput {
  id: string;
  title: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
