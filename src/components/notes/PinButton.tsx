"use client";

interface PinButtonProps {
  isPinned: boolean;
  onToggle: () => void;
}

export function PinButton({ isPinned, onToggle }: PinButtonProps): React.ReactElement {
  function handleClick(e: React.MouseEvent): void {
    e.stopPropagation();
    onToggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isPinned ? "Unpin note" : "Pin note"}
      aria-pressed={isPinned}
      className={`p-1 rounded transition-colors ${
        isPinned
          ? "text-blue-600 hover:text-blue-800"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isPinned ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 3l-4 4-4-1-4 4 5 5-4 4h6l3-3 1 4 4-4-5-5 4-4-2-4z"
        />
      </svg>
    </button>
  );
}
