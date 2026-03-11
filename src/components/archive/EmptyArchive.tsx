export default function EmptyArchive(): React.ReactElement {
  return (
    <section
      data-testid="empty-archive"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-16 h-16 text-gray-300 mb-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
        />
      </svg>
      <p className="text-gray-500 text-lg">Архив пуст</p>
      <p className="text-gray-400 text-sm mt-1">
        Архивируйте записи, чтобы они появились здесь
      </p>
    </section>
  );
}
