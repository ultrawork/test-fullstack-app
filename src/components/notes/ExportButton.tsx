import type { Note } from "@/types/note";
import { downloadNoteAsTextFile } from "@/lib/export-note";

interface ExportButtonProps {
  note: Note;
}

export default function ExportButton({
  note,
}: ExportButtonProps): React.ReactElement {
  function handleClick(): void {
    downloadNoteAsTextFile(note);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Export note as text file"
      className="inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export
    </button>
  );
}
