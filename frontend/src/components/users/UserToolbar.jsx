import {
  FaUsersCog,
  FaSearch,
  FaPlus,
} from "react-icons/fa";

export default function UserToolbar({
  search,
  setSearch,
  totalUsers,
  onAddUser,
}) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FaUsersCog className="text-3xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              User Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage system users, roles, and account access.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] md:w-auto"
        >
          <FaPlus />
          Add User
        </button>
      </div>

      {/* Search + Total */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-blue-50 px-5 py-3 lg:min-w-[170px]">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Users
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700">
              {totalUsers}
            </p>
          </div>

          <FaUsersCog className="text-xl text-blue-600" />
        </div>
      </div>
    </div>
  );
}