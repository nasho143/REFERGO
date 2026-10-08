import { FaChartPie, FaCheck, FaClock, FaTimes } from "react-icons/fa";

export default function ApprovalOverview({ summary = {} }) {
  const pending = Number(summary.pending) || 0;
  const approved = Number(summary.approved) || 0;
  const rejected = Number(summary.rejected) || 0;
  const total = pending + approved + rejected;

  const items = [
    { label: "Pending", value: pending, icon: FaClock, cls: "bg-amber-50 text-amber-700" },
    { label: "Approved", value: approved, icon: FaCheck, cls: "bg-green-50 text-green-700" },
    { label: "Rejected", value: rejected, icon: FaTimes, cls: "bg-red-50 text-red-700" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FaChartPie />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Approval Overview</h2>
          <p className="text-sm text-slate-500">Overall approval status across the four modules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cls}`}><Icon /></div>
              <span className="text-2xl font-extrabold text-slate-800">{value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        {total > 0 && (
          <div className="flex h-full w-full">
            <div className="bg-amber-400" style={{ width: `${(pending / total) * 100}%` }} />
            <div className="bg-green-500" style={{ width: `${(approved / total) * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(rejected / total) * 100}%` }} />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">{total} reviewed or pending record{total === 1 ? "" : "s"} in total.</p>
    </section>
  );
}
