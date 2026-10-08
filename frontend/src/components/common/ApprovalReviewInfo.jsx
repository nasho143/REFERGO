import {
  FaTimesCircle,
  FaCalendarAlt,
  FaUserShield,
  FaInfoCircle,
  FaRedoAlt,
} from "react-icons/fa";

export default function ApprovalReviewInfo({
  approvalStatus,
  rejectionReason,
  reviewedBy,
  reviewedAt,
  reapplyEligibleDate,
}) {
  const status = String(approvalStatus || "")
    .trim()
    .toLowerCase();

  if (status !== "rejected") {
    return null;
  }

  const formatDate = (value) => {
    if (!value) return "Not available";

    const dateOnly = String(value).substring(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return String(value);
    }

    const [year, month, day] = dateOnly.split("-");
    return `${month}/${day}/${year}`;
  };

  return (
    <section>
      <div className="mb-5 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <FaTimesCircle className="text-red-600" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Department Head Review
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              This record was rejected by the Department Head.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* REJECTION COMMENT */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <FaTimesCircle className="mt-1 shrink-0 text-red-600" />

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                Rejection Comment / Reason
              </p>

              <p className="mt-2 whitespace-pre-line break-words text-sm font-semibold leading-6 text-slate-800">
                {rejectionReason || "No rejection comment was provided."}
              </p>
            </div>
          </div>
        </div>

        {/* REVIEW DETAILS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <FaUserShield className="text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">
                Reviewed By
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {reviewedBy ? `Department Head (User ID: ${reviewedBy})` : "Department Head"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">
                Reviewed On
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {formatDate(reviewedAt)}
            </p>
          </div>
        </div>

        {/* REAPPLICATION */}
        {reapplyEligibleDate && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <FaRedoAlt className="mt-1 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Eligible to Reapply
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(reapplyEligibleDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <FaInfoCircle className="mt-0.5 shrink-0 text-blue-600" />
          <p className="text-xs leading-5 text-blue-800">
            This review information is read-only. The rejection comment was recorded by the Department Head during the approval review.
          </p>
        </div>
      </div>
    </section>
  );
}
