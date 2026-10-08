import { FaBriefcase } from "react-icons/fa";
import SearchBar from "../common/SearchBar";

export default function VacancyToolbar({
  search,
  setSearch,
  onAdd,
  totalVacancies = 0,
}) {
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FaBriefcase className="text-xl" />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Job Vacancies
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Manage available job vacancies and employer requirements.
            </p>

          </div>

        </div>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Vacancy
          </button>
        )}

      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vacancy..."
          />
        </div>

        <div className="flex w-fit items-center gap-3 rounded-lg bg-blue-50 px-4 py-2.5">

          <span className="text-sm text-slate-500">
            Total Vacancies
          </span>

          <span className="text-xl font-bold text-blue-700">
            {totalVacancies}
          </span>

        </div>

      </div>

    </div>
  );
}