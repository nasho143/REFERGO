import { FaArrowRight, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const paths = {
  Applicant: "/applicants",
  Employer: "/employers",
  "Job Vacancy": "/vacancies",
  Referral: "/referrals",
};

export default function PendingApprovalTable({ records = [] }) {
  const navigate = useNavigate();

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
        <div>
          <h2>Records Waiting for Approval</h2>
          <p className="mt-1 text-sm text-slate-500">The latest records requiring Department Head review.</p>
        </div>
        <FaClock className="shrink-0 text-amber-500" />
      </div>

      {records.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-semibold text-slate-700">No records are currently waiting for approval.</p>
          <p className="mt-1 text-sm text-slate-500">New pending records will appear here automatically.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Type', 'Record', 'Details', 'Date', 'Action'].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-left text-xs font-bold r text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.record_type}-${record.record_id}-${index}`} className="  hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{record.record_type}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{record.record_name || "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{record.secondary_name || "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{formatDate(record.submitted_at)}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => navigate(paths[record.record_type] || "/dashboard")}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#202860] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#202860]"
                    >
                      Review <FaArrowRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
