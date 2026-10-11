import {
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
} from "react-icons/fa";
import StatusBadge from "../common/StatusBadge";

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  // Handles MySQL DATE format: YYYY-MM-DD
  if (
    typeof dateValue === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
  ) {
    const [year, month, day] = dateValue.split("-");
    return `${month}/${day}/${year}`;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export default function RecentReferrals({ referrals = [] }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
          Recent Referrals
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Latest employment referrals
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold r text-slate-600 sm:px-6">
                Applicant
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold r text-slate-600 sm:px-6">
                Company
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold r text-slate-600 sm:px-6">
                Position
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold r text-slate-600 sm:px-6">
                Date
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold r text-slate-600 sm:px-6">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  No recent referrals found.
                </td>
              </tr>
            ) : (
              referrals.map((item, index) => (
                <tr
                  key={item.referral_id ?? index}
                  className="  transition hover:bg-slate-50"
                >
                  {/* Applicant */}
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <FaUser className="shrink-0 text-[#202860]" />

                      <span className="font-medium text-slate-700">
                        {item.full_name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <FaBuilding className="shrink-0 text-green-600" />

                      <span className="text-slate-700">
                        {item.company_name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <FaBriefcase className="shrink-0 text-amber-500" />

                      <span className="text-slate-700">
                        {item.position_title || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="shrink-0 text-slate-500" />

                      <span className="whitespace-nowrap text-slate-700">
                        {formatDate(item.date_referred)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 sm:px-6">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile hint */}
      {referrals.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-center text-xs text-slate-400 sm:hidden">
          Swipe left or right to view the complete table.
        </div>
      )}
    </div>
  );
}