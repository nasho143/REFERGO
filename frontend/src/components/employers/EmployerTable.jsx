import {
  FaBuilding,
  FaUserTie,
  FaPhone,
} from "react-icons/fa";

import StatusBadge from "../common/StatusBadge";
import ActionButtons from "../common/ActionButtons";
import ApprovalActions from "../common/ApprovalActions";

export default function EmployerTable({
  employers = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onApprove,
  onReject,
}) {
  const hasManagementActions =
    Boolean(onEdit || onDelete);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* =====================================================
          TABLE SCROLL CONTAINER
      ====================================================== */}

      <div className="table-scroll w-full overflow-x-auto">

        <table className="w-full min-w-[1100px] border-collapse">

          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[15%]" />
            <col className="w-[23%]" />
          </colgroup>


          {/* =================================================
              HEADER
          ================================================== */}

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Company
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Contact Person
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Approval
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>

            </tr>
          </thead>


          {/* =================================================
              BODY
          ================================================== */}

          <tbody>

            {/* LOADING */}
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-14 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">

                    <div
                      className="
                        h-9
                        w-9
                        animate-spin
                        rounded-full
                        border-4
                        border-slate-200
                        border-t-blue-600
                      "
                    />

                    <p className="text-sm text-slate-500">
                      Loading employers...
                    </p>

                  </div>
                </td>
              </tr>
            ) : employers.length === 0 ? (

              /* EMPTY */
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-14"
                >
                  <div className="flex flex-col items-center justify-center text-center">

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FaBuilding className="text-xl" />
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                      No Employers Found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {onAdd
                        ? "Start by adding your first employer."
                        : "There are no employers available to display."
                      }
                    </p>

                    {onAdd && (
                      <button
                        type="button"
                        onClick={onAdd}
                        className="
                          mt-4
                          rounded-lg
                          bg-blue-600
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-blue-700
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-300
                        "
                      >
                        Add Employer
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ) : (

              /* EMPLOYERS */
              employers.map((employer) => (

                <tr
                  key={employer.employer_id}
                  className="
                    border-b
                    border-slate-100
                    transition
                    last:border-b-0
                    hover:bg-slate-50
                  "
                >

                  {/* COMPANY */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-blue-100
                          text-blue-600
                        "
                      >
                        <FaBuilding />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {employer.company_name || "N/A"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {employer.address || "No address provided"}
                        </p>

                      </div>

                    </div>

                  </td>


                  {/* CONTACT PERSON */}

                  <td className="px-5 py-4">

                    <div className="flex min-w-0 items-center gap-2">

                      <FaUserTie className="shrink-0 text-sm text-blue-600" />

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-slate-700">
                          {employer.contact_person || "N/A"}
                        </p>

                        {employer.contact_number && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <FaPhone className="text-[10px]" />
                            <span className="truncate">
                              {employer.contact_number}
                            </span>
                          </div>
                        )}

                      </div>

                    </div>

                  </td>


                  {/* STATUS */}

                  <td className="px-5 py-4">

                    <StatusBadge
                      status={
                        employer.status || "Active"
                      }
                    />

                  </td>


                  {/* APPROVAL */}

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={employer.approval_status || "Pending"}
                      variant={
                        String(employer.approval_status || "Pending").toLowerCase() === "approved"
                          ? "success"
                          : String(employer.approval_status || "Pending").toLowerCase() === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>

                  {/* ACTIONS */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <ActionButtons
                      onView={
                        onView
                          ? () => onView(employer)
                          : null
                      }

                      onEdit={
                        onEdit
                          ? () => onEdit(employer)
                          : null
                      }

                      onDelete={
                        onDelete
                          ? () => onDelete(employer)
                          : null
                      }
                    />

                    <ApprovalActions
                      approvalStatus={employer.approval_status}
                      onApprove={
                        onApprove
                          ? () => onApprove(employer)
                          : null
                      }
                      onReject={
                        onReject
                          ? () => onReject(employer)
                          : null
                      }
                    />
                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}