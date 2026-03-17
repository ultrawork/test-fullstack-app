type SearchInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Renders a labeled controlled search input for filtering notes by title.
 */
export default function SearchInput({
  id = "search",
  value,
  onChange,
  placeholder = "Search by title",
}: SearchInputProps): JSX.Element {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <label className="text-sm font-medium text-gray-700" htmlFor={id}>
        Search notes
      </label>
      <input
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        id={id}
        name="search"
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
}
