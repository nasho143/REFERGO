import { FaPlus, FaSearch } from "react-icons/fa";
import PeriodFilter from "./PeriodFilter";

// One toolbar for every module: search, period filter, total, and the
// add button sit on a single row so placement is identical everywhere.
export default function ModuleToolbar({
  search,
  setSearch,
  searchPlaceholder = "Search...",
  period,
  setPeriod,
  totalLabel = "Total",
  total = 0,
  addLabel,
  onAdd,
  children,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border border-slate-300 bg-white px-3 py-3">
      <div className="relative min-w-[200px] flex-1">
        <FaSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-10 w-full !pl-9 pr-3 text-sm"
        />
      </div>

      {setPeriod && <PeriodFilter value={period} onChange={setPeriod} />}

      {children}

      <div className="flex h-10 items-center gap-3 border border-blue-200 bg-blue-50 px-3">
        <span className="text-[13px] font-medium text-slate-600">
          {totalLabel}
        </span>
        <span className="text-lg font-bold text-blue-600">{total}</span>
      </div>

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-10 items-center justify-center gap-2 bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-offset-2"
        >
          <FaPlus aria-hidden="true" className="text-[11px]" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
