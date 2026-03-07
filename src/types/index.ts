export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface NoteDTO {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags: TagDTO[];
}

export interface TagDTO {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagWithCount extends TagDTO {
  noteCount: number;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface CreateTagInput {
  name: string;
  color: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}
