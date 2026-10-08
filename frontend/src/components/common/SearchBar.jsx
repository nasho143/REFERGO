import { FaSearch, FaTimes } from "react-icons/fa";

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
    <div className={`relative w-full ${className}`}>

      {/* Search Icon */}
      <FaSearch
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-slate-400
          pointer-events-none
        "
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          py-3
          pl-12
          pr-12
          text-slate-700
          placeholder:text-slate-400
          transition-all
          duration-200
          outline-none
          shadow-sm
          focus:border-blue-600
          focus:ring-4
          focus:ring-blue-100
        "
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={clearSearch}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-slate-400
            hover:text-red-500
            transition
          "
        >
          <FaTimes />
        </button>
      )}

    </div>
  );
}