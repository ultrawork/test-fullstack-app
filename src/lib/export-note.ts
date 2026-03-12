import type { Note } from "@/types/note";

const BOM = "\uFEFF";

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 200) || "note";
}

export function formatNoteAsText(note: Note): string {
  const lines: string[] = [];

  lines.push(`Title: ${note.title}`);
  lines.push(`Created: ${note.createdAt}`);
  lines.push(`Updated: ${note.updatedAt}`);

  if (note.category) {
    lines.push(`Category: ${note.category}`);
  }

  if (note.tags && note.tags.length > 0) {
    lines.push(`Tags: ${note.tags.join(", ")}`);
  }

  lines.push("---");
  lines.push(note.content);

  return lines.join("\n");
}

export function downloadNoteAsTextFile(note: Note): void {
  const text = formatNoteAsText(note);
  const blob = new Blob([BOM + text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(note.title)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
