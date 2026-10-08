import { FaBuilding } from "react-icons/fa";
import SearchBar from "../common/SearchBar";

export default function EmployerToolbar({
  search,
  setSearch,
  onAdd,
  totalEmployers = 0,
}) {
  return (
    <div className="space-y-5">

      {/* =====================================================
          MODULE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* TITLE */}

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FaBuilding className="text-2xl" />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Employers
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Manage employer companies and their information.
            </p>

          </div>

        </div>


        {/* =================================================
            ADD BUTTON
        ================================================== */}

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="
              inline-flex
              items-center
              justify-center
              rounded-lg
              bg-blue-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
            "
          >
            + Add Employer
          </button>
        )}

      </div>


      {/* =====================================================
          SEARCH + TOTAL
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* SEARCH */}

        <div className="w-full sm:max-w-md">

          <SearchBar
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search employer..."
          />

        </div>


        {/* TOTAL */}

        <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5 sm:min-w-[150px]">

          <span className="text-sm font-medium text-slate-500">
            Total Employers
          </span>

          <span className="ml-4 text-xl font-bold text-blue-700">
            {totalEmployers}
          </span>

        </div>

      </div>

    </div>
  );
}