import type { NoteDTO, TagDTO } from "@/types";

export function formatNote(
  note: {
    id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    noteTags: { tag: { id: string; name: string; color: string; userId: string; createdAt: Date; updatedAt: Date } }[];
  }
): NoteDTO {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    userId: note.userId,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    tags: note.noteTags.map(
      (nt): TagDTO => ({
        id: nt.tag.id,
        name: nt.tag.name,
        color: nt.tag.color,
        userId: nt.tag.userId,
        createdAt: nt.tag.createdAt.toISOString(),
        updatedAt: nt.tag.updatedAt.toISOString(),
      })
    ),
  };
}
