export default function StatusBadge({ status = "Pending" }) {
  const normalizedStatus = String(status).trim();

  // Statuses stay readable without color alone: the label is always shown.
  const statusStyles = {
    // Referral statuses
    Pending: "bg-amber-50 text-amber-700 border-amber-600",
    "For Interview": "bg-blue-50 text-blue-600 border-blue-300",
    "Interview Scheduled": "bg-blue-100 text-blue-700 border-blue-400",
    Hired: "bg-green-50 text-green-700 border-green-600",
    Rejected: "bg-red-50 text-red-700 border-red-600",
    Failed: "bg-red-50 text-red-700 border-red-600",
    "No Response": "bg-slate-100 text-slate-700 border-slate-400",
    Expired: "bg-red-50 text-red-700 border-red-300",
    Cancelled: "bg-slate-100 text-slate-600 border-slate-300",

    // Vacancy statuses
    Active: "bg-green-50 text-green-700 border-green-600",
    Closed: "bg-slate-100 text-slate-700 border-slate-400",
    "Expiring Soon": "bg-amber-50 text-amber-700 border-amber-600",

    default: "bg-slate-100 text-slate-700 border-slate-400",
  };

  const style = statusStyles[normalizedStatus] || statusStyles.default;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 text-[12.5px] font-semibold ${style}`}
    >
      {normalizedStatus || "Pending"}
    </span>
  );
}
