import {
  FaTimes,
  FaUser,
  FaLock,
  FaEnvelope,
  FaUserTag,
} from "react-icons/fa";

export default function UserModal({
  show,
  editingUser,
  form,
  setForm,
  onClose,
  onSubmit,
  loading = false,
}) {
  if (!show) return null;

  const isEditing = Boolean(editingUser);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? "Edit User" : "Add User"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update the user's account information and access."
                : "Create a new REFERGO system user."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="max-h-[75vh] overflow-y-auto"
        >
          <div className="space-y-5 p-5 sm:p-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#202860] focus:ring-2 focus:ring-[#eef0f8] disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Username + Email */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Username <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FaUserTag className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                    disabled={loading}
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#202860] focus:ring-2 focus:ring-[#eef0f8] disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address <span className="text-red-600">*</span>
                </label>

                <div className="relative">
                  <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#202860] focus:ring-2 focus:ring-[#eef0f8] disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password{" "}
                {!isEditing && (
                  <span className="text-red-500">*</span>
                )}
              </label>

              <div className="relative">
                <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    isEditing
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  required={!isEditing}
                  disabled={loading}
                  autoComplete={
                    isEditing
                      ? "new-password"
                      : "new-password"
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#202860] focus:ring-2 focus:ring-[#eef0f8] disabled:bg-slate-50"
                />
              </div>

              {isEditing && (
                <p className="mt-2 text-xs text-slate-400">
                  Leave this field blank if you do not want to change
                  the password.
                </p>
              )}
            </div>

            {/* Role + Status */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Role <span className="text-red-500">*</span>
                </label>

                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#202860] focus:ring-2 focus:ring-[#eef0f8] disabled:bg-slate-50"
                >
                  <option value="peso_staff">
                    PESO Staff
                  </option>

                  <option value="department_head">
                    Department Head
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Status <span className="text-red-500">*</span>
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#202860] focus:ring-2 focus:ring-[#eef0f8] disabled:bg-slate-50"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            {/* Role Information */}
            <div className="rounded-xl border border-[#eef0f8] bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <FaUserTag className="mt-0.5 shrink-0 text-[#202860]" />

                <div>
                  <p className="text-sm font-semibold text-[#1b2255]">
                    Role Access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#202860]">
                    {form.role === "department_head"
                      ? "Department Head has supervisory access and can manage system users."
                      : "PESO Staff can manage operational records such as applicants, employers, vacancies, and referrals."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#202860] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#202860] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  {isEditing ? "Update User" : "Create User"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}