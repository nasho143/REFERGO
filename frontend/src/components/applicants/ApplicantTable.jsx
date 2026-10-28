import { SkeletonRows } from "../common/Skeleton";
import {
  FaUser,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";

import StatusBadge from "../common/StatusBadge";
import { calcAge } from "../../utils/period";
import ActionButtons from "../common/ActionButtons";
import ApprovalActions from "../common/ApprovalActions";

export default function ApplicantTable({
  applicants = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) {
  // =========================================================
  // READINESS STATUS
  // =========================================================

  const getReadinessStatus = (score) => {
    const readinessScore = Number(score) || 0;

    if (readinessScore >= 80) {
      return {
        label: "Ready for Referral",
        variant: "success",
      };
    }

    if (readinessScore >= 60) {
      return {
        label: "Nearly Ready",
        variant: "warning",
      };
    }

    return {
      label: "Needs Improvement",
      variant: "danger",
    };
  };

  // =========================================================
  // APPROVAL STATUS
  // =========================================================

  const getApprovalStatus = (status) => {
    const normalizedStatus =
      String(status || "Pending")
        .trim()
        .toLowerCase();

    if (normalizedStatus === "approved") {
      return {
        label: "Approved",
        variant: "success",
      };
    }

    if (normalizedStatus === "rejected") {
      return {
        label: "Rejected",
        variant: "danger",
      };
    }

    return {
      label: "Pending",
      variant: "warning",
    };
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* =====================================================
          TABLE SCROLL CONTAINER
      ====================================================== */}

      <div className="table-scroll w-full overflow-x-auto">

        <table className="w-full min-w-[1150px] border-collapse">

          {/* =================================================
              COLUMN WIDTHS
          ================================================== */}

          <colgroup>

            <col className="w-[19%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[13%]" />
            <col className="w-[16%]" />

          </colgroup>

          {/* =================================================
              HEADER
          ================================================== */}

          <thead>
            <tr className="  bg-slate-50">

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Applicant
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Gender / Age
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Education
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Address
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Referral
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Approval
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                Readiness
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

            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (
              <SkeletonRows columns={8} rows={6} />
            ) : applicants.length === 0 ? (

              /* =================================================
                  EMPTY
              ================================================== */

              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14"
                >

                  <div className="flex flex-col items-center justify-center text-center">


                    <h3 className="text-base font-bold text-slate-800">
                      No Applicants
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      This list is empty.
                    </p>

                    

                  </div>

                </td>
              </tr>

            ) : (

              /* =================================================
                  APPLICANTS
              ================================================== */

              applicants.map((applicant) => {

                const readiness =
                  getReadinessStatus(
                    applicant.job_readiness_score
                  );

                const readinessScore =
                  Number(
                    applicant.job_readiness_score
                  ) || 0;

                const approval =
                  getApprovalStatus(
                    applicant.approval_status
                  );

                return (
                  <tr
                    key={applicant.applicant_id}
                    className="
                      
                      
                      transition
                      
                      hover:bg-slate-50"
                  >

                    {/* =================================================
                        APPLICANT
                    ================================================== */}

                    <td className="px-5 py-4">

                      <div className="flex min-w-0 items-center gap-2">

                        <FaUser className="shrink-0 text-sm text-[#202860]" />

                        <div className="min-w-0">

                          <p
                            className="truncate text-sm font-semibold text-slate-800"
                            title={applicant.full_name || ""}
                          >
                            {applicant.full_name || "N/A"}
                          </p>

                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">

                            <FaPhone className="shrink-0 text-[10px]" />

                            <span className="truncate">
                              {applicant.contact_number ||
                                "No contact number"}
                            </span>

                          </div>

                        </div>

                      </div>

                    </td>

                    {/* =================================================
                        GENDER / AGE
                    ================================================== */}

                    <td className="px-5 py-4">

                      <p className="text-sm font-medium text-slate-700">
                        {applicant.gender || "N/A"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {calcAge(applicant.birthdate) !== null
                          ? `${calcAge(applicant.birthdate)} yrs old`
                          : "Age N/A"}
                      </p>

                    </td>

                    {/* =================================================
                        EDUCATION
                    ================================================== */}

                    <td className="px-5 py-4">

                      <div className="flex min-w-0 items-center gap-2">

                        <FaGraduationCap className="shrink-0 text-sm text-[#202860]" />

                        <span
                          className="truncate text-sm font-medium text-slate-700"
                          title={applicant.education || ""}
                        >
                          {applicant.education || "N/A"}
                        </span>

                      </div>

                    </td>

                    {/* =================================================
                        ADDRESS
                    ================================================== */}

                    <td className="px-5 py-4">

                      <div className="flex min-w-0 items-center gap-2">

                        <FaMapMarkerAlt className="shrink-0 text-sm text-[#202860]" />

                        <span
                          className="truncate text-sm font-medium text-slate-700"
                          title={applicant.address || ""}
                        >
                          {applicant.address || "N/A"}
                        </span>

                      </div>

                    </td>

                    {/* =================================================
                        REFERRAL STATUS
                    ================================================== */}

                    <td className="px-5 py-4">

                      <span className="text-sm font-medium text-slate-700">
                        {applicant.referral_status || "Not yet referred"}
                      </span>

                    </td>

                    {/* =================================================
                        APPROVAL STATUS
                    ================================================== */}

                    <td className="px-5 py-4">

                      <div className="flex flex-col items-start gap-1">

                        <StatusBadge
                          status={approval.label}
                          variant={approval.variant}
                        />

                        {approval.label === "Rejected" &&
                          applicant.rejection_reason && (
                            <span
                              className="max-w-[180px] truncate text-xs text-red-500"
                              title={
                                applicant.rejection_reason
                              }
                            >
                              {applicant.rejection_reason}
                            </span>
                          )}

                      </div>

                    </td>

                    {/* =================================================
                        JOB READINESS
                    ================================================== */}

                    <td className="px-5 py-4">

                      <div className="flex min-w-0 flex-col items-start gap-1.5">

                        <div className="flex items-center gap-2">

                          <StatusBadge
                            status={readiness.label}
                            variant={readiness.variant}
                          />

                          <span className="whitespace-nowrap text-xs font-semibold text-slate-500">
                            {readinessScore}%
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <ActionButtons
                        onView={
                          onView
                            ? () => onView(applicant)
                            : null
                        }

                        onEdit={
                          onEdit
                            ? () => onEdit(applicant)
                            : null
                        }

                        onDelete={
                          onDelete
                            ? () => onDelete(applicant)
                            : null
                        }
                        />

                        <ApprovalActions
                          approvalStatus={applicant.approval_status}
                          onApprove={
                            onApprove
                              ? () => onApprove(applicant)
                              : null
                          }
                          onReject={
                            onReject
                              ? () => onReject(applicant)
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