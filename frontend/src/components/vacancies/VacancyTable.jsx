import {
  FaBriefcase,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";

import StatusBadge from "../common/StatusBadge";
import ActionButtons from "../common/ActionButtons";
import ApprovalActions from "../common/ApprovalActions";

function getVacancyStatus(vacancy) {
  if (vacancy.status === "Closed") {
    return "Closed";
  }

  if (!vacancy.deadline) {
    return "Active";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineValue = String(vacancy.deadline).substring(0, 10);
  const parts = deadlineValue.split("-");

  if (parts.length !== 3) {
    return "Active";
  }

  const [year, month, day] = parts;

  const deadline = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  deadline.setHours(0, 0, 0, 0);

  const difference = Math.ceil(
    (deadline - today) / (1000 * 60 * 60 * 24)
  );

  if (difference < 0) {
    return "Expired";
  }

  if (difference <= 7) {
    return "Expiring Soon";
  }

  return "Active";
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const value = String(date).substring(0, 10);
  const parts = value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;

  if (
    !/^\d{4}$/.test(year) ||
    !/^\d{2}$/.test(month) ||
    !/^\d{2}$/.test(day)
  ) {
    return value;
  }

  return `${month}/${day}/${year}`;
}

export default function VacancyTable({
  vacancies = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onApprove,
  onReject,
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="table-scroll w-full overflow-x-auto">

        <table className="w-full min-w-[1120px] border-collapse">

          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[15%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[23%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">

              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Position
              </th>

              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Company
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Openings
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Deadline
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Approval
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-14 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">

                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="text-sm text-slate-500">
                      Loading job vacancies...
                    </p>

                  </div>
                </td>
              </tr>
            ) : vacancies.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-14"
                >
                  <div className="flex flex-col items-center justify-center text-center">

                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FaBriefcase className="text-lg" />
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                      No Job Vacancies Found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {onAdd
                        ? "Start by adding your first job vacancy."
                        : "There are no job vacancies available to display."}
                    </p>

                    {onAdd && (
                      <button
                        type="button"
                        onClick={onAdd}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Add Vacancy
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ) : (
              vacancies.map((vacancy) => {

                const displayStatus =
                  getVacancyStatus(vacancy);

                return (
                  <tr
                    key={vacancy.vacancy_id}
                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                  >

                    {/* Position */}
                    <td className="px-5 py-3.5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <FaBriefcase className="text-sm" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {vacancy.position_title}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {vacancy.employment_type || "Job Position"}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5">

                      <div className="flex items-center gap-2 text-sm text-slate-700">

                        <FaBuilding className="shrink-0 text-blue-600" />

                        <span className="truncate">
                          {vacancy.company_name || "-"}
                        </span>

                      </div>

                    </td>

                    {/* Openings */}
                    <td className="px-4 py-3.5">

                      <div className="flex items-center gap-2 text-sm text-slate-700">

                        <FaUsers className="shrink-0 text-green-600" />

                        <span>
                          {vacancy.openings || 0}
                        </span>

                      </div>

                    </td>

                    {/* Deadline */}
                    <td className="px-4 py-3.5">

                      <div className="flex items-center gap-2 text-sm text-slate-700">

                        <FaCalendarAlt className="shrink-0 text-orange-500" />

                        <span className="whitespace-nowrap">
                          {formatDate(vacancy.deadline)}
                        </span>

                      </div>

                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={displayStatus} />
                    </td>

                    {/* Approval */}
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        status={vacancy.approval_status || "Pending"}
                        variant={
                          String(vacancy.approval_status || "Pending").toLowerCase() === "approved"
                            ? "success"
                            : String(vacancy.approval_status || "Pending").toLowerCase() === "rejected"
                              ? "danger"
                              : "warning"
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                      <ActionButtons
                        onView={
                          onView
                            ? () => onView(vacancy)
                            : null
                        }
                        onEdit={
                          onEdit
                            ? () => onEdit(vacancy)
                            : null
                        }
                        onDelete={
                          onDelete
                            ? () => onDelete(vacancy)
                            : null
                        }
                      />

                      <ApprovalActions
                        approvalStatus={vacancy.approval_status}
                        onApprove={
                          onApprove
                            ? () => onApprove(vacancy)
                            : null
                        }
                        onReject={
                          onReject
                            ? () => onReject(vacancy)
                            : null
                        }
                      />
                      </div>

                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}