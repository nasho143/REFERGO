import { FaSearch, FaClock } from "react-icons/fa";

export default function ActivityLogToolbar({
  search,
  setSearch,
  totalActivities,
}) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          {/* Icon */}

          {/* Title */}
          <div>
            <h1>
              Activity Logs
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor system activities, user actions, and account events.
            </p>
          </div>
        </div>
      </div>

      {/* Search + Total */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-xl">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, module, activity, or IP address..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#202860] focus:ring-2 focus:ring-[#eef0f8]"
          />
        </div>

        {/* Total Activities */}
        <div className="flex w-full items-center justify-between rounded-xl bg-blue-50 px-5 py-3 lg:w-auto lg:min-w-[190px]">
          <div>
            <p className="text-sm font-medium text-[#202860]">
              Total Activities
            </p>

            <p className="mt-1 text-2xl font-bold text-[#202860]">
              {totalActivities}
            </p>
          </div>

          <FaClock className="text-2xl text-[#202860]" />
        </div>
      </div>
    </div>
  );
}