import { FaSearch } from "react-icons/fa";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  const clearSearch = () => {
    onChange({
      target: {
        value: "",
      },
    });
  };

  return (
    <div className={`flex w-full ${className}`}>
      <div className="relative min-w-0 flex-1">
        <FaSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
        />

        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full border border-slate-400 bg-white py-2.5 pl-9 pr-3 text-slate-900"
        />
      </div>

      {value && (
        <button
          type="button"
          onClick={clearSearch}
          className="shrink-0 border border-l-0 border-slate-400 bg-slate-100 px-3 text-sm font-semibold text-blue-600 hover:bg-slate-200"
        >
          Clear
        </button>
      )}
    </div>
  );
}
