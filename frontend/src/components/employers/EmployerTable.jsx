import { SkeletonRows } from "../common/Skeleton";
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
  onApprove,
  onReject,
}) {
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
            <tr className="  bg-slate-50">

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Company
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Contact Person
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Approval
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
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
              <SkeletonRows columns={5} rows={6} />
            ) : employers.length === 0 ? (

              /* EMPTY */
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-14"
                >
                  <div className="flex flex-col items-center justify-center text-center">


                    <h3 className="text-base font-bold text-slate-800">
                      No Employers
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      This list is empty.
                    </p>

                    

                  </div>
                </td>
              </tr>
            ) : (

              /* EMPLOYERS */
              employers.map((employer) => (

                <tr
                  key={employer.employer_id}
                  className="
                    
                    
                    transition
                    
                    hover:bg-slate-50"
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
                          rounded-sm
                          bg-[#eef0f8]
                          text-[#202860]"
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

                      <FaUserTie className="shrink-0 text-sm text-[#202860]" />

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