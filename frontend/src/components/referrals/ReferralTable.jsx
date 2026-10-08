import {
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
} from "react-icons/fa";

import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";
import ActionButtons from "../common/ActionButtons";
import ApprovalActions from "../common/ApprovalActions";

export default function ReferralTable({
  referrals = [],
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

  /* =========================================================
     COLUMN WIDTHS
  ========================================================= */

  const columnWidths = hasManagementActions
    ? ["18%", "13%", "14%", "10%", "9%", "11%", "25%"]
    : ["20%", "14%", "15%", "11%", "9%", "11%", "20%"];

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const value = String(date).substring(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    const [year, month, day] = parts;

    return `${month}/${day}/${year}`;
  };

  /* =========================================================
     STATUS LABEL
  ========================================================= */

  const getStatusLabel = (status) => {
    if (!status) {
      return "Pending";
    }

    return String(status).trim();
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl">

      {/* =====================================================
          TABLE WRAPPER
      ====================================================== */}

      <div className="min-w-[1100px]">

        <DataTable
          columns={[
            "Applicant",
            "Company",
            "Position",
            "Date Referred",
            "Status",
            "Approval",
            "Actions",
          ]}
          columnWidths={columnWidths}
          loading={loading}
          isEmpty={referrals.length === 0}
          emptyTitle="No Referrals Found"
          emptyDescription={
            hasManagementActions
              ? "There are no referral records yet. Add your first referral to get started."
              : "There are no referral records to display."
          }
          emptyButtonText={
            hasManagementActions
              ? "Add Referral"
              : null
          }
          onEmptyButtonClick={
            hasManagementActions
              ? onAdd
              : null
          }
        >

          {referrals.map((referral) => (

            <tr
              key={referral.referral_id}
              className="
                border-b
                border-slate-100
                transition
                last:border-b-0
                hover:bg-slate-50
              "
            >

              {/* =================================================
                  APPLICANT
              ================================================== */}

              <td className="px-5 py-4">

                <div className="flex min-w-0 items-center gap-2">

                  <FaUser className="shrink-0 text-sm text-blue-600" />

                  <div className="min-w-0">

                    <p
                      className="truncate text-sm font-semibold text-slate-800"
                      title={referral.full_name || ""}
                    >
                      {referral.full_name ||
                        "Unknown Applicant"}
                    </p>

                    <p
                      className="mt-0.5 truncate text-xs text-slate-500"
                      title={referral.classification || ""}
                    >
                      {referral.classification ||
                        "Applicant"}
                    </p>

                  </div>

                </div>

              </td>

              {/* =================================================
                  COMPANY
              ================================================== */}

              <td className="px-5 py-4">

                <div className="flex min-w-0 items-center gap-2">

                  <FaBuilding className="shrink-0 text-sm text-blue-600" />

                  <span
                    className="truncate text-sm font-medium text-slate-700"
                    title={referral.company_name || ""}
                  >
                    {referral.company_name || "—"}
                  </span>

                </div>

              </td>

              {/* =================================================
                  POSITION
              ================================================== */}

              <td className="px-5 py-4">

                <div className="flex min-w-0 items-center gap-2">

                  <FaBriefcase className="shrink-0 text-sm text-blue-600" />

                  <span
                    className="truncate text-sm font-medium text-slate-700"
                    title={referral.position_title || ""}
                  >
                    {referral.position_title || "—"}
                  </span>

                </div>

              </td>

              {/* =================================================
                  DATE REFERRED
              ================================================== */}

              <td className="px-5 py-4">

                <div className="flex items-center gap-2 whitespace-nowrap">

                  <FaCalendarAlt className="shrink-0 text-sm text-blue-600" />

                  <span className="text-sm font-medium text-slate-700">
                    {formatDate(
                      referral.date_referred
                    )}
                  </span>

                </div>

              </td>

              {/* =================================================
                  STATUS
              ================================================== */}

              <td className="px-5 py-4">

                <div className="flex items-center">

                  <StatusBadge
                    status={getStatusLabel(
                      referral.status
                    )}
                  />

                </div>

              </td>

              {/* =================================================
                  APPROVAL
              ================================================== */}

              <td className="px-5 py-4">
                <StatusBadge
                  status={referral.approval_status || "Pending"}
                  variant={
                    String(referral.approval_status || "Pending").toLowerCase() === "approved"
                      ? "success"
                      : String(referral.approval_status || "Pending").toLowerCase() === "rejected"
                        ? "danger"
                        : "warning"
                  }
                />
              </td>

              {/* =================================================
                  ACTIONS
              ================================================== */}

              <td className="px-5 py-4">

                <div className="flex min-w-0 flex-wrap items-center gap-1.5 whitespace-nowrap">

                  <ActionButtons
                    onView={
                      onView
                        ? () => onView(referral)
                        : null
                    }

                    onEdit={
                      onEdit
                        ? () => onEdit(referral)
                        : null
                    }

                    onDelete={
                      onDelete
                        ? () => onDelete(referral)
                        : null
                    }
                  />

                  <ApprovalActions
                    approvalStatus={referral.approval_status}
                    onApprove={
                      onApprove
                        ? () => onApprove(referral)
                        : null
                    }
                    onReject={
                      onReject
                        ? () => onReject(referral)
                        : null
                    }
                  />

                </div>

              </td>

            </tr>

          ))}

        </DataTable>

      </div>

    </div>
  );
}