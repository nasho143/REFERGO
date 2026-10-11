import SearchBar from "../common/SearchBar";

export default function ReferralToolbar({
  search,
  setSearch,
  onAdd,
  totalReferrals = 0,
}) {
  return (
    <div className="space-y-7">

      {/* =====================================================
          MODULE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        {/* TITLE */}

        <div className="flex items-center gap-3">


          <div>

            <h1>
              Referrals
            </h1>

            <p className="mt-1.5 text-sm text-slate-600">
              Manage applicant referrals and employment outcomes.
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
              border border-blue-600 bg-blue-600 px-5 py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#202860]
              focus:outline-none
              focus:ring-2
              focus:ring-[#202860]
              focus:ring-offset-2"
          >
            + Add Referral
          </button>
        )}

      </div>


      {/* =====================================================
          SEARCH + TOTAL
      ====================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        {/* SEARCH */}

        <div className="w-full sm:max-w-md">

          <SearchBar
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search referral..."
          />

        </div>


        {/* TOTAL */}

        <div className="flex items-center justify-between border border-blue-200 bg-blue-50 px-5 py-3 sm:min-w-[200px] sm:gap-6">

          <span className="text-sm font-medium text-slate-500">
            Total Referrals
          </span>

          <span className="ml-6 text-xl font-bold text-[#202860]">
            {totalReferrals}
          </span>

        </div>

      </div>

    </div>
  );
}