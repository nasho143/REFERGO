import {
  FaBuilding,
  FaBriefcase,
  FaClipboardList,
  FaUsers,
  FaCheckCircle,
  FaFileAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

export default function VacancyForm({
  form,
  employers = [],
  onChange,
}) {
  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200";

  const labelClass =
    "mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700";

  return (
    <div className="space-y-5">

      {/* =====================================================
          EMPLOYER / BASIC VACANCY INFORMATION
      ====================================================== */}

      <div>
        <div className="space-y-4">

          {/* Employer */}
          <div>
            <label className={labelClass}>
              <FaBuilding className="text-blue-600" />
              Employer
            </label>

            <select
              name="employer_id"
              value={form.employer_id || ""}
              onChange={onChange}
              className={inputClass}
            >
              <option value="">
                Select Employer
              </option>

              {employers.map((employer) => (
                <option
                  key={employer.employer_id}
                  value={employer.employer_id}
                >
                  {employer.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <label className={labelClass}>
              <FaBriefcase className="text-indigo-600" />
              Position Title
            </label>

            <input
              type="text"
              name="position_title"
              value={form.position_title || ""}
              onChange={onChange}
              placeholder="Enter position title"
              className={inputClass}
            />
          </div>

          {/* Salary + Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Salary */}
            <div>
              <label className={labelClass}>
                <FaMoneyBillWave className="text-green-600" />
                Salary
              </label>

              <input
                type="text"
                name="salary"
                value={form.salary || ""}
                onChange={onChange}
                placeholder="e.g. ₱15,000 - ₱20,000"
                className={inputClass}
              />
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>
                <FaMapMarkerAlt className="text-red-500" />
                Location
              </label>

              <input
                type="text"
                name="location"
                value={form.location || ""}
                onChange={onChange}
                placeholder="e.g. Mendez, Cavite"
                className={inputClass}
              />
            </div>

          </div>

          {/* Employment Type + Openings */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Employment Type */}
            <div>
              <label className={labelClass}>
                <FaBriefcase className="text-purple-600" />
                Employment Type
              </label>

              <select
                name="employment_type"
                value={form.employment_type || "Full-time"}
                onChange={onChange}
                className={inputClass}
              >
                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Temporary">
                  Temporary
                </option>

                <option value="Internship">
                  Internship
                </option>
              </select>
            </div>

            {/* Number of Openings */}
            <div>
              <label className={labelClass}>
                <FaUsers className="text-green-600" />
                Number of Openings
              </label>

              <input
                type="number"
                name="openings"
                min="1"
                value={form.openings || 1}
                onChange={onChange}
                className={inputClass}
              />
            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          VACANCY STATUS
      ====================================================== */}

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">
          Vacancy Status
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Deadline */}
          <div>
            <label className={labelClass}>
              <FaCalendarAlt className="text-orange-500" />
              Application Deadline
            </label>

            <input
              type="date"
              name="deadline"
              value={form.deadline || ""}
              onChange={onChange}
              className={inputClass}
            />

            <p className="mt-1 text-xs text-slate-500">
              The system monitors the vacancy deadline.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>
              <FaCheckCircle className="text-emerald-600" />
              Status
            </label>

            <select
              name="status"
              value={form.status || "Active"}
              onChange={onChange}
              className={inputClass}
            >
              <option value="Active">
                Active
              </option>

              <option value="Closed">
                Closed
              </option>
            </select>

            <p className="mt-1 text-xs text-slate-500">
              Expiring and expired status is monitored automatically.
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          JOB DETAILS
      ====================================================== */}

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">
          Job Details
        </h3>

        <div className="space-y-4">

          {/* Qualifications */}
          <div>
            <label className={labelClass}>
              <FaClipboardList className="text-amber-500" />
              Qualifications
            </label>

            <textarea
              name="qualifications"
              value={form.qualifications || ""}
              onChange={onChange}
              rows={3}
              placeholder="Enter required qualifications..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Requirements */}
          <div>
            <label className={labelClass}>
              <FaFileAlt className="text-blue-500" />
              Requirements
            </label>

            <textarea
              name="requirements"
              value={form.requirements || ""}
              onChange={onChange}
              rows={3}
              placeholder="Enter job requirements..."
              className={`${inputClass} resize-none`}
            />
          </div>

        </div>
      </div>

    </div>
  );
}