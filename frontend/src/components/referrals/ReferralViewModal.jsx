import Modal from "../common/Modal";
import Button from "../common/Button";
import ApprovalReviewInfo from "../common/ApprovalReviewInfo";
import StatusBadge from "../common/StatusBadge";

import {
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
  FaComments,
  FaClipboardCheck,
  FaPhone,
  FaUserTie,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function ReferralViewModal({
  isOpen,
  onClose,
  referral,
}) {
  if (!referral) {
    return null;
  }

  const status = String(referral.status || "Pending").trim();

  const isRejected =
    status === "Rejected" || status === "Failed";

  const hasInterview =
    Boolean(referral.interview_date) ||
    status === "For Interview" ||
    status === "Interview Scheduled" ||
    status === "Hired";

  const hasFollowUp =
    Boolean(referral.date_contacted) ||
    Boolean(referral.contacted_person) ||
    Boolean(referral.contact_method) ||
    Boolean(referral.follow_up_result) ||
    Boolean(referral.next_follow_up);

  const hasReapplication =
    isRejected &&
    Boolean(referral.reapply_eligible_date);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Referral Details"
      subtitle="View complete referral information."
      size="lg"
    >
      <div className="space-y-8">

        {/* =====================================================
            REFERRAL SUMMARY
        ====================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800">
                  Referral Summary
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Applicant referral and current referral status.
                </p>
              </div>

              <div className="shrink-0">
                <StatusBadge status={status} />
              </div>

            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

            <div className="flex items-start gap-3">

              <span className="mt-0.5 shrink-0 text-blue-600">
                <FaUser />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700">
                  Applicant
                </p>

                <p className="mt-1 break-words text-base font-bold text-slate-800">
                  {referral.full_name ||
                    referral.applicant_name ||
                    "Unknown Applicant"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Applicant Referral
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            REFERRAL INFORMATION
        ====================================================== */}
        <section>
          <SectionHeader
            title="Referral Information"
            description="Applicant, employer, position, and referral details."
            icon={<FaBriefcase />}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <InfoCard
              icon={<FaUser />}
              label="Applicant"
              value={
                referral.full_name ||
                referral.applicant_name ||
                "—"
              }
            />

            <InfoCard
              icon={<FaBuilding />}
              label="Employer"
              value={
                referral.company_name ||
                referral.employer_name ||
                "—"
              }
            />

            <InfoCard
              icon={<FaBriefcase />}
              label="Job Position"
              value={
                referral.position_title ||
                referral.job_title ||
                "—"
              }
            />

            <InfoCard
              icon={<FaCalendarAlt />}
              label="Date Referred"
              value={formatDate(referral.date_referred)}
            />

          </div>
        </section>

        {/* =====================================================
            INTERVIEW & OUTCOME
        ====================================================== */}
        {hasInterview && (
          <section>
            <SectionHeader
              title="Interview & Outcome"
              description="Interview schedule and employment result."
              icon={<FaClipboardCheck />}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <InfoCard
                icon={<FaCalendarAlt />}
                label="Interview Date"
                value={formatDate(referral.interview_date)}
              />

              <InfoCard
                icon={<FaClipboardCheck />}
                label="Result"
                value={referral.result || "—"}
              />

            </div>
          </section>
        )}

        <ApprovalReviewInfo
          approvalStatus={referral.approval_status}
          rejectionReason={referral.rejection_reason}
          reviewedBy={referral.reviewed_by}
          reviewedAt={referral.reviewed_at}
          reapplyEligibleDate={referral.reapply_eligible_date}
        />

        {/* =====================================================
            FOLLOW-UP & EMPLOYER RESPONSE
        ====================================================== */}
        {hasFollowUp && (
          <section>
            <SectionHeader
              title="Follow-up & Employer Response"
              description="Track employer communication and follow-up activity."
              icon={<FaComments />}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <InfoCard
                icon={<FaCalendarAlt />}
                label="Date Contacted"
                value={formatDate(referral.date_contacted)}
              />

              <InfoCard
                icon={<FaUserTie />}
                label="Contacted Person"
                value={
                  referral.contacted_person ||
                  "—"
                }
              />

              <InfoCard
                icon={<FaPhone />}
                label="Contact Method"
                value={
                  referral.contact_method ||
                  "—"
                }
              />

              <InfoCard
                icon={<FaClock />}
                label="Next Follow-up"
                value={formatDate(referral.next_follow_up)}
              />

            </div>

            {/* FOLLOW-UP RESULT */}
            {referral.follow_up_result && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex items-start gap-3">

                  <span className="mt-0.5 shrink-0 text-blue-600">
                    <FaComments />
                  </span>

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Follow-up Result
                    </p>

                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {referral.follow_up_result}
                    </p>

                  </div>

                </div>

              </div>
            )}

          </section>
        )}

        {/* =====================================================
            NO FOLLOW-UP INFORMATION
        ====================================================== */}
        {!hasFollowUp &&
          !isRejected &&
          status !== "Hired" && (
            <section>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex items-start gap-3">

                  <span className="mt-0.5 shrink-0 text-blue-600">
                    <FaClock />
                  </span>

                  <div>

                    <p className="text-sm font-semibold text-slate-700">
                      No follow-up information yet
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Employer follow-up details have not
                      been recorded for this referral.
                    </p>

                  </div>

                </div>

              </div>
            </section>
          )}

        {/* =====================================================
            HIRED
        ====================================================== */}
        {status === "Hired" && (
          <section>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">

              <div className="flex items-start gap-3">

                <span className="mt-0.5 shrink-0 text-emerald-600">
                  <FaCheckCircle />
                </span>

                <div>

                  <p className="text-sm font-bold text-emerald-800">
                    Applicant Hired
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-700">
                    This referral has been successfully marked
                    as hired.
                  </p>

                </div>

              </div>

            </div>
          </section>
        )}

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Close
        </Button>

      </div>
    </Modal>
  );
}

/* ==========================================================
   SECTION HEADER
========================================================== */

function SectionHeader({
  title,
  description,
  icon,
  iconClass = "text-blue-600",
  iconBgClass = "bg-blue-50",
}) {
  return (
    <div className="mb-5 border-b border-slate-200 pb-3">

      <div className="flex items-start gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
        >
          <span className={iconClass}>
            {icon}
          </span>
        </div>

        <div className="min-w-0">

          <h3 className="text-lg font-bold text-slate-800">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-start gap-3">

        {/* VIEW MODAL GENERAL ICON = BLUE */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">

          <span className="text-blue-600">
            {icon}
          </span>

        </div>

        <div className="min-w-0 flex-1">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800">
            {value || "—"}
          </p>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   DATE FORMAT
========================================================== */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const dateString = String(value).substring(0, 10);
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}