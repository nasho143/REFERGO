export default function StatusBadge({
  status = "Pending",
}) {
  const normalizedStatus =
    String(status).trim();

  const statusStyles = {
    // ================================
    // REFERRAL STATUSES
    // ================================

    Pending:
      "bg-amber-50 text-amber-700 border-amber-200",

    "For Interview":
      "bg-blue-50 text-blue-700 border-blue-200",

    "Interview Scheduled":
      "bg-indigo-50 text-indigo-700 border-indigo-200",

    Hired:
      "bg-green-50 text-green-700 border-green-200",

    Rejected:
      "bg-red-50 text-red-700 border-red-200",

    Failed:
      "bg-red-50 text-red-700 border-red-200",

    "No Response":
      "bg-slate-100 text-slate-700 border-slate-200",

    Expired:
      "bg-orange-50 text-orange-700 border-orange-200",

    Cancelled:
      "bg-slate-100 text-slate-600 border-slate-200",

    // ================================
    // VACANCY STATUSES
    // ================================

    Active:
      "bg-green-50 text-green-700 border-green-200",

    Closed:
      "bg-slate-100 text-slate-700 border-slate-200",

    "Expiring Soon":
      "bg-amber-50 text-amber-700 border-amber-200",

    // ================================
    // DEFAULT
    // ================================

    default:
      "bg-slate-100 text-slate-700 border-slate-200",
  };

  const style =
    statusStyles[normalizedStatus] ||
    statusStyles.default;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${style}`}
    >
      {normalizedStatus || "Pending"}
    </span>
  );
}