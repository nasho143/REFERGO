import { FaEdit, FaTrash, FaUserCheck, FaUserTimes } from "react-icons/fa";

export default function UserTable({
  users = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
  formatDate,
  getRoleLabel,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Table Header */}
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">

          <div>
            <h2 className="font-semibold text-slate-800">
              System Users
            </h2>

            <p className="text-sm text-slate-500">
              Manage user accounts and access status.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading users...
            </p>
          </div>
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[260px] items-center justify-center px-5">
          <div className="text-center">

            <h3 className="mt-4 font-semibold text-slate-700">
              No users found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No user accounts match your search.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="  bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500">
                    Username
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className=" ">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#eef0f8] font-semibold text-[#202860]">
                          {user.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {user.full_name}
                          </p>

                          <p className="truncate text-sm text-slate-500">
                            {user.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        @{user.username}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-sm px-3 py-1 text-xs font-semibold ${
                          user.role === "department_head"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-[#eef0f8] text-[#202860]"
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-sm px-3 py-1 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-sm ${
                            user.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />

                        {user.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          title="Edit User"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#202860] transition hover:bg-[#eef0f8]"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus(user)}
                          title={
                            user.status === "active"
                              ? "Deactivate User"
                              : "Activate User"
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                            user.status === "active"
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {user.status === "active" ? (
                            <FaUserTimes />
                          ) : (
                            <FaUserCheck />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(user)}
                          title="Delete User"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {/* User Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#eef0f8] font-semibold text-[#202860]">
                      {user.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-800">
                        {user.full_name}
                      </h3>

                      <p className="truncate text-sm text-slate-500">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-sm px-3 py-1 text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status === "active"
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-words text-sm text-slate-700">
                      {user.email || "No email"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Role
                    </p>

                    <div className="mt-1">
                      <span
                        className={`inline-flex rounded-sm px-3 py-1 text-xs font-semibold ${
                          user.role === "department_head"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-[#eef0f8] text-[#202860]"
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Created
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onEdit(user)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-[#202860] transition hover:bg-[#eef0f8]"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleStatus(user)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      user.status === "active"
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {user.status === "active" ? (
                      <>
                        <FaUserTimes />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <FaUserCheck />
                        Activate
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(user)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}